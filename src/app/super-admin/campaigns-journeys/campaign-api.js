"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/client-api";

// Client calls for Campaigns & Journeys (lib/campaigns on the server)
const base = "/api/v1/campaigns";
export const campaignApi = {
  segments: () => apiRequest(`${base}/segments`),
  segment: (id) => apiRequest(`${base}/segments/${id}`),
  createSegment: (body) => apiRequest(`${base}/segments`, { method: "POST", body }),
  updateSegment: (id, body) => apiRequest(`${base}/segments/${id}`, { method: "PATCH", body }),
  deleteSegment: (id) => apiRequest(`${base}/segments/${id}`, { method: "DELETE" }),
  addSegmentUsers: (id, userIds) => apiRequest(`${base}/segments/${id}/users`, { method: "POST", body: { userIds } }),
  templates: () => apiRequest(`${base}/templates`),
  template: (id) => apiRequest(`${base}/templates/${id}`),
  createTemplate: (body) => apiRequest(`${base}/templates`, { method: "POST", body }),
  updateTemplate: (id, body) => apiRequest(`${base}/templates/${id}`, { method: "PATCH", body }),
  deleteTemplate: (id) => apiRequest(`${base}/templates/${id}`, { method: "DELETE" }),
  duplicateTemplate: (id) => apiRequest(`${base}/templates/${id}/duplicate`, { method: "POST" }),
  uploadAsset: (file) => {
    const form = new FormData();
    form.append("file", file);
    return apiRequest(`${base}/assets`, { method: "POST", body: form });
  },
  campaigns: () => apiRequest(`${base}/broadcasts`),
  createCampaign: (body) => apiRequest(`${base}/broadcasts`, { method: "POST", body }),
  updateCampaign: (id, body) => apiRequest(`${base}/broadcasts/${id}`, { method: "PATCH", body }),
  cancelCampaign: (id) => apiRequest(`${base}/broadcasts/${id}/cancel`, { method: "POST" }),
  journeys: () => apiRequest(`${base}/journeys`),
  journey: (id) => apiRequest(`${base}/journeys/${id}`),
  createJourney: (body) => apiRequest(`${base}/journeys`, { method: "POST", body }),
  updateJourney: (id, body) => apiRequest(`${base}/journeys/${id}`, { method: "PATCH", body }),
  journeyStatus: (id, action) => apiRequest(`${base}/journeys/${id}/status`, { method: "POST", body: { action } }),
  testJourney: (id, body) => apiRequest(`${base}/journeys/${id}/test`, { method: "POST", body }),
  enrollments: (id) => apiRequest(`${base}/journeys/${id}/enrollments`),
  overview: () => apiRequest(`${base}/overview`),
  deliveries: (params = {}) => apiRequest(`${base}/deliveries?${new URLSearchParams(params)}`),
  runJobs: () => apiRequest("/api/v1/jobs/run", { method: "POST" }),
};

// GET `path` on mount (and when it changes); reload() fetches again after a change. path null = don't load.
export function useApi(path) {
  const [state, setState] = useState({ path: null, data: null, error: null });
  const reload = useCallback(() => {
    if (!path) return Promise.resolve();
    return apiRequest(path)
      .then((data) => setState({ path, data, error: null }))
      .catch((error) => setState((current) => ({ path, data: current.path === path ? current.data : null, error: error.message })));
  }, [path]);
  useEffect(() => {
    reload();
  }, [reload]);
  const current = state.path === path;
  return { data: current ? state.data : null, error: current ? state.error : null, reload };
}

// Signed-in staff member (who may change things: Super Admin and Admin Manager)
export function useCanManage() {
  const { data } = useApi("/api/v1/me");
  return ["super_admin", "admin_manager"].includes(data?.user?.role);
}

export const formatWhen = (value) =>
  value ? new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—";
export const percent = (part, whole) => (whole ? `${Math.round((part / whole) * 1000) / 10}%` : "—");

// API template → the shape the template cards use
export const toTemplateCard = (template) => {
  const content = template.content ?? {};
  const firstLine = String(content.body ?? "").split(/\n+/).find(Boolean) ?? "";
  const sent = template.stats?.sent ?? 0;
  return {
    id: template.id,
    title: template.name,
    headline: content.heading || (template.creationMethod === "design" ? "Uploaded design" : template.creationMethod === "html" ? "Uploaded HTML" : template.name),
    previewText: template.preheader || firstLine || template.subject,
    buttonLabel: content.buttonLabel || content.cta?.label || "",
    category: template.category,
    emailType: template.emailType,
    status: template.status.toUpperCase(),
    theme: template.emailType === "Transactional" ? "slate" : template.emailType === "Marketing" ? "orange" : "teal",
    lastEdited: `${formatWhen(template.updatedAt ?? template.createdAt)} by ${template.createdByName ?? "—"}`,
    openRate: sent ? `${Math.round(((template.stats?.opened ?? 0) / sent) * 1000) / 10}%` : "—",
    triggerEventLabel: template.triggerEventLabel,
  };
};
