"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Pause, Play, Archive } from "lucide-react";
import toast from "react-hot-toast";
import { triggerTitle } from "../journeys/components/journey-steps";
import { campaignApi } from "../campaign-api";

const STATUS = { active: "bg-emerald-50 text-emerald-600 border-emerald-200", paused: "bg-amber-50 text-amber-700 border-amber-200", draft: "bg-slate-100 text-slate-600 border-slate-200" };
const countEmails = (steps = []) => steps.reduce((sum, step) => sum + (step.type === "email" ? 1 : 0) + (step.type === "condition" ? countEmails(step.branches?.yes) + countEmails(step.branches?.no) : 0), 0);

// Live journeys (lib/campaigns/journeys); click a row to open the builder
export default function ActiveJourneysSection({ journeys = [], segments = [], loading = false, canManage = false, onChanged, title = "Journeys" }) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(journeys.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const rows = journeys.slice((page - 1) * pageSize, page * pageSize);

  const act = async (journey, action) => {
    if (action === "archive" && !window.confirm(`Archive "${journey.name}"? Users still in it leave the journey.`)) return;
    try {
      await campaignApi.journeyStatus(journey.id, action);
      toast.success({ pause: "Journey paused", resume: "Journey resumed", publish: "Journey published", archive: "Journey archived" }[action]);
      onChanged?.();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between overflow-hidden">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">{title}</h3>
          {canManage && (
            <button type="button" onClick={() => router.push("/super-admin/campaigns-journeys/journeys/create")} className="text-xs font-semibold text-primary hover:underline cursor-pointer">
              + New journey
            </button>
          )}
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-light-gray text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider whitespace-nowrap">
                <th className="pb-3">Journey Name</th>
                <th className="pb-3 px-3">Trigger</th>
                <th className="pb-3 text-center px-2">Emails</th>
                <th className="pb-3 text-center px-2">In Journey</th>
                <th className="pb-3 text-center px-2">Status</th>
                <th className="pb-3 text-right px-2">Goal Rate</th>
                <th className="pb-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/60 text-xs">
              {!rows.length && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-light-black">{loading ? "Loading…" : "No journeys yet."}</td>
                </tr>
              )}
              {rows.map((journey) => (
                <tr key={journey.id} onClick={() => router.push(`/super-admin/campaigns-journeys/journeys/${journey.id}`)} className="hover:bg-light-gray/30 transition-colors cursor-pointer">
                  <td className="py-3.5">
                    <span className="block font-semibold text-dark-black/80">{journey.name}</span>
                    <span className="block text-[11px] text-light-black mt-0.5 max-w-[220px] truncate">{journey.description || `${journey.stats.entered} entered so far`}</span>
                  </td>
                  <td className="py-3.5 px-3 text-medium-black max-w-[220px] truncate">{triggerTitle(journey.triggerConfig, segments)}</td>
                  <td className="py-3.5 px-2 text-center font-bold text-dark-black/80">{countEmails(journey.steps)}</td>
                  <td className="py-3.5 px-2 text-center font-semibold text-dark-black/80">{journey.stats.active}</td>
                  <td className="py-3.5 px-2 text-center">
                    <span className={`inline-flex text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide border whitespace-nowrap ${STATUS[journey.status] ?? STATUS.draft}`}>{journey.status === "active" ? "Live" : journey.status}</span>
                  </td>
                  <td className="py-3.5 px-2 text-right font-bold text-dark-black/80">{journey.conversionRate == null ? "—" : `${journey.conversionRate}%`}</td>
                  <td className="py-3.5 text-right whitespace-nowrap" onClick={(event) => event.stopPropagation()}>
                    {canManage && journey.status === "active" && (
                      <button type="button" aria-label={`Pause ${journey.name}`} title="Pause" onClick={() => act(journey, "pause")} className="p-1 text-light-black hover:text-amber-600 cursor-pointer"><Pause className="w-4 h-4" /></button>
                    )}
                    {canManage && journey.status === "paused" && (
                      <button type="button" aria-label={`Resume ${journey.name}`} title="Resume" onClick={() => act(journey, "resume")} className="p-1 text-light-black hover:text-emerald-600 cursor-pointer"><Play className="w-4 h-4" /></button>
                    )}
                    {canManage && journey.status !== "active" && (
                      <button type="button" aria-label={`Archive ${journey.name}`} title="Archive" onClick={() => act(journey, "archive")} className="p-1 text-light-black hover:text-red-600 cursor-pointer"><Archive className="w-4 h-4" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pt-4 mt-2 border-t border-light-gray flex items-center justify-between gap-3">
        <span className="text-[11px] text-light-black">{journeys.length} journey{journeys.length === 1 ? "" : "s"}</span>
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setCurrentPage(page - 1)} className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-medium-black disabled:opacity-40 cursor-pointer">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-light-black px-1">{page} / {totalPages}</span>
          <button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => setCurrentPage(page + 1)} className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-medium-black disabled:opacity-40 cursor-pointer">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
