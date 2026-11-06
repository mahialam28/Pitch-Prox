import { query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { paged } from "@/lib/listing";
import { emailProviderConnected } from "@/lib/campaigns/outbox";
import { lastRun } from "@/lib/campaigns/runner";

// ── Campaigns & Journeys: Overview, Broadcast KPIs and Analytics ──
// Counts come from the outbox (email_deliveries), campaigns, journeys and enrollments.
// "Sent", opens and clicks fill in once an email service is connected and reports them.

const DAY = 86400000;
const n = (value) => Number(value ?? 0);

export async function campaignOverview() {
  const since = new Date(Date.now() - 30 * DAY);
  const [mail] = await query(
    `SELECT COUNT(*) AS total, SUM(status = 'queued') AS queued, SUM(status = 'sent') AS sent, SUM(status = 'failed') AS failed, SUM(status = 'skipped') AS skipped,
      SUM(opened_at IS NOT NULL) AS opened, SUM(clicked_at IS NOT NULL) AS clicked,
      SUM(source = 'campaign') AS fromCampaigns, SUM(source = 'journey') AS fromJourneys, SUM(source = 'transactional') AS transactional
     FROM email_deliveries WHERE created_at >= ? AND source <> 'test'`,
    [since]
  );
  const [campaigns] = await query("SELECT SUM(status = 'sent' AND sent_at >= ?) AS sent30, SUM(status = 'scheduled') AS scheduled, COUNT(*) AS total FROM campaigns", [since]);
  const [journeys] = await query("SELECT SUM(status = 'active') AS active, SUM(status = 'paused') AS paused, SUM(status = 'draft') AS drafts FROM journeys WHERE status <> 'archived'");
  const [enrollments] = await query(
    "SELECT SUM(status = 'active') AS active, SUM(entered_at >= ?) AS entered30, SUM(goal_reached_at >= ?) AS goals30, SUM(status = 'exited' AND finished_at >= ?) AS exited30 FROM journey_enrollments",
    [since, since, since]
  );
  const [templates] = await query("SELECT SUM(status = 'Active') AS active, COUNT(*) AS total FROM campaign_templates");
  const [{ suppressed }] = await query("SELECT COUNT(*) AS suppressed FROM email_suppressions");

  // Last 14 days, per day
  const days = await query(
    `SELECT DATE(created_at) AS day, COUNT(*) AS queued, SUM(status = 'sent') AS sent, SUM(opened_at IS NOT NULL) AS opened, SUM(clicked_at IS NOT NULL) AS clicked
     FROM email_deliveries WHERE created_at >= ? AND source <> 'test' GROUP BY DATE(created_at)`,
    [new Date(Date.now() - 13 * DAY)]
  );
  const key = (value) => new Date(value).toISOString().slice(0, 10);
  const series = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(Date.now() - (13 - index) * DAY);
    const row = days.find((item) => key(item.day) === key(date));
    return { day: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }), queued: n(row?.queued), sent: n(row?.sent), opened: n(row?.opened), clicked: n(row?.clicked) };
  });

  const issues = await query(
    `SELECT email_deliveries.id, email_deliveries.to_email AS email, email_deliveries.subject, email_deliveries.status, email_deliveries.status_reason AS reason, email_deliveries.source, email_deliveries.created_at AS createdAt
     FROM email_deliveries WHERE status IN ('failed', 'skipped') ORDER BY created_at DESC LIMIT 8`
  );
  const activity = await query("SELECT id, actor_name AS actor, summary, created_at AS createdAt FROM audit_logs WHERE action LIKE 'campaigns.%' ORDER BY created_at DESC LIMIT 8");
  const topTemplates = await query(
    `SELECT campaign_templates.id, campaign_templates.name, campaign_templates.email_type AS emailType, COUNT(*) AS emails, SUM(email_deliveries.status = 'sent') AS sent,
      SUM(email_deliveries.opened_at IS NOT NULL) AS opened, SUM(email_deliveries.clicked_at IS NOT NULL) AS clicked
     FROM email_deliveries JOIN campaign_templates ON campaign_templates.id = email_deliveries.template_id
     WHERE email_deliveries.created_at >= ? GROUP BY campaign_templates.id, campaign_templates.name, campaign_templates.email_type ORDER BY emails DESC LIMIT 6`,
    [since]
  );

  return {
    providerConnected: emailProviderConnected(),
    lastRun: await lastRun(),
    mail: Object.fromEntries(Object.entries(mail).map(([name, value]) => [name, n(value)])),
    campaigns: { sent30: n(campaigns.sent30), scheduled: n(campaigns.scheduled), total: n(campaigns.total) },
    journeys: { active: n(journeys.active), paused: n(journeys.paused), drafts: n(journeys.drafts) },
    enrollments: { active: n(enrollments.active), entered30: n(enrollments.entered30), goals30: n(enrollments.goals30), exited30: n(enrollments.exited30) },
    templates: { active: n(templates.active), total: n(templates.total) },
    suppressed: n(suppressed),
    series,
    issues,
    activity,
    topTemplates: topTemplates.map((row) => ({ ...row, emails: n(row.emails), sent: n(row.sent), opened: n(row.opened), clicked: n(row.clicked) })),
  };
}

// Outbox list: ?status=queued|sent|failed|skipped&source=campaign|journey|transactional
export async function listDeliveries({ status, source, page, pageSize, offset }) {
  const clauses = [];
  const values = [];
  if (status) {
    if (!["queued", "sent", "failed", "skipped"].includes(status)) throw new ApiError("Unknown status.");
    clauses.push("email_deliveries.status = ?");
    values.push(status);
  }
  if (source) {
    if (!["campaign", "journey", "transactional", "test"].includes(source)) throw new ApiError("Unknown source.");
    clauses.push("email_deliveries.source = ?");
    values.push(source);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM email_deliveries ${where}`, values);
  const rows = await query(
    `SELECT email_deliveries.id, email_deliveries.source, email_deliveries.to_email AS email, email_deliveries.subject, email_deliveries.status, email_deliveries.status_reason AS reason,
      email_deliveries.created_at AS createdAt, email_deliveries.sent_at AS sentAt, email_deliveries.opened_at AS openedAt, email_deliveries.clicked_at AS clickedAt, campaign_templates.name AS templateName
     FROM email_deliveries LEFT JOIN campaign_templates ON campaign_templates.id = email_deliveries.template_id ${where}
     ORDER BY email_deliveries.created_at DESC LIMIT ${Number(pageSize)} OFFSET ${Number(offset)}`,
    values
  );
  return paged(rows, Number(total), { page, pageSize });
}
