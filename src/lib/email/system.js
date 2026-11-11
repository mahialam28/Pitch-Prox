import { after } from "next/server";
import { deliverQueued, queueEmail } from "@/lib/campaigns/outbox";

// ── System emails (Transactional stream) ──
// Password resets, employee invites and customer activation links. They go through the same
// outbox as every other email (so they show on Campaigns → Delivery) and are handed to Postmark
// right after the response instead of waiting for the next job run.

const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
export const appUrl = (path = "") => `${(process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "")}${path}`;

// Simple branded layout that renders well in every mail app (tables + inline styles)
export function systemLayout({ heading, paragraphs = [], button, footnote }) {
  const text = paragraphs.map((line) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#344054">${escape(line)}</p>`).join("");
  const cta = button
    ? `<p style="margin:24px 0"><a href="${escape(button.url)}" style="display:inline-block;background:#00B3BA;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:12px 24px;border-radius:10px">${escape(button.label)}</a></p><p style="margin:0 0 16px;font-size:12px;line-height:1.6;color:#667085">If the button doesn't work, copy this link into your browser:<br><a href="${escape(button.url)}" style="color:#00B3BA;word-break:break-all">${escape(button.url)}</a></p>`
    : "";
  const note = footnote ? `<p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#667085">${escape(footnote)}</p>` : "";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(heading)}</title></head><body style="margin:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 12px"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:32px"><tr><td><p style="margin:0 0 24px;font-size:20px;font-weight:bold;color:#00B3BA">PitchProX</p><h1 style="margin:0 0 16px;font-size:22px;color:#101828">${escape(heading)}</h1>${text}${cta}${note}</td></tr></table><p style="margin:16px 0 0;font-size:11px;color:#8a94a6">PitchProX</p></td></tr></table></body></html>`;
}

// kind: password_reset | staff_invite | customer_activation (kept in source_id)
export async function sendSystemEmail({ kind, userId = null, email, subject, html }) {
  const { id } = await queueEmail({ source: "system", sourceId: kind, template: { id: null, emailType: "Transactional" }, userId, email, subject, html });
  after(async () => {
    try {
      await deliverQueued({ ids: [id] });
    } catch (error) {
      console.error("System email delivery failed", error);
    }
  });
  return id;
}

export async function sendStaffInviteEmail({ userId, name, email, token, roleLabel, invitedBy }) {
  const url = appUrl(`/accept-invite?token=${encodeURIComponent(token)}`);
  return sendSystemEmail({
    kind: "staff_invite",
    userId,
    email,
    subject: "You're invited to join PitchProX",
    html: systemLayout({
      heading: `Welcome to PitchProX, ${String(name).split(" ")[0]}`,
      paragraphs: [`${invitedBy ? `${invitedBy} has invited you` : "You've been invited"} to join the PitchProX team${roleLabel ? ` as ${roleLabel}` : ""}.`, "Click below to set your password and start onboarding."],
      button: { label: "Accept invite", url },
      footnote: "This link works once and expires in 7 days. If you weren't expecting it, you can ignore this email.",
    }),
  });
}

export async function sendCustomerActivationEmail({ userId, name, email, token, company }) {
  const url = appUrl(`/activate?token=${encodeURIComponent(token)}`);
  return sendSystemEmail({
    kind: "customer_activation",
    userId,
    email,
    subject: "Activate your PitchProX account",
    html: systemLayout({
      heading: `Hi ${String(name).split(" ")[0]}, your account is ready`,
      paragraphs: [`Your PitchProX account${company ? ` for ${company}` : ""} has been created. Choose a password to activate it.`],
      button: { label: "Activate account", url },
      footnote: "This link works once and expires in 14 days. If you weren't expecting it, you can ignore this email.",
    }),
  });
}

export async function sendPasswordResetEmail({ userId, name, email, token }) {
  const url = appUrl(`/reset-password?token=${encodeURIComponent(token)}`);
  return sendSystemEmail({
    kind: "password_reset",
    userId,
    email,
    subject: "Reset your PitchProX password",
    html: systemLayout({
      heading: "Reset your password",
      paragraphs: [`Hi ${String(name).split(" ")[0]}, we received a request to reset the password for your PitchProX account.`],
      button: { label: "Choose a new password", url },
      footnote: "This link works once and expires in 1 hour. If you didn't ask for it, you can ignore this email: your password stays the same.",
    }),
  });
}
