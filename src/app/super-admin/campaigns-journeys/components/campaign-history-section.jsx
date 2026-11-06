"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { campaignApi, formatWhen } from "../campaign-api";

const STATUS = {
  sent: "bg-emerald-50 text-emerald-600 border-emerald-200",
  scheduled: "bg-sky-50 text-sky-600 border-sky-200",
  sending: "bg-sky-50 text-sky-600 border-sky-200",
  canceled: "bg-slate-100 text-slate-600 border-slate-200",
  failed: "bg-red-50 text-red-600 border-red-200",
};
const PAGE_SIZE = 6;

// Live broadcast history; scheduled campaigns can be cancelled
export default function CampaignHistorySection({ campaigns = [], loading = false, canManage = false, onChanged }) {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const filtered = campaigns.filter((campaign) => status === "all" || campaign.status === status);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const cancel = async (campaign) => {
    if (!window.confirm(`Cancel the scheduled campaign "${campaign.name}"?`)) return;
    try {
      await campaignApi.cancelCampaign(campaign.id);
      toast.success("Campaign cancelled");
      onChanged?.();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between overflow-hidden">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">Campaign History</h3>
          <select
            aria-label="Filter status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-white border border-light-gray rounded-xl text-xs font-semibold text-dark-black/80 cursor-pointer"
          >
            <option value="all">All statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="sent">Sent</option>
            <option value="canceled">Cancelled</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-light-gray text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider whitespace-nowrap">
                <th className="pb-3">Campaign Name</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3 text-right">Recipients</th>
                <th className="pb-3 text-right"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/60 text-xs">
              {!rows.length && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-light-black">{loading ? "Loading…" : "No campaigns yet."}</td>
                </tr>
              )}
              {rows.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-light-gray/30 transition-colors">
                  <td className="py-3.5">
                    <span className="block font-semibold text-dark-black/80">{campaign.name}</span>
                    <span className="block text-[10px] text-light-black font-semibold uppercase tracking-wider mt-0.5">Segment: {campaign.segmentName ?? "deleted"} · {campaign.templateName ?? "template deleted"}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`inline-flex text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide border whitespace-nowrap ${STATUS[campaign.status] ?? STATUS.canceled}`}>{campaign.status}</span>
                  </td>
                  <td className="py-3.5 px-3 text-medium-black whitespace-nowrap">{formatWhen(campaign.sentAt ?? campaign.scheduledAt)}</td>
                  <td className="py-3.5 px-3 text-right font-bold text-dark-black/80 whitespace-nowrap">
                    {campaign.status === "scheduled" ? "—" : campaign.recipients}
                    {campaign.stats.queued ? <span className="block text-[10px] font-normal text-amber-600">{campaign.stats.queued} waiting to deliver</span> : null}
                  </td>
                  <td className="py-3.5 text-right">
                    {canManage && campaign.status === "scheduled" && (
                      <button type="button" onClick={() => cancel(campaign)} aria-label={`Cancel ${campaign.name}`} className="text-light-black hover:text-red-600 cursor-pointer">
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-4 mt-2 border-t border-light-gray flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold text-light-black uppercase tracking-wider">
          Showing {rows.length} of {filtered.length} campaigns
        </span>
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)} className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-medium-black disabled:opacity-40 cursor-pointer">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-light-black px-1">{current} / {pages}</span>
          <button type="button" aria-label="Next page" disabled={current === pages} onClick={() => setPage(current + 1)} className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-medium-black disabled:opacity-40 cursor-pointer">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
