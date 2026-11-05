// ── Client preview ("demo mode") ──
// Turned on only where DEMO_MODE=true (e.g. the Vercel preview). Visitors pick a role on /demo
// and are signed in as that role's demo account (created by `npm run db:seed:demo`).
// With DEMO_MODE off, /demo and its API answer "not found".

export const isDemoMode = () => process.env.DEMO_MODE === "true";

// What the client can explore; emails match scripts/seed.mjs and scripts/seed-demo.mjs
export const DEMO_ROLES = [
  { key: "customer", label: "Customer (real-estate team)", email: "olivia.bennett@sunriserealty.demo", description: "Dashboard, Leads, CRM, Playbooks, AI Training, Calibration, Support, Mail, Billing and Settings." },
  { key: "sales-rep", label: "Sales Rep", email: "ryan.anderson@pitchprox.test", description: "Own pipeline, Customers, User Portal (new accounts), Support Tickets, Calendar, Mail and rep tools." },
  { key: "super-admin", label: "Super Admin", email: "sarah.johnson@pitchprox.test", description: "Company dashboard, Customers, Sales Reps, Plans, Billing, Campaigns, Compliance & Audit, Calendar, Mail." },
  { key: "admin-manager", label: "Admin Manager", email: "mike.davis@pitchprox.test", description: "The manager's view of the admin portal (sections chosen for this role)." },
  { key: "support", label: "Support", email: "emily.brown@pitchprox.test", description: "Support Dashboard and Support Tickets: reply, notes, assign, escalate." },
  { key: "auditor", label: "Auditor", email: "jessica.lee@pitchprox.test", description: "Read-only Compliance & Audit access." },
  { key: "new-employee", label: "New employee (onboarding)", email: "tom.wilson@pitchprox.test", description: "The step-by-step onboarding a new staff member completes before using the portal." },
];
