// ── Browser "user agent" text → readable device and browser ──
// Good enough for a devices list; no external lookup service needed.
export function describeUserAgent(userAgent = "") {
  const ua = userAgent || "";
  const device =
    /iPhone/.test(ua) ? "iPhone" :
    /iPad/.test(ua) ? "iPad" :
    /Android/.test(ua) ? (/Mobile/.test(ua) ? "Android phone" : "Android tablet") :
    /Macintosh|Mac OS X/.test(ua) ? "Mac" :
    /Windows/.test(ua) ? "Windows PC" :
    /Linux/.test(ua) ? "Linux computer" :
    "Unknown device";
  const version = (pattern) => ua.match(pattern)?.[1]?.split(".")[0];
  const browser =
    /Edg\//.test(ua) ? `Edge ${version(/Edg\/([\d.]+)/)}` :
    /OPR\//.test(ua) ? `Opera ${version(/OPR\/([\d.]+)/)}` :
    /Firefox\//.test(ua) ? `Firefox ${version(/Firefox\/([\d.]+)/)}` :
    /Chrome\//.test(ua) ? `Chrome ${version(/Chrome\/([\d.]+)/)}` :
    /Safari\//.test(ua) ? `Safari ${version(/Version\/([\d.]+)/) ?? ""}`.trim() :
    ua ? "Other browser" : "Unknown browser";
  return { device, browser, isMobile: /iPhone|Android.*Mobile/.test(ua) };
}
