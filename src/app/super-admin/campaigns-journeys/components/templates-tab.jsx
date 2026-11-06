"use client";

import React from "react";
import TemplatesStats from "./templates-stats";
import TemplatesSection from "./templates-section";
import { useApi, useCanManage } from "../campaign-api";

// Templates tab (live): one load feeds the stats and the card grid
export default function TemplatesTab() {
  const { data, error } = useApi("/api/v1/campaigns/templates");
  const canManage = useCanManage();
  const templates = data?.results ?? [];
  return (
    <>
      {error && !data && <p className="text-sm text-red-600">{error}</p>}
      <TemplatesStats templates={templates} />
      <TemplatesSection templates={templates} loading={!data} canManage={canManage} />
    </>
  );
}
