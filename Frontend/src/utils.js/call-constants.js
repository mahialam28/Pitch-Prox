// ── Header ↔ Live Calling bridge ───────────────────────────────────────────
// The shared Header's "Start Call" button hands the filled call setup to the
// live-calling page through sessionStorage, and notifies an already-mounted
// StartCall via a window event. Keeping the keys here avoids importing the
// whole Header component into the live-calling route just for two constants.

// sessionStorage key holding the JSON call setup to prefill on the next visit
export const PENDING_CALL_KEY = "pitchprox_pending_call";

// window event dispatched by the Header after storing a pending call; StartCall
// listens for it in case it is already mounted on the live-calling page
export const PENDING_CALL_EVENT = "pitchprox:start-call";
