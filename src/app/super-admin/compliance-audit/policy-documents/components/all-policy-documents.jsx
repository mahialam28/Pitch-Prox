"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import UploadDocumentModal from "./upload-document-modal";
import PolicyDetailsModal from "./policy-details-modal";
import { initialPoliciesData } from "../policies-data";

const categoryFilterOptions = [
  { value: "All Categories", label: "All Categories" },
  { value: "Security", label: "Security" },
  { value: "Access & Identity", label: "Access & Identity" },
  { value: "HR & People", label: "HR & People" },
  { value: "Compliance", label: "Compliance" },
  { value: "IT & Operations", label: "IT & Operations" },
];

const statusFilterOptions = [
  { value: "All Statuses", label: "All Statuses" },
  { value: "Approved", label: "Approved" },
  { value: "Under Review", label: "Under Review" },
  { value: "Draft", label: "Draft" },
];

const ownerFilterOptions = [
  { value: "All Owners", label: "All Owners" },
  { value: "Mike Davis", label: "Mike Davis" },
  { value: "Emily Brown", label: "Emily Brown" },
  { value: "Daniel Miller", label: "Daniel Miller" },
  { value: "Sarah Connor", label: "Sarah Connor" },
];

const pageSizeOptions = [
  { value: "10 / page", label: "10 / page" },
  { value: "20 / page", label: "20 / page" },
  { value: "50 / page", label: "50 / page" },
];

export default function AllPolicyDocuments({ onOpenUploadModal }) {
  const [documents, setDocuments] = useState(initialPoliciesData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedOwner, setSelectedOwner] = useState("All Owners");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedPolicyForModal, setSelectedPolicyForModal] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      !searchTerm ||
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All Categories" || doc.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "All Statuses" || doc.status === selectedStatus;

    const matchesOwner =
      selectedOwner === "All Owners" || doc.owner === selectedOwner;

    return matchesSearch && matchesCategory && matchesStatus && matchesOwner;
  });

  const totalItems = 28; // To match the 28 displayed in the screenshot
  const totalPages = Math.ceil(filteredDocuments.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedDocs = filteredDocuments.slice(startIndex, startIndex + pageSize);

  const router = useRouter();

  const handleDocumentClick = (doc) => {
    router.push(`/super-admin/compliance-audit/policy-documents/${doc.id}`);
  };

  const handleNewUpload = (newDoc) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleApprovePolicy = (id) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, status: "Approved" } : doc
      )
    );
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-light-gray shadow-xs overflow-hidden w-full flex flex-col justify-between">
        <div>
          {/* ── Top Header Row ── */}
          <div className="p-5 sm:p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base sm:text-lg font-bold text-dark-black/85 font-secondary">
              All Policy Documents
            </h2>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-primary hover:bg-[#0c9593] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Upload Document
            </button>
          </div>

          {/* ── Search and Filter Controls Row ── */}
          <div className="px-5 sm:px-6 pb-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search documents input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search documents..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-light-gray text-xs text-dark-black/80 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Categories Dropdown */}
            <div className="w-full sm:w-40">
              <Dropdown
                label="All Categories"
                items={categoryFilterOptions}
                selected={selectedCategory}
                onSelect={(val) => {
                  setSelectedCategory(val);
                  setCurrentPage(1);
                }}
                variant="sm"
                className="w-full"
              />
            </div>

            {/* Statuses Dropdown */}
            <div className="w-full sm:w-36">
              <Dropdown
                label="All Statuses"
                items={statusFilterOptions}
                selected={selectedStatus}
                onSelect={(val) => {
                  setSelectedStatus(val);
                  setCurrentPage(1);
                }}
                variant="sm"
                className="w-full"
              />
            </div>

            {/* Owners Dropdown */}
            <div className="w-full sm:w-36">
              <Dropdown
                label="All Owners"
                items={ownerFilterOptions}
                selected={selectedOwner}
                onSelect={(val) => {
                  setSelectedOwner(val);
                  setCurrentPage(1);
                }}
                variant="sm"
                className="w-full"
              />
            </div>
          </div>

          {/* ── Policy Documents Table ── */}
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
                  <th className="py-3 px-4 font-semibold">Next Updated</th>
                  <th className="py-3 px-5 sm:px-6 font-semibold text-right">
                    Acknowledgment
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray/70 text-xs text-dark-black/85">
                {paginatedDocs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-light-black">
                      No policy documents found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedDocs.map((doc) => (
                    <tr
                      key={doc.id}
                      onClick={() => handleDocumentClick(doc)}
                      className="hover:bg-light-gray/40 transition-colors cursor-pointer group"
                    >
                      {/* Document Name */}
                      <td className="py-3.5 px-5 sm:px-6">
                        <div className="flex items-center gap-3">
                          {/* Red Document outline icon matching screenshot */}
                          <div className="w-8 h-8 rounded-lg border border-red/40 bg-red/5 flex items-center justify-center shrink-0">
                            <span className="text-red font-bold text-[11px] leading-none">
                              D
                            </span>
                          </div>

                          <div className="min-w-0">
                            <span className="font-bold text-dark-black/80 block truncate group-hover:text-primary transition-colors">
                              {doc.name}
                            </span>
                            <span className="text-[11px] text-light-black truncate block">
                              {doc.description}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-medium text-dark-black/80 whitespace-nowrap">
                        {doc.category}
                      </td>

                      {/* Version */}
                      <td className="py-3.5 px-4 text-light-black font-medium whitespace-nowrap">
                        {doc.version}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {doc.status === "Approved" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#16A34A]">
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#D97706]">
                            {doc.status}
                          </span>
                        )}
                      </td>

                      {/* Effective Date */}
                      <td className="py-3.5 px-4 text-dark-black/80 font-medium whitespace-nowrap">
                        {doc.effectiveDate}
                      </td>

                      {/* Last Updated */}
                      <td className="py-3.5 px-4 text-dark-black/80 font-medium whitespace-nowrap">
                        {doc.lastUpdated}
                      </td>

                      {/* Next Updated */}
                      <td className="py-3.5 px-4 text-dark-black/80 font-medium whitespace-nowrap">
                        {doc.nextUpdated}
                      </td>

                      {/* Acknowledgment */}
                      <td className="py-3.5 px-5 sm:px-6 font-bold text-dark-black/80 text-right whitespace-nowrap">
                        {doc.acknowledgment}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Table Footer / Pagination Matching Screenshot ── */}
        <div className="p-4 sm:p-5 border-t border-light-gray flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* Left Text */}
          <span className="text-light-black font-medium">
            Showing 1 to {Math.min(pageSize, filteredDocsTotal(filteredDocuments.length))} of 28 documents
          </span>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-light-black hover:text-dark-black hover:border-dark-gray/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setCurrentPage(1)}
                className={`w-7 h-7 rounded-lg font-semibold flex items-center justify-center text-xs transition-colors cursor-pointer ${
                  currentPage === 1
                    ? "bg-primary text-white"
                    : "border border-light-gray text-dark-black/80 hover:bg-light-gray"
                }`}
              >
                1
              </button>

              <button
                onClick={() => setCurrentPage(2)}
                className={`w-7 h-7 rounded-lg font-semibold flex items-center justify-center text-xs transition-colors cursor-pointer ${
                  currentPage === 2
                    ? "bg-primary text-white"
                    : "border border-light-gray text-dark-black/80 hover:bg-light-gray"
                }`}
              >
                2
              </button>

              <button
                onClick={() => setCurrentPage(3)}
                className={`w-7 h-7 rounded-lg font-semibold flex items-center justify-center text-xs transition-colors cursor-pointer ${
                  currentPage === 3
                    ? "bg-primary text-white"
                    : "border border-light-gray text-dark-black/80 hover:bg-light-gray"
                }`}
              >
                3
              </button>

              <button
                onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
                disabled={currentPage === 3}
                className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-light-black hover:text-dark-black hover:border-dark-gray/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Page Size Dropdown */}
            <div className="w-28">
              <Dropdown
                label="10 / page"
                items={pageSizeOptions}
                selected={`${pageSize} / page`}
                onSelect={(val) => {
                  const num = parseInt(val);
                  setPageSize(num);
                  setCurrentPage(1);
                }}
                variant="sm"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleNewUpload}
      />

      {/* Policy Details Modal */}
      <PolicyDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        policy={selectedPolicyForModal}
        onApprovePolicy={handleApprovePolicy}
      />
    </>
  );
}

function filteredDocsTotal(len) {
  return len > 0 ? len : 0;
}
