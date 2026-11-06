"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Text from "@/components/texts/text";
import Wrapper from "@/components/wrappers/wrapper";
import { apiRequest } from "@/lib/client-api";
import TemplateEditor from "../components/template-editor";
import { usePortal } from "@/components/shared/use-portal";

export default function TemplatePreviewPage() {
  const params = useParams();
  const portal = usePortal();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [state, setState] = useState({ id: null, template: null, error: null });

  useEffect(() => {
    let cancelled = false;
    apiRequest(`/api/v1/mail/templates/${encodeURIComponent(id)}`)
      .then((result) => !cancelled && setState({ id, template: result.template, error: null }))
      .catch((failure) => !cancelled && setState({ id, template: null, error: failure.message }));
    return () => {
      cancelled = true;
    };
  }, [id]);
  const template = state.id === id ? state.template : null;

  if (state.id !== id) {
    return <div className="w-full py-20 text-center text-sm text-light-black">Loading template…</div>;
  }

  if (!template) {
    return (
      <Wrapper variant="bottomSection" className="w-full flex flex-col gap-4 sm:gap-6">
        <Link
          href={`${portal.base}/mail/templates`}
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
            href={`${portal.base}/mail/templates`}
            className="inline-block mt-4 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-medium-teal rounded-xl transition-all duration-200 shadow-sm"
          >
            View all templates
          </Link>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper variant="bottomSection" className="w-full">
      <TemplateEditor
        template={template}
        backUrl={`${portal.base}/mail/templates`}
      />
    </Wrapper>
  );
}
