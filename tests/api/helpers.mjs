// Shared helpers for the API tests. They run against a live app that uses the
// separate test database (pitchprox_test), so the development data stays clean:
//   npm run test:db                     # create/upgrade pitchprox_test + demo staff
//   MYSQL_DATABASE=pitchprox_test npm run create-user -- --email admin@pitchprox.test --name "Test Admin" --password admin-password-123 --role super_admin
//   npm run build && npm run test:server   # app on :3001 using pitchprox_test
//   MYSQL_DATABASE=pitchprox_test MYSQL_HOST=localhost ADMIN_EMAIL=admin@pitchprox.test ADMIN_PASSWORD=admin-password-123 BASE=http://localhost:3001 npm run test:api
// ADMIN_EMAIL / ADMIN_PASSWORD (a super_admin) unlock the staff and admin tests.
export const BASE = process.env.BASE || "http://127.0.0.1:3000";
export const RUN = Date.now().toString(36);

// A signed-in (or anonymous) actor with its own cookie. `userAgent` imitates a browser.
export function actor({ userAgent } = {}) {
  // Every pitchprox_* cookie the app sets (the session, and the staff session kept during impersonation)
  const jar = new Map();
  const cookieHeader = () => [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
  const call = async (method, path, body, { raw } = {}) => {
    const isForm = body instanceof FormData;
    const res = await fetch(BASE + path, {
      method,
      redirect: "manual",
      headers: {
        ...(!isForm && { "Content-Type": "application/json" }),
        ...(jar.size && { Cookie: cookieHeader() }),
        ...(userAgent && { "User-Agent": userAgent }),
      },
      body: raw ?? (body === undefined || isForm ? body : JSON.stringify(body)),
    });
    for (const header of res.headers.getSetCookie()) {
      const [pair, ...attributes] = header.split(";");
      const [name, ...rest] = pair.split("=");
      if (!name.startsWith("pitchprox_")) continue;
      const value = rest.join("=");
      const expired = !value || attributes.some((attribute) => /max-age=0\b/i.test(attribute.trim()) || /expires=thu, 01 jan 1970/i.test(attribute.trim()));
      if (expired) jar.delete(name);
      else jar.set(name, value);
    }
    if (method === "GET" && !res.headers.get("content-type")?.includes("json")) {
      return { status: res.status, bytes: Buffer.from(await res.arrayBuffer()), headers: res.headers };
    }
    const text = await res.text();
    let json = {};
    try { json = JSON.parse(text); } catch { /* not JSON */ }
    return { status: res.status, json };
  };
  return {
    cookie: () => cookieHeader(),
    hasCookie: (name) => jar.has(name),
    get: (path) => call("GET", path),
    post: (path, body, opts) => call("POST", path, body, opts),
    put: (path, body, opts) => call("PUT", path, body, opts),
    patch: (path, body, opts) => call("PATCH", path, body, opts),
    del: (path) => call("DELETE", path),
  };
}

// multipart body for upload endpoints; files are { name, content, type }
export function form(fields, files = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  for (const [key, file] of Object.entries(files)) data.append(key, new File([file.content], file.name, { type: file.type || "application/octet-stream" }));
  return data;
}

export const CHROME_MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
export const SAFARI_IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

// A brand-new customer company with a signed-in admin
export async function newCustomer(label, options) {
  const user = actor(options);
  const res = await user.post("/api/v1/auth/sign-up", { name: `${label} Tester`, email: `${label}-${RUN}@test.dev`, password: "password-123" });
  if (res.status !== 201) throw new Error(`sign-up failed: ${res.status} ${JSON.stringify(res.json)}`);
  return user;
}

export async function signIn(email, password, options) {
  const user = actor(options);
  const res = await user.post("/api/v1/auth/sign-in", { email, password });
  if (res.status !== 200) throw new Error(`sign-in failed for ${email}: ${res.status}`);
  return user;
}
