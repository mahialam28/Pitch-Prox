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
import { SuspendAccountModal, DeleteAccountModal, DeactivateAccountModal } from "./account-dialogs";
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

  // Dialogs show their own confirmation toast; here we only update the on-screen status
  const handleConfirmSuspend = () => setStatusData((prev) => ({ ...prev, accountStatus: "Suspended" }));
  const handleConfirmDeactivate = () => setStatusData((prev) => ({ ...prev, accountStatus: "Inactive" }));

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

      <SuspendAccountModal isOpen={isSuspendAlertOpen} onClose={() => setIsSuspendAlertOpen(false)} name={companyData.name} onConfirm={handleConfirmSuspend} />
      <DeleteAccountModal isOpen={isDeleteAlertOpen} onClose={() => setIsDeleteAlertOpen(false)} company={companyData.name} />
      <DeactivateAccountModal isOpen={isDeactivateAlertOpen} onClose={() => setIsDeactivateAlertOpen(false)} onConfirm={handleConfirmDeactivate} />
    </div>
  );
}
