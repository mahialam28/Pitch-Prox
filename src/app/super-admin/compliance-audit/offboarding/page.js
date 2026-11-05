"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowUp, Check, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";
import { showExportStartedToast, showSavedToast } from "@/lib/toast";
import { StartOffboardingDialog } from "../access-records/components/employee-dialogs";

// Offboarding queue and checklist (live). Ticking "Revoke application access" signs
// the employee out and blocks sign-in; finishing the checklist deactivates them.

const ACCESS_BADGE = {
  "Partially revoked": "bg-amber-50 text-amber-700 border-amber-200",
  Revoked: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Active: "bg-red-50 text-red-600 border-red-200",
};

const STATUS = {
  overdue: { label: "Overdue", className: "bg-red-50 text-red-600 border-red-200" },
  in_progress: { label: "In progress", className: "bg-blue-50 text-blue-600 border-blue-200" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
  completed: { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const barColor = (value) => (value >= 80 ? "bg-primary" : value >= 50 ? "bg-amber-500" : "bg-red-500");
const formatDay = (value) => new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

const Badge = ({ className, children }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-medium whitespace-nowrap ${className}`}>{children}</span>
);

export default function OffboardingPage() {
  const [data, setData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [saving, setSaving] = useState(null);
  const [me, setMe] = useState(null);
  const [managers, setManagers] = useState([]);
  const [starting, setStarting] = useState(null);

  const load = useCallback(async () => {
    try {
      setData(await apiRequest("/api/v1/admin/offboarding"));
    } catch (error) {
      showError("Offboarding not loaded", error.message);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

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

  const canWrite = me && me.role !== "auditor";
  const cases = data?.results ?? [];
  const steps = data?.steps ?? [];
  const selected = cases.find((item) => item.id === selectedId);

  const toggleStep = async (step, done) => {
    if (!selected || !canWrite) return;
    setSaving(step.key);
    try {
      const { case: updated } = await apiRequest(`/api/v1/admin/offboarding/${selected.id}/steps/${step.key}`, { method: "PUT", body: { done } });
      if (updated.status === "completed") showSavedToast("Offboarding complete", `${updated.name}'s access is fully revoked.`);
      else if (done && step.key === "revoke-access") showSavedToast("Access revoked", `${updated.name} was signed out and can no longer sign in.`);
      await load();
    } catch (error) {
      showError("Checklist not updated", error.message);
    } finally {
      setSaving(null);
    }
  };

  const stats = data?.stats;
  const completedChange = stats ? stats.completed30 - stats.completedPrev30 : 0;
  const STATS = stats
    ? [
        { label: "Pending Offboarding", value: stats.pending, note: "Requires action", tone: "text-red-600" },
        { label: "In Progress", value: stats.inProgress, note: "Checklist started", tone: "text-emerald-600" },
        { label: "Completed (30 days)", value: stats.completed30, note: `${Math.abs(completedChange)} ${completedChange >= 0 ? "more" : "fewer"} than last month`, tone: "text-emerald-600", trend: completedChange >= 0 ? "up" : "down" },
        { label: "Overdue", value: stats.overdue, note: stats.overdue ? "Revoke access now" : "None overdue", tone: stats.overdue ? "text-red-600" : "text-emerald-600" },
        { label: "Avg Time to Revoke", value: stats.avgDaysToRevoke == null ? "—" : `${stats.avgDaysToRevoke} days`, note: "Start to completion", tone: "text-medium-black" },
      ]
    : [];

  return (
    <div className="w-full flex flex-col gap-5 pb-12 font-secondary">
      <div>
        <Link href="/super-admin/compliance-audit/access-records" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Access Records
        </Link>
        <h1 className="text-2xl font-semibold text-dark-black">Offboarding</h1>
        <p className="text-sm text-medium-black mt-1">Revoke access and complete the checklist when employees leave.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-light-gray p-4 shadow-xs">
            <p className="text-xs text-medium-black">{stat.label}</p>
            <p className="text-2xl font-semibold text-dark-black mt-1">{stat.value}</p>
            <p className={`flex items-center gap-1 text-[11px] font-medium mt-1 ${stat.tone}`}>
              {stat.trend === "up" && <ArrowUp className="w-3 h-3" />}
              {stat.trend === "down" && <ArrowDown className="w-3 h-3" />}
              {stat.note}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
        <section className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-dark-black">Offboarding Queue</h2>
            <button type="button" onClick={showExportStartedToast} className="text-xs font-semibold text-primary hover:underline cursor-pointer">
              Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="bg-light-gray/60 text-[10px] font-semibold uppercase tracking-wider text-light-black">
                  <th className="px-3 py-2.5">Employee</th>
                  <th className="px-3 py-2.5">Last day</th>
                  <th className="px-3 py-2.5">Checklist</th>
                  <th className="px-3 py-2.5">Access</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray">
                {!data && (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-xs text-medium-black">
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Loading…
                    </td>
                  </tr>
                )}
                {data && !cases.length && (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-xs text-medium-black">No one is being offboarded.</td>
                  </tr>
                )}
                {cases.map((item) => {
                  const isSelected = item.id === selectedId;
                  const status = STATUS[item.status] ?? STATUS.pending;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedId(isSelected ? null : item.id)}
                      aria-selected={isSelected}
                      className={`cursor-pointer transition-colors ${isSelected ? "bg-light-teal/40" : "hover:bg-light-gray/40"}`}
                    >
                      <td className="px-3 py-3">
                        <p className="text-xs font-semibold text-dark-black">{item.name}</p>
                        <p className="text-[11px] text-light-black">{item.jobTitle ?? item.roleLabel}</p>
                      </td>
                      <td className="px-3 py-3 text-xs text-dark-black whitespace-nowrap">{formatDay(item.lastDay)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div className={`h-full rounded-full ${barColor(item.progress)}`} style={{ width: `${Math.max(item.progress, 2)}%` }} />
                          </div>
                          <span className="text-xs text-dark-black w-9">{item.progress}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3"><Badge className={ACCESS_BADGE[item.access]}>{item.access}</Badge></td>
                      <td className="px-3 py-3"><Badge className={status.className}>{status.label}</Badge></td>
                      <td className="px-3 py-3">
                        <p className="text-xs font-medium text-dark-black">{item.ownerName ?? "—"}</p>
                        <p className="text-[11px] text-light-black">{item.ownerTitle ?? ""}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 xl:sticky xl:top-6">
          <h2 className="text-base font-semibold text-dark-black">Offboarding Checklist</h2>
          {selected && (
            <p className="text-xs text-medium-black mt-0.5">
              {selected.name} · {selected.steps.length} of {steps.length} done
            </p>
          )}
          <ol className="mt-3 divide-y divide-light-gray">
            {steps.map((step, index) => {
              const done = selected ? selected.steps.includes(step.key) : false;
              const editable = selected && canWrite && !selected.completedAt;
              const content = (
                <>
                  {selected && (
                    <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${done ? "bg-primary border-primary" : "border-gray-300"}`}>
                      {saving === step.key ? <Loader2 className="w-3 h-3 animate-spin text-medium-black" /> : done && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    </span>
                  )}
                  <span>
                    <span className={`block text-sm font-medium ${done ? "text-light-black line-through" : "text-dark-black"}`}>{step.label}</span>
                    <span className="block text-[11px] text-light-black">
                      Step {index + 1} of {steps.length}
                    </span>
                  </span>
                </>
              );
              return (
                <li key={step.key} className="py-3">
                  {editable ? (
                    <button type="button" disabled={Boolean(saving)} onClick={() => toggleStep(step, !done)} className="w-full flex items-center gap-3 text-left cursor-pointer disabled:cursor-wait">
                      {content}
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">{content}</div>
                  )}
                </li>
              );
            })}
          </ol>
          {selected ? (
            <button type="button" onClick={() => setSelectedId(null)} className="mt-3 w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-medium-teal transition-colors cursor-pointer">
              Done
            </button>
          ) : (
            canWrite && (
              <button type="button" onClick={() => setStarting({ choose: true })} className="mt-3 w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-medium-teal transition-colors cursor-pointer">
                Start Offboarding
              </button>
            )
          )}
        </aside>
      </div>

      <StartOffboardingDialog
        key={starting ? "start-open" : "start-closed"}
        employee={starting}
        managers={managers.filter((manager) => manager.id !== me?.id)}
        onClose={() => setStarting(null)}
        onStart={async (body) => {
          const { case: created } = await apiRequest("/api/v1/admin/offboarding", { method: "POST", body });
          showSavedToast("Offboarding started", `${created.name} was added to the offboarding queue.`);
          await load();
          setSelectedId(created.id);
        }}
      />
    </div>
  );
}
