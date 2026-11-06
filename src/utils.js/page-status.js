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
  email: "an email-sending service (client)",
  integrations: "the client's Zoho, Google, Zoom and Outlook accounts",
  social: "the client's Google and Facebook developer accounts",
  ai: "an AI provider (client decision)",
};

const preview = (message = "This page shows sample data and isn't connected yet. It's coming in an upcoming update.") => ({ status: "preview", message });
const waiting = (feature, need) => ({ status: "waiting", message: `${feature} isn't connected yet — waiting for ${need}.` });
const partial = (message) => ({ status: "partial", message });
const working = { status: "working" };
const MAIL = `Emails and support tickets save and are listed, but emails are only delivered once ${NEEDS.email} is connected. Templates are the built-in library; the AI draft button inserts sample text until ${NEEDS.ai} is connected.`;
const CALENDAR = "Calendar events save and are shared by visibility (everyone, internal, management or private). Announcements are coming in an upcoming update.";
const CUSTOMER_DETAIL = `Account details, notes, support history, credits and adjustments, plan changes (with proration), pause, cancel, suspend and impersonation are live. Call history, usage, reports and calibration detail wait for ${NEEDS.calling}; invoices and refunds are processed once ${NEEDS.payments} is connected.`;
const CREDITS = `Credits, discounts, approvals and reversals are live and kept in the ledger. Refunds are recorded now and paid out once ${NEEDS.payments} is connected.`;
const STAFF_DASHBOARD = `Leads, accounts, revenue, alerts and activity are live. Call-based scores (prompt adherence, trust gain) wait for ${NEEDS.calling}.`;

// First match wins: exact paths, or "/section/*" for a section page and everything under it
const RULES = [
  // ── Public & sign-in ──
  ["/", partial("The demo request form isn't connected yet; everything else on this page is informational.")],
  ["/about", working],
  ["/demo", working],
  ["/sign-in", partial(`Email sign-in works. Google and Facebook sign-in need ${NEEDS.social}.`)],
  ["/sign-up", partial(`Email sign-up works. Google and Facebook sign-up need ${NEEDS.social}.`)],
  ["/forgot-password", waiting("Password reset email", NEEDS.email)],
  ["/reset-password", waiting("Password reset email", NEEDS.email)],

  // ── Customer panel ──
  ["/user/dashboard", partial("Lead numbers and the pipeline are live. Call stats appear once calling is connected.")],
  ["/user/leads", working],
  ["/user/leads/add", working],
  ["/user/leads/edit", working],
  ["/user/crm", working],
  ["/user/crm/add", working],
  ["/user/crm/edit", working],
  ["/user/playbook", partial(`Choosing, creating, editing and deleting playbooks all save. Buying premium playbooks waits for ${NEEDS.payments}.`)],
  ["/user/playbook/create", working],
  ["/user/live-calling", waiting("Live calling", NEEDS.calling)],
  ["/user/calls/*", waiting("Call history and call reports", NEEDS.calling)],
  ["/user/performance-analytics", waiting("Performance analytics (built from call data)", NEEDS.calling)],
  ["/user/calibration", partial(`The microphone test works and finished sessions are saved. Scores are samples until ${NEEDS.ai} is connected.`)],
  ["/user/ai-training", partial(`Uploading, pausing and deleting training material all save. The AI starts learning from it once ${NEEDS.ai} is connected.`)],
  ["/user/settings/support-ticket/*", working],
  ["/user/settings/security", partial("Your devices and sign-in history are live. Locations need an IP-lookup service; two-step login (2FA) is coming later.")],
  ["/user/settings/profile", partial("Your name and password save. Language and account deletion are coming later.")],
  ["/user/settings/preferences", working],
  ["/user/settings/notifications", working],
  ["/user/settings/integrations", waiting("Integrations", NEEDS.integrations)],
  ["/user/settings/billing/upgrade", waiting("Changing plans", NEEDS.payments)],
  ["/user/settings/billing/payment-method", waiting("Payment methods", NEEDS.payments)],
  ["/user/settings/billing/*", partial(`Your plan and its limits are live. Payments, invoices and usage counts wait for ${NEEDS.payments} and for calling to be connected.`)],
  ["/user/settings/send-mail/*", partial(`Emails are saved and listed, but only delivered once ${NEEDS.email} is connected. The AI draft button inserts sample text until ${NEEDS.ai} is connected.`)],

  // ── Sales rep panel ──
  ["/internal-sales-representative/dashboard", partial(STAFF_DASHBOARD)],
  ["/internal-sales-representative/leads/*", working],
  ["/internal-sales-representative/crm/*", working],
  ["/internal-sales-representative/support-tickets", working],
  ["/internal-sales-representative/billing/credits-adjustments", partial(CREDITS)],
  ["/internal-sales-representative/users", working],
  ["/internal-sales-representative/users/*", partial(CUSTOMER_DETAIL)],
  ["/internal-sales-representative/user-portal", partial(`Creating the customer account works; share the activation link it shows. Emailing that link and taking the first payment wait for ${NEEDS.email} and ${NEEDS.payments}.`)],
  ["/internal-sales-representative/calendar", partial(CALENDAR)],
  ["/internal-sales-representative/playbook", working],
  ["/internal-sales-representative/calibration", partial(`Finished sessions are saved. Scores are samples until ${NEEDS.ai} is connected.`)],
  ["/internal-sales-representative/ai-training", partial(`Uploading, pausing and deleting training material all save. The AI starts learning from it once ${NEEDS.ai} is connected.`)],
  ["/internal-sales-representative/settings/security", partial("Your devices and sign-in history are live. Locations need an IP-lookup service; two-step login (2FA) is coming later.")],
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
  ["/onboarding", partial(`Every step saves. Voice calibration records completion; scores need ${NEEDS.ai}. Invite links are shown to the admin until ${NEEDS.email} is connected.`)],
  ["/onboarding/team", working],

  // ── Super admin panel ──
  ["/super-admin/compliance-audit/access-records", partial(`Employees, invites, roles and access changes are live. Invite links are copied by the admin until ${NEEDS.email} is connected.`)],
  ["/super-admin/compliance-audit/offboarding", working],
  ["/super-admin/settings/integrations", waiting("Integrations", NEEDS.integrations)],
  ["/super-admin/settings/security", partial("Your devices and sign-in history are live. Locations need an IP-lookup service; two-step login (2FA) is coming later.")],
  ["/super-admin/settings/profile", partial("Your name and password save. Language is coming later.")],
  ["/super-admin/settings/preferences", working],
  ["/super-admin/settings/notifications", working],
  ["/super-admin/dashboard", partial(STAFF_DASHBOARD)],
  ["/super-admin/crm/*", working],
  ["/super-admin/support-tickets", working],
  ["/super-admin/users", working],
  ["/super-admin/users/*", partial(CUSTOMER_DETAIL)],
  ["/super-admin/calendar", partial(CALENDAR)],
  ["/super-admin/calendar-announcements", partial(CALENDAR)],
  ["/super-admin/mail/*", partial(MAIL)],
  ["/super-admin/campaigns-journeys/*", preview(`Campaigns, segments and templates are coming in an upcoming update. Sending campaigns waits for ${NEEDS.email}.`)],
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
