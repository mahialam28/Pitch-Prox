// Phase 16: launch readiness — health check and security headers.
import { test } from "node:test";
import assert from "node:assert/strict";
import { BASE } from "./helpers.mjs";

test("the health check reports the app and database without signing in", async () => {
  const response = await fetch(`${BASE}/api/health`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const body = await response.json();
  assert.equal(body.status, "ok");
  assert.equal(body.database, "ok");
  assert.deepEqual(Object.keys(body).sort(), ["database", "responseMs", "status", "time"]);
});

test("pages and API responses carry the security headers", async () => {
  for (const path of ["/", "/api/health", "/privacy"]) {
    const response = await fetch(`${BASE}${path}`, { redirect: "manual" });
    assert.equal(response.headers.get("x-content-type-options"), "nosniff", path);
    assert.equal(response.headers.get("x-frame-options"), "SAMEORIGIN", path);
    assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin", path);
    assert.match(response.headers.get("permissions-policy") ?? "", /microphone=\(self\)/, path);
    assert.match(response.headers.get("strict-transport-security") ?? "", /max-age=\d+/, path);
    assert.equal(response.headers.get("x-powered-by"), null, path);
  }
});
