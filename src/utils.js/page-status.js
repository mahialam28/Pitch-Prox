// ── What works on each page ──
// One central list for the status banner (components/shared/development-notice).
// Update an entry when a module is finished; pages with no rule show the
// generic "preview" banner, so a forgotten page never looks fully working.
//
//   working → no banner
//   partial → some actions save, others are named in the message
//   waiting → blocked on something outside the code (client account, provider, design)
//   preview → sample data; scheduled in the build plan (docs/build-plan.html)

// What each blocked feature is waiting for, in client-friendly words
const NEEDS = {
  calling: "a phone-call provider and an AI provider (client decision)",
  payments: "a Stripe payment account (client)",
  email: "the Postmark account (client)",
  integrations: "the client's Zoho, Google, Zoom and Outlook accounts",
  social: "the client's Google and Facebook developer accounts",
  ai: "an AI provider (client decision)",
};

const preview = (message = "This page shows sample data and isn't connected yet. It's coming in an upcoming update.") => ({ status: "preview", message });
const waiting = (feature, need) => ({ status: "waiting", message: `${feature} isn't connected yet — waiting for ${need}.` });
const partial = (message) => ({ status: "partial", message });
const working = { status: "working" };
const MAIL = `Emails, drafts and support tickets save and are listed; emails are delivered once ${NEEDS.email} is connected. Templates (built-in, team and your own) are live; the AI draft button inserts sample text until ${NEEDS.ai} is connected.`;
const CALENDAR = `Calendar events and announcements are live: events are shared by visibility (everyone, internal, management or private) and announcements reach the roles they are meant for. Emailing announcements waits for ${NEEDS.email}.`;
const CUSTOMER_DETAIL = `Account details, notes, support history, credits and adjustments, plan changes (with proration), pause, cancel, suspend and impersonation are live. Call history, usage, reports and calibration detail wait for ${NEEDS.calling}; invoices and refunds are processed once ${NEEDS.payments} is connected.`;
const CREDITS = `Credits, discounts, approvals and reversals are live and kept in the ledger. Refunds are recorded now and paid out once ${NEEDS.payments} is connected.`;
const SALES_TEAM = `Reps, quotas, booked revenue, coaching and manager notes, profile settings and the activity log are live. Revenue is booked from accounts sold until ${NEEDS.payments} is connected; calls, call reports and AI scores wait for ${NEEDS.calling}.`;
const STAFF_DASHBOARD = `Leads, accounts, revenue, alerts and activity are live. Call-based scores (prompt adherence, trust gain) wait for ${NEEDS.calling}.`;

// First match wins: exact paths, or "/section/*" for a section page and everything under it
const RULES = [
  // ── Public & sign-in ──
  ["/", working],
  ["/see-how-it-works", working],
  ["/privacy", working],
  ["/terms", working],
  ["/data-deletion", working],
  ["/about", working],
  ["/demo", working],
  ["/sign-in", partial(`Email sign-in works. Google and Facebook sign-in need ${NEEDS.social}.`)],
  ["/sign-up", partial(`Email sign-up works. Google and Facebook sign-up need ${NEEDS.social}.`)],
  ["/forgot-password", working],
  ["/reset-password", working],

  // ── Customer panel ──
  ["/user/dashboard", partial("Lead numbers and the pipeline are live. Call stats appear once calling is connected.")],
  ["/user/leads", working],
  ["/user/leads/add", working],
  ["/user/leads/edit", working],
  ["/user/crm", working],
  ["/user/crm/add", working],
  ["/user/crm/edit", working],
  ["/user/playbook", partial(`Choosing, creating, editing and deleting playbooks all save. Published playbooks show their real details, and owners can read what's inside. Buying premium playbooks waits for ${NEEDS.payments}.`)],
  ["/user/playbook/create", working],
  ["/user/live-calling", partial("Practice calls work now with the real AI coaching (simulated prospect). Phone calls connect once the calling service (Twilio) and speech-to-text are set up.")],
  ["/user/calls/*", partial("Call history and call reports are live (practice calls now; phone calls once Twilio is connected).")],
  ["/user/performance-analytics", waiting("Performance analytics (built from call data)", NEEDS.calling)],
  ["/user/calibration", partial(`The microphone test works and finished sessions are saved. Scores are samples until ${NEEDS.ai} is connected.`)],
  ["/user/ai-training", partial(`Uploading, pausing and deleting training material all save. The AI starts learning from it once ${NEEDS.ai} is connected.`)],
  ["/user/settings/support-ticket/*", working],
  ["/user/settings/security", partial("Two-step login (authenticator app), devices and sign-in history are live. Sign-in locations need an IP-lookup service.")],
  ["/user/settings/profile", partial("Your name and password save. Language and account deletion are coming later.")],
  ["/user/settings/preferences", working],
  ["/user/settings/notifications", working],
  ["/user/settings/integrations", waiting("Integrations", NEEDS.integrations)],
  ["/user/settings/billing/upgrade", waiting("Changing plans", NEEDS.payments)],
  ["/user/settings/billing/payment-method", waiting("Payment methods", NEEDS.payments)],
  ["/user/settings/billing/*", partial(`Your plan and its limits are live. Payments, invoices and usage counts wait for ${NEEDS.payments} and for calling to be connected.`)],
  ["/user/settings/send-mail/*", partial(`Emails (and drafts) are saved and listed; they're delivered once ${NEEDS.email} is connected. The AI draft button inserts sample text until ${NEEDS.ai} is connected.`)],

  // ── Sales rep panel ──
  ["/internal-sales-representative/dashboard", partial(STAFF_DASHBOARD)],
  ["/internal-sales-representative/leads/*", working],
  ["/internal-sales-representative/crm/*", working],
  ["/internal-sales-representative/support-tickets", working],
  ["/internal-sales-representative/billing/credits-adjustments", partial(CREDITS)],
  ["/internal-sales-representative/users", working],
  ["/internal-sales-representative/users/*", partial(CUSTOMER_DETAIL)],
  ["/internal-sales-representative/user-portal", partial(`Creating the customer account works and the activation link is emailed to the customer (sent once ${NEEDS.email} is connected; until then share the link shown). Taking the first payment waits for ${NEEDS.payments}.`)],
  ["/internal-sales-representative/calendar", partial(CALENDAR)],
  ["/internal-sales-representative/playbook", working],
  ["/internal-sales-representative/calibration", partial(`Finished sessions are saved. Scores are samples until ${NEEDS.ai} is connected.`)],
  ["/internal-sales-representative/ai-training", partial(`Uploading, pausing and deleting training material all save. The AI starts learning from it once ${NEEDS.ai} is connected.`)],
  ["/internal-sales-representative/settings/security", partial("Two-step login (authenticator app), devices and sign-in history are live. Sign-in locations need an IP-lookup service.")],
  ["/internal-sales-representative/settings/profile", partial("Your name and password save. Language is coming later.")],
  ["/internal-sales-representative/settings/preferences", working],
  ["/internal-sales-representative/settings/notifications", working],
  ["/internal-sales-representative/live-calling", waiting("Live calling", NEEDS.calling)],
  ["/internal-sales-representative/calls/*", waiting("Call history and call reports", NEEDS.calling)],
  ["/internal-sales-representative/performance-analytics", waiting("Performance analytics (built from call data)", NEEDS.calling)],
  ["/internal-sales-representative/settings/integrations", waiting("Integrations", NEEDS.integrations)],
  ["/internal-sales-representative/mail/*", partial(MAIL)],

  // ── Employee onboarding ──
  ["/accept-invite", working],
  ["/onboarding", partial(`Every step saves. Voice calibration records completion; scores need ${NEEDS.ai}. Invite links are emailed automatically once ${NEEDS.email} is connected (the admin can also copy them).`)],
  ["/onboarding/team", working],

  // ── Super admin panel ──
  ["/super-admin/compliance-audit/access-records", partial(`Employees, invites, roles and access changes are live. Invite links are emailed automatically once ${NEEDS.email} is connected (the admin can also copy them).`)],
  ["/super-admin/compliance-audit/offboarding", working],
  ["/super-admin/compliance-audit/audit-logs", working],
  ["/super-admin/playbook/*", partial("Drafts save automatically; publishing creates fixed versions (with checks, release notes and rollback) and an AI-safe download for the AI developer. Resources can be pinned to a shared Resource Library and imported into any playbook. The AI uses published playbooks once the calling/AI provider is connected.")],
  ["/super-admin/compliance-audit/evidence-repository", working],
  ["/super-admin/compliance-audit/soc2-readiness", working],
  ["/super-admin/compliance-audit/overview", working],
  ["/super-admin/compliance-audit/incident-management/*", partial(`Reporting, investigation, resolution, closing, reopening, notes, evidence and owners are live. "Request More Info" emails wait in the outbox until ${NEEDS.email} is connected.`)],
  ["/super-admin/compliance-audit/training-logs/*", partial(`Trainings, the library, categories, assignments, employee completions, certificates and the report are live. Assignment emails and reminders wait in the outbox until ${NEEDS.email} is connected.`)],
  ["/super-admin/compliance-audit/data-deletion", working],
  ["/super-admin/compliance-audit/policy-documents/*", partial(`Policies, versions, approvals and employee signatures are live. Reminder emails wait in the outbox until ${NEEDS.email} is connected.`)],
  ["/super-admin/settings/integrations", waiting("Integrations", NEEDS.integrations)],
  ["/super-admin/settings/security", partial("Two-step login (authenticator app), devices and sign-in history are live. Sign-in locations need an IP-lookup service.")],
  ["/super-admin/settings/profile", partial("Your name and password save. Language is coming later.")],
  ["/super-admin/settings/preferences", working],
  ["/super-admin/settings/notifications", working],
  ["/super-admin/dashboard", partial(STAFF_DASHBOARD)],
  ["/super-admin/crm/*", working],
  ["/super-admin/sales-reps/*", partial(SALES_TEAM)],
  ["/super-admin/support-tickets", working],
  ["/super-admin/support-dashboard", partial("Tickets, SLA, workload, performance and activity are live. Customer satisfaction (CSAT) needs surveys, which come in a later update.")],
  ["/super-admin/users", working],
  ["/super-admin/users/*", partial(CUSTOMER_DETAIL)],
  ["/super-admin/calendar", partial(CALENDAR)],
  ["/super-admin/calendar-announcements", partial(CALENDAR)],
  ["/super-admin/mail/*", partial(MAIL)],
  ["/super-admin/performance-analytics", partial(`Revenue (subscription value), growth, churn, cancellations, at-risk accounts, rep quotas, insights and alerts are live; trends fill in day by day. Collected revenue and costs wait for ${NEEDS.payments}; AI, call and telephony numbers wait for ${NEEDS.calling}.`)],
  ["/super-admin/campaigns-journeys/*", partial(`Segments, templates, broadcast campaigns, lifecycle journeys and event-triggered transactional emails are live and run every few minutes. Emails wait in the outbox until ${NEEDS.email} is connected; opens, clicks, call usage and payment events fill in once email, calling and ${NEEDS.payments} are connected.`)],
  ["/super-admin/plan-pricing-control", partial(`Plans, promo codes (checked at checkout), trial rules, report add-ons, enterprise defaults and billing rules all save. Customers are charged these prices once ${NEEDS.payments} is connected.`)],
  ["/super-admin/billing/credits-adjustments", partial(CREDITS)],
  ["/super-admin/billing/*", waiting("Payments, invoices and revenue figures", NEEDS.payments)],
];

// Everything else (customer detail pages, billing, the remaining super admin
// modules) falls through to the preview banner.
export function pageStatusFor(pathname) {
  for (const [pattern, status] of RULES) {
    const base = pattern.endsWith("/*") ? pattern.slice(0, -2) : null;
    const matches = base ? pathname === base || pathname.startsWith(`${base}/`) : pathname === pattern;
    if (matches) return status;
  }
  return preview();
}
