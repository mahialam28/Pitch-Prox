import Swal from "sweetalert2";

const options = { confirmButtonColor: "#0EADAB", buttonsStyling: true };

export function showSuccess(title, text) {
  return Swal.fire({ ...options, icon: "success", title, text });
}

export function showError(title, text) {
  return Swal.fire({ ...options, icon: "error", title, text });
}

// Yes / Cancel question → true when confirmed
export async function confirmAction({ title, text, confirmText = "Confirm" }) {
  const result = await Swal.fire({ ...options, icon: "warning", title, text, showCancelButton: true, confirmButtonText: confirmText, cancelButtonText: "Cancel", reverseButtons: true, focusCancel: true });
  return result.isConfirmed;
}

// Playbook Builder "Reset to Default": only that section goes back to its defaults
export const confirmReset = (section) =>
  confirmAction({ title: `Reset ${section}?`, text: `Only the ${section} settings go back to their defaults. Your other sections stay as they are.`, confirmText: "Reset section" });
