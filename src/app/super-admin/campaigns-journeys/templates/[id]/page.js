"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NewTemplateForm from "../components/new-template-form";
import { useApi, useCanManage } from "../../campaign-api";

// Edit one template (live). /templates/new-template, /new and /create open an empty form.
export default function CampaignTemplateDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const isNewMode = ["new-template", "new", "create"].includes(id);
  const { data, error } = useApi(isNewMode ? null : `/api/v1/campaigns/templates/${id}`);
  const canManage = useCanManage();

  if (isNewMode) return <NewTemplateForm canManage={canManage} />;
  if (!data) {
    return (
      <div className="w-full flex flex-col gap-6 pb-12">
        <Link href="/super-admin/campaigns-journeys?tab=templates" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-medium-teal w-fit">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Email Templates</span>
        </Link>
        <div className="bg-white rounded-2xl border border-light-gray p-10 text-center text-sm text-light-black">{error ?? "Loading template…"}</div>
      </div>
    );
  }
  return (
    <div className="w-full pb-12">
      <NewTemplateForm key={data.template.id} initialTemplate={data.template} canManage={canManage} />
    </div>
  );
}
