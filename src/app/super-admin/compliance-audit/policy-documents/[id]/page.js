"use client";

import React, { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PolicyDetailHeader from "./components/policy-detail-header";
import ReviewPanel from "./components/review-panel";
import DocumentPreview from "./components/document-preview";
import DocumentInformation from "./components/document-information";
import AcknowledgmentCard from "./components/acknowledgment-card";
import PolicyTabsSection from "./components/policy-tabs-section";
import EditDocumentModal from "./components/edit-document-modal";
import AlertModal from "@/components/modals/alert-modal";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";
import toast from "react-hot-toast";

export default function PolicyDetailPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const [data, setData] = useState(null);
  const [viewingVersionId, setViewingVersionId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const load = useCallback(
    () => apiRequest(`/api/v1/compliance/policies/${id}`).then(setData).catch((error) => showError("Policy not loaded", error.message)),
    [id]
  );
  useEffect(() => {
    load();
  }, [load]);

  if (!data) return <div className="py-24 text-center text-sm text-light-black">Loading policy...</div>;
  const { policy, permissions, owners } = data;
  const base = `/api/v1/compliance/policies/${policy.id}`;

  // Version actions (submit, approve, reject, withdraw, restore, discard)
  const act = async (versionId, action, note) => {
    try {
      const result = await apiRequest(`${base}/versions/${versionId}`, { method: "POST", body: { action, note } });
      setData(result);
      setViewingVersionId(null);
      const messages = {
        submit: "Sent to a Super Admin for approval.",
        approve: "Approved. Employees are asked to acknowledge this version.",
        reject: "Sent back with your note.",
        withdraw: "Withdrawn from review.",
        restore: "Restored as a new version and sent for approval.",
        discard: "Draft discarded.",
      };
      toast.success(messages[action] ?? "Saved.");
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  const remove = async () => {
    try {
      const result = await apiRequest(base, { method: "DELETE" });
      setIsDeleteModalOpen(false);
      if (result.deleted) {
        toast.success("Policy deleted.");
        router.push("/super-admin/compliance-audit/policy-documents");
      } else {
        toast.success("Policy archived. Its history and signatures are kept.");
        load();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const unarchive = async () => {
    try {
      setData(await apiRequest(`${base}/restore`, { method: "POST" }));
      toast.success("Policy restored.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const viewing = policy.versions.find((version) => version.id === viewingVersionId) ?? policy.versions.find((version) => version.status === "approved") ?? policy.versions[0];
  const neverApproved = policy.statusKey === "draft" || policy.statusKey === "under_review";

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      <PolicyDetailHeader
        policy={policy}
        permissions={permissions}
        onEditClick={() => setIsEditModalOpen(true)}
        onDeleteClick={() => setIsDeleteModalOpen(true)}
        onUnarchive={unarchive}
      />

      {policy.pendingVersion && <ReviewPanel policy={policy} permissions={permissions} onAction={act} onView={setViewingVersionId} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        <div className="lg:col-span-7 xl:col-span-7 w-full min-w-0">
          <DocumentPreview policy={policy} version={viewing} />
        </div>
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-6 w-full min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <DocumentInformation policy={policy} />
            <AcknowledgmentCard policy={policy} />
          </div>
          <PolicyTabsSection
            policy={policy}
            permissions={permissions}
            viewingVersionId={viewing?.id}
            onViewVersion={setViewingVersionId}
            onRestoreVersion={(versionId) => act(versionId, "restore")}
            onUploadNewVersion={() => setIsEditModalOpen(true)}
          />
        </div>
      </div>

      {isEditModalOpen && (
        <EditDocumentModal isOpen policy={policy} owners={owners} onClose={() => setIsEditModalOpen(false)} onSaved={(result) => setData(result)} />
      )}

      <AlertModal
        isOpen={isDeleteModalOpen}
        type="danger"
        title={neverApproved ? "Delete Policy Document" : "Archive Policy Document"}
        message={
          neverApproved
            ? `Delete "${policy.name}"? It was never approved, so it and its drafts are removed.`
            : `Archive "${policy.name}"? Employees no longer see or sign it, and it leaves onboarding. Its version history and signatures are kept, and a Super Admin can restore it.`
        }
        confirmLabel={neverApproved ? "Delete Policy" : "Archive Policy"}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={remove}
      />
    </div>
  );
}
