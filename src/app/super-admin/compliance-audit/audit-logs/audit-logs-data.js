import { AUDIT_CATEGORIES } from "@/lib/compliance/audit-catalog";

// Tabs = the six audit categories (lib/compliance/audit-catalog); the Category filter is the same list
export const auditTabs = [{ id: "all", label: "All Logs" }, ...AUDIT_CATEGORIES];

export const categoryFilterOptions = ["All Categories", ...AUDIT_CATEGORIES.map((tab) => tab.label)];
export const categoryLabelOf = (tabId) => auditTabs.find((tab) => tab.id === tabId)?.label.replace("All Logs", "All Categories") ?? "All Categories";
export const tabIdOf = (label) => auditTabs.find((tab) => tab.label === label)?.id ?? "all";
