"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Hand,
  Pencil,
  Plus,
  RotateCcw,
  Settings2,
  ShieldAlert,
  Star,
  Timer,
  Eye,
  UserPlus,
  ArrowUpCircle,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ActionMenu from "@/components/shared/dropdown/action-menu";
import { showSavedToast } from "@/lib/toast";
import { showError } from "@/lib/alerts";
import { apiRequest } from "@/lib/client-api";
import { ProfileAvatar } from "@/components/shared/avatar-editor";
import { EscalateTicketModal } from "../users/[id]/components/account-dialogs";

// Live Support Dashboard (lib/support-dashboard). Every number comes from the ticket records.

const RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];
const STATUS_COLORS = { Open: "#0E9384", "In progress": "#3B82F6", Waiting: "#F59E0B", Resolved: "#98A2B3", Closed: "#D0D5DD" };

const duration = (minutes) => {
  if (minutes == null) return "—";
  if (minutes < 1) return "<1m";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  if (minutes < 60 * 48) return `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}m`;
  return `${Math.round(minutes / 1440)}d`;
};
const ago = (value) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value)) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hour${minutes < 120 ? "" : "s"} ago`;
  return `${Math.floor(minutes / 1440)} day${minutes < 2880 ? "" : "s"} ago`;
};
const slaText = (sla) => (sla.status === "Breached" ? "Breached" : sla.minutesLeft != null ? duration(sla.minutesLeft) : sla.status);

const ACTIVITY_STYLE = {
  reply: { icon: Hand, tone: "bg-blue-50 text-blue-600", verb: "replied to" },
  note: { icon: Pencil, tone: "bg-indigo-50 text-indigo-600", verb: "added a note to" },
  escalated: { icon: ArrowUpCircle, tone: "bg-sky-50 text-sky-600" },
  opened: { icon: Plus, tone: "bg-emerald-50 text-emerald-600" },
  updated: { icon: Settings2, tone: "bg-purple-50 text-purple-600" },
};
const activityText = (item) => (item.summary ? `${item.actor}: ${item.summary}` : `${item.actor} ${ACTIVITY_STYLE[item.kind].verb} TKT-${item.number}`);

const PRIORITY_BADGE = {
  Urgent: "bg-red-50 text-red-600 border-red-200",
  High: "bg-orange-50 text-orange-600 border-orange-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-50 text-slate-600 border-slate-200",
};

const STATUS_BADGE = {
  Open: "bg-red-50 text-red-600 border-red-200",
  "In progress": "bg-blue-50 text-blue-600 border-blue-200",
  Waiting: "bg-amber-50 text-amber-700 border-amber-200",
  Resolved: "bg-emerald-50 text-emerald-600 border-emerald-200",
};

const Card = ({ title, action, className = "", children }) => (
  <section className={`bg-white rounded-2xl border border-light-gray shadow-xs p-5 min-w-0 ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold text-dark-black">{title}</h2>
        {action}
      </div>
    )}
    {children}
  </section>
);

const ViewLink = ({ href, children }) => (
  <Link href={href} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
    {children} <ArrowRight className="w-3 h-3" />
  </Link>
);

const Badge = ({ className, children }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-medium whitespace-nowrap ${className}`}>{children}</span>
);

export default function SupportDashboardPage() {
  const router = useRouter();
  const [range, setRange] = useState("7d");
  const [data, setData] = useState(null);
  const [me, setMe] = useState(null);
  const [agents, setAgents] = useState([]);
  const [escalating, setEscalating] = useState(null);

  const load = useCallback(() => apiRequest(`/api/v1/support/dashboard?range=${range}`).then(setData).catch((error) => showError("Dashboard not loaded", error.message)), [range]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    apiRequest("/api/v1/me").then((result) => setMe(result.user)).catch(() => {});
    apiRequest("/api/v1/staff/agents").then((result) => setAgents(result.results)).catch(() => {});
  }, []);

  const ticketHref = (ticket) => `/super-admin/support-tickets?ticket=${ticket.id}`;
  const update = async (ticket, changes, title, message) => {
    try {
      await apiRequest(`/api/v1/staff/tickets/${ticket.id}`, { method: "PATCH", body: changes });
      showSavedToast(title, message);
      load();
    } catch (error) {
      showError("Ticket not updated", error.message);
    }
  };
  const readOnly = me?.role === "auditor";

  const ticketMenu = (ticket) => [
    { label: "View ticket", icon: Eye, onClick: () => router.push(ticketHref(ticket)) },
    ...(readOnly
      ? []
      : [
          {
            label: "Assign to me",
            icon: UserPlus,
            disabled: !me || ticket.assignedTo?.id === me.id,
            onClick: () => update(ticket, { assignedTo: me.id, ...(ticket.status === "Open" && { status: "In progress" }) }, "Ticket assigned", `${ticket.reference} is now assigned to you.`),
          },
          { label: "Escalate", icon: ShieldAlert, onClick: () => setEscalating(ticket) },
          { divider: true },
          { label: "Mark resolved", icon: CheckCircle2, onClick: () => update(ticket, { status: "Resolved" }, "Ticket resolved", `${ticket.reference} was marked as resolved.`) },
        ]),
  ];

  const kpis = data?.kpis;
  const KPIS = kpis
    ? [
        { label: "Open Tickets", value: kpis.open, note: `${kpis.createdToday} new today`, noteTone: "text-emerald-600", icon: FileText, tone: "bg-blue-50 text-blue-600" },
        { label: "Urgent", value: kpis.urgent, note: `${kpis.urgentUnassigned} unassigned`, noteTone: kpis.urgentUnassigned ? "text-red-600" : "text-light-black", icon: AlertTriangle, tone: "bg-red-50 text-red-600" },
        { label: "SLA at Risk", value: kpis.slaAtRisk, note: `${kpis.dueWithinHour} due within 1 hr`, noteTone: kpis.dueWithinHour ? "text-amber-600" : "text-light-black", icon: Clock, tone: "bg-amber-50 text-amber-600" },
        {
          label: "Avg. First Response",
          value: duration(kpis.firstResponseMinutes),
          note: kpis.firstResponseChange == null ? "No earlier period" : `${Math.abs(kpis.firstResponseChange)}% vs previous`,
          noteTone: kpis.firstResponseChange == null ? "text-light-black" : kpis.firstResponseChange <= 0 ? "text-emerald-600" : "text-red-600",
          trend: kpis.firstResponseChange == null ? null : kpis.firstResponseChange <= 0 ? "down" : "up",
          icon: Timer,
          tone: "bg-emerald-50 text-emerald-600",
        },
        { label: "CSAT", value: "—", note: "Surveys not set up yet", noteTone: "text-light-black", icon: Star, tone: "bg-purple-50 text-purple-600" },
      ]
    : [];
  const STATUS = (data?.status.counts ?? []).filter((entry) => entry.count).map((entry) => ({ name: entry.status, value: entry.count, color: STATUS_COLORS[entry.status] }));
  const statusTotal = data?.status.total ?? 0;
  const perf = data?.performance;
  const PERFORMANCE = perf
    ? [
        { label: "First Response", value: duration(perf.firstResponseMinutes), change: perf.firstResponseChange, unit: "%", lowerIsBetter: true, icon: Clock, tone: "border-blue-200 text-blue-500" },
        { label: "Resolution Time", value: duration(perf.resolutionMinutes), change: perf.resolutionChange, unit: "%", lowerIsBetter: true, icon: Clock, tone: "border-blue-200 text-blue-500" },
        { label: "Escalation Rate", value: perf.escalationRate == null ? "—" : `${perf.escalationRate}%`, change: perf.escalationChange, unit: " pts", lowerIsBetter: true, icon: RotateCcw, tone: "border-purple-200 text-purple-500" },
        { label: "SLA Met", value: perf.slaMetRate == null ? "—" : `${perf.slaMetRate}%`, change: perf.slaMetChange, unit: " pts", lowerIsBetter: false, icon: CheckCircle2, tone: "border-emerald-200 text-emerald-500" },
      ]
    : [];
  const ATTENTION = data
    ? [
        { count: data.attention.urgentUnassigned, text: "urgent tickets unassigned" },
        { count: data.attention.slaAtRisk, text: "tickets at risk of missing SLA" },
        { count: data.attention.breachedLastDay, text: "SLA breaches in the last 24 hours" },
        { count: data.attention.highWaiting, text: "high-priority tickets awaiting customer response" },
      ]
    : [];
  const queue = data?.queue ?? [];
  const volume = data?.volume ?? [];

  return (
    <div className="w-full flex flex-col gap-5 pb-12 font-secondary">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-dark-black">Support Dashboard</h1>
          <p className="text-sm text-medium-black mt-1">Monitor ticket queues, SLA health, and team workload.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Calendar className="w-4 h-4 text-medium-black absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              aria-label="Date range"
              value={range}
              onChange={(event) => setRange(event.target.value)}
              className="h-10 pl-9 pr-9 rounded-lg border border-gray-300 bg-white text-xs font-medium text-dark-black appearance-none cursor-pointer outline-none focus:border-primary"
            >
              {RANGES.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-medium-black absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <a
            href={`/api/v1/support/dashboard/export?range=${range}`}
            className="h-10 inline-flex items-center gap-2 px-4 rounded-lg border border-gray-300 bg-white text-xs font-medium text-dark-black hover:bg-light-gray cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Report
          </a>
          {!readOnly && <Link
            href="/super-admin/mail?tab=support-tickets"
            className="h-10 inline-flex items-center gap-2 px-4 rounded-lg bg-primary text-xs font-semibold text-white hover:bg-medium-teal cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Ticket
          </Link>}
        </div>
      </div>

      {!data && <div className="bg-white rounded-2xl border border-light-gray p-10 text-center text-sm text-medium-black">Loading support data…</div>}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {KPIS.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-light-gray shadow-xs p-4 flex items-start gap-3">
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${kpi.tone}`}>
              <kpi.icon className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-medium-black">{kpi.label}</p>
              <p className="text-2xl font-semibold text-dark-black leading-tight">{kpi.value}</p>
              <p className={`flex items-center gap-0.5 text-[11px] font-medium ${kpi.noteTone}`}>
                {kpi.trend === "up" && <ArrowUp className="w-3 h-3" />}
                {kpi.trend === "down" && <ArrowDown className="w-3 h-3" />}
                {kpi.note}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-5">
        <Card
          title="Ticket Volume"
          action={
            <div className="flex items-center gap-4 text-xs text-medium-black">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0E9384]" /> Created</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" /> Resolved</span>
            </div>
          }
        >
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volume} barGap={4} margin={{ top: 16, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#EAECF0" strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#667085" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#98A2B3" }} />
                <Tooltip cursor={{ fill: "rgba(14,173,171,0.06)" }} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="created" name="Created" fill="#0E9384" radius={[3, 3, 0, 0]} maxBarSize={16}>
                  <LabelList dataKey="created" position="top" style={{ fontSize: 10, fill: "#344054", fontWeight: 600 }} />
                </Bar>
                <Bar dataKey="resolved" name="Resolved" fill="#3B82F6" radius={[3, 3, 0, 0]} maxBarSize={16}>
                  <LabelList dataKey="resolved" position="top" style={{ fontSize: 10, fill: "#344054", fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Ticket Status">
          <div className="flex items-center gap-6">
            <div className="relative w-[140px] h-[140px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={STATUS} dataKey="value" innerRadius={44} outerRadius={68} stroke="none" startAngle={90} endAngle={-270}>
                    {STATUS.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-semibold text-dark-black">{statusTotal}</span>
                <span className="text-[10px] text-light-black">New Tickets</span>
              </div>
            </div>
            <ul className="flex-1 space-y-2.5">
              {!STATUS.length && <li className="text-xs text-light-black">No tickets in this period.</li>}
              {STATUS.map((entry) => (
                <li key={entry.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-dark-black">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    {entry.name}
                  </span>
                  <span className="font-semibold text-dark-black">{entry.value} ({statusTotal ? Math.round((entry.value / statusTotal) * 100) : 0}%)</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      {/* Queue + workload */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-5">
        <Card title="Urgent & SLA Risk Queue" action={<ViewLink href="/super-admin/support-tickets">View all tickets</ViewLink>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead>
                <tr className="text-light-black border-b border-light-gray">
                  <th className="py-2 font-medium">Ticket</th>
                  <th className="py-2 font-medium">Requester</th>
                  <th className="py-2 font-medium">Category</th>
                  <th className="py-2 font-medium">Priority</th>
                  <th className="py-2 font-medium">SLA Remaining</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray">
                {!queue.length && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-light-black">No open tickets. Nice work!</td>
                  </tr>
                )}
                {queue.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="py-3">
                      <Link href={ticketHref(ticket)} className="font-semibold text-blue-600 hover:underline">{ticket.reference}</Link>
                      <p className="text-[11px] text-light-black max-w-[200px] truncate">{ticket.subject}</p>
                    </td>
                    <td className="py-3">
                      <p className="font-medium text-dark-black">{ticket.customer.name}</p>
                      <p className="text-[11px] text-light-black">{ticket.customer.company}</p>
                    </td>
                    <td className="py-3 text-dark-black">{ticket.categoryLabel}</td>
                    <td className="py-3"><Badge className={PRIORITY_BADGE[ticket.priorityLabel]}>{ticket.priorityLabel}</Badge></td>
                    <td className={`py-3 font-medium ${ticket.sla.status === "Met" || ticket.sla.status === "On Track" ? "text-light-black" : ticket.sla.status === "Breached" ? "text-red-600" : "text-amber-600"}`}>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {slaText(ticket.sla)}
                      </span>
                    </td>
                    <td className="py-3"><Badge className={STATUS_BADGE[ticket.status] ?? STATUS_BADGE.Resolved}>{ticket.status}</Badge></td>
                    <td className="py-3 text-center">
                      <ActionMenu label={`Actions for ${ticket.reference}`} items={ticketMenu(ticket)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Team Workload" action={<span className="text-[11px] text-light-black">Capacity = {data?.capacityPerAgent ?? 25} open tickets</span>}>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-light-black border-b border-light-gray">
                <th className="py-2 pr-3 font-medium whitespace-nowrap">Agent</th>
                <th className="py-2 pr-3 font-medium whitespace-nowrap">Status</th>
                <th className="py-2 pr-3 font-medium whitespace-nowrap">Open Tickets</th>
                <th className="py-2 pr-3 font-medium whitespace-nowrap">Capacity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {!(data?.workload ?? []).length && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-light-black">No support agents yet.</td>
                </tr>
              )}
              {(data?.workload ?? []).map((agent) => (
                <tr key={agent.id}>
                  <td className="py-3 pr-3">
                    <span className="flex items-center gap-2">
                      <ProfileAvatar name={agent.name} className="w-7 h-7 !text-[10px] !border" />
                      <span className="font-medium text-dark-black whitespace-nowrap">{agent.name}</span>
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <span className="flex items-center gap-1.5 text-dark-black">
                      <span className={`w-2 h-2 rounded-full ${agent.presence === "Online" ? "bg-emerald-500" : agent.presence === "Away" ? "bg-amber-500" : "bg-slate-300"}`} />
                      {agent.presence}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-dark-black">{agent.openTickets}</td>
                  <td className="py-3 pr-3">
                    <span className="flex items-center gap-2">
                      <span className="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <span className="block h-full rounded-full bg-primary" style={{ width: `${agent.capacity}%` }} />
                      </span>
                      <span className="text-light-black">{agent.capacity}%</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card title="Support Performance">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            {PERFORMANCE.map((metric) => (
              <div key={metric.label} className="flex items-start gap-3">
                <span className={`w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 ${metric.tone}`}>
                  <metric.icon className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-[11px] text-medium-black">{metric.label}</p>
                  <p className="text-lg font-semibold text-dark-black leading-tight">{metric.value}</p>
                  {metric.change == null ? (
                    <p className="text-[10px] text-light-black">No earlier period to compare</p>
                  ) : (
                    <p className="flex items-center gap-0.5 text-[10px] text-light-black">
                      <span className={`flex items-center font-medium ${(metric.change <= 0) === metric.lowerIsBetter ? "text-emerald-600" : "text-red-600"}`}>
                        {metric.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {Math.abs(metric.change)}{metric.unit}
                      </span>
                      vs. previous period
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Recent Activity" action={<ViewLink href="/super-admin/support-tickets">View all</ViewLink>}>
          <ul className="space-y-3">
            {!(data?.activity ?? []).length && <li className="text-xs text-light-black">No ticket activity yet.</li>}
            {(data?.activity ?? []).map((item) => {
              const style = ACTIVITY_STYLE[item.kind] ?? ACTIVITY_STYLE.updated;
              return (
                <li key={item.id} className="flex items-center gap-3 text-xs">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${style.tone}`}>
                    <style.icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="flex-1 min-w-0 truncate font-medium text-dark-black" title={activityText(item)}>{activityText(item)}</span>
                  <span className="text-[11px] text-light-black whitespace-nowrap">{ago(item.createdAt)}</span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card
          title={
            <span className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-4 h-4" /> Attention Needed
            </span>
          }
          action={<ViewLink href="/super-admin/support-tickets">View all</ViewLink>}
        >
          <ul className="divide-y divide-light-gray">
            {ATTENTION.map((item) => (
              <li key={item.text}>
                <Link href="/super-admin/support-tickets" className="flex items-center gap-2 py-2.5 text-xs text-dark-black hover:text-primary">
                  <span className={`font-semibold w-5 ${item.count ? "text-red-600" : "text-light-black"}`}>{item.count}</span>
                  <span className="flex-1">{item.text}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-light-black" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {escalating && (
        <EscalateTicketModal
          ticketId={escalating.reference}
          managers={agents.filter((agent) => agent.role !== "sales_rep").map((agent) => ({ value: agent.id, label: agent.name }))}
          onClose={() => setEscalating(null)}
          onConfirm={async ({ manager, priority, reason }) => {
            await apiRequest(`/api/v1/staff/tickets/${escalating.id}/escalate`, { method: "POST", body: { assignedTo: manager, priority: priority.toLowerCase(), reason } });
            load();
          }}
        />
      )}
    </div>
  );
}
