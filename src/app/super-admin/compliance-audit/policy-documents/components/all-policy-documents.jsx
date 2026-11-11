"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, FileText } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import Pagination from "@/components/shared/pagination/pagination";
import UploadDocumentModal from "./upload-document-modal";
import { formatDate } from "@/lib/client-api";
import { POLICY_STATUS_LABELS, POLICY_TOPICS } from "@/lib/compliance/policy-catalog";

const ALL_CATEGORIES = "All Categories";
const ALL_STATUSES = "All Statuses";
const ALL_OWNERS = "All Owners";
const categoryOptions = [ALL_CATEGORIES, ...POLICY_TOPICS].map((value) => ({ value, label: value }));
const statusOptions = [ALL_STATUSES, ...Object.values(POLICY_STATUS_LABELS)].map((value) => ({ value, label: value }));

const STATUS_STYLES = {
  Approved: "bg-[#DCFCE7] text-[#16A34A]",
  "Under Review": "bg-[#FEF3C7] text-[#D97706]",
  Draft: "bg-[#F3F4F6] text-medium-black",
  Archived: "bg-[#F1F5F9] text-[#64748B]",
};

// File-type badge: PDF (red "D" in the design) or a Word / text document
function DocIcon({ file }) {
  if (file && !file.isPdf) {
    return (
      <div className="w-8 h-8 rounded-lg border border-blue-400/30 bg-blue-50/50 flex items-center justify-center shrink-0">
        <FileText className="w-4 h-4 text-blue-500" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-lg border border-red/40 bg-red/5 flex items-center justify-center shrink-0">
      <span className="text-red font-bold text-[11px] leading-none">D</span>
    </div>
  );
}

// data: the /api/v1/compliance/policies response; onChanged reloads it
export default function AllPolicyDocuments({ data, onChanged }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const [selectedStatus, setSelectedStatus] = useState(ALL_STATUSES);
  const [selectedOwner, setSelectedOwner] = useState(ALL_OWNERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const documents = data?.results ?? [];
  const ownerOptions = [{ value: ALL_OWNERS, label: ALL_OWNERS }, ...(data?.owners ?? []).map((owner) => ({ value: owner.name, label: owner.name }))];
  const term = searchTerm.trim().toLowerCase();
  const filtered = documents.filter((doc) =>
    (!term || `${doc.name} ${doc.description} ${doc.category} ${doc.owner?.name ?? ""}`.toLowerCase().includes(term)) &&
    (selectedCategory === ALL_CATEGORIES || doc.category === selectedCategory) &&
    // Archived policies only show when asked for
    (selectedStatus === ALL_STATUSES ? doc.status !== "Archived" : doc.status === selectedStatus) &&
    (selectedOwner === ALL_OWNERS || doc.owner?.name === selectedOwner)
  );
  const page = Math.min(currentPage, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const filter = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-light-gray shadow-xs overflow-hidden w-full flex flex-col justify-between">
        <div>
          <div className="p-5 sm:p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base sm:text-lg font-bold text-dark-black/85 font-secondary">All Policy Documents</h2>
            {data?.permissions.manage && (
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-[#0c9593] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Upload Document
              </button>
            )}
          </div>

          <div className="px-5 sm:px-6 pb-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => filter(setSearchTerm)(event.target.value)}
                placeholder="Search documents..."
                aria-label="Search documents"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-gray text-xs text-dark-black/80 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="w-full sm:w-40">
              <Dropdown label={ALL_CATEGORIES} items={categoryOptions} selected={selectedCategory} onSelect={filter(setSelectedCategory)} variant="sm" />
            </div>
            <div className="w-full sm:w-36">
              <Dropdown label={ALL_STATUSES} items={statusOptions} selected={selectedStatus} onSelect={filter(setSelectedStatus)} variant="sm" />
            </div>
            <div className="w-full sm:w-36">
              <Dropdown label={ALL_OWNERS} items={ownerOptions} selected={selectedOwner} onSelect={filter(setSelectedOwner)} variant="sm" />
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-y border-light-gray bg-[#FAFBFB] text-light-black font-semibold text-[11px] sm:text-xs">
                  <th className="py-3 px-5 sm:px-6 font-semibold">Document Name</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Version</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Effective Date</th>
                  <th className="py-3 px-4 font-semibold">Last Updated</th>
                  <th className="py-3 px-4 font-semibold">Next Review</th>
                  <th className="py-3 px-5 sm:px-6 font-semibold text-right">Acknowledgment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray/70 text-xs text-dark-black/85">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-light-black">
                      {data ? "No policy documents match these filters." : "Loading policies..."}
                    </td>
                  </tr>
                ) : (
                  rows.map((doc) => (
                    <tr
                      key={doc.id}
                      onClick={() => router.push(`/super-admin/compliance-audit/policy-documents/${doc.id}`)}
                      className="hover:bg-light-gray/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-5 sm:px-6">
                        <div className="flex items-center gap-3">
                          <DocIcon file={doc.file} />
                          <div className="min-w-0 max-w-[260px]">
                            <span className="font-bold text-dark-black/80 block truncate group-hover:text-primary transition-colors">{doc.name}</span>
                            <span className="text-[11px] text-light-black truncate block">
                              {doc.pendingVersion ? `${doc.pendingVersion.version} ${doc.pendingVersion.statusLabel.toLowerCase()}` : doc.description || "—"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-dark-black/80 whitespace-nowrap">{doc.category}</td>
                      <td className="py-3.5 px-4 text-light-black font-medium whitespace-nowrap">{doc.version}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[doc.status] ?? STATUS_STYLES.Draft}`}>{doc.status}</span>
                      </td>
                      <td className="py-3.5 px-4 text-dark-black/80 font-medium whitespace-nowrap">{doc.effectiveDate ? formatDate(`${doc.effectiveDate}T12:00:00`) : "Pending"}</td>
                      <td className="py-3.5 px-4 text-dark-black/80 font-medium whitespace-nowrap">{formatDate(doc.lastUpdated)}</td>
                      <td className={`py-3.5 px-4 font-medium whitespace-nowrap ${doc.reviewOverdue ? "text-red" : "text-dark-black/80"}`} title={doc.reviewOverdue ? "The review date has passed" : undefined}>
                        {doc.nextReviewDate ? formatDate(`${doc.nextReviewDate}T12:00:00`) : "—"}
                      </td>
                      <td className="py-3.5 px-5 sm:px-6 font-bold text-dark-black/80 text-right whitespace-nowrap">
                        {doc.acknowledgment ? (doc.acknowledgment.rate == null ? "—" : `${doc.acknowledgment.rate}%`) : <span className="font-medium text-light-black">{doc.requireAcknowledgment ? "After approval" : "Not required"}</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-light-gray">
          <Pagination
            currentPage={page}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            itemLabel="documents"
          />
        </div>
      </div>

      {isUploadModalOpen && (
        <UploadDocumentModal
          isOpen
          owners={data?.ownerOptions ?? []}
          onClose={() => setIsUploadModalOpen(false)}
          onSaved={(result) => {
            onChanged?.();
            router.push(`/super-admin/compliance-audit/policy-documents/${result.policy.id}`);
          }}
        />
      )}
    </>
  );
}
