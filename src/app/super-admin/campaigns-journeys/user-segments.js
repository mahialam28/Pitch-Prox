// ── Campaigns & Journeys target PitchProX users (customers), not their real-estate leads ──
// The rules, field lists and display helpers are shared with the server (lib/campaigns/rules);
// users and segments come from GET /api/v1/campaigns/segments.
export * from "@/lib/campaigns/rules";

// Names of the segments a user is in (segments carry memberIds from the server)
export const segmentNamesOf = (user, segments = []) => segments.filter((segment) => segment.memberIds?.includes(user.id)).map((segment) => segment.name);

// "Auto-updated" for Dynamic segments; the last change for Static ones
export const segmentUpdatedLabel = (segment) =>
  segment.type === "Dynamic" ? "Auto-updated" : new Date(segment.updatedAt ?? segment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
