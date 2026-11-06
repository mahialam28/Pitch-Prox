import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { saveUpload } from "@/lib/storage";
import { CREATION_METHODS, EMAIL_TYPES, TEMPLATE_CATEGORIES, TEMPLATE_STATUSES, TRANSACTIONAL_EVENTS, eventByKey } from "@/lib/campaigns/catalog";
import { unsubscribeUrl } from "@/lib/campaigns/outbox";

// ── Email templates (Campaigns & Journeys → Templates) ──
// Creation methods (item 283): build (heading, text, button), design (uploaded images stacked
// vertically, each with alt text and an optional link, plus an optional CTA button) or html
// (an uploaded HTML email). Reusable in broadcasts, journeys and transactional emails.

export const appUrl = () => (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
const DESIGN_TYPES = ["png", "jpg", "jpeg"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_HTML_BYTES = 500 * 1024;

const parse = (value) => (typeof value === "string" ? JSON.parse(value) : value);
const COLUMNS = "id, name, email_type AS emailType, category, subject, preheader, from_name AS fromName, reply_to AS replyTo, creation_method AS creationMethod, content, html, status, trigger_event AS triggerEvent, created_by_name AS createdByName, created_at AS createdAt, updated_at AS updatedAt";

const toTemplate = (row, stats) => ({
  ...row,
  content: parse(row.content) ?? {},
  creationMethodLabel: CREATION_METHODS[row.creationMethod],
  triggerEventLabel: row.triggerEvent ? eventByKey(row.triggerEvent)?.label ?? row.triggerEvent : null,
  stats: stats ?? { sent: 0, queued: 0, opened: 0, clicked: 0 },
});

// ── Starter templates (Draft, so nothing sends until someone reviews and activates them) ──
const starter = (key, name, emailType, category, subject, heading, body, buttonLabel, triggerEvent = null) => ({ key, name, emailType, category, subject, content: { heading, body, buttonLabel, buttonUrl: "{App Link}", buttonColor: "#0EADAB" }, triggerEvent });
const STARTERS = [
  starter("trial-welcome", "Trial Welcome", "Lifecycle", "Onboarding", "Welcome to PitchProX, {First Name}", "Welcome to PitchProX!", "Hi {First Name},\n\nYour free trial is ready. A good first step is the voice calibration: it takes a few minutes and helps PitchProX coach you on live calls.\n\nIf you have any questions, just reply to this email.", "Open PitchProX"),
  starter("trial-ending", "Trial Ending Soon", "Lifecycle", "Trial", "Your PitchProX trial ends on {Trial End Date}", "Your trial is almost over", "Hi {First Name},\n\nYour free trial ends on {Trial End Date}. Choose a plan to keep your leads, playbooks and coaching history.", "Choose a Plan"),
  starter("calibration-reminder", "Calibration Reminder", "Lifecycle", "Onboarding", "Finish your voice calibration", "Two minutes to better coaching", "Hi {First Name},\n\nYou haven't finished your voice calibration yet. It helps PitchProX understand how you speak so its prompts fit your style.", "Start Calibration"),
  starter("usage-warning", "Usage Warning", "Lifecycle", "Usage", "You've used most of your calls this month", "You're running low on calls", "Hi {First Name},\n\nYou have {Calls Remaining} calls left on your {Plan} plan this month. Add more calls or move to a bigger plan so you don't get cut off mid-month.", "View Plans"),
  starter("call-limit", "Call Limit Reached", "Lifecycle", "Usage", "You've reached your call limit", "You've used all your calls", "Hi {First Name},\n\nYou've used every call included in your {Plan} plan this month. Buy extra calls or upgrade to keep calling.", "Get More Calls"),
  starter("we-miss-you", "Inactive User Recovery", "Lifecycle", "Retention", "We miss you, {First Name}", "Pick up where you left off", "Hi {First Name},\n\nIt's been a while since you signed in. Your leads and playbooks are waiting for you.", "Sign In"),
  starter("payment-processed", "Payment Processed", "Transactional", "Billing", "Payment received - thank you", "Payment received", "Hi {First Name},\n\nWe've received your payment for the {Plan} plan. Thank you!", "View Billing", "payment_succeeded"),
  starter("payment-failed", "Payment Failed", "Transactional", "Billing", "Your payment didn't go through", "We couldn't process your payment", "Hi {First Name},\n\nYour latest payment for the {Plan} plan failed. Please update your payment method to keep your account active.", "Update Payment Method", "payment_failed"),
  starter("subscription-confirmation", "Subscription Confirmation", "Transactional", "Billing", "Your PitchProX subscription is active", "You're all set", "Hi {First Name},\n\nYour {Plan} subscription is now active. Welcome aboard!", "Open PitchProX", "subscription_started"),
  starter("cancellation-confirmation", "Subscription Cancellation Confirmation", "Transactional", "Billing", "Your subscription has been cancelled", "Your subscription is cancelled", "Hi {First Name},\n\nWe've cancelled your {Plan} subscription. You keep access until the end of the current billing period. We'd love to have you back any time.", "Open PitchProX", "subscription_cancelled"),
];

let seeded = false;
async function seedStarters() {
  if (seeded) return;
  for (const item of STARTERS) {
    await query(
      "INSERT IGNORE INTO campaign_templates (id, name, email_type, category, subject, preheader, from_name, reply_to, creation_method, content, status, trigger_event, created_by_name) VALUES (?, ?, ?, ?, ?, NULL, 'PitchProX', NULL, 'build', ?, 'Draft', ?, 'PitchProX (starter)')",
      [`tpl_${item.key}`, item.name, item.emailType, item.category, item.subject, JSON.stringify(item.content), item.triggerEvent]
    );
  }
  seeded = true;
}

async function stats() {
  const rows = await query(
    "SELECT template_id AS templateId, SUM(status = 'sent') AS sent, SUM(status = 'queued') AS queued, SUM(opened_at IS NOT NULL) AS opened, SUM(clicked_at IS NOT NULL) AS clicked FROM email_deliveries WHERE template_id IS NOT NULL GROUP BY template_id"
  );
  return new Map(rows.map((row) => [row.templateId, { sent: Number(row.sent), queued: Number(row.queued), opened: Number(row.opened), clicked: Number(row.clicked) }]));
}

export async function listTemplates() {
  await seedStarters();
  const [rows, counts] = await Promise.all([query(`SELECT ${COLUMNS} FROM campaign_templates ORDER BY status = 'Archived', updated_at IS NULL, updated_at DESC, created_at DESC`), stats()]);
  return rows.map((row) => toTemplate(row, counts.get(row.id)));
}

export async function getTemplate(id) {
  await seedStarters();
  const [row] = await query(`SELECT ${COLUMNS} FROM campaign_templates WHERE id = ?`, [id]);
  if (!row) throw new ApiError("Template not found.", 404);
  return toTemplate(row, (await stats()).get(id));
}

// ── Validation ──
const cleanText = (value, label, max, { required = false } = {}) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (required && !trimmed) throw new ApiError(`${label} is required.`);
  if (trimmed.length > max) throw new ApiError(`${label} must be ${max} characters or fewer.`);
  return trimmed || null;
};
const EMAIL = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;
const URL_PATTERN = /^(https?:\/\/[^\s]+|\{App Link\})$/i;
const cleanUrl = (value, label, { required = false } = {}) => {
  const url = cleanText(value, label, 1000, { required });
  if (url && !URL_PATTERN.test(url)) throw new ApiError(`${label} must start with http:// or https://.`);
  return url;
};
const COLOR = /^#[0-9a-fA-F]{6}$/;

// Scripts, event handlers and javascript: links are removed (email clients block them anyway)
export function sanitizeHtml(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<(iframe|object|embed|form)[\s\S]*?<\/\1>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"');
}

async function cleanContent(method, content, existing) {
  if (method === "build") {
    return {
      heading: cleanText(content?.heading, "Heading", 200, { required: true }),
      body: cleanText(content?.body, "Email text", 20000, { required: true }),
      buttonLabel: cleanText(content?.buttonLabel, "Button label", 60),
      buttonUrl: cleanUrl(content?.buttonUrl, "Button link"),
      buttonColor: COLOR.test(content?.buttonColor ?? "") ? content.buttonColor : "#0EADAB",
    };
  }
  if (method === "design") {
    const images = Array.isArray(content?.images) ? content.images : [];
    if (!images.length) throw new ApiError("Upload at least one design image.");
    if (images.length > 20) throw new ApiError("A design can have up to 20 images.");
    const ids = images.map((image) => image.assetId);
    const assets = await query(`SELECT id FROM campaign_assets WHERE id IN (${ids.map(() => "?").join(", ")})`, ids);
    if (assets.length !== new Set(ids).size) throw new ApiError("Some design images are missing. Upload them again.");
    const cta = content?.cta ?? {};
    return {
      images: images.map((image, index) => ({
        assetId: image.assetId,
        alt: cleanText(image.alt, `Alt text for image ${index + 1}`, 200, { required: true }),
        link: cleanUrl(image.link, `Link for image ${index + 1}`),
      })),
      cta: cta.on
        ? { on: true, label: cleanText(cta.label, "Button label", 60, { required: true }), url: cleanUrl(cta.url, "Button destination URL", { required: true }), color: COLOR.test(cta.color ?? "") ? cta.color : "#0EADAB" }
        : { on: false },
    };
  }
  return existing ?? {};
}

async function fields(body, existing = null) {
  const merged = { ...(existing ?? {}), ...body };
  const method = merged.creationMethod;
  if (!CREATION_METHODS[method]) throw new ApiError("Choose a creation method.");
  if (existing && body.creationMethod !== undefined && body.creationMethod !== existing.creationMethod) throw new ApiError("The creation method can't change after a template is created. Make a new template instead.");
  const emailType = merged.emailType;
  if (!EMAIL_TYPES.includes(emailType)) throw new ApiError("Choose an email type: Marketing, Lifecycle or Transactional.");
  if (!TEMPLATE_CATEGORIES.includes(merged.category)) throw new ApiError("Choose a valid category.");
  const status = merged.status ?? "Draft";
  if (!TEMPLATE_STATUSES.includes(status)) throw new ApiError("Status must be Draft, Active or Archived.");
  const replyTo = cleanText(merged.replyTo, "Reply-to email", 255);
  if (replyTo && !EMAIL.test(replyTo)) throw new ApiError("Enter a valid reply-to email.");
  let triggerEvent = merged.triggerEvent || null;
  if (triggerEvent && (emailType !== "Transactional" || !TRANSACTIONAL_EVENTS.includes(triggerEvent))) throw new ApiError("Only Transactional templates can be sent automatically on an event.");
  if (emailType !== "Transactional") triggerEvent = null;

  let html = existing?.html ?? null;
  if (method === "html" && body.html !== undefined) {
    if (typeof body.html !== "string" || !body.html.trim()) throw new ApiError("Upload the HTML email file.");
    if (Buffer.byteLength(body.html) > MAX_HTML_BYTES) throw new ApiError("The HTML file must be 500 KB or smaller.");
    if (!/<(html|body|table|div|p)\b/i.test(body.html)) throw new ApiError("That file doesn't look like an HTML email.");
    html = sanitizeHtml(body.html);
  }
  if (method === "html" && !html) throw new ApiError("Upload the HTML email file.");

  return {
    name: cleanText(merged.name, "Template name", 120, { required: true }),
    email_type: emailType,
    category: merged.category,
    subject: cleanText(merged.subject, "Subject line", 255, { required: true }),
    preheader: cleanText(merged.preheader, "Preheader", 255),
    from_name: cleanText(merged.fromName, "From name", 120, { required: true }),
    reply_to: replyTo,
    creation_method: method,
    content: JSON.stringify(body.content !== undefined || !existing ? await cleanContent(method, body.content, existing?.content) : existing.content),
    html,
    status,
    trigger_event: triggerEvent,
  };
}

// Only one Active template per transactional event, so an event never sends two emails
async function assertTriggerFree(item, id = null) {
  if (!item.trigger_event || item.status !== "Active") return;
  const [other] = await query("SELECT name FROM campaign_templates WHERE trigger_event = ? AND status = 'Active' AND id <> ?", [item.trigger_event, id ?? ""]);
  if (other) throw new ApiError(`"${other.name}" is already sent on ${eventByKey(item.trigger_event)?.label}. Turn that one off first.`, 409);
}

export async function createTemplate(user, body) {
  const item = await fields(body ?? {});
  await assertTriggerFree(item);
  const id = createId("tpl");
  await query(
    `INSERT INTO campaign_templates (id, ${Object.keys(item).join(", ")}, created_by, created_by_name) VALUES (?, ${Object.keys(item).map(() => "?").join(", ")}, ?, ?)`,
    [id, ...Object.values(item), user.id, user.name]
  );
  await recordAudit(user, { action: "campaigns.template_created", entityType: "template", entityId: id, summary: `Created the ${item.email_type.toLowerCase()} template "${item.name}"` });
  return getTemplate(id);
}

export async function updateTemplate(user, id, body) {
  const existing = await getTemplate(id);
  const item = await fields(body ?? {}, existing);
  await assertTriggerFree(item, id);
  await query(`UPDATE campaign_templates SET ${Object.keys(item).map((key) => `${key} = ?`).join(", ")}, updated_at = NOW() WHERE id = ?`, [...Object.values(item), id]);
  await recordAudit(user, { action: "campaigns.template_updated", entityType: "template", entityId: id, summary: `Updated the template "${item.name}"${existing.status !== item.status ? ` (${item.status})` : ""}` });
  return getTemplate(id);
}

// Templates already used are archived instead of deleted, so sent emails keep their history
export async function deleteTemplate(user, id) {
  const template = await getTemplate(id);
  const [{ used }] = await query("SELECT (SELECT COUNT(*) FROM email_deliveries WHERE template_id = ?) + (SELECT COUNT(*) FROM campaigns WHERE template_id = ? AND status <> 'canceled') AS used", [id, id]);
  const journeys = await query("SELECT name FROM journeys WHERE status <> 'archived' AND JSON_SEARCH(steps, 'one', ?) IS NOT NULL", [id]);
  if (journeys.length) throw new ApiError(`The journey "${journeys[0].name}" sends this template. Remove it from the journey first.`, 409);
  if (Number(used)) {
    await query("UPDATE campaign_templates SET status = 'Archived', updated_at = NOW() WHERE id = ?", [id]);
    await recordAudit(user, { action: "campaigns.template_updated", entityType: "template", entityId: id, summary: `Archived the template "${template.name}" (it has been used)` });
    return { archived: true };
  }
  await query("DELETE FROM campaign_templates WHERE id = ?", [id]);
  await recordAudit(user, { action: "campaigns.template_deleted", entityType: "template", entityId: id, summary: `Deleted the template "${template.name}"` });
  return { archived: false };
}

export async function duplicateTemplate(user, id) {
  const template = await getTemplate(id);
  const newId = createId("tpl");
  await query(
    "INSERT INTO campaign_templates (id, name, email_type, category, subject, preheader, from_name, reply_to, creation_method, content, html, status, trigger_event, created_by, created_by_name) SELECT ?, ?, email_type, category, subject, preheader, from_name, reply_to, creation_method, content, html, 'Draft', NULL, ?, ? FROM campaign_templates WHERE id = ?",
    [newId, `${template.name} (copy)`.slice(0, 120), user.id, user.name, id]
  );
  return getTemplate(newId);
}

// "Upload Design" images (PNG/JPG). Served publicly so they show inside emails.
export async function uploadAsset(user, file) {
  const saved = await saveUpload("campaign-assets", file, { maxBytes: MAX_IMAGE_BYTES, allowed: DESIGN_TYPES });
  const id = createId("asset");
  await query("INSERT INTO campaign_assets (id, storage_path, name, mime, size, created_by) VALUES (?, ?, ?, ?, ?, ?)", [id, saved.storagePath, saved.name, saved.mime, saved.size, user.id]);
  return { assetId: id, name: saved.name, size: saved.size, url: assetUrl(id) };
}
export const assetUrl = (id) => `${appUrl()}/api/v1/public/campaign-assets/${id}`;

export async function loadAsset(id) {
  const [row] = await query("SELECT storage_path AS storagePath, mime FROM campaign_assets WHERE id = ?", [id]);
  if (!row) throw new ApiError("Image not found.", 404);
  return row;
}

// ── Rendering ──
const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

export function mergeValues(profile) {
  const firstName = (profile?.name ?? "").split(/\s+/)[0] || "there";
  return {
    "{First Name}": firstName,
    "{Name}": profile?.name ?? "",
    "{Company}": profile?.company ?? "",
    "{Plan}": profile?.plan ?? "",
    "{Trial End Date}": profile?.trialEnd ? new Date(`${profile.trialEnd}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : "",
    "{Calls Remaining}": profile?.callsRemaining ?? "",
    "{Email}": profile?.email ?? "",
    "{App Link}": appUrl(),
  };
}
const merge = (text, values, { html = false } = {}) => String(text ?? "").replace(/\{[A-Za-z ]+\}/g, (token) => (token in values ? (html ? escape(values[token]) : String(values[token])) : token));

const button = (label, url, color) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto"><tr><td style="background:${color};border-radius:10px"><a href="${escape(url)}" style="display:inline-block;padding:12px 24px;color:#ffffff;font-weight:600;text-decoration:none;font-family:Arial,sans-serif">${escape(label)}</a></td></tr></table>`;

function shell(inner, { preheader, footer }) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f4f5f7">${preheader ? `<div style="display:none;max-height:0;overflow:hidden">${escape(preheader)}</div>` : ""}<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden">${inner}</table>${footer}</td></tr></table></body></html>`;
}

// Subject and HTML for one person. `options.unsubscribe` adds the footer link (Marketing and Lifecycle).
export async function renderTemplate(template, profile, { preview = false } = {}) {
  const values = mergeValues(profile);
  const subject = merge(template.subject, values);
  const preheader = merge(template.preheader ?? "", values);
  const unsubscribe = template.emailType !== "Transactional" && profile?.email ? (preview ? "#" : await unsubscribeUrl(profile.email)) : null;
  const footer = `<p style="font-family:Arial,sans-serif;font-size:11px;color:#8a94a6;margin:16px 0 0">PitchProX${unsubscribe ? ` · <a href="${escape(unsubscribe)}" style="color:#8a94a6">Unsubscribe</a>` : ""}</p>`;

  if (template.creationMethod === "html") {
    let html = merge(template.html ?? "", values, { html: true });
    if (unsubscribe && !/unsubscribe/i.test(html)) html = html.replace(/<\/body>/i, `${footer}</body>`);
    return { subject, html: /<\/body>/i.test(html) ? html : `${html}${footer}` };
  }
  if (template.creationMethod === "design") {
    const { images = [], cta = {} } = template.content ?? {};
    const rows = images
      .map((image) => {
        const img = `<img src="${escape(assetUrl(image.assetId))}" alt="${escape(image.alt)}" width="600" style="display:block;width:100%;height:auto;border:0">`;
        return `<tr><td>${image.link ? `<a href="${escape(merge(image.link, values))}">${img}</a>` : img}</td></tr>`;
      })
      .join("");
    const ctaRow = cta.on ? `<tr><td align="center" style="padding:0 24px 8px">${button(cta.label, merge(cta.url, values), cta.color)}</td></tr>` : "";
    return { subject, html: shell(rows + ctaRow, { preheader, footer }) };
  }
  const content = template.content ?? {};
  const paragraphs = merge(content.body ?? "", values)
    .split(/\n{2,}/)
    .map((paragraph) => `<p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#344054">${escape(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
  const inner = `<tr><td style="background:#0EADAB;padding:20px 32px;font-family:Arial,sans-serif;font-size:20px;font-weight:700;color:#ffffff">PitchProX</td></tr><tr><td style="padding:32px"><h1 style="margin:0 0 18px;font-family:Arial,sans-serif;font-size:22px;color:#101828">${escape(merge(content.heading ?? "", values))}</h1>${paragraphs}${content.buttonLabel && content.buttonUrl ? button(content.buttonLabel, merge(content.buttonUrl, values), content.buttonColor ?? "#0EADAB") : ""}</td></tr>`;
  return { subject, html: shell(inner, { preheader, footer }) };
}

export const TEMPLATE_LIMITS = { MAX_IMAGE_BYTES, MAX_HTML_BYTES, DESIGN_TYPES };
