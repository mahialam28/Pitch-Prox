"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import CampaignMetrics from "./campaign-metrics";
import ActiveJourneysSection from "./active-journeys-section";
import { Card, DataTable } from "@/components/shared/dashboard-ui";
import { percent } from "../campaign-api";

// Analytics (live): email volume by day, journey funnel and the most-used templates.
// Opens and clicks fill in once an email service reports them.
export default function AnalyticsSection({ overview, journeys = [], segments = [] }) {
  const series = overview?.series ?? [];
  const entered = journeys.reduce((sum, journey) => sum + journey.stats.entered, 0);
  const emailed = journeys.reduce((sum, journey) => sum + (journey.stats.emails ? Math.min(journey.stats.entered, journey.stats.emails) : 0), 0);
  const goals = journeys.reduce((sum, journey) => sum + journey.stats.goals, 0);
  const funnel = [
    { label: "Entered a journey", value: entered },
    { label: "Got at least one email", value: emailed },
    { label: "Reached the goal", value: goals },
  ];
  return (
    <div className="w-full flex flex-col gap-6">
      <CampaignMetrics overview={overview} />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
        <div className="xl:col-span-7 flex flex-col gap-6 w-full min-w-0">
          <Card title="Email Activity (14 days)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#EAECF0" strokeDasharray="3 3" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#667085" }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#98A2B3" }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="queued" name="Created" fill="#0E9384" radius={[3, 3, 0, 0]} maxBarSize={14} />
                  <Bar dataKey="sent" name="Delivered" fill="#3B82F6" radius={[3, 3, 0, 0]} maxBarSize={14} />
                  <Bar dataKey="opened" name="Opened" fill="#8B5CF6" radius={[3, 3, 0, 0]} maxBarSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <ActiveJourneysSection journeys={journeys} segments={segments} title="Journey Performance" />
        </div>
        <div className="xl:col-span-5 flex flex-col gap-6 w-full min-w-0">
          <Card title="Journey Funnel (all time)">
            <div className="space-y-3">
              {funnel.map((step) => (
                <div key={step.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-dark-black/80 font-medium">{step.label}</span>
                    <span className="font-semibold text-dark-black">{step.value} <span className="text-light-black font-normal">({percent(step.value, entered)})</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-light-gray overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: entered ? `${Math.round((step.value / entered) * 100)}%` : 0 }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Email Sources (30 days)">
            <DataTable
              rowKey={(row) => row.source}
              rows={[
                { source: "Broadcast campaigns", count: overview?.mail.fromCampaigns ?? 0 },
                { source: "Lifecycle journeys", count: overview?.mail.fromJourneys ?? 0 },
                { source: "Transactional (events)", count: overview?.mail.transactional ?? 0 },
              ]}
              columns={[
                { key: "source", label: "Source" },
                { key: "count", label: "Emails" },
              ]}
            />
          </Card>
          <Card title="Top Templates (30 days)">
            {overview?.topTemplates?.length ? (
              <DataTable
                rowKey={(row) => row.id}
                rows={overview.topTemplates}
                columns={[
                  { key: "name", label: "Template", render: (row) => <span><span className="block font-medium text-dark-black">{row.name}</span><span className="block text-[11px] text-light-black">{row.emailType}</span></span> },
                  { key: "emails", label: "Emails" },
                  { key: "open", label: "Open Rate", render: (row) => percent(row.opened, row.sent) },
                  { key: "click", label: "Click Rate", render: (row) => percent(row.clicked, row.sent) },
                ]}
              />
            ) : (
              <p className="text-sm text-light-black">No emails in the last 30 days.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
