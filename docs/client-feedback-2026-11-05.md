# Client change list (Google Doc, 5 Nov 2026): status

Source: the Google Doc Bryce sent in the Fiverr chat on 5 Nov 2026 at 12:26 ("PitchProX Edits for User Role / Internal Sales Reps / Mobile Site / Super Admin").
Numbers below match the numbering in that document.

Status key:
- **Done today**: changed in the code on 5 Nov.
- **Already done**: the code already did this (the client was probably looking at an older link).
- **Open**: not done yet.

---

## Home page
| Item | Status |
|---|---|
| Free Trial tooltip by "10 calls", same as the paid plans | Open |
| Update logo | Already done. The logo file the client sent (8 Sep) looks the same as the one in the app. **Ask the client which logo or location he means.** |

## Lead types & outcomes lists
| Item | Status |
|---|---|
| User and internal lead type / outcome lists | Already done. They match the document exactly. |

## User role
| # | Item | Status |
|---|---|---|
| 1 | Calibration "Suggested Response 1/4" wording | Already done ("Speak 1 Response Aloud") |
| 3–4 | Live Calling: disclosure notice during the call; Disclosure, Objection and Sentiment tabs after the call | Open |

## Internal Sales Rep
| # | Item | Status |
|---|---|---|
| — | Dashboard: full column titles; tooltips on the 4 trend metrics | Already done |
| 1 | Support Tickets: "+ New Ticket" | Done today |
| 2 | "Canceled Accounts" for churn recovery | Done today. Users page card that opens the list filtered to Canceled. |
| 3 / M25 | Calibration "Go to Dashboard" did not work | Done today |
| 5 / M45 | Overview: Reset Calibration alignment, plus a confirmation pop-up | Done today |
| 6–7 | Current Usage (This Cycle) on one line, with a tooltip | Done today (tooltip already existed) |
| 8–9 | "Lead to Subscription" in title case | Already done |
| 10 | Credits & adjustments: no delete column | Already done |
| 11 / SA6 | Users: "Add New Customer" button that opens the account form | Done today (Sales Rep and Super Admin) |
| 12 | Wrong lead types on Sales Rep screens | Done today (sales rep profile: internal lead types and outcomes) |
| 13 | Performance: page numbers on Rep Bonus Performance | Open |
| 14 | "Industry average" → legend "● You - - - PitchProX Benchmark", with tooltip | Done today (dashboard chart and all metric cards) |
| 16 | Live Calling: Transcription tab after the call | Open |

## "Mobile Site" list
| # | Item | Status |
|---|---|---|
| 1–8, 21, 23 | Mobile layout fixes (squeezed tables, live calling screens, overlapping notifications) | Open. They need a mobile pass. |
| 9–11, 15–17 | Page numbers on Leads, CRM, Calls and Performance tables | Open. Desktop Leads, CRM and Calls already have pagination. |
| 12, 21 | Remove "/" between Customer and Company | Open |
| 13, 20 | Support Ticket: internal notes, 4 actions, search bar | Already done (desktop ticket drawer) |
| 18–19 | Mail: editable drafts; ticket link → email | Open |
| 22 | Billing: Invoice Management opens invoice history | Open |
| 24 | Calibration "seasons" → "session status" | Open. The wording isn't in the web app, so it's probably the mobile app. |
| 26–41 | Customer detail Call History / Usage & Activity: customer lead types, property address, homeowner profile, customer outcomes | Already done |
| 42–44, 46 | Overview cards link to Billing details, the Usage & Credits section, the Invoice section and the Usage page | Done today (cards jump to the exact section) |
| 47–50 | Add Calls / Reports / Discount capped at 50 with confirmation; Invoice Settings edit | Already done |
| 51–54 | Reports: +8 alignment, remove recordings, internal notes, Calibration layout | Done (screens); real reports appear once calling is connected |
| 55 | Support: "PitchProX AI Suggested Reply" next to Send Reply | Already done |

## Super Admin
| # | Item | Status |
|---|---|---|
| 1–3 | Add Calls / Reports / Discount: no cap, with confirmation | Already done |
| 4 | Issue Refund opens the Figma pop-up | Open |
| 5 | "Downgrade Subscription" | Already done |
| 7 | Mail: "Use template" pre-fills the form | Done today (Super Admin now uses the same Mail screens as the Sales Rep) |
| 8 | Top Sales Rep name → rep profile | Open |
| 9–13, 15–18 | Playbook basic info: Author (default = creator, shown in the preview), new Category / Style (up to 2) / Experience lists, cover photo in the preview, new communication / sentence / formality lists | Done today |
| 14 | Core Focus & Outcomes spacing | Open |
| 19–25 | Objections: new categories (up to 2); stages from the playbook's own stages, multi-select with "Any Stage"; searchable lead type picker with "All Lead Types"; renamed labels | Done today |
| 26 | Playbook library landing page; "View details" opens the playbook for editing; "Create a New Playbook" | Done today |
| 27–35 | Resources & Scripts: upload, pin to Resource Library, library search | Open |
| 36 | "Next" button at the bottom of each step | Open |
| 37–38 | Context Inputs and Response Sequence tooltips | Done today |
| 39 | Prompt DNA opens on Core Coaching Philosophy | Done today |
| 40–45, 47 | Prompt DNA small fixes (tooltip position, text fitting, buttons that don't respond) | Open |
| 46 | Voice option "Balanced / Natural / Conversational" | Done today |
| 48 | Publishing returns to the Playbook Library | Done today |
| 49 | Quality check score /100 and AI recommendations | Done today |
| 50 | Visibility: Private / Team Only / Organization / Marketplace | Done today |
| 51–53 | 500-character fields, "Reset to Default" confirmation per section, auto-save state | Open |
| 54 | Settings: "Need Help?" tab | Open |
| 55 | Staff email shown but not editable | Already done |
| 56 | Dashboard performance trend: switch between Users and Sales Reps | Done today |
| 57, 152 | Remove "Start Call" (top right) | Done today (whole Super Admin portal) |
| 59–60 | Plans & Pricing: enterprise totals; promo-code validation | Done 2026-11-06: contradictory promo settings are refused by the server; codes are checked at checkout |
| 61 | Performance Analytics metric tooltips | Mostly already done. "Revenue Churn" card still open. |
| 62–65 | Billing: permanent adjustment trail, approval rules, proration notice, name → Subscription & Billing tab | Open |
| 66–83 | Sales reps table, leaderboard (1st/2nd/3rd, re-ranking), rep profile tabs and coaching notes | Partly done: lead types and outcomes on the rep profile (73, 74, 76, 77). The rest is open. |
| 84–118 | Training Logs | Done today: departments, statuses, "Due Soon (Next 30 Days)", "Upcoming Due Dates", Requirement field and options, reassignment off by default, assignment count = trainings × employees, no Format filter, PDF / Document / Video labels, export (Report Type, Training / Status / Department / Date Range filters, no Score), "Issue certificate on completion", categories (move trainings before delete, no duplicates), status chart with exactly 4 statuses. Open: 94, 97–99, 105, 113–114. The Training Material Library page (86) already existed. |
| 119–152 | Incident Management | Done today: full-width table; tabs (All, Escalated Tickets, Investigating, Resolved); one category list; Open / Investigating / Resolved / Closed (no "Solved"); summary adds up to the total; "Active Incidents"; "Top Incident Categories"; "Incident Occurred At"; automatic "Reported At"; read-only Reported By; new incidents start Open; Start Investigation → Submit Investigation (all 3 fields required) → Resolved with automatic Completed At / Investigated By → Close Incident; Reopen. Open: 133–135 (calculations), 142–143 (owner lists by permission). |
| 121, 193 | Remove "AI Ethics & Governance" from the Compliance menu | Done today |
| 153–161 | Access Records | Done today: tabs (Pending Invitations, Onboarding In Progress, Active, Offboarding Pending, Expired Invites); card links open those tabs; "All Statuses"; "All MFA Statuses"; "Support Assistant". **Role list needs the client's answer (see below).** 153–154 spacing is open. |
| 162–191 | Audit Logs | Done today: category tabs and Category filter kept in sync; Billing → "Billing & Payments"; entity list and every action's category / entity mapping; duplicate filters above the table removed; Filters panel order (Date Range, Category, Action, Entity, User, IP); 7 KPI cards whose six categories add up to Total Events; "Include metadata & client context" plus the list of things exports never include. |
| 192–237 | Evidence Repository | Done today: table at full width with the side cards below; "Total Evidence"; status list and flow (Upload → Under Review, Save as Draft → Draft, Verify, Request Changes → Needs Changes, Archive); "Trust Service Criteria" (multi-select, 5 options); Associated Controls (multi-select from the SOC 2 controls, "CC6.1 +2 more" in the table); Evidence Owner (defaults to the uploader); Evidence Expiration (Does Not Expire / Expires On, date required); "Description / Supporting Notes"; reviewer Verification Note; the full details list; Verified By / At filled automatically; "Upload New Version" keeps the old file; actions per status; only drafts can be deleted, everything else is archived; search by name, control, owner and ID. Open: 201 (automatic expiry needs the backend), 233–234 (counts that exclude archived items). |
| 238–303 | Campaigns & Journeys (users instead of leads, dynamic segments and rules, journey triggers / re-entry / exits, template creation methods and email types) | Open. This is the largest remaining block. |

## Question for the client
- **Access Records roles (item 155).** His list is Super Admin, Admin, Manager, Sales Rep, Support Assistant and User. The app has Super Admin, Admin Manager, Support, Auditor and Sales Rep. What do "Admin", "Manager" and "User" map to, and should Auditor be listed?

## Also fixed today (found while testing)
- Settings → Integrations crashed on every portal.
- Admin Manager's Mail page showed "no permission" errors for support tickets.
- Customers list crash (fixed earlier the same day).
