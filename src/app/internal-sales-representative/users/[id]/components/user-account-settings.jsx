"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import CompanyProfile from "./company-profile";
import AccountOwner from "./account-owner";
import DangerZone from "./danger-zone";
import AccountStatusCard from "./account-status-card";
import AccountSettingsQuickActions from "./account-settings-quick-actions";
import EditCompanyProfileModal from "./edit-company-profile-modal";
import EditAccountOwnerModal from "./edit-account-owner-modal";
import AlertModal from "@/components/modals/alert-modal";
import AuditInfo from "./audit-info";

export default function UserAccountSettings({
  onNavigateTab = () => {},
}) {
  // State for Company Profile
  const [companyData, setCompanyData] = useState({
    name: "Acme Inc.",
    website: "www.acme.com",
    industry: "Real Estate",
    size: "11-50 employees",
    phone: "(512) 555-0198",
    address: "123 Main Street, Suite 400\nAustin, TX 78701, USA",
    timeZone: "(GMT-05:00) Eastern Time (US & Canada)",
    language: "English (US)",
    dateFormat: "MM/DD/YYYY",
  });

  // State for Account Owner
  const [ownerData, setOwnerData] = useState({
    name: "Jennifer Smith",
    email: "jennifer.smith@acme.com",
    phone: "(555) 123-4567",
  });

  // State for Account Status
  const [statusData, setStatusData] = useState({
    accountStatus: "Active",
    billingStatus: "Up to date",
    plan: "Premium",
    nextInvoice: "Jun 15, 2025",
    autoRenew: true,
    accountId: "ACC-001234",
  });

  // Modals
  const [isEditCompanyOpen, setIsEditCompanyOpen] = useState(false);
  const [isEditOwnerOpen, setIsEditOwnerOpen] = useState(false);
  const [isSuspendAlertOpen, setIsSuspendAlertOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isDeactivateAlertOpen, setIsDeactivateAlertOpen] = useState(false);

  // Handlers
  const handleSaveCompany = (newData) => {
    setCompanyData(newData);
    setIsEditCompanyOpen(false);
    toast.success("Company profile updated successfully!");
  };

  const handleSaveOwner = (newData) => {
    setOwnerData(newData);
    setIsEditOwnerOpen(false);
    toast.success("Account owner updated successfully!");
  };

  const handleToggleAutoRenew = () => {
    const nextVal = !statusData.autoRenew;
    setStatusData((prev) => ({ ...prev, autoRenew: nextVal }));
    toast.success(nextVal ? "Auto renew turned ON." : "Auto renew turned OFF.");
  };

  const handleQuickAction = (actionId) => {
    if (actionId === "reset_calibration") {
      onNavigateTab("calibration");
      toast.success("Navigated to Calibration.");
    } else if (actionId === "add_calls" || actionId === "add_reports") {
      onNavigateTab("subscription");
      toast.success("Navigated to Subscription & Billing.");
    } else if (actionId === "view_login_activity") {
      onNavigateTab("usage");
      toast.success("Navigated to Usage & Activity.");
    } else if (actionId === "deactivate_account") {
      setIsDeactivateAlertOpen(true);
    }
  };

  const handleConfirmSuspend = () => {
    setStatusData((prev) => ({ ...prev, accountStatus: "Suspended" }));
    setIsSuspendAlertOpen(false);
    toast.error("Account has been suspended.");
  };

  const handleConfirmDelete = () => {
    setIsDeleteAlertOpen(false);
    toast.error("Account scheduled for deletion.");
  };

  const handleConfirmDeactivate = () => {
    setStatusData((prev) => ({ ...prev, accountStatus: "Inactive" }));
    setIsDeactivateAlertOpen(false);
    toast.error("Account has been deactivated.");
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-6">
      {/* ═════════════════════════════════════════════════════════════ */}
      {/* MAIN 2-COLUMN LAYOUT MATCHING USER REFERENCE IMAGE          */}
      {/* ═════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN (8 cols): Company Profile + Account Owner + Danger Zone ── */}
        <div className="xl:col-span-8 flex flex-col gap-6 w-full">
          {/* 1. Company Profile Card */}
          <CompanyProfile
            company={companyData}
            onEdit={() => setIsEditCompanyOpen(true)}
          />

          {/* 2. Account Owner Card */}
          <AccountOwner
            owner={ownerData}
            onEdit={() => setIsEditOwnerOpen(true)}
          />

          {/* 3. Danger Zone Card */}
          <DangerZone
            onSuspendAccount={() => setIsSuspendAlertOpen(true)}
            onDeleteAccount={() => setIsDeleteAlertOpen(true)}
          />
        </div>

        {/* ── RIGHT COLUMN (4 cols): Account Status + Quick Actions ── */}
        <div className="xl:col-span-4 flex flex-col gap-6 w-full">
          {/* 1. Account Status Card */}
          <AccountStatusCard
            status={statusData}
            onViewSubscription={() => onNavigateTab("subscription")}
            onToggleAutoRenew={handleToggleAutoRenew}
          />

          {/* 2. Quick Actions Card */}
          <AccountSettingsQuickActions onActionClick={handleQuickAction} />
        </div>
      </div>

      {/* ── Footer Audit Info ── */}
      <AuditInfo />

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* MODALS                                                       */}
      {/* ═════════════════════════════════════════════════════════════ */}

      {/* 1. Edit Company Profile Modal */}
      <EditCompanyProfileModal
        isOpen={isEditCompanyOpen}
        onClose={() => setIsEditCompanyOpen(false)}
        company={companyData}
        onSave={handleSaveCompany}
      />

      {/* 2. Edit Account Owner Modal */}
      <EditAccountOwnerModal
        isOpen={isEditOwnerOpen}
        onClose={() => setIsEditOwnerOpen(false)}
        owner={ownerData}
        onSave={handleSaveOwner}
      />

      {/* 3. Suspend Account Alert Modal */}
      <AlertModal
        isOpen={isSuspendAlertOpen}
        onClose={() => setIsSuspendAlertOpen(false)}
        type="warning"
        title="Suspend Account?"
        message={`Are you sure you want to suspend ${companyData.name}? The account users will be immediately locked out of active features.`}
        confirmLabel="Suspend Account"
        onConfirm={handleConfirmSuspend}
      />

      {/* 4. Delete Account Alert Modal */}
      <AlertModal
        isOpen={isDeleteAlertOpen}
        onClose={() => setIsDeleteAlertOpen(false)}
        type="error"
        title="Delete Account?"
        message={`Warning: Deleting ${companyData.name} is permanent and cannot be undone. All call logs, reports, and recordings will be removed.`}
        confirmLabel="Delete Account"
        onConfirm={handleConfirmDelete}
      />

      {/* 5. Deactivate Account Alert Modal */}
      <AlertModal
        isOpen={isDeactivateAlertOpen}
        onClose={() => setIsDeactivateAlertOpen(false)}
        type="warning"
        title="Deactivate Account?"
        message="Are you sure you want to deactivate this account? It can be reactivated by an administrator later."
        confirmLabel="Deactivate Account"
        onConfirm={handleConfirmDeactivate}
      />
    </div>
  );
}
