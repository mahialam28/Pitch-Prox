"use client";

import React from "react";
import { TIER_STYLES, lastActive, rosterStatus } from "../../team-api";

const Card = ({ label, value, note, noteTone = "text-light-black" }) => (
  <div className="bg-white p-3 rounded-xl border border-light-gray shadow-xs flex flex-col justify-between gap-1">
    <span className="text-[10.5px] text-light-black font-medium leading-tight">{label}</span>
    <div className="flex items-baseline justify-between gap-1.5 mt-0.5">
      <span className="text-lg font-bold text-dark-black/90 font-secondary">{value}</span>
      {note && <span className={`text-[10px] font-semibold ${noteTone}`}>{note}</span>}
    </div>
  </div>
);

// Live secondary metrics. Prompt adherence and call duration need call data.
export default function RepMetricCards({ rep, goals }) {
  const status = rosterStatus(rep);
  const tier = TIER_STYLES[rep.tier];
  const momentum = goals.newLeads ? Math.round((goals.qualifiedLeads / goals.newLeads) * 100) : null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
      <div className="bg-white p-3 rounded-xl border border-light-gray shadow-xs flex flex-col justify-between gap-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-dark-black/85">
          <span className={`w-2 h-2 rounded-full ${status.dot}`} />
          <span>Status: {status.label}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-light-black">
          <span className="w-1 h-1 rounded-full bg-light-black/50" />
          <span>Last Active: {lastActive(rep.lastActiveAt)}</span>
        </div>
      </div>
      <Card label="Prompt Adherence" value="—" note="Needs call data" />
      <Card label="Avg. Call Duration" value="—" note="Needs call data" />
      <Card label="Conversion Momentum" value={momentum == null ? "—" : `${momentum}%`} note={`${goals.qualifiedLeads} of ${goals.newLeads} new leads qualified`} />
      <Card label="Customer Accounts" value={rep.accounts} note={`${rep.leads} leads assigned`} />
      <div className="bg-white p-3 rounded-xl border border-light-gray shadow-xs flex flex-col justify-between gap-1">
        <span className="text-[10.5px] text-light-black font-medium leading-tight">Performance Tier</span>
        <div className="flex items-center justify-between gap-1.5 mt-0.5">
          <span className="px-2 py-0.5 rounded-md bg-light-gray/60 text-dark-black/80 border border-light-gray text-[11px] font-bold inline-flex items-center gap-1.5">
            {tier && <span className={`w-1.5 h-1.5 rounded-full ${tier.dot}`} />}
            {tier?.label ?? "No quota"}
          </span>
          <span className="text-[10px] text-light-black font-medium">{rep.attainment == null ? "" : `${rep.attainment}% of quota`}</span>
        </div>
      </div>
    </div>
  );
}
