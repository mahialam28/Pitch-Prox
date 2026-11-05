"use client";

// ── Design preview: a pretend API that lives in the browser ──
// The Frontend build has no server or database. Every request to /api/v1/... is answered
// here from sample data (fixtures.json, recorded from the real app), so all screens work.
// Changes (adding a lead, replying to a ticket…) are kept in this browser's storage and
// can be reset by signing out.
import FIXTURES from "./fixtures.json";
import { PERSONAS, personaFromCookie, previewIdentity } from "./personas";

const STORE_PREFIX = "pitchprox_preview_data_";
const clone = (value) => JSON.parse(JSON.stringify(value));
const newId = (prefix) => `${prefix}_preview_${Math.random().toString(36).slice(2, 10)}`;
const now = () => new Date().toISOString();

// Lists that support create / update / delete; `key` is the single-item wrapper the screens read
const COLLECTIONS = [
  { base: "/api/v1/leads", key: "lead", prefix: "lead" },
  { base: "/api/v1/crm/prospects", key: "prospect", prefix: "prospect" },
  { base: "/api/v1/calendar/events", key: "event", prefix: "event" },
  { base: "/api/v1/mail/messages", key: "message", prefix: "mail" },
  { base: "/api/v1/playbooks", key: "playbook", prefix: "playbook" },
  { base: "/api/v1/ai-training/assets", key: "asset", prefix: "asset" },
  { base: "/api/v1/support/tickets", key: "ticket", prefix: "ticket" },
  { base: "/api/v1/staff/tickets", key: "ticket", prefix: "ticket" },
  { base: "/api/v1/admin/employees", key: "employee", prefix: "user" },
];

function loadStore(persona) {
  try {
    const saved = localStorage.getItem(STORE_PREFIX + persona);
    if (saved) return JSON.parse(saved);
  } catch { /* storage unavailable */ }
  return clone(FIXTURES.personas[persona]?.responses ?? {});
}
const saveStore = (persona, store) => {
  try { localStorage.setItem(STORE_PREFIX + persona, JSON.stringify(store)); } catch { /* full or unavailable */ }
};
export const resetPreviewData = () => {
  try { Object.keys(localStorage).filter((key) => key.startsWith(STORE_PREFIX)).forEach((key) => localStorage.removeItem(key)); } catch { /* ignore */ }
};

const json = (status, body) => ({ status, body });
const ok = (body) => json(200, body);

async function readBody(init) {
  const body = init?.body;
  if (!body) return {};
  if (typeof body === "string") { try { return JSON.parse(body); } catch { return {}; } }
  if (body instanceof FormData) {
    const out = {};
    for (const [key, value] of body.entries()) out[key] = typeof value === "string" ? value : { name: value.name, size: value.size, type: value.type };
    return out;
  }
  return {};
}

const listOf = (entry) => entry?.json?.results ?? [];

// The signed-in person's name and email (a preview visitor may type any email)
function withIdentity(path, body) {
  const identity = previewIdentity();
  if (!identity) return body;
  if (path === "/api/v1/me" && body.user) return { ...body, user: { ...body.user, ...identity } };
  if (path === "/api/v1/settings/profile" && body.profile) return { ...body, profile: { ...body.profile, ...identity } };
  return body;
}

function filterEmployees(results, params) {
  const tabStatus = { pending: ["invited"], "in-progress": ["onboarding"], active: ["active"], completed: ["active"], expired: ["expired"], offboarding: ["offboarding"] }[params.get("tab")];
  const search = (params.get("search") || "").toLowerCase();
  let rows = results.filter((row) =>
    (!tabStatus || tabStatus.includes(row.status)) &&
    (!params.get("role") || row.role === params.get("role")) &&
    (!params.get("status") || row.status === params.get("status")) &&
    (!params.get("mfa") || (params.get("mfa") === "enabled") === Boolean(row.mfaMethod)) &&
    (!search || `${row.name} ${row.email} ${row.employeeId}`.toLowerCase().includes(search))
  );
  const pageSize = Number(params.get("pageSize")) || 10;
  const page = Number(params.get("page")) || 1;
  const total = rows.length;
  rows = rows.slice((page - 1) * pageSize, page * pageSize);
  return { results: rows, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

// ── Sign-in, sign-up, sign-out (cookies the preview pages read) ──
function setSession(persona, identity) {
  document.cookie = `pitchprox_session=${persona}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
  if (identity) document.cookie = `pitchprox_preview_identity=${encodeURIComponent(JSON.stringify(identity))}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
  else document.cookie = "pitchprox_preview_identity=; path=/; max-age=0";
}

function nameFromEmail(email) {
  const local = String(email || "").split("@")[0].replace(/[._-]+/g, " ").trim();
  return local ? local.replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Preview User";
}

async function handleAuth(path, body) {
  if (path === "/api/v1/auth/sign-out") {
    document.cookie = "pitchprox_session=; path=/; max-age=0";
    document.cookie = "pitchprox_preview_identity=; path=/; max-age=0";
    resetPreviewData();
    return ok({ success: true });
  }
  if (path === "/api/v1/auth/sign-in" || path === "/api/v1/auth/sign-up") {
    const email = String(body.email || "").trim().toLowerCase();
    if (!email) return json(400, { error: "Enter an email address." });
    // A persona's own email opens that role; any other email opens the customer portal as that person
    const match = Object.entries(PERSONAS).find(([, persona]) => persona.email === email);
    const persona = match ? match[0] : "customer";
    const identity = match ? null : { name: body.name || nameFromEmail(email), email };
    setSession(persona, identity);
    return ok({ user: { ...PERSONAS[persona].user, ...(identity ?? {}) } });
  }
  if (path === "/api/v1/auth/accept-invite") {
    setSession("new-employee");
    return ok({ user: PERSONAS["new-employee"].user });
  }
  if (path === "/api/v1/auth/activate") {
    setSession("customer");
    return ok({ user: PERSONAS.customer.user });
  }
  return null;
}

// ── The router ──
async function route(method, url, init) {
  const parsed = new URL(url, window.location.origin);
  const path = parsed.pathname.replace(/\/$/, "");
  const params = parsed.searchParams;
  const body = method === "GET" ? {} : await readBody(init);

  const auth = await handleAuth(path, body);
  if (auth) return auth;

  const persona = personaFromCookie();
  if (!persona) return json(401, { error: "Please sign in." });
  if (persona === "new-employee") return ok({ success: true });
  const store = loadStore(persona);
  const save = () => saveStore(persona, store);

  if (method === "GET") {
    if (path === "/api/v1/calendar/events") {
      const from = params.get("from") || "0000";
      const to = `${params.get("to") || "9999"}T99`;
      const entry = store[path];
      if (!entry || entry.status !== 200) return json(entry?.status ?? 404, entry?.json ?? { error: "Not found." });
      return ok({ results: listOf(entry).filter((event) => event.startsAt <= to && event.endsAt >= from) });
    }
    if (path === "/api/v1/admin/employees" && store[path]?.status === 200) return ok(filterEmployees(listOf(store[path]), params));
    const key = path === "/api/v1/staff/tickets" && params.get("opened") === "me" ? "/api/v1/staff/tickets?opened=me" : path;
    const entry = store[key];
    if (entry) return json(entry.status, entry.status === 200 ? withIdentity(path, entry.json) : entry.json);
    // A record created in this preview: build its detail from the list
    for (const collection of COLLECTIONS) {
      const id = path.startsWith(`${collection.base}/`) ? path.slice(collection.base.length + 1).split("/") : null;
      if (!id) continue;
      const item = listOf(store[collection.base]).find((row) => row.id === id[0]);
      if (item && id.length === 1) return ok({ [collection.key]: { messages: [], internalNotes: [], ...item } });
      if (item && (id[1] === "notes" || id[1] === "follow-ups")) return ok({ results: [] });
    }
    return json(404, { error: "Not available in the preview." });
  }

  // ── Changes ──
  if (path === "/api/v1/playbooks/active") {
    const playbooks = listOf(store["/api/v1/playbooks"]);
    playbooks.forEach((playbook) => { playbook.isActive = playbook.id === body.playbookId; });
    if (store["/api/v1/playbooks"]) store["/api/v1/playbooks"].json.activePlaybookId = body.playbookId;
    save();
    return ok({ playbook: playbooks.find((playbook) => playbook.id === body.playbookId) ?? {} });
  }
  if (path === "/api/v1/calibration/sessions") {
    const entry = store[path] ?? { status: 200, json: { results: [], total: 0 } };
    if (method === "DELETE") { entry.json = { results: [], total: 0 }; store[path] = entry; save(); return ok({ removed: 1 }); }
    const session = { id: newId("calib"), durationSeconds: body.durationSeconds ?? 0, roundsCompleted: body.roundsCompleted ?? null, completedAt: now() };
    entry.json.results = [session, ...(entry.json.results ?? [])];
    entry.json.total = (entry.json.total ?? 0) + 1;
    store[path] = entry; save();
    return json(201, { session, total: entry.json.total });
  }
  if (path.startsWith("/api/v1/settings/")) {
    const section = path.split("/").pop();
    if (section === "password") return ok({ success: true });
    const entry = store[path];
    const wrapper = { preferences: "preferences", notifications: "notifications", profile: "profile" }[section];
    if (entry && wrapper) {
      entry.json[wrapper] = { ...(entry.json[wrapper] ?? {}), ...body };
      save();
      return ok(withIdentity(path, entry.json));
    }
    return ok({ success: true });
  }
  if (path === "/api/v1/customers" && method === "POST") {
    const account = { organizationId: newId("org"), company: body.company, name: body.fullName ?? body.name, email: body.email, phone: body.phone ?? null, status: "Invited", subscriptionStatus: "pending_payment", planName: body.planId, seats: Number(body.seats) || 1, healthScore: 20, calibrated: false, members: 1, accountNumber: "ACC-PREVIEW", createdAt: now() };
    const list = store[path];
    if (list?.json?.results) { list.json.results.unshift(account); save(); }
    return json(201, { account, invite: { token: "preview-activation-link", expiresAt: new Date(Date.now() + 14 * 86400000).toISOString() } });
  }

  for (const collection of COLLECTIONS) {
    if (path !== collection.base && !path.startsWith(`${collection.base}/`)) continue;
    const list = (store[collection.base] ??= { status: 200, json: { results: [] } });
    list.json.results ??= [];
    const [id, sub] = path.slice(collection.base.length + 1).split("/");
    const detailKey = `${collection.base}/${id}`;
    const current = () => list.json.results.find((row) => row.id === id) ?? store[detailKey]?.json?.[collection.key];
    const update = (changes) => {
      const merged = { ...(store[detailKey]?.json?.[collection.key] ?? current() ?? {}), ...changes, updatedAt: now() };
      list.json.results = list.json.results.map((row) => (row.id === id ? { ...row, ...changes, updatedAt: merged.updatedAt } : row));
      store[detailKey] = { status: 200, json: { ...(store[detailKey]?.json ?? {}), [collection.key]: merged } };
      save();
      return merged;
    };

    if (!id && method === "POST") {
      const user = PERSONAS[persona].user;
      const item = { id: newId(collection.prefix), ...body, status: body.status ?? (collection.key === "ticket" ? "Open" : collection.key === "message" ? "queued" : body.status), createdAt: now(), updatedAt: now() };
      if (collection.key === "message") Object.assign(item, { toEmail: body.to, senderName: user.name, senderEmail: user.email });
      if (collection.key === "event") Object.assign(item, { startsAt: `${body.startDate}T${to24(body.startTime)}`, endsAt: `${body.endDate || body.startDate}T${to24(body.endTime)}`, ownerName: user.name, canEdit: true, source: "event" });
      if (collection.key === "ticket") Object.assign(item, { reference: `TKT-${Math.floor(2000 + Math.random() * 7000)}`, messages: [{ id: newId("msg"), role: "customer", body: body.description, sender: user.name, createdAt: now() }] });
      if (collection.key === "playbook") Object.assign(item, { kind: "custom", isCustom: true, isAvailable: body.status === "published", subtitle: body.status === "draft" ? "Draft" : "Custom" });
      list.json.results.unshift(item);
      store[`${collection.base}/${item.id}`] = { status: 200, json: { [collection.key]: item } };
      save();
      return json(201, { [collection.key]: item });
    }
    if (id && !sub && (method === "PATCH" || method === "PUT")) {
      const changes = { ...body };
      if (collection.key === "event") Object.assign(changes, { startsAt: `${body.startDate}T${to24(body.startTime)}`, endsAt: `${body.endDate || body.startDate}T${to24(body.endTime)}` });
      return ok({ [collection.key]: update(changes) });
    }
    if (id && !sub && method === "DELETE") {
      list.json.results = list.json.results.filter((row) => row.id !== id);
      delete store[detailKey];
      save();
      return ok({ success: true });
    }
    if (sub === "notes" && collection.key !== "ticket") {
      const note = { id: newId("note"), body: body.body ?? body.note ?? "", createdAt: now(), author: PERSONAS[persona].user.name, authorName: PERSONAS[persona].user.name };
      const notes = (store[`${detailKey}/notes`] ??= { status: 200, json: { results: [] } });
      notes.json.results = [note, ...(notes.json.results ?? [])];
      save();
      return json(201, { note });
    }
    if (sub === "messages" || sub === "notes") {
      const ticket = current() ?? {};
      const entry = { id: newId(sub === "notes" ? "note" : "msg"), body: body.body ?? "", createdAt: now() };
      const user = PERSONAS[persona].user;
      if (sub === "notes") return ok({ ticket: update({ internalNotes: [...(ticket.internalNotes ?? []), { ...entry, author: user.name }] }) });
      const staff = collection.base.includes("/staff/");
      return ok({ ticket: update({ messages: [...(ticket.messages ?? []), { ...entry, role: staff ? "agent" : "customer", sender: user.name, attachment: body.file ? { name: body.file.name, size: `${Math.max(1, Math.round((body.file.size ?? 0) / 1024))} KB` } : null }], status: staff ? "Waiting" : "Open" }) });
    }
    if (sub) return ok({ [collection.key]: update(body), success: true });
    return ok({ success: true });
  }

  // Anything else (onboarding steps, invites, offboarding steps…) succeeds without changes
  return ok({ success: true });
}

function to24(value = "09:00 AM") {
  const match = String(value).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return "09:00";
  let hours = Number(match[1]);
  if (match[3]) hours = (hours % 12) + (match[3].toUpperCase() === "PM" ? 12 : 0);
  return `${String(hours).padStart(2, "0")}:${match[2]}`;
}

// ── Install: answer /api/ requests made with fetch or XMLHttpRequest ──
let installed = false;
export function installMockApi() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    if (!new URL(url, window.location.origin).pathname.startsWith("/api/")) return realFetch(input, init);
    const method = (init.method || (typeof input === "object" && input.method) || "GET").toUpperCase();
    await new Promise((resolve) => setTimeout(resolve, 120));
    const { status, body } = await route(method, url, init);
    if (status >= 400) console.debug(`[preview api] ${method} ${url} → ${status}`, body?.error ?? "");
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  };

  // Uploads (AI Training) use XMLHttpRequest for the progress bar
  const RealXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function PreviewXHR() {
    const xhr = new RealXHR();
    let target = null;
    const upload = { onprogress: null };
    const open = xhr.open.bind(xhr);
    const send = xhr.send.bind(xhr);
    const fake = {
      upload,
      status: 0,
      responseText: "",
      onload: null,
      onerror: null,
      setRequestHeader() {},
      open(method, url, ...rest) {
        if (new URL(url, window.location.origin).pathname.startsWith("/api/")) target = { method: method.toUpperCase(), url };
        else open(method, url, ...rest);
      },
      async send(data) {
        if (!target) return send(data);
        for (const loaded of [25, 60, 100]) {
          await new Promise((resolve) => setTimeout(resolve, 150));
          upload.onprogress?.({ lengthComputable: true, loaded, total: 100 });
        }
        const result = await route(target.method, target.url, { method: target.method, body: data });
        fake.status = result.status;
        fake.responseText = JSON.stringify(result.body);
        fake.onload?.();
      },
    };
    return new Proxy(xhr, {
      get: (object, prop) => (prop in fake ? fake[prop] : typeof object[prop] === "function" ? object[prop].bind(object) : object[prop]),
      set: (object, prop, value) => { if (prop in fake) fake[prop] = value; else object[prop] = value; return true; },
    });
  };
}
