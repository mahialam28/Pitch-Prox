// ── US phone number auto-formatting ──
// Formats raw input like "2132222222" as "(213) 222-2222" while the user types.

export const formatPhoneNumber = (value = "") => {
  // Keep only digits and drop a leading "1" (US country code)
  const digits = value.replace(/\D/g, "").replace(/^1/, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};
