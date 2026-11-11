import { PENDING_CALL_KEY } from "@/utils.js/call-constants";
import { isCallable } from "@/utils.js/phone-status";

// The number a call should use: the one asked for, else the contact's first callable number
export const callableNumberOf = (contact, phoneId = null) =>
  contact?.phones?.find((phone) => phone.id === phoneId) ?? contact?.phones?.find((phone) => isCallable(phone.status)) ?? null;

// Hand a lead/prospect to Live Calling (sessionStorage bridge). The call remembers which contact and
// which of its numbers it uses, so after the call that number alone can be marked and the next one dialled.
export function queueCall(contact, kind, phone = callableNumberOf(contact)) {
  try {
    sessionStorage.setItem(
      PENDING_CALL_KEY,
      JSON.stringify({
        leadName: contact?.name || "",
        phoneNumber: phone?.number || contact?.phoneNumber || "",
        leadType: contact?.leadType || "",
        address: contact?.propertyAddress || "",
        playbook: "PitchProx Standard",
        contactKind: kind,
        contactId: contact?.id ?? null,
        phoneId: phone?.id ?? null,
      })
    );
  } catch {
    /* sessionStorage unavailable: the call starts without the prefill */
  }
}

// API path of a contact (lead or prospect)
export const contactPath = (kind, id) => (kind === "lead" ? `/api/v1/leads/${id}` : `/api/v1/crm/prospects/${id}`);
