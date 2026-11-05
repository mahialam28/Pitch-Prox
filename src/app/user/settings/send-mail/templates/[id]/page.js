"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Text from "@/components/texts/text";
import { allTemplates } from "../templates-data";
import TemplateEditor from "../components/template-editor";

export default function TemplatePreviewPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const template = allTemplates.find((t) => t.id === id);

  if (!template) {
    return (
      <div className="w-full flex flex-col gap-4 sm:gap-6">
        <Link
          href="/user/settings/send-mail/templates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-medium-teal transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to templates
        </Link>
        <div className="bg-white rounded-2xl border border-light-gray p-10 text-center">
          <Text variant="small" className="text-light-black">
            Template not found.
          </Text>
          <Link
            href="/user/settings/send-mail/templates"
            className="inline-block mt-4 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-medium-teal rounded-xl transition-all duration-200 shadow-sm"
          >
            View all templates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <TemplateEditor
        template={template}
        backUrl="/user/settings/send-mail/templates"
      />
    </div>
  );
}
