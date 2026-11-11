// ── Phone numbers of a contact (Phase 13) ──
// Shared by the server and the screens. Each number of a lead/prospect has its own status, so a bad
// number doesn't stop the others from being called.

export const MAX_CONTACT_PHONES = 6;

export const PHONE_LABELS = ["Mobile", "Home", "Work", "Other"];

// tone: badge colors on the screens
export const PHONE_STATUSES = [
  { value: "not_called", label: "Not called yet", tone: "gray", callable: true },
  { value: "good", label: "Good number", tone: "green", callable: true },
  { value: "no_answer", label: "No answer", tone: "amber", callable: true },
  { value: "bad", label: "Bad number", tone: "red", callable: false },
  { value: "wrong", label: "Wrong number", tone: "red", callable: false },
  { value: "disconnected", label: "Disconnected", tone: "red", callable: false },
  { value: "fax", label: "Fax / modem", tone: "red", callable: false },
  { value: "do_not_call", label: "Do not call", tone: "red", callable: false },
];

export const isCallable = (status) => PHONE_STATUSES.find((option) => option.value === status)?.callable ?? true;
export const phoneStatusLabel = (status) => PHONE_STATUSES.find((option) => option.value === status)?.label ?? "Not called yet";

// The next number to try after `currentId` (callable ones only, in their saved order, wrapping around)
export function nextCallablePhone(phones = [], currentId = null) {
  const callable = phones.filter((phone) => isCallable(phone.status));
  if (!callable.length) return null;
  const index = phones.findIndex((phone) => phone.id === currentId);
  const after = phones.slice(index + 1).find((phone) => isCallable(phone.status));
  return after ?? callable.find((phone) => phone.id !== currentId) ?? null;
}
