# PitchProX — Project Discovery & Delivery Plan

**Reviewed:** October 25, 2026  
**Repository:** `pitchprox-dev`  
**Purpose of this document:** explain what exists today, what is missing, and the recommended work plan for making the product functional.

## 1. Executive summary

PitchProX is designed as a multi-tenant AI sales-enablement SaaS product. It combines a public marketing website with three application portals:

| Portal | Who uses it | Main job |
| --- | --- | --- |
| Public website | Prospects | Learn about the product, view plans, request a demo, and register/sign in. |
| Customer portal (`/user`) | Tenant administrators and sales teams | Manage leads, CRM, calls, playbooks, AI training, settings, and support. |
| Internal sales portal (`/internal-sales-representative`) | PitchProX sales representatives | Work assigned leads, place calls, manage follow-ups, mail, calendars, and quotas. |
| Super-admin portal (`/super-admin`) | Operations, finance, and compliance staff | Run the platform, manage customers/reps/plans, operate support, and maintain compliance evidence. |

### Current reality

The repository is a large, high-fidelity **frontend prototype**, not yet a working SaaS application.

- 113 Next.js page entries and 781 JavaScript/JSX source files exist.
- Navigation, dashboards, tables, dialogs, forms, charts, and client-side browser interactions are largely implemented.
- There are **zero** Next.js API route handlers, no server actions, and no actual `fetch`, Axios, React Query, or database calls in the application source.
- At least 17 local `*-data.js` files supply fixture content; many submit actions only log to the browser console, wait briefly, or redirect.
- Authentication is simulated. The current proxy only passes requests through and does not protect the real application route prefixes.

This means we should treat the UI as the product specification and build the real application behind it in deliberate phases.

## 2. What the product is meant to do

PitchProX helps a sales organization run AI-assisted calling:

1. A company signs up and configures its sales workspace.
2. It imports and manages leads in a CRM pipeline.
3. A representative makes a call in a browser-based dialer.
4. During a call, speech/transcripts feed AI guidance and objection-handling cards.
5. After the call, notes, disposition, recording, transcript, and analysis become part of the lead/call history.
6. Managers measure performance, manage subscriptions/minutes, and supervise user access.
7. Platform administrators run billing, support, sales-rep operations, audit logs, incidents, policies, training, and evidence storage.

## 3. Existing site and application modules

### Public website and authentication

| Area | Existing UI | Functional status today |
| --- | --- | --- |
| Landing page (`/`) | Hero, product explanations, simulated AI conversation, pricing toggle, FAQ, request-demo UI, footer | Visual/interactive only; demo submissions are not stored or sent. |
| About (`/about`) | Marketing/about content | Static. |
| Sign in, sign up, forgot/reset password | Validated forms and provider buttons | Simulated delays and redirects; no account creation, session, reset email, Google, or Facebook OAuth. |

### Customer portal — `/user`

| Module | Existing routes/UI | Backend work needed |
| --- | --- | --- |
| Dashboard | Dashboard, KPI cards, charts, recent calls, lead pipeline | Tenant-scoped dashboard metrics and recent activity. |
| Leads | List, add, edit, detail modal, filters/import affordances | Lead CRUD, bulk CSV import, validation, assignment, pagination, audit logs. |
| CRM | Pipeline, add prospect, detail view, call entry points | Prospect CRUD, stage changes, lead conversion, activity timeline. |
| Live calling | Dialer, microphone/recording UI, notes, follow-up, status, end-call and purchase modals | Telephony provider, WebRTC token service, real-time events, call persistence, minute enforcement. |
| Calls/reporting | Call history, contact modal, report screen | Call list/detail, recordings, transcript, sentiment, summary, export/download authorization. |
| Performance analytics | Charts, filters, insights | Aggregated tenant/rep analytics queries. |
| AI training | Guidelines, training content/progress UI | Training asset upload, versioning, jobs, status, AI configuration. |
| Playbooks | List, detail/change/learn modals, creation wizard | Playbook CRUD, draft/publish workflow, objection library, validation. |
| Calibration | Recorder/player/browser audio checks | Persist results only if product requires it; keep raw audio local unless explicit consent. |
| Settings | Profile, billing/history, integrations, security, notifications, preferences, mail, support | Profile/security, subscriptions/invoices, OAuth integrations, mail, tickets, preferences. |

### Internal sales representative portal — `/internal-sales-representative`

| Module | Existing UI | Backend work needed |
| --- | --- | --- |
| Dashboard and performance | Quotas, metrics, trends, operational alerts | Rep-scoped metrics, quota and commission data. |
| Users/client portal | Client list, client detail, user portal | Assignment-aware customer views with strict permissions. |
| Leads, CRM, calls, live calling | Rep versions of customer workflows | Assigned-lead APIs, rep call ownership, dispositions, recordings, live guidance. |
| Calendar and mail | Calendar UIs, mail inbox/composer/templates | Event/reminder APIs, mail provider integration, templates, delivery logs. |
| Billing/quota | Billing and credit-adjustment UI | Read-only quota/commission data plus approved adjustment workflow. |
| Calibration, support tickets, settings | Supporting forms and UI | Same service domains as customer portal, constrained by rep role. |

### Super-admin portal — `/super-admin`

| Module | Existing UI | Backend work needed |
| --- | --- | --- |
| Dashboard | Platform metrics, trends, user/revenue insights | Cross-tenant aggregates and operational monitoring. |
| Users and sales reps | Lists, detail pages, plans, notes, reports, quota controls | Tenant/reps CRUD, role assignment, support notes, auditable changes. |
| Plans, billing, credits | Plans, promotions, invoices, payment activity, credit dialogs | Subscription/payment provider integration, invoices, ledger, idempotent credit adjustments. |
| Campaigns and journeys | Campaign, segment, template UI | Segment definitions, campaign workflows, template CRUD, delivery provider. |
| Mail, calendar, support | Mail center, template and ticket UIs, announcement/calendar pages | Email provider, ticket workflow, events/announcements, notifications. |
| Master playbook | Extensive AI prompt/playbook builder | Global playbook versioning, tenant assignment, approval/publish workflow. |
| Compliance suite | Overview plus policy, training, AI governance, incidents, audit/access logs, SOC 2, evidence repository | Immutable audit trail, role-based access, document/evidence storage, signed uploads, integrity hashes, incident and training workflows. |

## 4. Page coverage and confirmed missing pages

The visible route coverage is broad. The major documented screens have corresponding pages, including dynamic detail pages for users, reps, emails, templates, incidents, policies, and campaign segments.

### Confirmed missing page routes

Two static links point to routes that do not have a page:

| Missing route | Linked from | Recommended resolution |
| --- | --- | --- |
| `/user/settings/billing/payment-method` | Customer billing section | Build a payment-method management page, or replace the link with a payment-provider portal/session flow. |
| `/user/settings/billing/upgrade` | Customer current-plan card | Build a plan-comparison/checkout page, or open the provider-hosted checkout flow. |

### Route/design inconsistencies to resolve

- The project specification mentions a super-admin campaign-segments index route, but only a dynamic segment detail route exists. Confirm whether segments should remain a tab within campaigns or receive `/super-admin/campaigns-journeys/segments`.
- Customer call reports currently use a generic `/user/calls/report` route. Production should use a canonical call identifier, such as `/user/calls/{callId}` or `?id={callId}`, and enforce ownership server-side.
- The proxy matcher is `'/user/:path*'` and `'/admin/:path*'`; it does **not** protect the actual `/super-admin/*` or `/internal-sales-representative/*` routes. Authentication/RBAC middleware must be designed before launch.

## 5. API inventory to build

The following is the recommended implementation backlog. Use `/api/v1` consistently; validate all inputs; derive tenant and role from the server-side session, never from an untrusted request body.

### Foundation: authentication, identity, tenant isolation

| Priority | API group | Main endpoints/actions |
| --- | --- | --- |
| P0 | Auth | Register, sign in, sign out, refresh session, forgot password, reset password, email verification, OAuth callback. |
| P0 | Current user/profile | `GET/PATCH /me`, password change, avatar upload, notification/preferences. |
| P0 | RBAC/organizations | Organization creation, memberships, invitations, roles, active tenant context. |
| P0 | Security | 2FA enrollment/verify, sessions/devices, revoke session, audit events. |

### Core sales application

| Priority | API group | Main endpoints/actions |
| --- | --- | --- |
| P0 | Leads | List/filter/page, create, read, update, archive, import CSV, export, assign/reassign, activity history. |
| P0 | CRM | Pipeline stages, prospects, stage move, notes, tasks, follow-ups. |
| P0 | Dashboard | Tenant/rep dashboard KPIs, lead-pipeline counts, recent calls, alerts. |
| P1 | Playbooks | List, create, update, draft, publish, archive, clone, objection/value-proposition resources. |
| P1 | AI training | Guidelines, source assets, upload, job creation/status, configuration/version history. |
| P1 | Analytics | Date-filtered call, rep, conversion, sentiment, and usage aggregations. |

### Calls and real-time AI

| Priority | API group | Main endpoints/actions |
| --- | --- | --- |
| P1 | Calling sessions | Initiate/answer/end a call, status updates, notes, disposition, follow-up, minute-balance check. |
| P1 | Telephony integration | Server-side provider webhooks, verified signature handling, recording lifecycle, retry/idempotency rules. |
| P1 | Live connection | Authenticated WebSocket/SSE for call state, transcript events, AI battlecards, and usage updates. |
| P2 | Call intelligence | Transcript retrieval/search, speaker turns, AI summary/action items, sentiment, adherence and report data. |

### Commercial, communication, and operations

| Priority | API group | Main endpoints/actions |
| --- | --- | --- |
| P1 | Billing | Plans, subscriptions, checkout/customer portal session, invoices, payment methods, usage/minutes, webhook processing. |
| P1 | Credit ledger | Admin-only grant/deduct adjustments, reason, approval policy, idempotency key, immutable audit event. |
| P2 | Support | Ticket CRUD, messages/replies, assignment, priority/status, attachments, customer notifications. |
| P2 | Mail/calendar | Email templates, send/queue/status, inbound events, calendars, events, reminders, announcements. |
| P2 | CRM integrations | OAuth connect/disconnect, sync configuration, import/sync jobs, webhook receiver, error logs. |

### Super-admin/compliance APIs

| Priority | API group | Main endpoints/actions |
| --- | --- | --- |
| P2 | Platform administration | Tenant/user/rep search, detail, plan changes, access/impersonation safeguards, reporting. |
| P2 | Campaigns | Segments, templates, campaigns/journeys, audience preview, publish/send, delivery metrics. |
| P2 | Compliance | Overview, policy documents/acknowledgments, trainings/assignments, incidents, AI governance controls, SOC 2 controls. |
| P2 | Evidence/audit | Signed upload/download URLs, server-calculated SHA-256, retention controls, append-only audit/access logs, exports. |

## 6. Minimum data model

Start with PostgreSQL and migrations. The key entities are:

`Organization`, `User`, `Membership`, `Role`, `Session`, `Lead`, `LeadActivity`, `PipelineStage`, `Prospect`, `Task`, `Call`, `CallParticipant`, `CallNote`, `CallRecording`, `TranscriptSegment`, `CallAnalysis`, `Playbook`, `PlaybookVersion`, `TrainingAsset`, `TrainingJob`, `Subscription`, `Invoice`, `MinuteLedgerEntry`, `SupportTicket`, `TicketMessage`, `EmailTemplate`, `EmailMessage`, `CalendarEvent`, `IntegrationConnection`, `AuditLog`, `SecurityIncident`, `PolicyDocument`, `TrainingAssignment`, and `EvidenceFile`.

Every tenant-owned table needs an `organization_id`. Authorization must constrain reads and writes by organization and role in the database/service layer, not only in the UI.

## 7. Functional status: what works today versus what does not

### Works locally as a frontend

- Page rendering, navigation, responsive layouts, dialogs, form validation, tables, chart presentation, and local UI state.
- Browser microphone/recording and audio-calibration interactions where browser permission is granted.
- Static/demonstration flows such as moving through pages, opening modals, and simulated post-action redirects.

### Not yet functional as a product

- User registration, credentials, sessions, social login, password recovery, and logout.
- Any persistent create/update/delete action: leads, CRM items, notes, playbooks, tickets, plans, billing adjustments, and profile changes.
- Actual data filtering/pagination/search, tenant isolation, permissions, and audit records.
- Telephony, recordings, real-time transcription, AI guidance, call analytics, email, calendar, CRM sync, billing, payment methods, invoices, and file uploads.
- Security controls: server authorization, 2FA, device/session management, webhook verification, rate limiting, secure secrets, and evidence integrity.

## 8. Recommended delivery order

### Today: establish a working foundation

1. Choose backend approach and hosting: recommended **Next.js API/backend-for-frontend + PostgreSQL** for the first functional release, with external providers for auth, telephony, payment, email, and file storage.
2. Define environment variables, database schema, migrations, seed data, and role model.
3. Implement authentication, protected routing, customer/organization membership, and session handling.
4. Implement lead CRUD and dashboard data for the customer portal first.
5. Replace one representative set of mock UI data with real API calls, loading states, errors, and empty states.

### Next: core sales workflow

1. CRM pipeline, playbooks, notes/tasks, and call history.
2. Billing/minute ledger and the two missing billing routes.
3. Calling-provider proof of concept: initiate/end call plus webhooks before attempting live AI coaching.

### After that: platform scale and governance

1. Real-time transcript/AI events and post-call analysis.
2. Internal sales-rep workflow and supervisor views.
3. Super-admin billing, support, campaigns, and compliance modules.
4. Automated tests, monitoring, security review, accessibility, and deployment readiness.

## 9. Risks and decisions needed before implementation

| Decision | Why it is needed |
| --- | --- |
| Backend stack and deployment platform | Determines project structure, database access, background jobs, and authentication approach. |
| Telephony provider (for example, Twilio or LiveKit) | Determines browser call flow, recording, WebRTC tokens, provider webhooks, and cost model. |
| AI providers and data retention policy | Sales calls can contain personal/sensitive information; retention, consent, model processing, and access must be decided. |
| Billing provider | Required for checkout, customer portal, payment methods, invoices, subscriptions, and webhooks. |
| Multi-tenant/RBAC policy | Defines who can view customers, calls, financial data, and compliance evidence. |
| Compliance scope | The UI says SOC 2, but actual controls, audit requirements, and evidence retention must be confirmed with the business. |

## 10. Figma status

The supplied Figma design link was not accessible to this environment: the regular browser fetch cannot open it, and no connected Figma integration is available. I therefore did **not** use it to judge design parity.

If the Figma file is shared with the connected account or a Figma connector is enabled, I can add a screen-by-screen design comparison and identify visual/interaction gaps.

## 11. Suggested status update for today

> We completed discovery of the PitchProX codebase. The frontend prototype contains 113 implemented pages across public, customer, sales-rep, and super-admin portals, but it has no functional backend/API layer yet. We identified the first two missing billing routes and confirmed that authentication, persistence, permissions, telephony, payment, email, and AI services need implementation. The recommended next step is to establish the backend foundation—database, authentication, tenant/RBAC model, and lead management APIs—then connect the existing UI module by module.

