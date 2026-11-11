# PitchProX launch checklist (Phase 16)

Work through this list top to bottom on the day before go-live. Server setup steps are in `DEPLOYMENT.md`.

## 1. Code gate (on your machine)

- [ ] `npm ci && npm run lint`: no errors. The only errors left (Nov 10) are in the unused files in section 7. Delete those files and lint is clean.
- [ ] `npm run build` succeeds.
- [ ] `npm audit --omit=dev` shows 0 vulnerabilities. Next.js is 16.4.6 as of Nov 10.
- [ ] API tests pass against a fresh test database:
  ```bash
  npm run test:db && npm run build && (npm run test:server &)
  MYSQL_DATABASE=pitchprox_test MYSQL_HOST=localhost ADMIN_EMAIL=… ADMIN_PASSWORD=… BASE=http://localhost:3001 npm run test:api
  ```

## 2. Server and secrets

- [ ] The production `.env.local` exists only on the server. Use new values, not the dev ones, for:
  - `MYSQL_PASSWORD`
  - `CRON_SECRET`, `APP_SECRET`, `POSTMARK_WEBHOOK_SECRET` and `CALL_SERVICE_SECRET` (each a long random string)
- [ ] `CALL_SERVICE_PUBLIC_URL=wss://<domain>/call-ws`, and the NGINX `/call-ws/` block from `DEPLOYMENT.md` §8 is in the vhost.
  - `ADMIN_PASSWORD`
- [ ] `APP_URL=https://<domain>`. Emails, unsubscribe links and the video link use it.
- [ ] HTTPS works and HTTP redirects to HTTPS. The app sends HSTS, so HTTPS must work before go-live.
- [ ] The MySQL port (3306) and the Node app port are not reachable from the internet.
- [ ] Production uses its own database (not `pitchprox_dev`) and a MySQL user that can only reach that database.
- [ ] `npm run db:migrate`, then `npm run db:seed`. Do not run the demo seed on production.
- [ ] PM2 runs the app (`pitchprox`), the scheduler (`pitchprox-jobs`) and the AI call service (`pitchprox-calls`), and `pm2 save` + `pm2 startup` are done. `curl http://127.0.0.1:3010/health` answers.

## 3. Monitoring and backups

- [ ] Health check: `GET https://<domain>/api/health`.
  - It returns `{"status":"ok","database":"ok"}` with 200, or 503 if the database is down. It shows no secrets.
  - Add it to an uptime monitor (for example UptimeRobot, free, every 5 minutes) that alerts Mahi and Bryce.
- [ ] Nightly backup cron (database + uploaded files, 14 days kept):
  ```
  30 2 * * * cd /home/<site-user>/htdocs/<domain> && ./scripts/backup.sh >> storage/backup.log 2>&1
  ```
- [ ] Backups are also copied off the server, through Hostinger's backups or rclone to Google Drive / S3.
- [ ] **Restore test, once:** restore last night's backup into a scratch database and open the app against it. A backup that has never been restored doesn't count. The local app user can't create databases, so do this on the server with the panel's database user.

## 4. Third-party services

- [ ] Postmark:
  - production server token;
  - sender domain verified (DKIM + Return-Path);
  - webhook `https://postmark:<POSTMARK_WEBHOOK_SECRET>@<domain>/api/v1/public/postmark/webhook` added for the Transactional and Broadcast streams (see `DEPLOYMENT.md`);
  - the account is out of test mode (approved).
- [ ] Stripe: live keys and the webhook. Do this when the Stripe phase is done.
- [ ] Google / Facebook sign-in: the production domain is added to the allowed origins and redirect URLs, and the app's Privacy Policy, Terms and Data Deletion URLs point to `/privacy`, `/terms` and `/data-deletion`.
- [ ] Twilio, Deepgram and the AI provider: keys set when the AI phases go live.
- [ ] The "See how it works" video:
  - it is served from `public/videos` (39 MB);
  - to serve it from a CDN or Vimeo instead, set `NEXT_PUBLIC_DEMO_VIDEO_URL` before building.

## 5. Legal (Bryce)

- [ ] PitchProX's lawyer has reviewed the Privacy Policy and Terms.
- [ ] Every highlighted `[placeholder]` is filled in: company legal name, address, hosting provider and region, retention periods, governing state.
- [ ] Then remove the "Draft" banner. It is in `src/components/legal/legal-page.jsx`, and `updated="Draft · not yet in effect"` is set on each page.
- [ ] Someone owns data deletion requests (Compliance & Audit → Data Deletion) and answers within 30 days.

## 6. Smoke test on the live site (about 15 minutes)

- [ ] Home page:
  - the "See how it works" form opens the video pop-up;
  - the email arrives;
  - the plans link to sign-up.
- [ ] Sign up a fresh account, sign out and back in, turn on two-step login, and reset the password by email.
- [ ] Add a lead with two phone numbers. Mark one "Wrong number", then "Call next number".
- [ ] Add a CRM prospect, move its stage, add a follow-up and send an email.
- [ ] Sign in as Super Admin: the dashboard loads, the notifications bell works, and the Data Deletion list opens.
- [ ] Submit `/data-deletion`: the confirmation email arrives and the Super Admin gets a notification.
- [ ] `pm2 logs pitchprox --lines 200` shows no errors.

## 7. Unused files to delete (Mahi)

These are design copies that the live screens replaced; nothing imports them. Deleting them also clears the last lint errors.

- `src/app/internal-sales-representative/users/[id]/components/` (whole folder)
- `src/app/super-admin/plan-pricing-control/components/add-edit-plan-modal.jsx`
- `src/app/super-admin/dashboard/components/` (whole folder)
- `src/app/super-admin/billing/components/invoice-management.jsx` and `customer-invoice-history-modal.jsx`
- `src/app/internal-sales-representative/billing/components/invoice-management.jsx` and `customer-invoice-history-modal.jsx`
- `src/components/modals/time-picker.jsx`
- `src/app/user/leads/components/add-lead.jsx`
- Old sample call-report sections, all in `src/app/user/calls/components/`: `call-report.jsx`, `call-summary.jsx`, `performance.jsx`, `conversion.jsx`, `agent-sentiment.jsx`, `share-report-modal.jsx` (replaced by `src/components/calls/call-report-view.jsx`)
- Campaigns & Journeys design copies, all in `src/app/super-admin/campaigns-journeys/`:
  - `templates-data.js`
  - `segments-data.js`
  - `components/` → `leads-selection-table.jsx`, `top-performing-content.jsx`, `email-engagement-chart.jsx`, `edit-segment-modal.jsx`, `create-segment-modal.jsx`, `analytics-journeys-table.jsx`, `conversion-funnel-card.jsx`, `delivery-insights-card.jsx`
  - `segments/[id]/components/` → `segment-leads-table.jsx`, `segment-insights-card.jsx`

After deleting, run `npm run lint && npm run build` again.

## 8. Security review summary (Nov 10)

- **Sign-in:**
  - passwords are hashed with scrypt;
  - sessions are stored in the database, can be revoked, and are listed in Settings → Security;
  - two-step login is optional (TOTP + backup codes).
- **Rate limits:** sign-in, sign-up, forgot / reset password, invite links, two-step codes, password change, the demo form and the deletion form.
- **Access:**
  - every API route checks the signed-in user and their role on the server, so the page proxy is not the only guard;
  - customer data is filtered by organization.
- **Public endpoints (no sign-in):**
  - plans, demo request + watch events, data deletion request, unsubscribe, campaign images, Postmark webhook (shared secret), health;
  - each one validates its input, and the forms are rate-limited.
- **Headers:** `X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy` (microphone for this site only), HSTS, and no `X-Powered-By`.
- **Dependencies:** Next.js 16.4.6 (fixes a critical proxy-bypass advisory) and axios patched; production dependencies have 0 known vulnerabilities.
- **Not done yet:**
  - A strict Content-Security-Policy. Add it after launch, once the Google, Stripe and Twilio allowances are known.
  - An external penetration test, if Bryce wants one before scaling.

## 9. Staging

Bryce currently sees only the Vercel preview, which has sample data and no backend. To let him test the real app before launch:

- **Option A: Mahi's server, once it's fixed.**
  - Same CloudPanel setup with a second site, `staging.<domain>`, with its own database and `.env.local`.
  - Postmark test mode, so no real emails are sent.
- **Option B: a small separate VPS (about $13/mo, Hostinger KVM 2 or similar)** in Bryce's account.
  - Same steps as `DEPLOYMENT.md`.
  - Bryce owns it, and it later becomes production or stays as staging.

Either way:
- protect staging with a basic-auth password in the web server (nginx) so search engines and strangers can't reach it;
- load it with `npm run db:seed:demo` so Bryce has data to click through;
- add `X-Robots-Tag: noindex`.

Recommendation: Option A if Mahi's server is back this week. Otherwise Option B: Bryce already plans to buy a Hostinger KVM 4 about a month before go-live, so buying it now and using it as staging first costs nothing extra later.
