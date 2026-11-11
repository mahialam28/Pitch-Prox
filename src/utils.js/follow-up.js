// ── Playbook Email Templates & Follow-Up (client's Google Doc, Nov 9) ──
// Shared by the Playbook Builder (Super Admin), the server and the after-call "Send an email" flow.
// Email Template = HOW the follow-up email is written. Follow Up = HOW the playbook wants follow-up handled.
// Both are used after the call only: never on the teleprompter, never sent in full to the live AI.

export const TEMPLATE_PURPOSES = [
  "Appointment Confirmation",
  "Requested Information",
  "Agreed Follow-Up",
  "Post-Meeting Follow-Up",
  "Unresolved Objection Follow-Up",
];

// Follow-up kind → the template purpose it normally uses
export const FOLLOW_UP_KINDS = [
  { value: "Call back later", template: "Agreed Follow-Up" },
  { value: "Send information", template: "Requested Information" },
  { value: "Appointment confirmed", template: "Appointment Confirmation" },
  { value: "After a meeting", template: "Post-Meeting Follow-Up" },
  { value: "Revisit a concern", template: "Unresolved Objection Follow-Up" },
];

// Placeholders a template may use. Each one is filled only from a real fact (the contact record,
// the signed-in user, or what the user enters after the call). A line whose placeholder has no
// value is left out of the draft: nothing is invented.
export const TEMPLATE_PLACEHOLDERS = [
  { key: "Prospect First Name", source: "contact" },
  { key: "Prospect Name", source: "contact" },
  { key: "Property Address", source: "contact" },
  { key: "Your Name", source: "you" },
  { key: "Your First Name", source: "you" },
  { key: "Your Email", source: "you" },
  { key: "Your Company", source: "you" },
  { key: "Appointment Date", source: "call" },
  { key: "Appointment Time", source: "call" },
  { key: "Follow-Up Date", source: "call" },
  { key: "Follow-Up Time", source: "call" },
  { key: "Agreed Channel", source: "call" },
  { key: "Requested Information", source: "call" },
  { key: "Concern", source: "call" },
  { key: "Meeting Topic", source: "call" },
];

// Facts the user can confirm after the call (keys of the draft request's `facts`)
export const CALL_FACTS = [
  { key: "appointmentAt", label: "Appointment (date and time)", type: "datetime-local", fills: ["Appointment Date", "Appointment Time"] },
  { key: "followUpAt", label: "Agreed follow-up (date and time)", type: "datetime-local", fills: ["Follow-Up Date", "Follow-Up Time"] },
  { key: "channel", label: "Agreed channel", type: "select", options: ["Phone call", "Email", "Text message", "In person", "Video call"], fills: ["Agreed Channel"] },
  { key: "requestedInformation", label: "Information they asked for", type: "text", fills: ["Requested Information"] },
  { key: "concern", label: "Concern still open", type: "text", fills: ["Concern"] },
  { key: "meetingTopic", label: "Meeting topic", type: "text", fills: ["Meeting Topic"] },
];

// Where the after-call draft is handed to the Mail tab (sessionStorage, read once)
export const MAIL_DRAFT_KEY = "pitchprox_mail_draft";
