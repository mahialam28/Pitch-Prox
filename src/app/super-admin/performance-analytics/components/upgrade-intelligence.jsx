"use client";

import React from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Repeat } from "lucide-react";

const initials = (name = "") => name.split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
const money = (cents) => `$${Math.round(Math.abs(cents) / 100).toLocaleString("en-US")}`;

// Live: upgrade prospects (trials and entry-plan accounts that are active this week) and the
// plan changes of the last 30 days. AI likelihood scores come once the AI provider is connected.
export const UpgradeIntelligence = ({ upgrades }) => {
  const prospects = upgrades?.prospects ?? [];
  const changes = upgrades?.changes ?? [];

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs hover:shadow-sm transition-all duration-200 p-5 sm:p-6 flex flex-col gap-5 h-full">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight flex items-center gap-2">
          Upgrade Intelligence
          <span
            title="Identifies accounts showing defined usage and account signals that may indicate a need for a higher plan, helping the team prioritize potential upgrade opportunities. Signals used now: on the free trial or the entry plan, sign-ins in the last 7 days and leads added. An upgrade likelihood score is added once the AI provider is connected (an internal indicator, not a guarantee)."
            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-light-gray text-[10px] font-bold text-medium-black cursor-help"
          >
            i
          </span>
        </h3>
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600"><ArrowUpRight className="w-3.5 h-3.5" /> {upgrades?.upgrades ?? 0} upgrades</span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red"><ArrowDownRight className="w-3.5 h-3.5" /> {upgrades?.downgrades ?? 0} downgrades</span>
          <span className="text-light-black font-medium">30 days</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[560px]">
          <thead>
            <tr className="border-b border-light-gray text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider">
              <th className="pb-3 pr-4">Account</th>
              <th className="pb-3 px-4 text-center">Current Plan</th>
              <th className="pb-3 px-4 text-center">Sign-ins (7 days)</th>
              <th className="pb-3 px-4 text-center">Leads</th>
              <th className="pb-3 pl-4 text-right">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray/60 text-xs">
            {!prospects.length && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-light-black">No upgrade prospects right now.</td>
              </tr>
            )}
            {prospects.map((prospect) => (
              <tr key={prospect.id} className="hover:bg-primary/5 transition-colors">
                <td className="py-3 pr-4">
                  <Link href={`/super-admin/users/${prospect.id}`} className="flex items-center gap-3 group">
                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 text-slate-600 font-semibold text-xs">{initials(prospect.company)}</span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-dark-black/85 group-hover:text-primary truncate">{prospect.company}</span>
                      <span className="block text-[11px] text-light-black">{prospect.seats} seat{prospect.seats === 1 ? "" : "s"}{prospect.isTrial ? " · on trial" : ""}</span>
                    </span>
                  </Link>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${prospect.isTrial ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-sky-50 text-sky-600 border-sky-100"}`}>{prospect.planName}</span>
                </td>
                <td className="py-3 px-4 text-center font-semibold text-dark-black/80">{prospect.logins7d}</td>
                <td className="py-3 px-4 text-center text-dark-black/80">{prospect.leads}</td>
                <td className="py-3 pl-4 text-right text-medium-black">{prospect.repName ?? "Self sign-up"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-light-gray pt-4">
        <p className="text-xs font-bold text-dark-black/80 mb-2.5">Recent plan changes</p>
        {!changes.length && <p className="text-xs text-light-black">No plan changes in the last 30 days.</p>}
        <ul className="space-y-2">
          {changes.slice(0, 5).map((change, index) => (
            <li key={`${change.organizationId}-${index}`} className="flex items-center gap-2.5 text-xs">
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${change.direction === "upgrade" ? "bg-emerald-50 text-emerald-600" : change.direction === "downgrade" ? "bg-red-50 text-red" : "bg-light-gray text-medium-black"}`}>
                {change.direction === "upgrade" ? <ArrowUpRight className="w-3.5 h-3.5" /> : change.direction === "downgrade" ? <ArrowDownRight className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
              </span>
              <span className="flex-1 min-w-0 truncate text-dark-black/80">{change.summary}</span>
              {change.diffCents != null && change.diffCents !== 0 && (
                <span className={`font-semibold whitespace-nowrap ${change.diffCents > 0 ? "text-emerald-600" : "text-red"}`}>{change.diffCents > 0 ? "+" : "-"}{money(change.diffCents)}/mo</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UpgradeIntelligence;
