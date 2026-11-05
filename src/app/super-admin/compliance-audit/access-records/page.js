"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Link2, ListChecks, RotateCcw, UserCog, UserMinus, Users, ShieldCheck, UserPlus } from "lucide-react";
import AccessStats from "./components/access-stats";
import AccessTable from "./components/access-table";
import AccessOverview from "./components/access-overview";
import RecentAccessChanges from "./components/recent-access-changes";
import OffboardingChecklistBanner from "./components/offboarding-checklist-banner";
import AddUserModal from "./components/add-user-modal";
import { ChangeRoleDialog, InviteLinkDialog, OnboardingProgressDialog, StartOffboardingDialog } from "./components/employee-dialogs";
import { MFA_FILTERS, ROLE_FILTERS, STATUS_FILTERS } from "./access-records-data";
import ActionMenu from "@/components/shared/dropdown/action-menu";
import ConfirmDialog from "@/components/modals/confirm-dialog";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";
import { showSavedToast } from "@/lib/toast";

// Access Records: PitchProX employees, invites, roles and access changes (live data).
export default function AccessRecordsPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [list, setList] = useState({ results: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [changes, setChanges] = useState([]);
  const [offboardingCounts, setOffboardingCounts] = useState({});
  const [managers, setManagers] = useState([]);

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedMfa, setSelectedMfa] = useState("All MFA Statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [invite, setInvite] = useState(null);
  const [changingRole, setChangingRole] = useState(null);
  const [viewingProgress, setViewingProgress] = useState(null);
  const [offboarding, setOffboarding] = useState(null);
  const [deactivating, setDeactivating] = useState(null);

  const canWrite = me && me.role !== "auditor";

  const loadList = useCallback(async () => {
    const params = new URLSearchParams({ tab: activeTab, page: String(currentPage), pageSize: String(pageSize) });
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    if (ROLE_FILTERS[selectedRole]) params.set("role", ROLE_FILTERS[selectedRole]);
    if (STATUS_FILTERS[selectedStatus] && activeTab === "all") params.set("status", STATUS_FILTERS[selectedStatus]);
    if (MFA_FILTERS[selectedMfa]) params.set("mfa", MFA_FILTERS[selectedMfa]);
    try {
      setList(await apiRequest(`/api/v1/admin/employees?${params}`));
    } catch (error) {
      showError("Employees not loaded", error.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, pageSize, searchTerm, selectedRole, selectedStatus, selectedMfa]);

  const loadSummary = useCallback(async () => {
    try {
      const [statsData, changesData, offboardingData] = await Promise.all([
        apiRequest("/api/v1/admin/employees/stats"),
        apiRequest("/api/v1/admin/access-changes"),
        apiRequest("/api/v1/admin/offboarding"),
      ]);
      setStats(statsData);
      setChanges(changesData.results);
      setOffboardingCounts(offboardingData.stats);
    } catch (error) {
      showError("Summary not loaded", error.message);
    }
  }, []);

  // Search waits for typing to pause
  useEffect(() => {
    const timer = setTimeout(loadList, searchTerm ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadList, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(loadSummary, 0);
    return () => clearTimeout(timer);
  }, [loadSummary]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([apiRequest("/api/v1/me"), apiRequest("/api/v1/admin/managers")])
      .then(([meData, managerData]) => {
        if (cancelled) return;
        setMe(meData.user);
        setManagers(managerData.results);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = () => Promise.all([loadList(), loadSummary()]);

  const updateEmployee = async (employee, changes, message) => {
    await apiRequest(`/api/v1/admin/employees/${employee.id}`, { method: "PATCH", body: changes });
    showSavedToast(message.title, message.text);
    await refresh();
  };

  const newInviteLink = async (employee) => {
    try {
      const result = await apiRequest(`/api/v1/admin/employees/${employee.id}/invite`, { method: "POST" });
      setInvite({ ...result.invite, name: employee.name });
      await refresh();
    } catch (error) {
      showError("Invite link not created", error.message);
    }
  };

  const rowActions = (employee) => {
    if (!canWrite || employee.id === me?.id) return null;
    const pending = employee.status === "invited" || employee.status === "expired";
    return (
      <ActionMenu
        label={`Actions for ${employee.name}`}
        items={[
          pending && { label: "Copy new invite link", icon: Link2, onClick: () => newInviteLink(employee) },
          employee.status === "onboarding" && { label: "View onboarding progress", icon: ListChecks, onClick: () => setViewingProgress(employee) },
          employee.status !== "deactivated" && { label: "Change role", icon: UserCog, onClick: () => setChangingRole(employee) },
          ["active", "onboarding"].includes(employee.status) && { label: "Start offboarding", icon: UserMinus, onClick: () => setOffboarding(employee) },
          employee.status === "deactivated"
            ? {
                label: "Reactivate",
                icon: RotateCcw,
                onClick: () =>
                  updateEmployee(employee, { status: "active" }, { title: "Employee reactivated", text: `${employee.name} can sign in again.` }).catch((error) =>
                    showError("Not reactivated", error.message)
                  ),
              }
            : { divider: true },
          employee.status !== "deactivated" && { label: "Deactivate", icon: Ban, danger: true, onClick: () => setDeactivating(employee) },
        ]}
      />
    );
  };

  const total = stats?.total ?? 0;
  const pct = (value) => (total ? `${((value / total) * 100).toFixed(1)}% of total` : "—");
  const statCards = [
    { id: "total", label: "TOTAL USERS", value: total, subtext: `↑ ${stats?.addedThisMonth ?? 0} this month`, isTrend: true, linkText: "View all users →", icon: Users, iconBg: "bg-[#E6F7F7]", iconColor: "text-[#0EADAB]" },
    { id: "active", label: "ACTIVE USERS", value: stats?.active ?? 0, subtext: pct(stats?.active ?? 0), linkText: "View active users →", icon: ShieldCheck, iconBg: "bg-[#EFF6FF]", iconColor: "text-[#3B82F6]" },
    { id: "onboarding", label: "ONBOARDING IN PROGRESS", value: stats?.onboarding ?? 0, subtext: pct(stats?.onboarding ?? 0), linkText: "View In Progress users →", icon: UserPlus, iconBg: "bg-[#FEF3EB]", iconColor: "text-[#F97316]" },
    { id: "offboarding", label: "OFFBOARDING PENDING", value: stats?.offboarding ?? 0, subtext: pct(stats?.offboarding ?? 0), linkText: "View Offboarding Pending users →", icon: UserMinus, iconBg: "bg-[#FEF3EB]", iconColor: "text-[#F97316]" },
  ];

  const handleStatClick = (statId) => {
    setCurrentPage(1);
    if (statId === "total") {
      setActiveTab("all");
      setSelectedStatus("All Statuses");
    }
    if (statId === "active") setActiveTab("active");
    if (statId === "onboarding") setActiveTab("in-progress");
    if (statId === "offboarding") setActiveTab("offboarding");
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-black/90 font-secondary tracking-tight">Access Records</h1>
        <p className="text-xs sm:text-sm text-medium-black font-normal">Monitor user access, roles, permissions, and account lifecycle.</p>
      </div>

      <AccessStats stats={statCards} onStatClick={handleStatClick} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        <div className="lg:col-span-8 xl:col-span-9 w-full min-w-0">
          <AccessTable
            users={list.results}
            loading={loading}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedMfa={selectedMfa}
            setSelectedMfa={setSelectedMfa}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalUsers={list.total}
            totalPages={list.pages}
            canWrite={Boolean(canWrite)}
            rowActions={rowActions}
            onOpenAddUserModal={() => setIsAddUserModalOpen(true)}
          />
        </div>
        <div className="lg:col-span-4 xl:col-span-3 w-full flex flex-col gap-6">
          <AccessOverview roles={stats?.roles ?? []} />
          <RecentAccessChanges changes={changes} />
        </div>
      </div>

      <OffboardingChecklistBanner counts={offboardingCounts} onViewOffboarding={() => router.push("/super-admin/compliance-audit/offboarding")} />

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserCreated={(result) => {
          setInvite({ ...result.invite, name: result.employee.name });
          refresh();
        }}
      />
      <InviteLinkDialog invite={invite} onClose={() => setInvite(null)} />
      <ChangeRoleDialog
        key={changingRole?.id ?? "role"}
        employee={changingRole}
        onClose={() => setChangingRole(null)}
        onSave={(role) => updateEmployee(changingRole, { role }, { title: "Role changed", text: `${changingRole.name}'s access was updated.` })}
      />
      <OnboardingProgressDialog key={viewingProgress?.id ?? "progress"} employee={viewingProgress} onClose={() => setViewingProgress(null)} />
      <StartOffboardingDialog
        key={offboarding?.id ?? "offboarding"}
        employee={offboarding}
        managers={managers}
        onClose={() => setOffboarding(null)}
        onStart={async (body) => {
          await apiRequest("/api/v1/admin/offboarding", { method: "POST", body });
          showSavedToast("Offboarding started", `${offboarding.name} was added to the offboarding queue.`);
          router.push("/super-admin/compliance-audit/offboarding");
        }}
      />
      <ConfirmDialog
        isOpen={Boolean(deactivating)}
        onClose={() => setDeactivating(null)}
        title="Deactivate this employee?"
        icon={Ban}
        iconTone="warning"
        message={`${deactivating?.name ?? ""} will be signed out everywhere and can't sign in until reactivated.`}
        note="For someone leaving the company, use Start offboarding instead so the checklist is recorded."
        confirmLabel="Deactivate"
        onConfirm={async () => {
          try {
            await updateEmployee(deactivating, { status: "deactivated" }, { title: "Employee deactivated", text: `${deactivating.name} no longer has access.` });
          } catch (error) {
            showError("Not deactivated", error.message);
            throw error;
          }
        }}
      />
    </div>
  );
}
