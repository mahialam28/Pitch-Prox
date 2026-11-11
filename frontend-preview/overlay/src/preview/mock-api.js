"use client";

// ── Design preview: a pretend API that lives in the browser ──
// The Frontend build has no server or database. Every request to /api/v1/... is answered
// here from sample data (fixtures.json, recorded from the real app), so all screens work.
// Changes (adding a lead, replying to a ticket…) are kept in this browser's storage and
// can be reset by signing out.
import FIXTURES from "./fixtures.json";
import { PERSONAS, personaFromCookie, previewIdentity } from "./personas";
import QRCode from "qrcode";
import { checkPlaybook } from "@/lib/playbook-compile";

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
  { base: "/api/v1/campaigns/templates", key: "template", prefix: "tpl" },
  { base: "/api/v1/campaigns/journeys", key: "journey", prefix: "jrny" },
  { base: "/api/v1/campaigns/broadcasts", key: "campaign", prefix: "camp" },
  { base: "/api/v1/mail/templates", key: "template", prefix: "mailtpl" },
  { base: "/api/v1/announcements", key: "announcement", prefix: "ann" },
  { base: "/api/v1/admin/playbook-resources", key: "resource", prefix: "plres" },
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
  const special = await previewFeatures(method, path, body, store, save, persona);
  if (special) return special;
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

// ── Phases 6-11 in the preview: calibration gate, Playbook Builder, follow-up emails,
// notifications, Mail drafts, two-step login ──
const placeholderLine = /\{([^{}]{1,60})\}/g;
async function previewFeatures(method, path, body, store, save, persona) {
  const user = PERSONAS[persona].user;

  // Calibration: one saved session unlocks calling
  if (path === "/api/v1/calibration/sessions" && method === "POST" && store["/api/v1/calibration/status"]) {
    Object.assign(store["/api/v1/calibration/status"].json, { completed: true });
  }
  if (path === "/api/v1/calibration/defer") {
    const status = (store["/api/v1/calibration/status"] ??= { status: 200, json: { required: true, completed: false, deferredAt: null, sessions: 0 } });
    status.json.deferredAt = now();
    save();
    return ok(status.json);
  }

  // Playbook Builder: drafts saved in this browser; the real publish checks run here too
  const BUILDS = "/api/v1/admin/playbook-builds";
  if (path === `${BUILDS}/files`) return ok({ file: { id: newId("file"), name: body.file?.name ?? "file", size: "1 KB", type: (body.file?.name ?? "").split(".").pop(), url: "/api/v1/admin/playbook-builds/files/preview" } });
  if (path === BUILDS && method === "POST") {
    const build = { id: newId("build"), playbookId: body.playbookId ?? null, content: body.content ?? {}, currentStep: body.currentStep ?? 1, revision: 1, updatedAt: now(), createdAt: now() };
    store[`${BUILDS}/${build.id}`] = { status: 200, json: { build } };
    const list = (store[BUILDS] ??= { status: 200, json: { drafts: [], playbooks: [] } });
    (list.json.drafts ??= []).unshift({ id: build.id, title: build.content.playbookName || "Untitled playbook", playbookId: build.playbookId, currentStep: build.currentStep, updatedAt: build.updatedAt, updatedBy: user.name });
    save();
    return json(201, { build });
  }
  const buildMatch = path.match(/^\/api\/v1\/admin\/playbook-builds\/([^/]+)(?:\/(check|publish))?$/);
  if (buildMatch) {
    const [, id, action] = buildMatch;
    const entry = store[`${BUILDS}/${id}`];
    const build = entry?.json?.build;
    if (!build) return json(404, { error: "Draft not found." });
    if (method === "DELETE") {
      delete store[`${BUILDS}/${id}`];
      if (store[BUILDS]?.json?.drafts) store[BUILDS].json.drafts = store[BUILDS].json.drafts.filter((draft) => draft.id !== id);
      save();
      return ok({ deleted: true });
    }
    if (action === "check") return ok({ ...checkPlaybook(build.content), revision: build.revision, nextVersion: 1, changedSections: null, releaseNotesRequired: false });
    if (action === "publish") {
      const check = checkPlaybook(build.content);
      if (check.errors.length) return json(422, { ok: false, ...check });
      if (check.warnings.length && !body.acknowledgeWarnings) return json(422, { ok: false, ...check, needsAcknowledgement: true });
      return ok({ ok: true, playbookId: build.playbookId ?? newId("published"), version: 1 });
    }
    if (method === "PATCH" || method === "PUT") {
      Object.assign(build, { content: body.content ?? build.content, currentStep: body.currentStep ?? build.currentStep, revision: build.revision + 1, updatedAt: now() });
      const draft = store[BUILDS]?.json?.drafts?.find((item) => item.id === id);
      if (draft) Object.assign(draft, { title: build.content.playbookName || draft.title, currentStep: build.currentStep, updatedAt: build.updatedAt, updatedBy: user.name });
      save();
      return ok({ build });
    }
  }

  // After-call "Send an email": a draft from the active playbook's template, known facts only
  if (path === "/api/v1/follow-up/draft") {
    const template = store["/api/v1/follow-up"]?.json?.templates?.find((item) => item.id === body.templateId);
    if (!template) return json(404, { error: "This email template isn't part of your active playbook." });
    const name = String(body.leadName || "").trim();
    const values = { "Prospect Name": name, "Prospect First Name": name.split(" ")[0], "Your Name": user.name, "Your First Name": user.name.split(" ")[0], "Your Email": user.email, "Your Company": user.organizationName ?? "PitchProX" };
    const facts = body.facts ?? {};
    const when = (value) => { const date = value ? new Date(value) : null; return date && !Number.isNaN(date.getTime()) ? { date: date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }), time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) } : null; };
    const appointment = when(facts.appointmentAt);
    const followUp = when(facts.followUpAt);
    Object.assign(values, { "Appointment Date": appointment?.date, "Appointment Time": appointment?.time, "Follow-Up Date": followUp?.date, "Follow-Up Time": followUp?.time, "Agreed Channel": facts.channel?.toLowerCase(), "Requested Information": facts.requestedInformation, Concern: facts.concern, "Meeting Topic": facts.meetingTopic });
    const left = new Set();
    const lines = [];
    for (const line of template.body.split("\n")) {
      const missing = [...line.matchAll(placeholderLine)].map((match) => match[1]).filter((key) => !values[key]);
      if (missing.length) { missing.forEach((key) => left.add(key)); if (/^\s*(Hi|Hello|Dear)\s+\{/.test(line)) lines.push("Hi,"); continue; }
      lines.push(line.replace(placeholderLine, (_, key) => values[key]));
    }
    const subject = template.subject.replace(/\s*(?:\b(?:on|at|for|about)\s+)?\{([^{}]{1,60})\}/g, (whole, key) => (values[key] ? whole.replace(`{${key}}`, values[key]) : (left.add(key), ""))).trim();
    return ok({ to: "", subject: subject || template.name, body: lines.join("\n").replace(/\n{3,}/g, "\n\n").trim(), templateName: template.name, playbook: store["/api/v1/follow-up"].json.playbook, contact: null, leftOut: [...left] });
  }

  // Notifications: read, unread, delete, read all
  const NOTIFICATIONS = "/api/v1/notifications";
  if (path.startsWith(NOTIFICATIONS)) {
    const list = (store[NOTIFICATIONS] ??= { status: 200, json: { results: [], hasMore: false, unreadCount: 0 } });
    const results = (list.json.results ??= []);
    const recount = () => { list.json.unreadCount = results.filter((item) => item.isUnread).length; save(); return list.json.unreadCount; };
    if (path === `${NOTIFICATIONS}/read-all`) { results.forEach((item) => { item.isUnread = false; }); return ok({ marked: 1, unreadCount: recount() }); }
    const id = path.slice(NOTIFICATIONS.length + 1);
    const item = results.find((row) => row.id === id);
    if (!item) return json(404, { error: "Notification not found." });
    if (method === "DELETE") { list.json.results = results.filter((row) => row.id !== id); return ok({ deleted: true, unreadCount: (list.json.unreadCount = list.json.results.filter((row) => row.isUnread).length, save(), list.json.unreadCount) }); }
    item.isUnread = body.read === false;
    return ok({ notification: item, unreadCount: recount() });
  }

  // Mail: drafts and sending (nothing leaves the preview)
  if (path === "/api/v1/mail/messages" && method === "POST") {
    const message = { id: newId("mail"), toEmail: body.to ?? "", cc: body.cc || null, bcc: body.bcc || null, subject: body.subject ?? "", body: body.body ?? "", trackOpens: body.trackOpens !== false, status: body.draft ? "draft" : "waiting", senderName: user.name, senderEmail: user.email, createdAt: now(), updatedAt: body.draft ? now() : null };
    const list = (store[path] ??= { status: 200, json: { results: [], count: 0 } });
    list.json.results = [message, ...(list.json.results ?? [])];
    list.json.count = list.json.results.length;
    store[`${path}/${message.id}`] = { status: 200, json: { message } };
    save();
    return json(201, { message });
  }
  const mailMatch = path.match(/^\/api\/v1\/mail\/messages\/([^/]+)$/);
  if (mailMatch && method !== "GET") {
    const id = mailMatch[1];
    const list = store["/api/v1/mail/messages"];
    const message = list?.json?.results?.find((item) => item.id === id);
    if (!message) return json(404, { error: "Email not found." });
    if (message.status !== "draft") return json(409, { error: "This email was already sent, so it can't be changed." });
    if (method === "DELETE") { list.json.results = list.json.results.filter((item) => item.id !== id); delete store[path]; save(); return ok({ deleted: true }); }
    Object.assign(message, { toEmail: body.to ?? message.toEmail, cc: body.cc || null, bcc: body.bcc || null, subject: body.subject ?? message.subject, body: body.body ?? message.body, trackOpens: body.trackOpens !== false, updatedAt: now() });
    if (body.send) Object.assign(message, { status: "waiting", createdAt: now(), updatedAt: null });
    store[path] = { status: 200, json: { message } };
    save();
    return ok({ message });
  }

  // Two-step login: a real QR code; any 6 digits confirm it in the preview
  if (path.startsWith("/api/v1/me/mfa/")) {
    const status = (store["/api/v1/me/mfa"] ??= { status: 200, json: { enabled: false, enabledAt: null, recoveryCodesLeft: 0 } });
    const action = path.split("/").pop();
    const codes = () => Array.from({ length: 10 }, () => Math.random().toString(36).slice(2, 14).replace(/(.{4})(.{4})(.{4})/, "$1-$2-$3"));
    if (action === "setup") {
      const secret = Array.from({ length: 32 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"[Math.floor(Math.random() * 32)]).join("");
      const otpauthUrl = `otpauth://totp/PitchProX:${encodeURIComponent(user.email)}?secret=${secret}&issuer=PitchProX`;
      return ok({ secret: secret.match(/.{1,4}/g).join(" "), otpauthUrl, qrCode: await QRCode.toDataURL(otpauthUrl, { margin: 1, width: 220 }) });
    }
    if (action === "confirm") {
      if (!/^\d{6}$/.test(String(body.code ?? ""))) return json(400, { error: "Enter the 6-digit code from your authenticator app." });
      Object.assign(status.json, { enabled: true, enabledAt: now(), recoveryCodesLeft: 10 });
      save();
      return ok({ ...status.json, recoveryCodes: codes() });
    }
    if (action === "disable") { Object.assign(status.json, { enabled: false, enabledAt: null, recoveryCodesLeft: 0 }); save(); return ok(status.json); }
    if (action === "recovery-codes") { status.json.recoveryCodesLeft = 10; save(); return ok({ ...status.json, recoveryCodes: codes() }); }
  }
  return null;
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
