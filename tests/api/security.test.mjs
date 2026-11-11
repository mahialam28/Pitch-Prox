// Phase 11: two-step login (authenticator app), attempt limits, remember me, admin reset.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomInt } from "node:crypto";
import { BASE, RUN, actor, newCustomer, signIn } from "./helpers.mjs";

const PASSWORD = "password-123";
const superAdmin = await signIn("sarah.johnson@pitchprox.test", PASSWORD).catch(() => null);
const needsStaff = () => ({ skip: !superAdmin && "demo staff not seeded (npm run test:db)" });

// RFC 6238, the same as an authenticator app
const base32 = (text) => {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const char of text.replace(/\s/g, "")) {
    value = (value << 5) | alphabet.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
};
const totp = (secret, offset = 0) => {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000) + offset));
  const hmac = createHmac("sha1", base32(secret)).update(counter).digest();
  const at = hmac[hmac.length - 1] & 15;
  return String((hmac.readUInt32BE(at) & 0x7fffffff) % 1e6).padStart(6, "0");
};

// Raw request with a chosen client IP (NGINX sets X-Real-IP in production)
const fromIp = (ip, path, body) => fetch(BASE + path, { method: "POST", headers: { "Content-Type": "application/json", "X-Real-IP": ip }, body: JSON.stringify(body) });

test("wrong passwords: 5 per email in 15 minutes, then even the right one waits", async () => {
  await newCustomer("limited");
  const email = `limited-${RUN}@test.dev`;
  for (let attempt = 0; attempt < 5; attempt += 1) assert.equal((await actor().post("/api/v1/auth/sign-in", { email, password: "wrong-one-1" })).status, 401);
  const blocked = await fromIp("198.51.100.7", "/api/v1/auth/sign-in", { email, password: PASSWORD });
  assert.equal(blocked.status, 429);
  assert.ok(Number(blocked.headers.get("retry-after")) > 0);
  assert.match((await blocked.json()).error, /Too many attempts/);
  // Other accounts aren't affected
  await newCustomer("unlimited");
  assert.equal((await actor().post("/api/v1/auth/sign-in", { email: `unlimited-${RUN}@test.dev`, password: PASSWORD })).status, 200);
});

test("attempt limits per IP: sign-up and wrong passwords across many emails", async () => {
  const ip = `203.0.113.${randomInt(1, 250)}`;
  for (let index = 0; index < 10; index += 1) {
    const res = await fromIp(ip, "/api/v1/auth/sign-up", { name: "Ip Tester", email: `ip-${RUN}-${index}@test.dev`, password: PASSWORD });
    assert.equal(res.status, 201, `sign-up ${index}`);
  }
  assert.equal((await fromIp(ip, "/api/v1/auth/sign-up", { name: "Ip Tester", email: `ip-${RUN}-x@test.dev`, password: PASSWORD })).status, 429);
  assert.equal((await fromIp(`198.18.0.${randomInt(1, 250)}`, "/api/v1/auth/sign-up", { name: "Other", email: `ip-${RUN}-other@test.dev`, password: PASSWORD })).status, 201, "another IP isn't affected");

  const spray = `192.0.2.${randomInt(1, 250)}`;
  for (let index = 0; index < 30; index += 1) await fromIp(spray, "/api/v1/auth/sign-in", { email: `spray-${RUN}-${index}@test.dev`, password: "nope-nope" });
  assert.equal((await fromIp(spray, "/api/v1/auth/sign-in", { email: `spray-${RUN}-last@test.dev`, password: "nope-nope" })).status, 429);
  // A fake X-Forwarded-For first entry doesn't get around it
  const sneaky = await fetch(BASE + "/api/v1/auth/sign-in", { method: "POST", headers: { "Content-Type": "application/json", "X-Real-IP": spray, "X-Forwarded-For": "10.9.8.7" }, body: JSON.stringify({ email: `spray-${RUN}-x@test.dev`, password: "nope-nope" }) });
  assert.equal(sneaky.status, 429);
});

test("two-step login: set up with an app, sign in with a code or a recovery code, turn off", async () => {
  const user = await newCustomer("twostep");
  const email = `twostep-${RUN}@test.dev`;
  const otherDevice = await signIn(email, PASSWORD);
  assert.deepEqual((await user.get("/api/v1/me/mfa")).json, { enabled: false, enabledAt: null, recoveryCodesLeft: 0 });

  const setup = (await user.post("/api/v1/me/mfa/setup")).json;
  assert.match(setup.qrCode, /^data:image\/png;base64,/);
  assert.match(setup.otpauthUrl, /^otpauth:\/\/totp\/PitchProX:.+\?secret=[A-Z2-7]+&issuer=PitchProX/);
  assert.equal((await user.get("/api/v1/me/mfa")).json.enabled, false, "nothing changes until confirmed");
  assert.equal((await user.post("/api/v1/me/mfa/confirm", { code: "000000" === totp(setup.secret) ? "111111" : "000000" })).status, 400);
  const confirmed = await user.post("/api/v1/me/mfa/confirm", { code: totp(setup.secret) });
  assert.equal(confirmed.status, 200, JSON.stringify(confirmed.json));
  assert.equal(confirmed.json.enabled, true);
  assert.equal(confirmed.json.recoveryCodes.length, 10);
  assert.match(confirmed.json.recoveryCodes[0], /^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/);
  assert.equal((await otherDevice.get("/api/v1/me")).status, 401, "other devices are signed out");
  assert.equal((await user.get("/api/v1/me")).status, 200, "this one stays signed in");
  assert.equal((await user.post("/api/v1/me/mfa/setup")).status, 409);

  // Sign-in now asks for the code; the password alone gives no session
  const device = actor();
  const first = await device.post("/api/v1/auth/sign-in", { email, password: PASSWORD });
  assert.equal(first.status, 200);
  assert.equal(first.json.mfaRequired, true);
  assert.equal((await device.get("/api/v1/me")).status, 401);
  const wrong = await device.post("/api/v1/auth/sign-in/verify", { challengeToken: first.json.challengeToken, code: "123456" === totp(setup.secret, 1) ? "654321" : "123456" });
  assert.equal(wrong.status, 401);
  assert.match(wrong.json.error, /4 tries left/);
  // The code used to confirm can't be used again; the next one can
  assert.equal((await device.post("/api/v1/auth/sign-in/verify", { challengeToken: first.json.challengeToken, code: totp(setup.secret) })).status, 401, "no replay");
  const ok = await device.post("/api/v1/auth/sign-in/verify", { challengeToken: first.json.challengeToken, code: totp(setup.secret, 1) });
  assert.equal(ok.status, 200, JSON.stringify(ok.json));
  assert.equal(ok.json.user.email, email);
  assert.equal((await device.get("/api/v1/me")).status, 200);
  assert.equal((await device.post("/api/v1/auth/sign-in/verify", { challengeToken: first.json.challengeToken, code: totp(setup.secret, 1) })).status, 401, "a challenge works once");

  // Recovery code: once only
  const [recovery] = confirmed.json.recoveryCodes;
  const second = (await actor().post("/api/v1/auth/sign-in", { email, password: PASSWORD })).json;
  const phone = actor();
  assert.equal((await phone.post("/api/v1/auth/sign-in/verify", { challengeToken: second.challengeToken, code: recovery.toUpperCase() })).status, 200);
  assert.equal((await phone.get("/api/v1/me/mfa")).json.recoveryCodesLeft, 9);
  const third = (await actor().post("/api/v1/auth/sign-in", { email, password: PASSWORD })).json;
  assert.equal((await actor().post("/api/v1/auth/sign-in/verify", { challengeToken: third.challengeToken, code: recovery })).status, 401, "used up");

  // 5 wrong codes end the challenge
  const fourth = (await actor().post("/api/v1/auth/sign-in", { email, password: PASSWORD })).json;
  for (let attempt = 0; attempt < 5; attempt += 1) await actor().post("/api/v1/auth/sign-in/verify", { challengeToken: fourth.challengeToken, code: "abcd-efgh-jkmn" });
  const expired = await actor().post("/api/v1/auth/sign-in/verify", { challengeToken: fourth.challengeToken, code: confirmed.json.recoveryCodes[1] });
  assert.equal(expired.status, 401);
  assert.match(expired.json.error, /email and password again/);

  // Turning it off needs the password and a code
  assert.equal((await phone.post("/api/v1/me/mfa/recovery-codes", { code: "000000" })).status, 403);
  assert.equal((await phone.post("/api/v1/me/mfa/disable", { password: "not-it-123", code: confirmed.json.recoveryCodes[2] })).status, 403);
  const off = await phone.post("/api/v1/me/mfa/disable", { password: PASSWORD, code: confirmed.json.recoveryCodes[2] });
  assert.equal(off.status, 200, JSON.stringify(off.json));
  assert.equal(off.json.enabled, false);
  const plain = await actor().post("/api/v1/auth/sign-in", { email, password: PASSWORD });
  assert.equal(plain.json.mfaRequired, undefined);
  assert.equal(plain.json.user.email, email);
});

test("remember me: 30-day session instead of 7", async () => {
  await newCustomer("remember");
  const email = `remember-${RUN}@test.dev`;
  const cookieAge = async (remember) => {
    const res = await fetch(BASE + "/api/v1/auth/sign-in", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: PASSWORD, remember }) });
    return Number(res.headers.getSetCookie().find((cookie) => cookie.startsWith("pitchprox_session="))?.match(/Max-Age=(\d+)/i)?.[1]);
  };
  assert.equal(await cookieAge(true), 60 * 60 * 24 * 30);
  assert.equal(await cookieAge(false), 60 * 60 * 24 * 7);
});

test("a Super Admin can reset someone's two-step login (lost phone)", needsStaff(), async () => {
  const user = await newCustomer("lostphone");
  const userId = (await user.get("/api/v1/me")).json.user.id;
  const setup = (await user.post("/api/v1/me/mfa/setup")).json;
  assert.equal((await user.post("/api/v1/me/mfa/confirm", { code: totp(setup.secret) })).status, 200);
  const other = await newCustomer("notadmin");
  assert.equal((await other.post(`/api/v1/admin/users/${userId}/mfa-reset`)).status, 403);
  assert.equal((await superAdmin.post(`/api/v1/admin/users/${userId}/mfa-reset`)).json.reset, true);
  assert.equal((await user.get("/api/v1/me")).status, 401, "their sessions end");
  const back = await actor().post("/api/v1/auth/sign-in", { email: `lostphone-${RUN}@test.dev`, password: PASSWORD });
  assert.equal(back.json.user.email, `lostphone-${RUN}@test.dev`, "password only again");
  assert.equal((await superAdmin.post(`/api/v1/admin/users/${userId}/mfa-reset`)).status, 409);
});
