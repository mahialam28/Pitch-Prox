import { settingsRoute } from "@/lib/settings";
import { PREFERENCE_DEFAULTS } from "@/lib/playbooks";

export const runtime = "nodejs";
// defaultPlaybook is checked when read: one the user can't use falls back to Standard
export const { GET, PUT } = settingsRoute("preferences", PREFERENCE_DEFAULTS, {
  fontSize: (value) => Number.isInteger(value) && value >= 50 && value <= 200,
  defaultPlaybook: (value) => typeof value === "string" && value.length > 0 && value.length <= 120,
});
