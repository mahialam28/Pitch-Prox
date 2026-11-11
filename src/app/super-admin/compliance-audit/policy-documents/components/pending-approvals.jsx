"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { formatDate } from "@/lib/client-api";

// Versions waiting for a Super Admin (from /api/v1/compliance/policies → pendingApprovals).
// Opening one goes to the policy, where it's approved or sent back.
export default function PendingApprovals({ items }) {
  const router = useRouter();
  const list = items ?? [];

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-light-gray shadow-xs flex flex-col justify-between w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-dark-black/85 font-secondary">Pending Approvals</h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{list.length}</span>
      </div>

      <div className="divide-y divide-light-gray/70">
        {list.length === 0 ? (
          <div className="py-6 text-center text-xs text-light-black">{items ? "No pending approvals at this time." : "Loading..."}</div>
        ) : (
          list.map((item) => (
            <button
              key={item.versionId}
              type="button"
              onClick={() => router.push(`/super-admin/compliance-audit/policy-documents/${item.policyId}`)}
              className="w-full text-left flex items-start gap-3 py-3 first:pt-0 last:pb-0 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg border border-blue-400/30 bg-blue-50/50 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-dark-black/85 group-hover:text-primary transition-colors truncate">
                    {item.name} <span className="font-medium text-light-black">{item.version}</span>
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] whitespace-nowrap">Under Review</span>
                </div>
                <p className="text-[11px] text-light-black mt-0.5">
                  {item.isNewPolicy ? "New policy" : "New version"} · submitted by {item.submittedBy}
                </p>
                <p className="text-[11px] text-light-black">{formatDate(item.submittedAt)}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
