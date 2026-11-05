"use client";

import React, { useState } from "react";
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
import { showExportStartedToast, showSavedToast } from "@/lib/toast";
import { NewSupportTicketModal, EscalateTicketModal } from "../users/[id]/components/account-dialogs";

// Design-only Support Dashboard: sample data and local state, no API calls.

const RANGES = ["Last 7 days", "Last 30 days"];

const VOLUME = {
  "Last 7 days": [
    { label: "Mon", created: 48, resolved: 32 },
    { label: "Tue", created: 62, resolved: 45 },
    { label: "Wed", created: 51, resolved: 38 },
    { label: "Thu", created: 70, resolved: 52 },
    { label: "Fri", created: 58, resolved: 46 },
    { label: "Sat", created: 44, resolved: 36 },
    { label: "Sun", created: 40, resolved: 34 },
  ],
  "Last 30 days": [
    { label: "Week 1", created: 318, resolved: 270 },
    { label: "Week 2", created: 352, resolved: 301 },
    { label: "Week 3", created: 296, resolved: 284 },
    { label: "Week 4", created: 373, resolved: 283 },
  ],
};

const KPIS = [
  { label: "Open Tickets", value: "246", note: "+12 today", noteTone: "text-emerald-600", trend: "up", icon: FileText, tone: "bg-blue-50 text-blue-600" },
  { label: "Urgent", value: "18", note: "5 unassigned", noteTone: "text-red-600", icon: AlertTriangle, tone: "bg-red-50 text-red-600" },
  { label: "SLA at Risk", value: "27", note: "11 due within 1 hr", noteTone: "text-amber-600", icon: Clock, tone: "bg-amber-50 text-amber-600" },
  { label: "Avg. First Response", value: "8m 24s", note: "14%", noteTone: "text-emerald-600", trend: "down", icon: Timer, tone: "bg-emerald-50 text-emerald-600" },
  { label: "CSAT", value: "94.6%", note: "1,284 responses", noteTone: "text-light-black", icon: Star, tone: "bg-purple-50 text-purple-600" },
];

const STATUS = [
  { name: "Open", value: 42, color: "#0E9384" },
  { name: "In Progress", value: 31, color: "#3B82F6" },
  { name: "Waiting", value: 17, color: "#F59E0B" },
  { name: "Resolved", value: 10, color: "#98A2B3" },
];

const QUEUE = [
  { id: "#TK-10482", issue: "Login blocked", requester: "Sarah Kim", company: "Acme Co.", category: "Account Access", priority: "Critical", sla: "18 min", urgent: true, status: "Open" },
  { id: "#TK-10479", issue: "Payment failed", requester: "Michael Torres", company: "BrightPath LLC", category: "Billing", priority: "High", sla: "37 min", urgent: true, status: "In Progress" },
  { id: "#TK-10466", issue: "AI disclosure issue", requester: "Emma Carter", company: "Northbridge Media", category: "Compliance", priority: "High", sla: "52 min", urgent: true, status: "Open" },
  { id: "#TK-10458", issue: "Call recording missing", requester: "James Wilson", company: "Summit Growth", category: "Call Monitoring", priority: "Medium", sla: "1 hr 22 min", urgent: false, status: "In Progress" },
  { id: "#TK-10451", issue: "Cannot invite user", requester: "Olivia Chen", company: "Vertex Labs", category: "User Management", priority: "High", sla: "1 hr 48 min", urgent: false, status: "Open" },
];

const AGENTS = [
  { name: "Daniel Park", status: "Online", open: 52, capacity: 87, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80" },
  { name: "Priya Shah", status: "Online", open: 46, capacity: 77, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80" },
  { name: "Marcus Lee", status: "Away", open: 38, capacity: 63, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80" },
  { name: "Aisha Rahman", status: "Online", open: 28, capacity: 47, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80" },
];

const PERFORMANCE = [
  { label: "First Response", value: "8m 24s", change: "14%", good: true, direction: "down", icon: Clock, tone: "border-blue-200 text-blue-500" },
  { label: "Resolution Time", value: "12h 36m", change: "22%", good: true, direction: "down", icon: Clock, tone: "border-blue-200 text-blue-500" },
  { label: "Reopen Rate", value: "3.2%", change: "0.8%", good: true, direction: "down", icon: RotateCcw, tone: "border-purple-200 text-purple-500" },
  { label: "SLA Met", value: "96.1%", change: "2.4%", good: true, direction: "up", icon: CheckCircle2, tone: "border-emerald-200 text-emerald-500" },
];

const ACTIVITY = [
  { text: "Daniel Park assigned #TK-10482 to himself", when: "12 min ago", icon: Hand, tone: "bg-blue-50 text-blue-600" },
  { text: "Priya Shah added a note to #TK-10479", when: "28 min ago", icon: Pencil, tone: "bg-indigo-50 text-indigo-600" },
  { text: "Marcus Lee resolved #TK-10435", when: "1 hour ago", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" },
  { text: "Aisha Rahman escalated #TK-10466 to Level 2", when: "2 hours ago", icon: ArrowUpCircle, tone: "bg-sky-50 text-sky-600" },
  { text: "System auto-assigned #TK-1045", when: "3 hours ago", icon: Settings2, tone: "bg-purple-50 text-purple-600" },
];

const ATTENTION = [
  { count: 5, text: "urgent tickets unassigned" },
  { count: 27, text: "tickets at risk of missing SLA" },
  { count: 3, text: "SLA breaches in the last 24 hours" },
  { count: 7, text: "high-priority tickets awaiting customer response" },
];

const PRIORITY_BADGE = {
  Critical: "bg-red-50 text-red-600 border-red-200",
  High: "bg-orange-50 text-orange-600 border-orange-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-50 text-slate-600 border-slate-200",
};

const STATUS_BADGE = {
  Open: "bg-red-50 text-red-600 border-red-200",
  "In Progress": "bg-blue-50 text-blue-600 border-blue-200",
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
  const [range, setRange] = useState(RANGES[0]);
  const [queue, setQueue] = useState(QUEUE);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [escalating, setEscalating] = useState(null);
  const volume = VOLUME[range];

  const updateTicket = (id, changes) => setQueue((prev) => prev.map((ticket) => (ticket.id === id ? { ...ticket, ...changes } : ticket)));

  const ticketMenu = (ticket) => [
    { label: "View ticket", icon: Eye, onClick: () => router.push("/super-admin/support-tickets") },
    {
      label: "Assign to me",
      icon: UserPlus,
      onClick: () => {
        updateTicket(ticket.id, { status: "In Progress" });
        showSavedToast("Ticket assigned", `${ticket.id} is now assigned to you.`);
      },
    },
    { label: "Escalate", icon: ShieldAlert, onClick: () => setEscalating(ticket.id) },
    { divider: true },
    {
      label: "Mark resolved",
      icon: CheckCircle2,
      disabled: ticket.status === "Resolved",
      onClick: () => {
        updateTicket(ticket.id, { status: "Resolved" });
        showSavedToast("Ticket resolved", `${ticket.id} was marked as resolved.`);
      },
    },
  ];

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
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-medium-black absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button
            type="button"
            onClick={showExportStartedToast}
            className="h-10 inline-flex items-center gap-2 px-4 rounded-lg border border-gray-300 bg-white text-xs font-medium text-dark-black hover:bg-light-gray cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button
            type="button"
            onClick={() => setNewTicketOpen(true)}
            className="h-10 inline-flex items-center gap-2 px-4 rounded-lg bg-primary text-xs font-semibold text-white hover:bg-medium-teal cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Ticket
          </button>
        </div>
      </div>

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
                <span className="text-xl font-semibold text-dark-black">246</span>
                <span className="text-[10px] text-light-black">Total Tickets</span>
              </div>
            </div>
            <ul className="flex-1 space-y-2.5">
              {STATUS.map((entry) => (
                <li key={entry.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-dark-black">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    {entry.name}
                  </span>
                  <span className="font-semibold text-dark-black">{entry.value}%</span>
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
                {queue.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="py-3">
                      <Link href="/super-admin/support-tickets" className="font-semibold text-blue-600 hover:underline">{ticket.id}</Link>
                      <p className="text-[11px] text-light-black">{ticket.issue}</p>
                    </td>
                    <td className="py-3">
                      <p className="font-medium text-dark-black">{ticket.requester}</p>
                      <p className="text-[11px] text-light-black">{ticket.company}</p>
                    </td>
                    <td className="py-3 text-dark-black">{ticket.category}</td>
                    <td className="py-3"><Badge className={PRIORITY_BADGE[ticket.priority]}>{ticket.priority}</Badge></td>
                    <td className={`py-3 font-medium ${ticket.status === "Resolved" ? "text-light-black" : ticket.urgent ? "text-red-600" : "text-amber-600"}`}>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {ticket.status === "Resolved" ? "Met" : ticket.sla}
                      </span>
                    </td>
                    <td className="py-3"><Badge className={STATUS_BADGE[ticket.status]}>{ticket.status}</Badge></td>
                    <td className="py-3 text-center">
                      <ActionMenu label={`Actions for ${ticket.id}`} items={ticketMenu(ticket)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Team Workload" action={<ViewLink href="/super-admin/support-tickets">View team</ViewLink>}>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-light-black border-b border-light-gray">
                <th className="py-2 font-medium">Agent</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium">Open Tickets</th>
                <th className="py-2 font-medium">Capacity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {AGENTS.map((agent) => (
                <tr key={agent.name}>
                  <td className="py-3">
                    <span className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={agent.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                      <span className="font-medium text-dark-black whitespace-nowrap">{agent.name}</span>
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="flex items-center gap-1.5 text-dark-black">
                      <span className={`w-2 h-2 rounded-full ${agent.status === "Online" ? "bg-emerald-500" : "bg-amber-500"}`} />
                      {agent.status}
                    </span>
                  </td>
                  <td className="py-3 text-dark-black">{agent.open}</td>
                  <td className="py-3">
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
                  <p className="flex items-center gap-0.5 text-[10px] text-light-black">
                    <span className="flex items-center text-emerald-600 font-medium">
                      {metric.direction === "up" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {metric.change}
                    </span>
                    vs. previous period
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Recent Activity" action={<ViewLink href="/super-admin/support-tickets">View all</ViewLink>}>
          <ul className="space-y-3">
            {ACTIVITY.map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-xs">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${item.tone}`}>
                  <item.icon className="w-3.5 h-3.5" />
                </span>
                <span className="flex-1 min-w-0 truncate font-medium text-dark-black">{item.text}</span>
                <span className="text-[11px] text-light-black whitespace-nowrap">{item.when}</span>
              </li>
            ))}
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
                  <span className="font-semibold text-red-600 w-5">{item.count}</span>
                  <span className="flex-1">{item.text}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-light-black" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <NewSupportTicketModal
        isOpen={newTicketOpen}
        onClose={() => setNewTicketOpen(false)}
        onCreate={({ subject, category, priority }) =>
          setQueue((prev) => [
            {
              id: `#TK-${10483 + prev.length}`,
              issue: subject,
              requester: "Daniel Miller",
              company: "PitchProX",
              category,
              priority: priority === "Urgent" ? "Critical" : priority,
              sla: "4 hr",
              urgent: priority === "Urgent" || priority === "High",
              status: "Open",
            },
            ...prev,
          ])
        }
      />
      <EscalateTicketModal key={escalating ?? "none"} ticketId={escalating} onClose={() => setEscalating(null)} />
    </div>
  );
}
