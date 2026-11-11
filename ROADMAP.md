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
| — | Lint clean-up | 🟡 | 2026-11-10: 0 errors in files the app uses. The 10 left are all in unused files; delete the list in `Docs/launch-checklist.md` §7 and lint is clean. |

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
| 6. Compliance & Audit | Policy versions, training logs, incidents, evidence uploads, audit-log page, AI governance, SOC 2, exports | ✅ Done 2026-11-08 (reminder and assignment emails wait in the outbox for phase 7; AI Ethics & Governance was removed from the menu by the client) |
| 7. Outside services | Email, Stripe, telephony + speech-to-text + AI, OAuth integrations, 2FA (each when the client picks a provider) | ❌ |
| 8. Launch readiness | Rate limiting, full tests, security review, credential rotation, backups, monitoring | ❌ |

**Phase 0–1 notes**
- Roles: `customer_admin`, `customer_member`, `sales_rep`, `super_admin`, `admin_manager`, `support`, `auditor`. Admin roles share `/super-admin`; `ADMIN_SECTIONS` in `src/utils.js/roles.js` decides each role's sidebar *and* which `/api/v1/admin/*` data it may load. Auditors can read but not change.
- Invites: until an email service is connected, Add Employee shows the activation link for the admin to copy (valid 7 days, single use).
- Tests: `npm run test:db`, then `npm run build && npm run test:server` (port 3001, test DB), then run `npm run test:api` with `BASE=http://localhost:3001` (see `tests/api/helpers.mjs`). 156 tests pass, one file at a time (`--test-concurrency=1`: the files share one database, and parallel runs made journeys, onboarding and policies interfere) (Phase 2 adds `tests/api/sales.test.mjs`; Phase 3 adds `accounts.test.mjs` and `pricing.test.mjs`; Phase 4 adds `team.test.mjs` and `operations.test.mjs`; Phase 5 adds `campaigns.test.mjs`; Phase 6 adds `compliance.test.mjs`; Playbook Builder adds `playbook-builder.test.mjs`; Postmark adds `email-delivery.test.mjs`, which starts a stand-in for the Postmark API on :3002 that `npm run test:server` points to; Phase 8 adds `follow-up.test.mjs`; Phase 9 adds `notifications.test.mjs`; Phase 11 adds `security.test.mjs`).

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

**Playbook Builder notes (build phase 1: saving, 2026-11-08)**
- Drafts (`playbook_builds`): the whole 7-step form as one JSON document, the step the editor was on, and a revision number. The builder auto-saves 1.5 s after the last change ("Unsaved changes / Saving / All changes saved" in the header; Save Draft saves now) and warns before leaving with unsaved changes. A save based on an older revision is refused (409), so two editors can't overwrite each other.
- `/super-admin/playbook/create` (new), `?build=<id>` (continue), `?id=<platform playbook>` (one working draft per published playbook). The Playbook Library lists drafts (continue / delete) and reads platform playbooks from the database.
- Cover image, assets and voice audio upload straight away (`playbook_build_files`, served by `/api/v1/admin/playbook-builds/files/:id`); browser-only `blob:` links are refused. Resource files come with the Resource Library phase.
- Super Admin only.

**Playbook Builder notes (build phase 2: publishing, 2026-11-08)**
- Publish = an immutable numbered version in `playbook_versions` (Spec 12 §11): `content` is the compiled PremiumPlaybook object (§5, `lib/playbook-compile.js` → identity, commerce, internal, methodology, voice_language, conversation_flow, objection_library, resources, prompt_framework, prompt_dna, logic_rules, prompt_delivery, safety_boundaries, advanced, publication) and `source` the builder form. `playbooks.active_version_id` / `version` point at the one in force. Commerce and internal notes are marked `runtime_use: false`; hard boundaries are kept apart from preferences.
- Publish checks run on the saved draft (§9): required fields, allowed values, lengths, min ≤ ideal ≤ max prompt length, duplicate stages/objections, objection roots, resource names/types → errors block publishing. §9.1 contradictions and quality issues → warnings a reviewer must confirm (recorded on the version).
- Objections: one root (Financial / Risk / Logistics / Relationship) + subtype (§6.4); old labels (Pricing, Timing, Identity / Emotional…) are converted.
- Editing a published playbook makes a new draft from the version in force; v2+ need release notes; the changed builder sections are recorded. Rollback re-publishes an earlier version as the next number (with a reason); versions are never overwritten. Version history is on the Playbook Library card ("Versions").
- Visibility: Marketplace = customers and staff; Team / Organization = staff only; Private = Super Admins only (`lib/playbooks.js`). The seeded playbooks have no visibility set and stay visible to everyone.
- Review & Publish shows only saved content: no sample counts and no projected "Impact Preview" numbers (§6.12).

**Playbook Builder notes (build phase 3: premium playbooks for customers + AI export, 2026-11-08)**
- `lib/playbook-runtime.js`: `aiPlaybook()` is the AI-safe copy of a published version (commerce, internal notes, marketplace description, internal tags and status removed; `contract: "pitchprox.premium-playbook/1"`). `playbookOverview()` feeds the customer cards and details window; `playbookInside()` is the read-only methodology (stages, objections, scripts).
- Customer library: each card carries `overview` from the version in force. `GET /api/v1/playbooks/{id}` adds `inside` only when the person has the playbook (bought, staff, or free); otherwise `null`. A premium playbook published as Free (no price) is open to everyone and shows "Free".
- Details window: highlights, "You'll Learn" and counts come from the published version; "Use Playbook" for available ones, "Purchase Playbook" (waits for Stripe) otherwise; "What's Inside" read-only section for owners. Seeded playbooks have no published version and show general text.
- AI: `GET /api/v1/me/playbook-runtime` returns the user's active playbook at the version in force (`playbook: null` for seeded/custom ones). `GET /api/v1/admin/playbooks/{id}/export?version=N` downloads the JSON (Version History → "For AI developer"). Contract: `docs/ai-playbook-contract.md`.

**Playbook Builder notes (build phase 4: Resource Library, 2026-11-08)**
- `playbook_resource_library` + `lib/playbook-resources.js`; routes `GET/POST /api/v1/admin/playbook-resources` (`?search=&type=&addedBy=`) and `PATCH/DELETE /api/v1/admin/playbook-resources/{id}`. Super Admin only. Pinning the same name + type again links to the existing entry; removing only hides it from imports.
- Pin from "Add Resource" (checkbox) or a row's menu ("Pin to Library"). Import from Library: search (name, description, text), type, added by; multi-select; resources already in the playbook are marked. Imported resources are copies with `libraryId`, so library edits never change a published version; editing a pinned resource can also update the library copy (checkbox).
- Files: resources can carry an uploaded file (builder file purpose `resource`: PDF, Word, PowerPoint, Excel, text, images, audio, video; 50 MB).
- "Added by" and the date are the signed-in user and today (no more "Daniel Miller / May 10, 2024"). New playbooks start with no resources (the 24 sample resources are gone). Quick Script Builder cards open the same Add Resource window.
- Email Template / Follow Up resources: shown as reference for the rep and for follow-up drafts after the call, not spoken live (hint under the type picker). Still to confirm with the client / AI developer.

**Playbook Builder notes (build phase 5: screen fixes, 2026-11-08)**
- Every step ends with Back (left) and Next (bottom right); step 1 has Next only, step 7 Back only (its publish card has the Publish button).
- "Reset to Default" asks first (`confirmReset` in `lib/alerts.js`) and resets only that section. The "Reset to Playbook / Logic Defaults" buttons (all areas) ask with their own wording. The sections' default `onResetDefaults = () => {}` made the reset a no-op where no handler was passed; removed.
- Methodology text fields (Strategic Framing, Trust-Building, Discovery, Objection Tone, Closing, Follow-Up) allow 500 characters.
- Objection Tone → "Adapt to emotion level" opens: an on/off switch plus guidance for calm / frustrated / upset leads (`objectionTone.intensityLevels`, reaches the AI through the compiled methodology).
- Language Rules → special instructions: inline edit, delete and "Add instruction".
- Layout: Coaching Pillars, DNA area and logic category names, focus areas and key outcomes wrap instead of being cut off; Closing / Objection / Discovery / Follow-Up step cards use 2 columns; Logic & Rules rows put "how it works" under the title so it can't run into the Active button; the dead dropdown arrows on two follow-up angles and the Internal Tags box are gone.
- Previews: author falls back to the signed-in user (also the Author placeholder), cover image or initials instead of a stock photo, PREMIUM badge only for premium playbooks, tags/focus/best-for/style come from the form. New playbooks start without the Herjavec internal notes and tags; Internal Notes shows what's saved (it used to show sample text when empty).

**Logo + calibration gate (build phase 6, 2026-11-09)**
- Logo: `src/assets/logos/blue-logo.png` (dark text) and `white-logo.png` (white text) are the client's tagline logo (Nov 8 zip), 900 px wide, transparent; the dark version is the client's transparent file with the text recolored. Every usage imports these two files (public header/footer, sign-in/up, demo, onboarding, all portal sidebars); boxes widened for the wider logo. Browser tab: `src/app/icon.svg` (bubble mark, brand teal #00B3BA) + `src/app/apple-icon.png` (bubble on white, 180 px). The product screenshot on the sign-in page still shows the old logo (inside the image).
- Calibration gate (customers only): `lib/calibration.js`; `GET /api/v1/calibration/status` → `{ required, completed, deferredAt, sessions }`; `POST /api/v1/calibration/defer` ("Do it later", saved in user preferences). Sign-up and sign-in return `needsCalibration` → the form goes to `/user/calibration`. Calibration page: welcome card (Start / Do it later). Dashboard: "Calibration required to unlock calling" reminder until done. Live Calling: locked screen until one session is saved (a header "Start Call" made while locked is discarded). Employees aren't gated. The real call API (AI plan) must check `calibrationStatus` server-side too.

**Postmark email delivery (build phase 7, 2026-11-09)**
- Delivery only: PitchProX keeps campaigns, journeys, segments, triggers and templates. `lib/email/postmark.js` sends one email (`POST /email`); `lib/campaigns/outbox.js` `deliverQueued()` claims each queued row (`status = 'sending'`, `locked_at`) so the job runner and an immediate send never double-send. Streams: Transactional templates, compliance and system emails → `POSTMARK_TRANSACTIONAL_STREAM` (default `outbound`); Marketing/Lifecycle → `POSTMARK_BROADCAST_STREAM` (default `broadcast`) with `List-Unsubscribe` + one-click `List-Unsubscribe-Post` (the unsubscribe route now also answers POST). From = template's From Name + `EMAIL_FROM_ADDRESS`; Reply-To from the template; plain-text part generated; opens/links tracked except on system emails.
- Results: accepted → `sent` + `provider_id` (MessageID). Unreachable / wrong token / 429 / 5xx → stays `queued`, the pass stops (attempts not used). Postmark 406 (inactive recipient) → `skipped`. Other refusals → retried, `failed` after 3 attempts. Without `POSTMARK_SERVER_TOKEN` nothing is sent (emails wait, as before).
- Webhook `POST /api/v1/public/postmark/webhook` (Basic auth, password `POSTMARK_WEBHOOK_SECRET`; 503 when unset): every event stored in `email_events`; Delivery → `delivered_at`; hard bounce → `bounced_at` + suppression; spam complaint → `complained_at` + suppression; Open/Click → `opened_at`/`clicked_at` (journey "Email Opened/Clicked" conditions); SubscriptionChange → suppression list follows Postmark (added or removed). Suppressions stop Marketing/Lifecycle only.
- System emails (`lib/email/system.js`, source `system`, sent right after the response with `after()`): employee invites and resends, customer activation links and resends (links still returned for copying), password reset.
- Password reset (`lib/password-reset.js`): `POST /api/v1/auth/forgot-password` (same answer for every address; max 3 links per 15 min per account; not for deactivated / not-yet-invited staff, suspended customers or customers who haven't activated), `GET|POST /api/v1/auth/reset-password` (1 hour, single use, 8+ characters, signs out every session, audit log). The forgot/reset pages now call these.
- Overview: delivered / bounced / spam counts, "Postmark connected" line; system emails are kept out of campaign numbers. Delivery list has `stream`, `deliveredAt`, `bouncedAt`, `complainedAt`, `providerStatus`.
- Not in this phase: the Mail tab (users' own emails to prospects) still only saves; sending those needs a decision on the sender address (phase 10).

**Playbook Email Templates & Follow-Up (build phase 8, 2026-11-09, client's Google Doc)**
- Shared lists in `src/utils.js/follow-up.js`: template purposes (Appointment Confirmation, Requested Information, Agreed Follow-Up, Post-Meeting Follow-Up, Unresolved Objection Follow-Up), follow-up kinds (each → a template purpose), the placeholders a template may use, and the call facts the user can confirm.
- Builder: Email Template resources get Template Purpose + Email Subject; Follow Up resources get Follow-Up Kind + "Uses Email Template". Kept in the Resource Library (`playbook_resource_library.follow_up` JSON). Publish checks warn on a template without purpose/body, placeholders PitchProX can't fill, and a follow-up whose template purpose the playbook lacks.
- AI export (`aiPlaybook`): every resource has `use` (`live` / `after_call`); Email Templates lose `content`/`subject` (the live AI only knows which follow-ups exist). Documented in `docs/ai-playbook-contract.md`.
- `lib/follow-up.js`: `GET /api/v1/follow-up` (customers + sales reps) → the ACTIVE playbook's templates and follow-ups (read-only), or the Standard set for the Standard playbook; custom playbooks have none. `POST /api/v1/follow-up/draft` builds a draft only (nothing saved or sent): contact by id, or matched by phone number then name (reps: their own pipeline); "Do Not Contact" outcome or a suppressed address → 409; values come from the contact, the signed-in user and the facts the user confirms (dates are formatted as entered, no time-zone shift; a prospect's stored follow-up is used when no follow-up fact is given); a line whose placeholder has no value is left out (`leftOut`), a bare greeting becomes "Hi,"; subjects drop the placeholder and its "on/at/for".
- UI: "Send an email" next to "Set A Follow Up" on both after-call screens → modal (follow-up kind preselects the template, asks only for the facts the template uses) → draft handed to Mail via sessionStorage (`components/follow-up/mail-draft.js`) → User Send Mail / Sales Rep Mail open with To/Subject/Message filled and a notice of what was left out. The user edits and sends it themselves.

**In-app notifications (build phase 9, 2026-11-09)**
- Table `notifications` (per person: type, title, body, link, entity, actor name, read_at). `lib/notifications.js` `notify(recipients, {...})` never throws (a failed notification doesn't break the action), skips the actor, deactivated staff and anyone whose Settings → In-App Notifications is "off" / "email-only". `link` can be a function of the recipient's role (customers vs staff portals). Read notifications older than 90 days are cleared when the list is loaded.
- API: `GET /api/v1/notifications?limit&before&unread=1` → `{ results, hasMore, unreadCount }`; `PATCH /api/v1/notifications/:id { read }`; `DELETE /api/v1/notifications/:id`; `POST /api/v1/notifications/read-all`. Only your own (404 otherwise).
- Sources: policies (submitted → Super Admins; approved / changes requested → submitter; required policy approved → every active employee; overdue reminders), training (assigned when "notify" is on, reminders), incidents (assigned to someone else, "request more info" → reporter), coaching notes → the rep, support tickets (new / customer reply → assigned agent or the Support + Admin Manager team; agent reply, resolved/closed → the customer; assigned / escalated → the agent), billing adjustments (pending request → Super Admins; decision → requester).
- Bell (`components/shared/header`): unread badge from `use-unread-notifications.js` (on load, every minute while visible, on tab focus); the dropdown loads the list when opened, opens the linked page and marks it read, menu for read/unread/delete, "Mark all read", "Show older notifications".

**Mail & billing leftovers (build phase 10, 2026-11-09)**
- Mail tab (`lib/mail.js`): sending writes an outbox row (`email_deliveries`, source `mail`, Transactional stream) with `from_name` "Name via PitchProX", `reply_to` the sender, CC/BCC and `track_opens`; Postmark gets it right after the response (`after()`), links aren't rewritten. The list status comes from that row: draft / waiting (Postmark off) / sending / sent / delivered / opened / bounced / failed. Addresses suppressed as bounced or spam are refused (409). Merge fields `{First Name}`, `{Last Name}`, `{Company}` (internal pipelines), `{Phone}`, `{Property Address}` are filled from the prospect/lead with the recipient's email (reps: their own); an unfillable one stops the send (400) and nothing is stored. The stored email keeps what was actually sent.
- Drafts: `POST /api/v1/mail/messages { draft: true }` (may be incomplete), `PATCH /api/v1/mail/messages/:id` (save, or `send: true`), `DELETE` (drafts only; sent emails can't change, 409). Drafts are visible only to the writer. Compose forms have Save draft / Delete draft; lists open drafts in the form (`?edit=<id>`).
- Staff ticket drawer: the customer's email opens the portal's Mail with `?to=` and `?subject=Re: TKT-…`.
- Billing → Invoice Management (`components/billing/invoice-management.jsx`, both portals): `GET /api/v1/billing/invoices?search&organizationId` (billing staff; reps their accounts; customers 403) from the `invoices` table; row → that customer's invoice history. Empty until payments (Stripe) write invoices. The old sample-data components in `*/billing/components/invoice-management.jsx` and `customer-invoice-history-modal.jsx` are no longer used (on the delete list).

**Security (build phase 11, 2026-11-10)**
- Two-step login (`lib/mfa.js`, TOTP RFC 6238, no SMS/email provider needed): `POST /api/v1/me/mfa/setup` (new secret, QR as a data URL via the `qrcode` package; nothing changes until confirmed), `confirm { code }` (turns it on, returns 10 recovery codes once, signs out other devices, sets `staff_profiles.mfa_method = 'authenticator'`), `disable { password, code }`, `recovery-codes { code }`, `GET /api/v1/me/mfa`. Secrets are AES-256-GCM encrypted (key from `APP_SECRET`, else a generated `app_secrets` row); recovery codes are stored hashed; a code's 30-second step is remembered so it can't be replayed. Not changeable during impersonation. Super Admin: `POST /api/v1/admin/users/:userId/mfa-reset` (Access Records → "Reset two-step login").
- Sign-in: `POST /api/v1/auth/sign-in { email, password, remember }` → session, or `{ mfaRequired, challengeToken }`; then `POST /api/v1/auth/sign-in/verify { challengeToken, code }` (app code or recovery code; 5 minutes, 5 tries). Shared completion in `lib/sign-in.js`. "Remember Me" → 30-day session (else 7).
- Attempt limits (`lib/rate-limit.js`, table `rate_limit_hits`, 429 + `Retry-After`): wrong passwords 5 per email and 30 per IP per 15 min (a correct password clears the email count), sign-up 10/hour per IP, forgot-password 10/hour, reset-password 20/hour, invite/activation links 20/hour per IP, change-password and two-step codes per account. Loopback addresses aren't limited by IP (local runs, health checks).
- Client IP (`requestClient`): X-Real-IP (set by NGINX/CloudPanel), else the last X-Forwarded-For hop. The first X-Forwarded-For entry is visitor-controlled and is no longer trusted. If the server ever runs without NGINX in front, per-IP limits only see the direct connection.
- Sessions: expired rows are cleared on the next sign-in.
- Not done: onboarding's "SMS / Mail" security choice is still only a preference (it needs an SMS/email provider to send codes); employees can turn on the authenticator app from Settings → Security.

**Consistency + mobile (build phase 12, 2026-11-10)**
- Audit method: every static page of each portal, signed in as each demo role, at 360, 390 and 1024 px; checks page width vs viewport, page errors, the no-access message, and that sidebar links only lead to allowed pages. All clean after the fixes below.
- `components/shared/development-notice.jsx`: on phones a small "Partly working / Waiting on client" tag (bottom-left) that opens the message; desktop unchanged.
- `components/shared/table-scroll-hints.jsx` (mounted in the root layout) + `globals.css`: every table scroller gets `data-scroll-table` and `data-more="left|right|both"` → edge fade; on phones the first column is sticky. `.overflow-x-auto:has(table) { position: relative }` keeps absolutely positioned bits (sr-only labels) inside the scroller (they widened Sales Reps by 600 px).
- Two-column layouts that only fit wide screens now split at `xl` instead of `lg` (Calibration both portals, Training Logs, dashboard KPI cards, Access Records offboarding banner); Integrations row text can shrink.
- `/super-admin` redirects to the role's home (`dashboardPathFor`); the Support Dashboard is blocked in the shell unless the role has the Support Tickets section (Super Admin, Support).
- Sample call histories (until calling is connected) are built per visit with a fixed time of day, and their date cells allow server/browser differences (React error 418 on Calls).

**Phase 6 notes**
- Permissions: Compliance & Audit is Super Admin, Admin Manager (manage) and Auditor (read-only). "Incident Management permission" and owner lists = Super Admin + Admin Manager. Only a Super Admin approves policies, deletes/archives policies and removes incident evidence.
- Audit Logs: the `audit_logs` table every module writes to, filed into 6 categories by action prefix (`lib/compliance/audit-catalog.js`; they add up to Total Events). Filters, paging, CSV/JSON export (secrets never exported; "Include metadata & client context" adds IDs, browser and details); each export is itself logged. Staff sign-ins and every failed sign-in are now logged (customers' successful sign-ins stay in their own login history).
- Policy Documents: `policy_versions` keeps every version (Draft → Under Review → Approved; Changes Requested with a note; restore an old version as a new one; archive). The approved version is copied onto `policy_documents`, which onboarding shows; signatures are per version, so a new version asks everyone again. Overdue = not signed 14 days after approval (or after joining). Employees sign from a prompt in their portal (`components/shared/policy-prompt.jsx`); reminders are queued in the email outbox. PDF/DOCX uploads; PDFs preview in the page.
- Training Logs: Training = course (`training_courses`) built from library materials (`training_materials`: PDF / Doc / Video file or https link); categories (unique ignoring capitals; content must be moved before delete); Bulk Assign = Trainings × employees (open ones skipped; completed ones only with "Allow reassignment", which adds a new record). Status: Completed / Overdue (past due) / In Progress (a material opened) / Not Started; "By Employee" view shows "2 of 3 Completed", "Mixed", "Overdue". Employees open every material, then mark complete ("My Training" prompt, `components/shared/training-prompt.jsx`); certificates use Certificate Validity (Does Not Expire / 6 Months / 1 Year / Custom months). The onboarding course appears as an assignment for everyone who onboards (synced from onboarding progress). Report = Training Assignment Report as CSV (Excel/PDF files not built).
- Incident Management: INC-YYYY-NNNN; Open → Investigating (whoever starts owns it if unassigned) → Resolved (findings, actions, conclusion all required; Investigation Completed At / Investigated By automatic) → Closed; Close Without Incident needs a reason; Resolved/Closed reopen to Investigating. Timeline (`incident_events`), evidence files, optional escalated support ticket (the "Escalated Tickets" tab), resolution targets by severity (24h / 3 days / 7 days / 30 days). KPIs follow client items 133–135.
- Evidence Repository: EV-NNN items with versions (`evidence_versions`; a new version keeps the old file and returns to Under Review). Upload → Under Review, Save as Draft → Draft, Verify (note optional) / Request Changes (note required), Archive (kept, not counted), only drafts deleted. Verified evidence past its expiry date shows as Expired automatically.
- SOC 2 Readiness: control library (`soc2_controls`, 24 controls over the 5 Trust Service Criteria; status, owner, due date per control). A control is ready when Implemented and backed by Verified, unexpired evidence; readiness, gaps (CSV export) and per-criteria progress are calculated. Audit timeline dates are editable. "Invite Auditor" opens Access Records (invite with the Auditor role).
- Compliance Overview: built from the five pages (score = average of policy signature rate, training completion, verified evidence share and SOC 2 readiness).
- Unused files to delete (sample data the live screens replaced): `src/app/super-admin/compliance-audit/policy-documents/policies-data.js`, `policy-documents/components/policy-details-modal.jsx`, `training-logs/components/manage-categories-modal.jsx`, `evidence-repository/evidence-data.js`, `evidence-repository/evidence-options.js`, and `incident-management/[id]/components/` (four design components the detail page never used).

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
| Compliance and audit | ✅ | Policies, training, incidents, audit logs, SOC 2 readiness and evidence (backend Phase 6). |

---

## Phase 6 — Launch readiness

| Feature | Status | What it's for |
|---------|--------|---------------|
| Lint and build pass | ❌ | Required before the deploy workflow will run. |
| Automated tests | ❌ | Catch bugs before release. |
| Rate limiting | ❌ | Blocks login-guessing and abuse. |
| Audit logs | ❌ | Record who changed what, and when. |
| Rotate old credentials | ❌ | Old keys may have leaked through the earlier malware. |
