"use client";

import React, { useEffect, useState } from "react";
import UserHeader from "./components/user-header";
import UserList from "./components/user-list";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

// Live customer accounts: a sales rep sees the accounts they own, admins see all of them.

const PLAN_CLASSES = {
  "Free Trial": "bg-slate-50 text-slate-600 border border-slate-200",
  Basic: "bg-sky-50 text-sky-600 border border-sky-100",
  Pro: "bg-indigo-50 text-indigo-600 border border-indigo-100",
  Elite: "bg-purple-50 text-purple-600 border border-purple-100",
};
const STATUS = {
  Active: ["bg-emerald-500", "text-dark-black/80"],
  Trial: ["bg-sky-500", "text-dark-black/80"],
  "Pending payment": ["bg-amber-500", "text-amber-700"],
  Invited: ["bg-slate-400", "text-medium-black"],
  Canceled: ["bg-red-500", "text-red-600"],
  Suspended: ["bg-red-500", "text-red-600"],
  Deleted: ["bg-slate-400", "text-light-black"],
};
const COLORS = ["bg-[#0EADAB] text-white", "bg-indigo-500 text-white", "bg-orange-500 text-white", "bg-pink-500 text-white", "bg-sky-500 text-white"];

const lastActive = (value) => {
  if (!value) return ["Never", "bg-slate-300"];
  const minutes = Math.round((Date.now() - new Date(value)) / 60000);
  if (minutes < 5) return ["Just now", "bg-emerald-500"];
  if (minutes < 60) return [`${minutes}m ago`, "bg-emerald-500"];
  if (minutes < 1440) return [`${Math.round(minutes / 60)}h ago`, "bg-amber-500"];
  return [`${Math.round(minutes / 1440)}d ago`, "bg-red-500"];
};

export const toUserRow = (account, index) => {
  const [activeLabel, activeDot] = lastActive(account.lastActiveAt);
  const [statusDot, statusClass] = STATUS[account.status] ?? STATUS.Active;
  return {
    id: account.organizationId,
    name: account.name,
    company: account.company,
    email: account.email,
    phone: account.phone ?? "—",
    initials: account.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join(""),
    initialsBg: COLORS[index % COLORS.length],
    accountId: account.accountNumber,
    plan: (account.planName ?? "—").toUpperCase(),
    planClass: PLAN_CLASSES[account.planName] ?? PLAN_CLASSES.Basic,
    status: account.status,
    statusDot,
    statusClass,
    calibration: account.calibrated ? "Completed" : "Not Started",
    calibrationClass: account.calibrated ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-50 text-slate-500 border border-slate-200",
    // Calls and reports are counted once calling is connected
    callsUsed: 0,
    callsMax: account.callsMax ?? 0,
    reportsUsed: 0,
    reportsMax: account.reportsMax ?? 0,
    lastActive: activeLabel,
    lastActiveDot: activeDot,
    healthScore: account.healthScore,
    healthLabel: account.healthScore >= 70 ? "Healthy" : account.healthScore >= 40 ? "At Risk" : "Inactive",
    leadType: account.repName ? `Rep: ${account.repName}` : "Self sign-up",
    userType: account.source === "sales" ? "Sales" : "Self sign-up",
  };
};

export default function CustomersScreen() {
  const [data, setData] = useState(null);

  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    apiRequest("/api/v1/customers")
      .then((result) => !cancelled && setData(result))
      .catch((error) => showError("Customers not loaded", error.message));
    return () => {
      cancelled = true;
    };
  }, [version]);

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      <UserHeader
        stats={{
          ...(data?.stats ?? { total: 0, active: 0, trial: 0, pending: 0, calibrated: 0, avgHealth: 0 }),
          canceled: (data?.results ?? []).filter((account) => account.status === "Canceled").length,
        }}
      />
      <UserList users={(data?.results ?? []).map(toUserRow)} onChanged={() => setVersion((value) => value + 1)} />
    </div>
  );
}
