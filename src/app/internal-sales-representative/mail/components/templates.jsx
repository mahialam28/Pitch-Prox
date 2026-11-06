"use client";

import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import Text from "@/components/texts/text";
import { useMailTemplates } from "../templates/use-mail-templates";
import { usePortal } from "@/components/shared/use-portal";

export default function QuickTemplates({ onSelectTemplate }) {
  const portal = usePortal();
  // The employee's own and team templates first, then the built-in library
  const { templates } = useMailTemplates();
  const templatesData = templates.slice(0, 4);

  return (
    <div className="grow bg-white rounded-2xl border border-light-gray p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Text variant="regular" className="font-bold text-dark-black">
          Quick templates
        </Text>
        <Link
          href={`${portal.base}/mail/templates`}
          className="text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          View all
        </Link>
      </div>

      <div className="space-y-3">
        {templatesData.map((template) => (
          <div
            key={template.id}
            className="flex items-center justify-between gap-3 p-3 rounded-xl border border-light-gray hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-light-gray text-light-black group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-dark-black truncate">
                  {template.title}
                </p>
                <p className="text-[11px] text-light-black truncate mt-0.5">
                  {template.preview}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectTemplate?.(template)}
              className="px-3 py-1 text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              Use
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
