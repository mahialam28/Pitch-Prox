import Swal from "sweetalert2";

const options = { confirmButtonColor: "#0EADAB", buttonsStyling: true };

export function showSuccess(title, text) {
  return Swal.fire({ ...options, icon: "success", title, text });
}

export function showError(title, text) {
  return Swal.fire({ ...options, icon: "error", title, text });
}
