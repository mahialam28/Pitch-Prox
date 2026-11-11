"use client";

import React from "react";
import { Triangle, Mail, Eye, Layers, AlertTriangle } from "lucide-react";
import { percent } from "../campaign-api";

// Live KPIs from GET /api/v1/campaigns/overview (last 30 days)
export default function CampaignMetrics({ overview }) {
  const mail = overview?.mail;
  const metrics = [
    {
      id: "active-journeys",
      label: "LIVE JOURNEYS",
      value: overview ? String(overview.journeys.active) : "—",
      subtext: overview ? `${overview.enrollments.active} users in a journey now` : "",
      subtextColor: "text-emerald-600",
      icon: Triangle,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "emails-sent",
      label: "EMAILS (30 DAYS)",
      value: mail ? mail.total.toLocaleString("en-US") : "—",
      subtext: mail ? (overview.providerConnected ? `${mail.sent} sent · ${mail.delivered ?? 0} delivered` : `${mail.queued} waiting for an email service`) : "",
      subtextColor: overview?.providerConnected ? "text-emerald-600" : "text-amber-600",
      icon: Mail,
      iconBg: "bg-sky-50 text-sky-600",
    },
    {
      id: "open-rate",
      label: "OPEN RATE",
      value: mail ? percent(mail.opened, mail.sent) : "—",
      subtext: mail?.sent ? `${mail.clicked} clicks` : "Needs delivered emails",
      subtextColor: "text-light-black",
      icon: Eye,
      iconBg: "bg-purple-50 text-purple-600",
    },
    {
      id: "goal-conversion",
      label: "JOURNEY GOALS (30 DAYS)",
      value: overview ? percent(overview.enrollments.goals30, overview.enrollments.entered30) : "—",
      subtext: overview ? `${overview.enrollments.goals30} of ${overview.enrollments.entered30} who entered` : "",
      subtextColor: "text-emerald-600",
      icon: Layers,
      iconBg: "bg-orange-50 text-orange-500",
    },
    {
      id: "failed",
      label: "FAILED / SKIPPED",
      value: mail ? String(mail.failed + mail.skipped) : "—",
      subtext: mail ? (mail.failed ? `${mail.failed} failed` : `${mail.skipped} skipped (unsubscribed)`) : "",
      subtextColor: mail?.failed ? "text-red" : "text-light-black",
      icon: AlertTriangle,
      iconBg: "bg-red/10 text-red",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
      {metrics.map((item) => {
        const IconComponent = item.icon;
        return (
          <div key={item.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-light-gray shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-[11px] font-bold text-light-black uppercase tracking-wider">{item.label}</span>
                <span className="text-xl sm:text-2xl font-bold text-dark-black/85 tracking-tight font-secondary mt-1">{item.value}</span>
              </div>
              <div className={`h-9 w-9 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                <IconComponent className="h-4 w-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-2.5">
              <span className={`text-[11px] font-semibold ${item.subtextColor}`}>{item.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
