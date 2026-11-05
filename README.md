# PitchProX

PitchProX is an AI-powered sales platform for teams that make and manage sales calls. It helps companies organize leads, move prospects through a CRM pipeline, guide representatives during calls, review performance, and run platform operations.

The current repository is a complete frontend/UI prototype. The next phase is to build the real backend, database, authentication, billing, calling, and AI integrations.

## Product areas

| Area | User | Purpose |
| --- | --- | --- |
| Public website | Visitors | Learn about PitchProX, pricing, AI calling, and request a demo. |
| Customer portal (`/user`) | Customer owners and sales teams | Manage leads, CRM, calls, playbooks, AI training, reports, and account settings. |
| Sales rep portal (`/internal-sales-representative`) | Internal sales reps | Work assigned leads, make calls, manage follow-ups, calendar, and mail. |
| Super-admin portal (`/super-admin`) | Platform operations team | Manage users, reps, plans, billing, support, campaigns, and compliance. |

## User journey

### 1. Visitor to customer

1. A visitor opens the landing page, learns about features and pricing, and requests a demo or creates an account.
2. The customer signs in and enters the customer portal.
3. They complete company settings, select a plan, and invite their sales team.

### 2. Customer workspace setup

1. The customer connects CRM/email tools and configures notifications.
2. They create an AI sales playbook and training guidelines.
3. They import or add leads and organize them in the CRM pipeline.

### 3. Sales calling workflow

1. A representative selects a lead from the lead list or CRM.
2. They start a browser-based call.
3. PitchProX shows live transcripts, AI guidance, and objection-handling suggestions.
4. The representative saves notes, updates lead status, and schedules a follow-up.
5. The completed call gets a recording, transcript, summary, sentiment analysis, and report.

### 4. Manager and platform workflow

1. Managers review dashboards, conversion rates, call quality, and rep performance.
2. Super admins manage accounts, subscriptions, credits, tickets, campaigns, and platform health.
3. Compliance users maintain policies, audit records, incidents, training, and evidence files.

## Features already designed in the frontend

### Public website

- Landing page, product explanations, AI conversation demo, pricing, FAQ, demo request form, and about page.
- Sign in, sign up, forgot-password, and reset-password screens.

### Customer portal

- Dashboard: KPI cards, charts, recent calls, and lead pipeline.
- Leads: list, search/filter UI, add, edit, detail view, and CSV-import UI.
- CRM: pipeline, add prospect, detail view, lead stages, and follow-up UI.
- Live calling: call controls, notes, status, follow-up, end-call, and buy-minutes dialogs.
- Call history and report UI.
- Performance analytics.
- AI training/guidelines.
- Sales playbooks and multi-step playbook creation wizard.
- Microphone/audio calibration.
- Profile, preferences, notifications, security, integrations, billing, mail, and support settings.

### Sales rep portal

- Rep dashboard, performance, assigned users/clients, leads, CRM, calls, and live calling.
- Calendar, mail/templates, support tickets, quota/billing, audio calibration, and settings.

### Super-admin portal

- Platform dashboard, customers/users, sales reps, plans, pricing, promotions, billing, and credits.
- Support tickets, mail, calendar, announcements, campaigns, segments, and templates.
- Master playbook builder.
- Compliance center: policies, training, AI governance, incidents, audit logs, access records, SOC 2 readiness, and evidence repository.

## APIs to build

All APIs must authenticate the user and enforce organization/tenant and role permissions on the server. Never trust a tenant ID sent by the browser.

### Authentication and account

- `POST /api/v1/auth/register` — create organization and first admin user
- `POST /api/v1/auth/sign-in` — sign in
- `POST /api/v1/auth/sign-out` — sign out
- `POST /api/v1/auth/refresh` — refresh session
- `POST /api/v1/auth/forgot-password` — send reset email
- `POST /api/v1/auth/reset-password` — reset password
- `POST /api/v1/auth/verify-email` — verify email
- `GET/PATCH /api/v1/me` — current user/profile
- `PATCH /api/v1/me/password` — change password
- `GET/DELETE /api/v1/me/sessions` — list/revoke logged-in devices
- `POST /api/v1/auth/2fa/setup` and `POST /api/v1/auth/2fa/verify` — two-factor authentication

### Organization, users, and roles

- `GET/PATCH /api/v1/organization` — organization profile
- `GET /api/v1/users` — list organization users
- `POST /api/v1/users/invite` — invite user
- `PATCH/DELETE /api/v1/users/:userId` — update role/status or deactivate user
- `GET/POST /api/v1/sales-reps` — list/create sales reps
- `PATCH /api/v1/sales-reps/:repId` — update rep, quota, or assignment

### Leads and CRM

- `GET/POST /api/v1/leads` — list/filter/search leads or create lead
- `GET/PATCH/DELETE /api/v1/leads/:leadId` — lead details/update/archive
- `POST /api/v1/leads/import` — import CSV
- `POST /api/v1/leads/:leadId/assign` — assign lead to rep
- `GET /api/v1/leads/:leadId/activity` — notes, calls, tasks, and status history
- `GET /api/v1/crm/stages` — pipeline stages and counts
- `GET/POST /api/v1/crm/prospects` — list/create prospects
- `PATCH /api/v1/crm/prospects/:prospectId` — update prospect
- `POST /api/v1/crm/prospects/:prospectId/move` — move pipeline stage
- `POST /api/v1/crm/prospects/:prospectId/notes` — add note
- `POST /api/v1/crm/prospects/:prospectId/follow-ups` — schedule follow-up

### Dashboards and analytics

- `GET /api/v1/dashboard` — customer dashboard KPIs, pipeline, calls, and alerts
- `GET /api/v1/analytics/performance` — conversion and trend data
- `GET /api/v1/analytics/calls` — call volume and outcomes
- `GET /api/v1/analytics/reps` — rep leaderboard/performance
- `GET /api/v1/super-admin/dashboard` — platform-wide metrics

### Calling, recordings, and AI

- `POST /api/v1/calls/initiate` — create call session and secure WebRTC/provider token
- `POST /api/v1/calls/:callId/end` — finish call with disposition, duration, and notes
- `PATCH /api/v1/calls/:callId/status` — update call status
- `POST /api/v1/calls/:callId/notes` — add in-call note
- `POST /api/v1/calls/:callId/follow-up` — schedule callback
- `GET /api/v1/calls` — call history
- `GET /api/v1/calls/:callId` — call detail/report
- `GET /api/v1/calls/:callId/transcript` — transcript and speakers
- `GET /api/v1/calls/:callId/recording` — authorized recording URL
- `GET /api/v1/calls/:callId/analysis` — summary, sentiment, adherence, and talk/listen ratio
- `POST /api/v1/webhooks/telephony` — verified telephony-provider events
- `WS /ws/v1/live-calls/:callId` — live call state, transcript, and AI guidance

### AI training and playbooks

- `GET/POST /api/v1/playbooks` — list/create playbooks
- `GET/PATCH /api/v1/playbooks/:playbookId` — playbook detail/update
- `POST /api/v1/playbooks/:playbookId/publish` — publish playbook
- `POST /api/v1/playbooks/:playbookId/clone` — duplicate playbook
- `POST /api/v1/playbooks/:playbookId/objections` — add objection/rebuttal rule
- `GET/POST /api/v1/ai-training/guidelines` — manage AI rules/guidelines
- `POST /api/v1/ai-training/assets` — upload training material
- `POST /api/v1/ai-training/jobs` — start processing/training job
- `GET /api/v1/ai-training/jobs/:jobId` — training-job status

### Billing and subscriptions

- `GET /api/v1/billing/subscription` — active plan and usage
- `GET /api/v1/billing/plans` — available plans
- `POST /api/v1/billing/checkout` — payment checkout session
- `POST /api/v1/billing/customer-portal` — payment method/customer portal session
- `GET /api/v1/billing/invoices` — invoices and receipts
- `GET /api/v1/billing/usage` — minutes/credits usage
- `POST /api/v1/billing/webhook` — verified billing-provider webhook
- `POST /api/v1/super-admin/billing/adjust-credits` — grant/deduct minutes with audit record
- `GET /api/v1/super-admin/billing/payments` — platform payment activity

### Mail, calendar, and support

- `GET/POST /api/v1/mail/templates` — email templates
- `GET/PATCH/DELETE /api/v1/mail/templates/:templateId` — template detail/manage
- `POST /api/v1/mail/send` — send/queue email
- `GET /api/v1/mail/messages` — mail records
- `GET/POST /api/v1/calendar/events` — list/create events
- `GET/PATCH/DELETE /api/v1/calendar/events/:eventId` — update/delete event
- `GET/POST /api/v1/support/tickets` — list/create support tickets
- `GET/PATCH /api/v1/support/tickets/:ticketId` — ticket detail/status
- `POST /api/v1/support/tickets/:ticketId/messages` — reply to ticket
- `POST /api/v1/support/tickets/:ticketId/assign` — assign support owner

### Integrations, campaigns, and compliance

- `GET /api/v1/integrations` — connected integrations
- `POST /api/v1/integrations/:provider/connect` — start OAuth connection
- `DELETE /api/v1/integrations/:integrationId` — disconnect integration
- `POST /api/v1/integrations/:integrationId/sync` — start CRM sync
- `POST /api/v1/webhooks/integrations/:provider` — verified provider webhook
- `GET/POST /api/v1/campaigns` — campaigns
- `GET/PATCH/DELETE /api/v1/campaigns/:campaignId` — campaign management
- `GET/POST /api/v1/segments` — customer segments
- `GET/POST /api/v1/campaign-templates` — campaign templates
- `GET /api/v1/compliance/overview` — readiness and alerts
- `GET/POST /api/v1/compliance/policies` — policy documents
- `GET/POST /api/v1/compliance/training` — training and assignments
- `GET /api/v1/compliance/ai-governance` — AI governance metrics
- `GET/POST /api/v1/compliance/incidents` — security incidents
- `GET /api/v1/compliance/audit-logs` — immutable audit log search/export
- `GET /api/v1/compliance/access-records` — login/access history
- `GET/PATCH /api/v1/compliance/soc2-controls` — SOC 2 controls
- `POST /api/v1/compliance/evidence/upload-url` — signed evidence upload

## Missing pages to add

These links exist in the UI but their pages do not:

- `/user/settings/billing/payment-method`
- `/user/settings/billing/upgrade`

## Suggested implementation order

1. Database, organization/tenant model, authentication, user roles, and protected routes.
2. Customer dashboard, leads, CRM, notes, and follow-ups.
3. Playbooks, AI training, and performance analytics.
4. Billing, plans, minutes, invoices, payment methods, and the two missing billing pages.
5. Telephony, call records, recordings, transcripts, and live AI guidance.
6. Mail, calendar, support, CRM integrations, campaigns, and super-admin operations.
7. Compliance modules, automated tests, monitoring, and security review.

## Important implementation note

The frontend uses mock/static data for most screens. Before launch, every action that creates, edits, deletes, sends, charges, calls, or uploads must be connected to secure backend APIs with validation, authorization, error handling, audit logs, and tests.

For the detailed technical discovery, see [PROJECT_DISCOVERY.md](./PROJECT_DISCOVERY.md).
