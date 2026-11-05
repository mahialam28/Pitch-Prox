// ── Canonical option lists shared across Analytics, Calls, Leads and CRM ──
// Keeping these in one place guarantees the same option has the same label
// everywhere in the app.

// Universal date-range list (used on Calls and Analytics)
export const dateRangeOptions = [
  { value: "Today", label: "Today" },
  { value: "Yesterday", label: "Yesterday" },
  { value: "This Week", label: "This Week" },
  { value: "Last 7 Days", label: "Last 7 Days" },
  { value: "This Month", label: "This Month" },
  { value: "Last 30 Days", label: "Last 30 Days" },
  { value: "Last 3 Months", label: "Last 3 Months" },
  { value: "Last 6 Months", label: "Last 6 Months" },
  { value: "Year to Date", label: "Year to Date" },
  { value: "Custom Date Range", label: "Custom Date Range" },
];

// Analytics display interval
export const displayIntervalOptions = [
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
];

// ─────────────────────────────────────────────────────────────────────────────
// USER ROLE (Real Estate)
// ─────────────────────────────────────────────────────────────────────────────

// User Role Lead types (16)
export const userLeadTypeOptions = [
  "Expired Listings",
  "Pre-Expired Listings",
  "FSBO",
  "Absentee Owners",
  "Circle Prospecting",
  "Just Listed",
  "Just Sold",
  "Probate",
  "Trust & Estate",
  "Pre-Foreclosure",
  "Foreclosure / REO",
  "Divorce",
  "Tax Delinquent",
  "Vacant Properties",
  "Investor / Cash Buyers",
  "Past Clients & Sphere",
].map((label) => ({ value: label, label }));

// Backward compatibility alias for user role components
export const leadTypeOptions = userLeadTypeOptions;

// User Role Outcomes with badge styles for BadgeSelect & Dropdown (10)
export const userOutcomeOptions = [
  {
    value: "Appointment Set",
    label: "Appointment Set",
    className: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100",
    dotClass: "bg-emerald-500",
  },
  {
    value: "Follow-Up Required",
    label: "Follow-Up Required",
    className: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
    dotClass: "bg-blue-500",
  },
  {
    value: "Information Requested",
    label: "Information Requested",
    className: "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100",
    dotClass: "bg-indigo-500",
  },
  {
    value: "Not Interested",
    label: "Not Interested",
    className: "bg-red/10 text-red border-red/20 hover:bg-red/15",
    dotClass: "bg-red",
  },
  {
    value: "Not a Fit",
    label: "Not a Fit",
    className: "bg-light-gray text-medium-black border-light-gray hover:bg-light-gray/80",
    dotClass: "bg-medium-black",
  },
  {
    value: "No Answer",
    label: "No Answer",
    className: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200",
    dotClass: "bg-gray-400",
  },
  {
    value: "Voicemail",
    label: "Voicemail",
    className: "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100",
    dotClass: "bg-yellow-500",
  },
  {
    value: "Wrong Number",
    label: "Wrong Number",
    className: "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100",
    dotClass: "bg-orange-500",
  },
  {
    value: "Do Not Contact",
    label: "Do Not Contact",
    className: "bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-100",
    dotClass: "bg-rose-500",
  },
  {
    value: "Other",
    label: "Other",
    className: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200",
    dotClass: "bg-gray-400",
  },
];

// Backward compatibility alias for user role components
export const outcomeOptions = userOutcomeOptions;

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL ROLES (Internal Sales Representative / Admin)
// ─────────────────────────────────────────────────────────────────────────────

// Internal Roles Lead types (16)
export const internalLeadTypeOptions = [
  "Solo agent",
  "Micro-Teams",
  "Assistant to team",
  "Junior agent",
  "Small Teams",
  "Mid-Size Teams",
  "Multi-agent brokerage with a General Manager",
  "Large Teams / Brokerages",
  "Top-10 local producer",
  "Mega-Teams",
  "Broker of Record, Managing Broker",
  "Office Manager",
  "e-Agent",
  "Franchise Owners/Broker Owners",
  "New Agents",
  "Luxury Agents",
].map((label) => ({ value: label, label }));

// Internal Roles Outcomes with badge styles for BadgeSelect & Dropdown (19)
export const internalOutcomeOptions = [
  {
    value: "No Answer",
    label: "No Answer",
    className: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200",
    dotClass: "bg-gray-400",
  },
  {
    value: "Voicemail",
    label: "Voicemail",
    className: "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100",
    dotClass: "bg-yellow-500",
  },
  {
    value: "Wrong Number",
    label: "Wrong Number",
    className: "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100",
    dotClass: "bg-orange-500",
  },
  {
    value: "Disconnected",
    label: "Disconnected",
    className: "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200",
    dotClass: "bg-zinc-400",
  },
  {
    value: "Gatekeeper",
    label: "Gatekeeper",
    className: "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200",
    dotClass: "bg-stone-400",
  },
  {
    value: "Connected",
    label: "Connected",
    className: "bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100",
    dotClass: "bg-sky-500",
  },
  {
    value: "Call Back",
    label: "Call Back",
    className: "bg-cyan-50 text-cyan-600 border-cyan-200 hover:bg-cyan-100",
    dotClass: "bg-cyan-500",
  },
  {
    value: "Follow-Up Set",
    label: "Follow-Up Set",
    className: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
    dotClass: "bg-blue-500",
  },
  {
    value: "Demo Requested",
    label: "Demo Requested",
    className: "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100",
    dotClass: "bg-indigo-500",
  },
  {
    value: "Demo Scheduled",
    label: "Demo Scheduled",
    className: "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100",
    dotClass: "bg-purple-500",
  },
  {
    value: "Trial Interested",
    label: "Trial Interested",
    className: "bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100",
    dotClass: "bg-violet-500",
  },
  {
    value: "Trial Started",
    label: "Trial Started",
    className: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200 hover:bg-fuchsia-100",
    dotClass: "bg-fuchsia-500",
  },
  {
    value: "Pricing Discussed",
    label: "Pricing Discussed",
    className: "bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100",
    dotClass: "bg-teal-500",
  },
  {
    value: "Proposal Sent",
    label: "Proposal Sent",
    className: "bg-lime-50 text-lime-600 border-lime-200 hover:bg-lime-100",
    dotClass: "bg-lime-500",
  },
  {
    value: "Decision Pending",
    label: "Decision Pending",
    className: "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100",
    dotClass: "bg-amber-500",
  },
  {
    value: "Subscription Secured",
    label: "Subscription Secured",
    className: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100",
    dotClass: "bg-emerald-500",
  },
  {
    value: "Not Interested",
    label: "Not Interested",
    className: "bg-red-50 text-red-500 border-red-200 hover:bg-red-100",
    dotClass: "bg-red-500",
  },
  {
    value: "Lost to Competitor",
    label: "Lost to Competitor",
    className: "bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-100",
    dotClass: "bg-rose-500",
  },
  {
    value: "Other",
    label: "Other",
    className: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200",
    dotClass: "bg-gray-400",
  },
];

// Playbooks available to a user (PitchProX Standard + purchased/custom).
// Exactly one playbook is active per call.
export const playbookOptions = [
  { value: "PitchProX Standard", label: "PitchProX Standard" },
  { value: "SPIN Selling", label: "SPIN Selling" },
  { value: "Challenger Sale", label: "Challenger Sale" },
  { value: "Sandler Selling System", label: "Sandler Selling System" },
  { value: "Herjavec Sales Method", label: "Herjavec Sales Method" },
  { value: "Daniel G. Method", label: "Daniel G. Method" },
  { value: "MEDDIC", label: "MEDDIC" },
];

// Pipeline stages shared by Leads and CRM (also validated by the API)
export const leadStageOptions = [
  "New",
  "Attempted",
  "Contacted",
  "In Conversation",
  "Follow-Up",
  "Qualified",
  "Appointment Set",
  "Archived",
].map((label) => ({ value: label, label }));

// Lead temperature shared by Leads and CRM (also validated by the API)
export const leadStatusOptions = ["Hot", "Warm", "Cold", "Unknown"].map((label) => ({ value: label, label }));
