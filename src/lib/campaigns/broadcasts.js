import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { getTemplate, renderTemplate } from "@/lib/campaigns/templates";
import { allSegments, segmentMembers } from "@/lib/campaigns/segments";
import { queueEmail, suppressedSet } from "@/lib/campaigns/outbox";

// ── Broadcast campaigns (one-time or scheduled sends to a segment) ──
// Send Now hands the emails to the outbox straight away; Schedule waits for the job runner.
// Recipients are worked out at send time, so a Dynamic segment uses whoever matches then.

const COLUMNS = `campaigns.id, campaigns.name, campaigns.segment_id AS segmentId, campaign_segments.name AS segmentName, campaigns.template_id AS templateId,
  campaign_templates.name AS templateName, campaign_templates.email_type AS emailType, campaigns.send_option AS sendOption, campaigns.scheduled_at AS scheduledAt,
  campaigns.optimize_send_time AS optimizeSendTime, campaigns.status, campaigns.recipients, campaigns.sent_at AS sentAt, campaigns.canceled_at AS canceledAt,
  campaigns.created_by_name AS createdByName, campaigns.created_at AS createdAt`;
const FROM = "FROM campaigns LEFT JOIN campaign_segments ON campaign_segments.id = campaigns.segment_id LEFT JOIN campaign_templates ON campaign_templates.id = campaigns.template_id";

async function deliveryStats(ids) {
  if (!ids.length) return new Map();
  const rows = await query(
    `SELECT source_id AS id, COUNT(*) AS total, SUM(status = 'sent') AS sent, SUM(status = 'queued') AS queued, SUM(status = 'failed') AS failed, SUM(status = 'skipped') AS skipped,
      SUM(opened_at IS NOT NULL) AS opened, SUM(clicked_at IS NOT NULL) AS clicked
     FROM email_deliveries WHERE source = 'campaign' AND source_id IN (${ids.map(() => "?").join(", ")}) GROUP BY source_id`,
    ids
  );
  return new Map(rows.map((row) => [row.id, Object.fromEntries(Object.entries(row).filter(([key]) => key !== "id").map(([key, value]) => [key, Number(value)]))]));
}

const withStats = (row, stats) => {
  const s = stats.get(row.id) ?? { total: 0, sent: 0, queued: 0, failed: 0, skipped: 0, opened: 0, clicked: 0 };
  return { ...row, optimizeSendTime: Boolean(row.optimizeSendTime), stats: s, openRate: s.sent ? Math.round((s.opened / s.sent) * 1000) / 10 : null, clickRate: s.sent ? Math.round((s.clicked / s.sent) * 1000) / 10 : null };
};

export async function listCampaigns() {
  const rows = await query(`SELECT ${COLUMNS} ${FROM} ORDER BY COALESCE(campaigns.sent_at, campaigns.scheduled_at, campaigns.created_at) DESC LIMIT 500`);
  const stats = await deliveryStats(rows.map((row) => row.id));
  return rows.map((row) => withStats(row, stats));
}

export async function getCampaign(id) {
  const [row] = await query(`SELECT ${COLUMNS} ${FROM} WHERE campaigns.id = ?`, [id]);
  if (!row) throw new ApiError("Campaign not found.", 404);
  return withStats(row, await deliveryStats([id]));
}

async function validate(body) {
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) throw new ApiError("Campaign name is required.");
  if (name.length > 160) throw new ApiError("Campaign name must be 160 characters or fewer.");
  const [segment] = body.segmentId ? await allSegments({ ids: [body.segmentId] }) : [];
  if (!segment) throw new ApiError("Choose a target segment.");
  if (!body.templateId) throw new ApiError("Choose an email template.");
  const template = await getTemplate(body.templateId);
  if (template.status !== "Active") throw new ApiError("Only Active templates can be sent. Activate the template first.");
  if (template.emailType === "Transactional") throw new ApiError("Transactional templates are sent by system events, not broadcasts.");
  const sendOption = body.sendOption === "schedule" ? "schedule" : body.sendOption === "now" ? "now" : null;
  if (!sendOption) throw new ApiError("Choose Send Now or Schedule.");
  let scheduledAt = new Date();
  if (sendOption === "schedule") {
    scheduledAt = new Date(body.scheduledAt);
    if (!body.scheduledAt || Number.isNaN(scheduledAt.getTime())) throw new ApiError("Choose the date and time to send.");
    if (scheduledAt < new Date(Date.now() + 60000)) throw new ApiError("Schedule the campaign at least a minute from now.");
    if (scheduledAt > new Date(Date.now() + 366 * 86400000)) throw new ApiError("Campaigns can be scheduled up to a year ahead.");
  }
  // Send-time optimization isn't built yet; when it is, it stays an opt-in toggle (items 297–298)
  if (body.optimizeSendTime) throw new ApiError("Send-time optimization isn't available yet.");
  return { name, segment, template, sendOption, scheduledAt: new Date(Math.floor(scheduledAt.getTime() / 1000) * 1000) };
}

export async function createCampaign(user, body) {
  const item = await validate(body);
  const id = createId("camp");
  await query(
    "INSERT INTO campaigns (id, name, segment_id, template_id, send_option, scheduled_at, status, created_by, created_by_name) VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?, ?)",
    [id, item.name, item.segment.id, item.template.id, item.sendOption, item.scheduledAt, user.id, user.name]
  );
  await recordAudit(user, {
    action: "campaigns.campaign_created",
    entityType: "campaign",
    entityId: id,
    summary: item.sendOption === "now" ? `Sent the campaign "${item.name}" to "${item.segment.name}"` : `Scheduled the campaign "${item.name}" for ${item.scheduledAt.toISOString()}`,
  });
  if (item.sendOption === "now") await dispatchCampaign(id);
  return getCampaign(id);
}

// Reschedule or change a campaign that hasn't gone out yet
export async function updateCampaign(user, id, body) {
  const campaign = await getCampaign(id);
  if (campaign.status !== "scheduled") throw new ApiError("Only scheduled campaigns can be changed.", 409);
  const item = await validate({ name: campaign.name, segmentId: campaign.segmentId, templateId: campaign.templateId, sendOption: "schedule", scheduledAt: campaign.scheduledAt, ...body });
  await query("UPDATE campaigns SET name = ?, segment_id = ?, template_id = ?, send_option = ?, scheduled_at = ?, updated_at = NOW() WHERE id = ? AND status = 'scheduled'", [item.name, item.segment.id, item.template.id, item.sendOption, item.scheduledAt, id]);
  await recordAudit(user, { action: "campaigns.campaign_updated", entityType: "campaign", entityId: id, summary: `Updated the campaign "${item.name}"` });
  if (item.sendOption === "now") await dispatchCampaign(id);
  return getCampaign(id);
}

export async function cancelCampaign(user, id) {
  const campaign = await getCampaign(id);
  const result = await query("UPDATE campaigns SET status = 'canceled', canceled_at = NOW() WHERE id = ? AND status = 'scheduled'", [id]);
  if (!result.affectedRows) throw new ApiError("Only scheduled campaigns can be cancelled.", 409);
  await recordAudit(user, { action: "campaigns.campaign_canceled", entityType: "campaign", entityId: id, summary: `Cancelled the campaign "${campaign.name}"` });
  return getCampaign(id);
}

// Turns a due campaign into one queued email per member. The status change claims it, so two
// runners can't send the same campaign twice.
export async function dispatchCampaign(id) {
  const claimed = await query("UPDATE campaigns SET status = 'sending' WHERE id = ? AND status = 'scheduled' AND scheduled_at <= NOW()", [id]);
  if (!claimed.affectedRows) return { skipped: true };
  try {
    const campaign = await getCampaign(id);
    const template = await getTemplate(campaign.templateId);
    if (template.status !== "Active") throw new Error(`The template "${template.name}" is no longer active.`);
    const members = (await segmentMembers(campaign.segmentId)).filter((member) => member.accountStatus === "active" && member.email);
    const suppressed = await suppressedSet(members.map((member) => member.email));
    for (const member of members) {
      const { subject, html } = await renderTemplate(template, member);
      await queueEmail({ source: "campaign", sourceId: id, template, userId: member.id, email: member.email, subject, html, suppressed: suppressed.has(member.email.toLowerCase()) });
    }
    await query("UPDATE campaigns SET status = 'sent', sent_at = NOW(), recipients = ? WHERE id = ?", [members.length, id]);
    return { recipients: members.length };
  } catch (error) {
    await query("UPDATE campaigns SET status = 'failed', sent_at = NOW() WHERE id = ?", [id]);
    await recordAudit(null, { action: "campaigns.campaign_failed", entityType: "campaign", entityId: id, summary: `Campaign could not be sent: ${error.message}` });
    return { error: error.message };
  }
}

export async function dispatchDueCampaigns() {
  const due = await query("SELECT id FROM campaigns WHERE status = 'scheduled' AND scheduled_at <= NOW() ORDER BY scheduled_at LIMIT 20");
  let recipients = 0;
  for (const row of due) recipients += (await dispatchCampaign(row.id)).recipients ?? 0;
  return { campaigns: due.length, recipients };
}
