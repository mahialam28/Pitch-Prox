// Every customer page renders on the server without crashing.
// A page that throws while rendering still returns HTTP 200, but Next.js
// falls back with a `$RX("…", "<digest>")` call — that's what this catches.
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { BASE, newCustomer } from "./helpers.mjs";

const CUSTOMER_PAGES = [
  "/user/dashboard", "/user/leads", "/user/leads/add", "/user/leads/edit?id=x", "/user/crm", "/user/crm/add", "/user/crm/edit?id=x",
  "/user/live-calling", "/user/calls", "/user/calls/report", "/user/performance-analytics", "/user/ai-training",
  "/user/playbook", "/user/playbook/create", "/user/calibration",
  "/user/settings/profile", "/user/settings/preferences", "/user/settings/notifications", "/user/settings/security",
  "/user/settings/integrations", "/user/settings/billing", "/user/settings/billing/history", "/user/settings/billing/upgrade",
  "/user/settings/send-mail", "/user/settings/send-mail/emails",
  "/user/settings/send-mail/emails/x", "/user/settings/send-mail/templates", "/user/settings/send-mail/templates/1",
  "/user/settings/support-ticket", "/user/settings/support-ticket/tickets",
];

// Old pages that now redirect elsewhere
const REDIRECTS = { "/user/settings/billing/payment-method": "/user/settings/billing" };

let customer;
before(async () => { customer = await newCustomer("pages"); });

for (const path of CUSTOMER_PAGES) {
  test(`renders ${path}`, async () => {
    const res = await fetch(BASE + path, { headers: { Cookie: customer.cookie() }, redirect: "manual" });
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(!/\$RX\("/.test(html), "page crashed while rendering (see server log)");
  });
}

for (const [path, destination] of Object.entries(REDIRECTS)) {
  test(`redirects ${path}`, async () => {
    const res = await fetch(BASE + path, { headers: { Cookie: customer.cookie() }, redirect: "manual" });
    assert.equal(res.status, 307);
    assert.equal(new URL(res.headers.get("location"), BASE).pathname, destination);
  });
}
