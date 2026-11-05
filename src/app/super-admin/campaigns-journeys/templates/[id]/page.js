"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Text from "@/components/texts/text";
import { CAMPAIGN_TEMPLATES } from "../../templates-data";
import NewTemplateForm from "../components/new-template-form";

export default function CampaignTemplateDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const isNewMode =
    id === "new-template" || id === "new" || id === "create";

  const template = isNewMode
    ? null
    : CAMPAIGN_TEMPLATES.find((t) => t.id === id);

  if (!template && !isNewMode) {
    return (
      <div className="w-full flex flex-col gap-6 pb-12">
        <Link
          href="/super-admin/campaigns-journeys?tab=templates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-medium-teal transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Email Templates</span>
        </Link>
        <div className="bg-white rounded-2xl border border-light-gray p-10 text-center flex flex-col items-center gap-3">
          <Text variant="small" className="text-light-black">
            Template not found.
          </Text>
          <Link
            href="/super-admin/campaigns-journeys?tab=templates"
            className="inline-block px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-medium-teal rounded-xl transition-all duration-200 shadow-sm"
          >
            View all templates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-12">
      <NewTemplateForm
        initialTemplate={template}
        backUrl="/super-admin/campaigns-journeys?tab=templates"
      />
    </div>
  );
}
