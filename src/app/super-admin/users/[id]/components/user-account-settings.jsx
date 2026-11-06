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
import { formatDate, formatDateTime } from "@/lib/client-api";

// Account Settings tab on the live customer page. `account` is the customer detail from the API,
// `api` the account calls (../../account-api) and `onChanged` reloads the page after a change.
const STATUS_NAMES = { active: "Active", suspended: "Suspended", deleted: "Deleted" };

export default function UserAccountSettings({ onNavigateTab = () => {}, account, api, onChanged = () => {} }) {
  const [open, setOpen] = useState(null);
  const close = () => setOpen(null);
  const { permissions, subscription, profile } = account;
  const canWrite = permissions.canWrite && account.status !== "deleted";

  const companyData = {
    name: account.company,
    website: profile.website ?? "",
    industry: profile.industry ?? "",
    size: profile.companySize ?? "",
    phone: profile.phone ?? "",
    address: profile.address ?? "",
    timeZone: profile.timezone ?? "",
    language: "English (US)",
    dateFormat: "MM/DD/YYYY",
  };
  const ownerData = { name: account.owner?.name ?? "", email: account.owner?.email ?? "", phone: profile.phone ?? "" };
  const statusData = {
    accountStatus: STATUS_NAMES[account.status] ?? "Active",
    billingStatus: subscription.status === "pending_payment" ? "Payment pending" : "Up to date",
    plan: subscription.plan.name,
    nextInvoice: subscription.cancelAtPeriodEnd ? "None (cancelling)" : subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : "End of this period",
    autoRenew: !subscription.cancelAtPeriodEnd,
    accountId: account.accountNumber,
  };

  // Edit modals wait for the server and stay open if it refuses
  const saveCompany = async (data) => {
    await api.updateProfile({ company: data.name, website: data.website, industry: data.industry, companySize: data.size, phone: data.phone, address: data.address, timezone: data.timeZone });
    close();
    onChanged();
    toast.success("Company profile updated.");
  };
  const saveOwner = async (data) => {
    await api.updateOwner({ name: data.name, email: data.email });
    if (data.phone !== ownerData.phone) await api.updateProfile({ phone: data.phone });
    close();
    onChanged();
    toast.success("Account owner updated.");
  };
  const toggleAutoRenew = async () => {
    if (!canWrite) return;
    await api.cancel(statusData.autoRenew ? {} : { undo: true });
    onChanged();
    toast.success(statusData.autoRenew ? "Auto renew is off. The subscription ends at the end of this period." : "Auto renew is on.");
  };
  const handleQuickAction = (actionId) => {
    if (actionId === "reset_calibration") onNavigateTab("calibration");
    else if (actionId === "view_login_activity") onNavigateTab("usage");
    else if (actionId === "deactivate_account" && permissions.canSuspend && account.status === "active") setOpen("deactivate");
  };
  const lastChange = account.activity[0];

  return (
    <div className="w-full flex flex-col gap-6 pb-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 flex flex-col gap-6 w-full">
          <CompanyProfile company={companyData} onEdit={canWrite ? () => setOpen("company") : undefined} />
          <AccountOwner owner={ownerData} onEdit={canWrite ? () => setOpen("owner") : undefined} />
          {permissions.canSuspend && account.status !== "deleted" && (
            <DangerZone
              onSuspendAccount={() => (account.status === "active" ? setOpen("suspend") : toast("This account is already suspended."))}
              onDeleteAccount={() => (permissions.isSuperAdmin ? setOpen("delete") : toast.error("Only a Super Admin can delete an account."))}
            />
          )}
        </div>

        <div className="xl:col-span-4 flex flex-col gap-6 w-full">
          <AccountStatusCard status={statusData} onViewSubscription={() => onNavigateTab("subscription")} onToggleAutoRenew={toggleAutoRenew} />
          <AccountSettingsQuickActions onActionClick={handleQuickAction} />
        </div>
      </div>

      <AuditInfo
        createdDate={formatDateTime(account.customerSince)}
        createdBy={account.source === "sales" ? account.rep?.name ?? "Sales rep" : "Self sign-up"}
        lastUpdated={lastChange ? formatDateTime(lastChange.createdAt) : "—"}
        updatedBy={lastChange?.actor ?? "—"}
        lastLogin={account.lastActiveAt ? formatDateTime(account.lastActiveAt) : "Never"}
        loginCount={account.members.length}
        loginCountLabel="Members"
      />

      {open === "company" && <EditCompanyProfileModal isOpen onClose={close} company={companyData} onSave={(data) => saveCompany(data).catch(() => {})} />}
      {open === "owner" && <EditAccountOwnerModal isOpen onClose={close} owner={ownerData} onSave={(data) => saveOwner(data).catch(() => {})} />}
      <SuspendAccountModal
        isOpen={open === "suspend"}
        onClose={close}
        name={account.company}
        onConfirm={async (reason) => {
          await api.setStatus("suspended", reason);
          onChanged();
        }}
      />
      <DeactivateAccountModal
        isOpen={open === "deactivate"}
        onClose={close}
        onConfirm={async () => {
          await api.setStatus("suspended", "Deactivated from Account Settings");
          onChanged();
        }}
      />
      <DeleteAccountModal
        isOpen={open === "delete"}
        onClose={close}
        company={account.company}
        onConfirm={async () => {
          await api.setStatus("deleted", "Deleted from Account Settings");
          onChanged();
        }}
      />
    </div>
  );
}
