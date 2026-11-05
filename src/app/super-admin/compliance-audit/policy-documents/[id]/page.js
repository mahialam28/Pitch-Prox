"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import PolicyDetailHeader from "./components/policy-detail-header";
import DocumentPreview from "./components/document-preview";
import DocumentInformation from "./components/document-information";
import AcknowledgmentCard from "./components/acknowledgment-card";
import PolicyTabsSection from "./components/policy-tabs-section";
import EditDocumentModal from "./components/edit-document-modal";
import AlertModal from "@/components/modals/alert-modal";
import { getPolicyById } from "../policies-data";
import toast from "react-hot-toast";

export default function PolicyDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const initialPolicy = getPolicyById(resolvedParams.id);

  const [policy, setPolicy] = useState(initialPolicy);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleUpdateSuccess = (updatedPolicy) => {
    setPolicy(updatedPolicy);
  };

  const handleDeleteConfirm = () => {
    toast.success(`Policy "${policy.name}" deleted successfully.`);
    setIsDeleteModalOpen(false);
    router.push("/super-admin/compliance-audit/policy-documents");
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* ── 1. Page Breadcrumb, Title & Action Buttons ── */}
      <PolicyDetailHeader
        policy={policy}
        onEditClick={() => setIsEditModalOpen(true)}
        onDeleteClick={() => setIsDeleteModalOpen(true)}
      />

      {/* ── 2. Main 2-Column Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column: Document Preview (approx 58%) */}
        <div className="lg:col-span-7 xl:col-span-7 w-full">
          <DocumentPreview policy={policy} />
        </div>

        {/* Right Column: Information, Acknowledgment, Tabs (approx 42%) */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-6 w-full">
          {/* Top 2 Cards: Document Information & Acknowledgment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <DocumentInformation policy={policy} />
            <AcknowledgmentCard policy={policy} />
          </div>

          {/* Bottom Tabs: Overview / Version History */}
          <PolicyTabsSection
            policy={policy}
            onUploadNewVersion={() => setIsEditModalOpen(true)}
          />
        </div>
      </div>

      {/* ── 3. Edit Document Modal ── */}
      <EditDocumentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        policy={policy}
        onUpdateSuccess={handleUpdateSuccess}
      />

      {/* ── 4. Delete Confirmation Modal ── */}
      <AlertModal
        isOpen={isDeleteModalOpen}
        type="danger"
        title="Delete Policy Document"
        message={`Are you sure you want to delete "${policy.name}"? This action will remove all version history and active acknowledgment logs.`}
        confirmLabel="Delete Policy"
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
