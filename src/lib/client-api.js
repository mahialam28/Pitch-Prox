// Browser helper for calling /api/v1. Sends JSON (or FormData for uploads),
// returns the parsed body, and throws an Error carrying the server's message.
// A 401 means the session has ended, so the user is sent back to sign-in.
export async function apiRequest(url, { body, ...options } = {}) {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const response = await fetch(url, {
    ...options,
    headers: body === undefined || isForm ? options.headers : { "Content-Type": "application/json", ...options.headers },
    body: body === undefined || isForm ? body : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) window.location.assign("/sign-in");
  if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

// Formatted like "Jul 18, 2026" for tables
export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

// Formatted like "Jul 18, 2026, 2:45 PM"
export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—";
