"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import PolicyDetailsModal from "./policy-details-modal";

const initialPendingApprovals = [
  {
    id: "pa-1",
    name: "Acceptable Use Policy",
    description: "Guidelines and acceptable behavior for company systems",
    submittedBy: "Mike Davis",
    date: "May 14, 2024",
    category: "Security",
    version: "v1.0",
    status: "Under Review",
    effectiveDate: "Pending Review",
    lastUpdated: "May 14, 2024",
    nextUpdated: "May 14, 2025",
    acknowledgment: "0%",
    iconType: "red-d",
  },
  {
    id: "pa-2",
    name: "Vendor Management Policy",
    description: "Due diligence and vendor security risk assessments",
    submittedBy: "Emily Brown",
    date: "May 12, 2024",
    category: "Compliance",
    version: "v1.0",
    status: "Under Review",
    effectiveDate: "Pending Review",
    lastUpdated: "May 12, 2024",
    nextUpdated: "May 12, 2025",
    acknowledgment: "0%",
    iconType: "blue-doc",
  },
  {
    id: "pa-3",
    name: "Data Classification Policy",
    description: "Confidentiality tiers, PII handling, and retention controls",
    submittedBy: "Daniel Miller",
    date: "May 11, 2024",
    category: "Security",
    version: "v1.0",
    status: "Under Review",
    effectiveDate: "Pending Review",
    lastUpdated: "May 11, 2024",
    nextUpdated: "May 11, 2025",
    acknowledgment: "0%",
    iconType: "blue-doc",
  },
];

export default function PendingApprovals() {
  const [pendingList, setPendingList] = useState(initialPendingApprovals);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();

  const handleOpenDetail = (policy) => {
    router.push(`/super-admin/compliance-audit/policy-documents/${policy.id}`);
  };

  const handleApprove = (id) => {
    setPendingList((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <>
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-light-gray shadow-xs flex flex-col justify-between w-full">
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-dark-black/85 font-secondary">
            Pending Approvals
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
            {pendingList.length}
          </span>
        </div>

        {/* List */}
        <div className="divide-y divide-light-gray/70">
          {pendingList.length === 0 ? (
            <div className="py-6 text-center text-xs text-light-black">
              No pending approvals at this time.
            </div>
          ) : (
            pendingList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenDetail(item)}
                className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3 group cursor-pointer hover:bg-light-gray/20 -mx-2 px-2 rounded-xl transition-colors"
              >
                {/* Icon matching screenshot */}
                {item.iconType === "red-d" ? (
                  <div className="w-8 h-8 rounded-lg border border-red/30 bg-red/5 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-red font-bold text-[11px] leading-none">
                      D
                    </span>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg border border-blue-400/30 bg-blue-50/50 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-blue-500" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-dark-black/85 group-hover:text-primary transition-colors truncate">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] whitespace-nowrap">
                      Under Review
                    </span>
                  </div>

                  <p className="text-[11px] text-light-black mt-0.5">
                    Submitted by {item.submittedBy}
                  </p>
                  <p className="text-[11px] text-light-black">
                    {item.date}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Details & Approval Modal */}
      <PolicyDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        policy={selectedPolicy}
        onApprovePolicy={handleApprove}
      />
    </>
  );
}
