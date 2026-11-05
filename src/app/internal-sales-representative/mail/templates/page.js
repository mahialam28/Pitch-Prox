"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Mail, Search } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import Wrapper from "@/components/wrappers/wrapper";
import { allTemplates } from "./templates-data";
import { usePortal } from "@/components/shared/use-portal";

export default function TemplatesPage() {
  const portal = usePortal();
  const [query, setQuery] = useState("");

  const filteredTemplates = allTemplates.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.preview.toLowerCase().includes(query.toLowerCase()) ||
      t.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Wrapper variant="bottomSection" className="w-full flex flex-col gap-4 sm:gap-6">
      {/* ── Header ── */}
      <div className="w-full flex flex-col gap-3">
        <Link
          href={`${portal.base}/mail`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-medium-teal transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Mail & Support
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <Title variant="small" className="!text-dark-black/80">
              Email Templates
            </Title>
            <Text variant="small">
              Reusable templates to help you send consistent, professional emails.
            </Text>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search templates..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder:text-light-black transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* ── Templates Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-2xl border border-light-gray p-6 shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-light-gray text-light-black group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-dark-black truncate">
                    {template.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-primary bg-primary/10 whitespace-nowrap">
                    {template.category}
                  </span>
                </div>
                <p className="text-xs text-light-black mt-1.5 leading-relaxed">
                  {template.preview}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-light-gray">
              <Link
                href={`${portal.base}/mail/templates/${template.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary border border-primary hover:bg-primary/5 rounded-xl transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </Link>
              <Link
                href={`${portal.base}/mail?template=${template.id}`}
                className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-medium-teal rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
              >
                Use template
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="bg-white rounded-2xl border border-light-gray p-10 text-center">
          <Text variant="small" className="text-light-black">
            No templates found for &quot;{query}&quot;
          </Text>
        </div>
      )}
    </Wrapper>
  );
}
