import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { INTERNAL_ORGANIZATION } from "@/lib/staff";
import { savePhones, parsePhones } from "@/lib/phones";
import { appUrl, sendSystemEmail, systemLayout } from "@/lib/email/system";
import { notify, usersWithRoles } from "@/lib/notifications";
import { ROLES } from "@/utils.js/roles";

// ── "See how it works" (website, Phase 14) ──
// The visitor sees the video and the plans straight away (client's mockup, Nov 10) and also gets
// the link by email. The request becomes a prospect in PitchProX's own CRM (Admin Manager → CRM) so
// the sales team can follow up, and Admin Managers are told in the bell.

const EMAIL = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;
const ROLE_LABELS = { "sales-rep": "Sales Representative", "sales-manager": "Sales Manager / Director", exec: "Executive / Founder", other: "Other" };
const SOURCE_LABELS = { google: "Search engine", social: "Social media", referral: "Friend or colleague", ad: "Online advertisement" };

const clean = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) || null : null);

export async function createDemoRequest(body, { ip = null } = {}) {
  const name = clean(body.fullName ?? body.name, 255);
  const email = clean(body.workEmail ?? body.email, 255)?.toLowerCase();
  if (!name) throw new ApiError("Enter your full name.");
  if (!email || !EMAIL.test(email)) throw new ApiError("Enter a valid email address.");
  const phone = clean(body.phoneNumber, 64);
  const phones = phone ? parsePhones({ phones: [{ number: phone, label: "Mobile" }] }) : [];
  const company = clean(body.company, 255);
  const role = ROLE_LABELS[body.roleDescription] ? body.roleDescription : null;
  const source = SOURCE_LABELS[body.referralSource] ? body.referralSource : null;
  const notes = clean(body.additionalNotes, 2000);

  // A prospect in PitchProX's own CRM (unassigned: managers see it and can hand it to a rep)
  await query("INSERT IGNORE INTO organizations (id, name) VALUES (?, ?)", [INTERNAL_ORGANIZATION.id, INTERNAL_ORGANIZATION.name]);
  const prospectId = createId("prospect");
  const leadNotes = [
    'Asked for the "See how it works" video on the website.',
    company && `Company: ${company}`,
    role && `Role: ${ROLE_LABELS[role]}`,
    source && `Heard about us: ${SOURCE_LABELS[source]}`,
    notes && `Message: ${notes}`,
  ].filter(Boolean).join("\n");
  await query("INSERT INTO prospects (id, organization_id, name, email, phone_number, property_address, stage, status, notes) VALUES (?, ?, ?, ?, ?, ?, 'New', 'Warm', ?)", [
    prospectId, INTERNAL_ORGANIZATION.id, name, email, phones[0]?.number ?? null, company, leadNotes,
  ]);
  if (phones.length) await savePhones("prospect", prospectId, INTERNAL_ORGANIZATION.id, phones);

  const id = createId("demo");
  await query("INSERT INTO demo_requests (id, name, email, phone, company, role, source, notes, lead_id, ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id, name, email, phone, company, role, source, notes, prospectId, ip]);

  await sendSystemEmail({
    kind: "demo_video",
    email,
    subject: "Your PitchProX video is ready",
    html: systemLayout({
      heading: `Hi ${name.split(" ")[0]}, your video is ready`,
      paragraphs: ["Here's the 9-minute look at how PitchProX gives you the right words during live sales calls.", "When you're ready, start free with 10 live AI-guided calls and a detailed call report."],
      button: { label: "Watch the video", url: appUrl(`/see-how-it-works?r=${encodeURIComponent(id)}`) },
      footnote: "You're receiving this because you asked for the video on pitchprox.com.",
    }),
  });

  await notify(await usersWithRoles([ROLES.ADMIN_MANAGER]), {
    type: "lead",
    title: `New demo request: ${name}`,
    body: [company, email].filter(Boolean).join(" · "),
    link: "/super-admin/crm",
    entityType: "prospect",
    entityId: prospectId,
  });
  return { id };
}

// The video page records when the visitor started and finished watching
export async function recordDemoWatch(id, event) {
  if (typeof id !== "string" || !id.startsWith("demo_")) throw new ApiError("Not found.", 404);
  const column = event === "completed" ? "video_completed_at" : event === "started" ? "video_started_at" : null;
  if (!column) throw new ApiError("Unknown event.");
  const result = await query(`UPDATE demo_requests SET ${column} = COALESCE(${column}, NOW()) WHERE id = ?`, [id]);
  if (!result.affectedRows) throw new ApiError("Not found.", 404);
  return { recorded: true };
}
