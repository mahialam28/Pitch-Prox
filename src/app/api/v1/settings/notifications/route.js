import { settingsRoute } from "@/lib/settings";

export const runtime = "nodejs";
const channel = (value) => typeof value === "string" && value.length > 0 && value.length <= 64;
export const { GET, PUT } = settingsRoute("notifications", { inAppNotifications: "in-app-email", aiInsightAlerts: "in-app-only" }, {
  inAppNotifications: channel,
  aiInsightAlerts: channel,
});
