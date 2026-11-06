# PitchProX — What's Left to Build

**Status key:** ✅ Done · 🟡 Partly done · ❌ Not started

---

## Phase 1 — Fix first (bugs in existing code) ✅ Done 2026-10-26

| # | Feature | Status | What it's for |
|---|---------|--------|---------------|
| 1 | Role-based access | ✅ | Each portal only opens for its own role; others are redirected. |
| 2 | Real API errors | ✅ | 401 / 403 / 400 / 500 with clear messages instead of always "please sign in". |
| 3 | Live dashboard data | ✅ | Real lead numbers and pipeline; call widgets show "No call data yet". |
| 4 | Role-based sign-in redirect | ✅ | Sends each user to their own portal after signing in. |
| 5 | Edit leads | ✅ | Edit page and table dropdowns save to the database. |
| 6 | CRM prospect actions | ✅ | Edit, delete, stage moves, notes, and follow-ups all save. |
| — | Staff accounts | ✅ | `npm run create-user` creates super admins and sales reps. |
| — | Lint clean-up | 🟡 | 21 errors remain (2026-11-06): 6 are in unused files listed under the Phase 3 notes (delete them); the rest are in billing invoices, compliance, playbook admin, the date/time pickers and the customer call history; fix them in those phases. |

---

## Backend plan — making every portal dynamic (agreed 2026-11-05)

| Phase | Scope | Status |
|---|---|---|
| 0. Foundations | Local dev + test databases, shared role/section permissions (sidebar and API use the same list), staff profiles, audit log, list/paging helpers, demo seed (`npm run db:seed`), test server on the separate `pitchprox_test` DB | ✅ Done 2026-11-05 |
| 1. Staff & Onboarding | Add Employee invites (one-time activation link), Access Records, 8-step onboarding saved per employee (policy signatures, password + MFA choice, training, final sign-off, voice step for reps), portal locked until onboarding is done, Offboarding checklist that revokes access | ✅ Done 2026-11-05 |
| 2. Sales Rep portal | Assigned leads/CRM, rep dashboard, calendar, internal mail, staff side of support tickets, user portal account creation, rep settings and tools | ✅ Done 2026-11-05 |
| 3. Super Admin — customers & money | Users list/detail actions, notes, credits/discount/refund records, impersonation sessions, Plan & Pricing, credits & adjustments | ✅ Done 2026-11-06 (billing queue, invoices and payments wait for Stripe in phase 7) |
| 4. Super Admin — team & operations | Sales reps (quotas, notes), dashboards, performance analytics, support dashboard, calendar & announcements, mail templates | ✅ Done 2026-11-06 (call/AI scores, costs and collected revenue wait for phase 7) |
| 5. Campaigns & Journeys | Templates, segments, broadcast campaigns, journey builder, scheduled-send job runner | ✅ Done 2026-11-06 (delivery, opens/clicks, call usage and payment events wait for phase 7) |
| 6. Compliance & Audit | Policy versions, training logs, incidents, evidence uploads, audit-log page, AI governance, SOC 2, exports | ❌ |
| 7. Outside services | Email, Stripe, telephony + speech-to-text + AI, OAuth integrations, 2FA (each when the client picks a provider) | ❌ |
| 8. Launch readiness | Rate limiting, full tests, security review, credential rotation, backups, monitoring | ❌ |

**Phase 0–1 notes**
- Roles: `customer_admin`, `customer_member`, `sales_rep`, `super_admin`, `admin_manager`, `support`, `auditor`. Admin roles share `/super-admin`; `ADMIN_SECTIONS` in `src/utils.js/roles.js` decides each role's sidebar *and* which `/api/v1/admin/*` data it may load. Auditors can read but not change.
- Invites: until an email service is connected, Add Employee shows the activation link for the admin to copy (valid 7 days, single use).
- Tests: `npm run test:db`, then `npm run build && npm run test:server` (port 3001, test DB), then run `npm run test:api` with `BASE=http://localhost:3001` (see `tests/api/helpers.mjs`). 116 tests pass (Phase 2 adds `tests/api/sales.test.mjs`; Phase 3 adds `accounts.test.mjs` and `pricing.test.mjs`; Phase 4 adds `team.test.mjs` and `operations.test.mjs`; Phase 5 adds `campaigns.test.mjs`).

**Phase 2 notes**
- Ownership: leads and prospects have `assigned_to`. A rep sees only their own; Admin Manager / Super Admin (CRM section) see all of PitchProX's pipeline. Customer accounts have an owning rep (`customer_accounts.account_rep_id`).
- User Portal: a rep creates the customer company, owner login and a subscription waiting for payment, and gets a 14-day activation link (`/activate?token=…`) to send until email and Stripe are connected.
- Support tickets (staff side): reply, internal notes (never shown to customers), assign/reassign, priority/status, escalate, first-response SLA (urgent 4h, high 8h, medium 24h, low 48h). Reps can also open a ticket for one of their customers (Mail → Support Tickets).
- Dashboard: a rep sees their own leads/accounts; Super Admin sees the company. Call-based scores stay empty until calling is connected.
- Calendar: events with visibility (All Employees, Internal Only, Management Only = Super Admin + Admin Manager, Private = owner). Only the creator (or a Super Admin) edits; reps also see their lead follow-ups. Announcements come in Phase 4.
- Mail: each staff member sees only their own sent mail; emails wait in the outbox until an email service is connected. Templates are the built-in library.
- Rep tools: Playbooks, AI Training and Calibration are open to reps; custom playbooks and training files belong to the rep, and staff get premium playbooks without buying them. Settings reuse the customer screens (account deletion and call-only preferences are hidden where they don't apply).
- The Super Admin Calendar, Mail, Settings, CRM, Dashboard and Customers pages now reuse the same live screens as the Sales Rep portal.

**Phase 3 notes**
- Customer detail (`/super-admin/users/:id`, and the same page at `/internal-sales-representative/users/:id`): one shared page; what each role may do comes from the server (`account.permissions`). Sales reps open only their own accounts. Overview, Subscription & Billing, Account Settings, Notes and Support History are live; Call History, Usage, Reports and Calibration detail wait for calling (phase 7).
- Credits & adjustments: one ledger (`account_adjustments`). Super Admin and sales reps apply directly (reps up to 50 calls / 50 reports / $50 at a time); Support's requests wait for a Super Admin's approval. Entries are never edited: a mistake is undone with a reversal (an opposite entry). Refunds are Super Admin only and are recorded now; money moves once Stripe is connected.
- Subscription: plan or billing-cycle change now (prorated, preview shown first) or at renewal; pause until a date / resume; cancel at period end / undo.
- Account status: suspending or deleting ends the customer's sessions and blocks sign-in; reps can't suspend; only a Super Admin deletes.
- Impersonation: Super Admin and Support open a real session as a customer user (full access or read-only, 15 min–12 h). The staff session is kept aside and restored on exit; read-only is enforced on the server for every change; start/end and every change made while impersonating are in the audit log under the staff member's name. Impersonation sessions don't show in the customer's device list.
- Plan & Pricing: plans (create, edit, archive; plans customers used can't be deleted), promo codes with checks that refuse contradictory settings (client item 60) and a validation endpoint used at checkout (`POST /api/v1/promo-codes/validate`; the rep's User Portal uses it and records the redemption), plus trial rules (they set the Free Trial plan's limits), report add-ons, enterprise defaults and billing rules. Support can view; only a Super Admin changes.
- Unused files to delete: `src/app/internal-sales-representative/users/[id]/components/` (the rep page re-exports the Super Admin page) and `src/app/super-admin/plan-pricing-control/components/add-edit-plan-modal.jsx`.

**Phase 4 notes**
- Sales Reps (`/super-admin/sales-reps`): roster, stats, tiers, top performers, alerts, leaderboard (month / quarter / year) and CSV export are live. "Closed" = customer accounts a rep sold in the month (not cancelled); "booked revenue" = their monthly value (plan price × seats) until Stripe can count payments. Quotas are monthly revenue targets that carry forward (`sales_quotas`); they can start this month or next. Super Admin and Admin Manager change things; Support views.
- Rep profile: KPIs, monthly chart against the quota pace, coaching notes (shared with the rep, who sees and completes them on their dashboard → My Coaching Notes), private manager notes, workspace/access settings, deactivate, activity log (from the audit log). Calls, call reports and performance scores wait for calling; "Impersonate Rep" is hidden (staff sessions can't be impersonated).
- Support Dashboard: KPIs, volume, status mix, SLA risk queue (assign to me / escalate / resolve), team workload (capacity = 25 open tickets), performance vs the previous period, activity and CSV export. CSAT needs surveys (later). Ticket links open the ticket (`/super-admin/support-tickets?ticket=…`).
- Announcements (both Calendar pages): Super Admin, Admin Manager and Support post them to an audience (all, reps, managers, support, HQ), now or scheduled, with an expiry; everyone sees what's meant for their role and can dismiss it; author or Super Admin edits/archives; only scheduled ones can be deleted. Emailing them waits for an email service.
- Email templates: the built-in library (read-only, `lib/catalogs/mail-template-catalog.js`) plus personal templates (any employee) and team templates (Super Admin / Admin Manager). Used by Mail → Templates, Quick templates and "Use template".
- Performance Analytics: MRR, growth, subscribers, trial conversion, churn and revenue churn, revenue by plan, upgrade prospects and plan changes (upgrade/downgrade from the audit metadata), ARPU, rep bonus eligibility (quota attainment), insights, cancellation reasons, at-risk accounts (scored from defined signals) and alerts. Trends compare with a daily snapshot (`analytics_snapshots`) that starts on the first visit, so they fill in over 30 days. Costs, AI and telephony cards wait for their providers. Tooltips use the client's definitions (item 61).
- Fixed on the way: the plan-change preview priced annual plans as one month (annual plans store the per-month price); cancellations now keep their reason and date; lead-to-subscription is capped at 100% (accounts don't always start as a lead).
- Unused files to delete: `src/app/super-admin/dashboard/components/` (the Super Admin dashboard re-exports the rep dashboard). The rep profile's calls/reports/performance/calibration design tabs in `src/app/super-admin/sales-reps/[id]/components/` are kept for phase 7.

**Phase 5 notes**
- Audience: PitchProX customer users (account owners and team members), never their real-estate leads. Each user's profile (`lib/campaigns/profiles.js`) carries every rule field: plan, subscription / trial / calibration / payment status, trial dates, last login, signup date, tags, email engagement and feature usage. Call usage is 0% (full allowance left) and payment status follows the subscription state until calling and Stripe are connected.
- Segments: Dynamic (Entry Rules, Match ALL / ANY, the operators per field type from client items 249–251) or Static (users picked by hand). One rule engine (`lib/campaigns/rules.js`) is shared by the server and the browser preview. The 13 built-in segments (item 256) are seeded; their rules can be edited (e.g. the High Call Usage threshold) but they can't be deleted.
- Templates: Build in PitchProX / Upload Design (PNG/JPG stacked, alt text, optional links, optional CTA; images are served publicly for email apps) / Upload HTML (scripts and handlers removed). Every template has the item-292 fields; Draft → Active → Archived; used templates are archived, not deleted. Ten short starter templates are seeded as Drafts. Transactional templates can be sent automatically on an event (one Active template per event, item 299).
- Broadcasts: Send Now or Schedule to a segment with an Active Marketing/Lifecycle template; recipients are worked out at send time; scheduled ones can be cancelled. Send-time optimization is an opt-in for later (items 297–298).
- Journeys: trigger (User Event with time / usage settings, Enters / Exits Segment, Date / Relative Date), audience, re-entry (Never / Every Time / After X Days), exit conditions, goal and the step tree (email, wait, condition with Yes/No, update user field, add / remove tag, goal, end). Draft → Live → Paused → Archived. Before every step the user's current state is checked again (item 270): exit conditions, the goal, and whether the trigger still holds (e.g. no trial reminder after upgrading).
- User events (`user_events`) are recorded on sign-up, trial start, account activation, first calibration, plan upgrade / downgrade / trial conversion, cancellation and signing in again after 7+ days. Payment, renewal, call and bundle events start once Stripe and calling are connected.
- Job runner (`lib/campaigns/runner.js`, POST /api/v1/jobs/run): segment snapshots (who entered / left), due broadcasts, transactional emails, journey enrollment and steps, then the outbox. Production runs it every 5 minutes with the `pitchprox-jobs` PM2 app (`npm run jobs` locally); it needs `CRON_SECRET` and `APP_URL` (see DEPLOYMENT.md). Super Admins can also press "Run now" on the Overview.
- Outbox (`email_deliveries`): every customer email is queued here; nothing is sent until an email service is connected (phase 7 fills in `sendWithProvider` in `lib/campaigns/outbox.js`). Marketing and Lifecycle emails carry a signed unsubscribe link and skip unsubscribed addresses; Transactional emails always go.
- Unused files to delete (design copies the live screens replaced): in `src/app/super-admin/campaigns-journeys/`: `components/leads-selection-table.jsx`, `components/top-performing-content.jsx`, `components/email-engagement-chart.jsx`, `components/edit-segment-modal.jsx`, `components/create-segment-modal.jsx`, `components/analytics-journeys-table.jsx`, `components/conversion-funnel-card.jsx`, `components/delivery-insights-card.jsx`, `segments/[id]/components/segment-leads-table.jsx`, `segments/[id]/components/segment-insights-card.jsx`, `templates-data.js` and `segments-data.js`.

## Current build plan
Role by role, module by module — see **docs/build-plan.html**. Page status banners (module 0.1) are ✅ done: each page's label lives in `src/utils.js/page-status.js` — update it when a module is finished.

## Phase 2 — Customer portal (`/user`)

| Feature | Status | What it's for |
|---------|--------|---------------|
| Sign up / Sign in / Sign out | ✅ | Account creation and secure login sessions. |
| Profile, password, preferences, notifications | ✅ | User account settings, saved to the database. |
| Leads: add, list, delete | ✅ | Store and manage the people a team calls. |
| CRM: add, list prospects | ✅ | Track prospects through the sales pipeline. |
| Forgot / reset password | ❌ | Lets users recover their account by email. |
| Email verification | ❌ | Confirms that a user owns their email address. |
| Google login | ❌ | One-click sign-in with Google. |
| Two-factor authentication (2FA) | ❌ | Adds a second login step for security. |
| CSV lead import | 🟡 | CRM import saves to the database; the Leads screen has no import button in the design. |
| Payment method page | 🟡 | Page exists; adding a card waits for Stripe. |
| Upgrade plan page | 🟡 | Shows real plans; choosing one waits for Stripe. |
| Call history and reports | ❌ | Past calls with notes, outcome, and report. |
| Performance analytics | ❌ | Charts for conversion, call volume, and trends. |
| Playbooks and builder | ✅ | Sales scripts and objection handling the AI follows. (Buying premium waits for Stripe.) |
| AI training | 🟡 | Uploads, pause and delete save; the AI learning itself waits for an AI provider. |
| Billing and usage | 🟡 | Real plan and limits; payments, invoices and usage counts wait for Stripe and calling. |
| Support tickets | ✅ | Customers create tickets (with attachments) and reply; staff answer in Step 2. |

---

## Phase 3 — Calling and AI (need outside services)

| Feature | Status | What it's for | Needs |
|---------|--------|---------------|-------|
| Browser phone calls | ❌ | Make real calls from the app. | Twilio or a similar service |
| Call recordings | ❌ | Save the audio of every call. | Telephony and file storage |
| Live transcripts | ❌ | Text of the conversation as it happens. | Speech-to-text service |
| Live AI coaching | ❌ | Suggests what to say during a call. | AI provider |
| Post-call analysis | ❌ | Summary, sentiment, and score after each call. | AI provider |
| Payments and subscriptions | ❌ | Charge customers and manage plans. | Stripe or a similar service |
| Email sending | ❌ | Password resets, templates, support replies. | Email service (Resend, SES, …) |
| CRM integrations | ❌ | Sync with Zoho, Gmail, Outlook, and calendars. | Each provider's OAuth |

---

## Phase 4 — Sales Rep portal (`/internal-sales-representative`)

| Feature | Status | What it's for |
|---------|--------|---------------|
| Rep dashboard | 🟡 | The rep's own leads, accounts and revenue are live; call-based scores wait for calling. |
| Assigned leads and CRM | ✅ | Leads given to this rep only. |
| Calls and live calling | ❌ | Same calling tools, scoped to the rep (backend plan phase 7). |
| Calendar | ✅ | Meetings, demos, and follow-up reminders. (Announcements: backend plan phase 4.) |
| Mail and templates | 🟡 | Emails save to the outbox; delivery waits for an email service. |
| Quota and commission | ❌ | Track targets and earnings (backend plan phase 4). |
| Support tickets | ✅ | Handle customer help requests. |
| User Portal (new customer accounts) | 🟡 | Account + activation link work; emailing the link and payment wait for email/Stripe. |

---

## Phase 5 — Super Admin portal (`/super-admin`)

| Feature | Status | What it's for |
|---------|--------|---------------|
| Platform dashboard | ❌ | Totals across all customers: revenue, users, usage. |
| Users and customers | ❌ | View and manage every customer account. |
| Sales reps management | ❌ | Add reps, set quotas, review performance. |
| Plans and pricing control | ❌ | Create plans, promo codes, and trial rules. |
| Billing and credits | ❌ | Invoices, payments, and minute adjustments. |
| Support tickets | ❌ | Answer and assign all support requests. |
| Mail, calendar, announcements | ❌ | Platform-wide communication. |
| Campaigns and segments | ❌ | Marketing emails to groups of customers. |
| Master playbook | ❌ | The default playbook every customer starts with. |
| Compliance and audit | ❌ | Policies, incidents, audit logs, SOC 2 evidence. |

---

## Phase 6 — Launch readiness

| Feature | Status | What it's for |
|---------|--------|---------------|
| Lint and build pass | ❌ | Required before the deploy workflow will run. |
| Automated tests | ❌ | Catch bugs before release. |
| Rate limiting | ❌ | Blocks login-guessing and abuse. |
| Audit logs | ❌ | Record who changed what, and when. |
| Rotate old credentials | ❌ | Old keys may have leaked through the earlier malware. |
