"use client";

import React, { useState } from "react";
import { Search, MoreHorizontal, Bell, CalendarClock, Trash2, Award } from "lucide-react";
import toast from "react-hot-toast";
import Dropdown from "@/components/shared/dropdown/dropdown";
import Pagination from "@/components/shared/pagination/pagination";
import { apiRequest, formatDate } from "@/lib/client-api";
import { departmentFilterOptions, statusFilterOptions } from "../training-options";

const CATEGORY_STYLES = {
  security: "bg-[#E8F8F0] text-[#12B76A] border-emerald-200/50",
  "ai ethics": "bg-[#F4EBFF] text-[#7F56D9] border-purple-200/50",
  privacy: "bg-[#EFF8FF] text-[#175CD3] border-blue-200/50",
  compliance: "bg-[#FFF4ED] text-[#FF692E] border-orange-200/50",
};
export function statusBadge(status) {
  if (status === "Completed" || /^(\d+) of \1 Completed$/.test(status)) return "bg-[#E8F8F0] text-[#12B76A]";
  if (/ of \d+ Completed$/.test(status)) return "bg-[#E6F7F7] text-[#0EADAB]";
  if (status === "In Progress") return "bg-[#FEF6E7] text-[#F79009]";
  if (status === "Overdue") return "bg-[#FEE4E2] text-[#F04438]";
  if (status === "Mixed") return "bg-[#F4EBFF] text-[#7F56D9]";
  return "bg-gray-100 text-gray-700";
}
const day = (value) => (value ? formatDate(value.length === 10 ? `${value}T12:00:00` : value) : "—");
const initials = (name) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

function Person({ employee }) {
  return (
    <div className="flex items-center gap-2.5 min-w-[160px]">
      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0">{initials(employee.name)}</div>
      <div className="flex flex-col min-w-0">
        <span className="font-bold text-dark-black truncate leading-tight">{employee.name}</span>
        <span className="text-[11px] text-light-black truncate mt-0.5">{employee.role} · {employee.department}</span>
      </div>
    </div>
  );
}

// Row menu: change the due date, remind, remove (open assignments only)
function RowActions({ item, onChanged }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [due, setDue] = useState(item.dueDate ?? "");
  const run = async (request, message) => {
    try {
      await request();
      toast.success(message);
      setOpen(false);
      setEditing(false);
      onChanged();
    } catch (error) {
      toast.error(error.message);
    }
  };
  const base = `/api/v1/compliance/training/assignments/${item.id}`;
  return (
    <div className="relative">
      <button type="button" aria-label={`Actions for ${item.trainingTitle}`} onClick={() => setOpen((value) => !value)} className="p-1.5 rounded-lg hover:bg-light-gray cursor-pointer">
        <MoreHorizontal className="w-4 h-4 text-medium-black" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-light-gray rounded-xl shadow-lg py-1 z-30 text-xs">
          {editing ? (
            <div className="p-3 space-y-2">
              <label htmlFor={`due-${item.id}`} className="font-semibold text-dark-black/80 block">New due date</label>
              <input id={`due-${item.id}`} type="date" value={due} onChange={(event) => setDue(event.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-light-gray" />
              <button type="button" onClick={() => run(() => apiRequest(base, { method: "PATCH", body: { dueDate: due } }), "Due date changed.")} className="w-full py-1.5 rounded-lg bg-primary text-white font-semibold cursor-pointer">Save</button>
            </div>
          ) : (
            <>
              <button type="button" onClick={() => setEditing(true)} className="w-full px-3 py-2 text-left hover:bg-light-gray/60 flex items-center gap-2 cursor-pointer"><CalendarClock className="w-3.5 h-3.5" /> Change due date</button>
              <button type="button" onClick={() => run(() => apiRequest(`${base}/remind`, { method: "POST" }), "Reminder queued. It's emailed once an email service is connected.")} className="w-full px-3 py-2 text-left hover:bg-light-gray/60 flex items-center gap-2 cursor-pointer"><Bell className="w-3.5 h-3.5" /> Send reminder</button>
              <button type="button" onClick={() => run(() => apiRequest(base, { method: "DELETE" }), "Assignment removed.")} className="w-full px-3 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Remove assignment</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// data: /api/v1/compliance/training. View "assignment" = one row per Training given to someone;
// "employee" = one row per person with a combined status ("2 of 3 Completed", "Mixed", "Overdue").
export default function TrainingTable({ data, onChanged }) {
  const [view, setView] = useState("assignment");
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("All");
  const [department, setDepartment] = useState("All");
  const [category, setCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const term = searchTerm.trim().toLowerCase();
  const assignments = (data?.results ?? []).filter((item) =>
    (!term || `${item.employee.name} ${item.trainingTitle} ${item.employee.role}`.toLowerCase().includes(term)) &&
    (status === "All" || item.status === status) &&
    (department === "All" || item.employee.department === department) &&
    (category === "All" || item.category === category)
  );
  const employees = (data?.employees ?? []).filter((row) =>
    (!term || `${row.employee.name} ${row.assignments.map((item) => item.trainingTitle).join(" ")}`.toLowerCase().includes(term)) &&
    (department === "All" || row.employee.department === department) &&
    (status === "All" || row.assignments.some((item) => item.status === status))
  );
  const rows = view === "assignment" ? assignments : employees;
  const page = Math.min(currentPage, Math.max(1, Math.ceil(rows.length / pageSize)));
  const visible = rows.slice((page - 1) * pageSize, page * pageSize);
  const categoryOptions = [{ value: "All", label: "All Training Types" }, ...(data?.categories ?? []).map((value) => ({ value, label: value }))];
  const pick = (setter) => (value) => { setter(value); setCurrentPage(1); };
  const canManage = Boolean(data?.permissions.manage);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0 sm:min-w-[240px]">
          <Search className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => pick(setSearchTerm)(event.target.value)}
            placeholder="Search training or employee..."
            aria-label="Search training or employee"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-gray bg-white text-xs text-dark-black placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-[135px]"><Dropdown label="All Statuses" items={statusFilterOptions} selected={status} onSelect={pick(setStatus)} variant="sm" className="w-full" /></div>
          <div className="w-[150px]"><Dropdown label="All Departments" items={departmentFilterOptions} selected={department} onSelect={pick(setDepartment)} variant="sm" className="w-full" /></div>
          {view === "assignment" && <div className="w-[155px]"><Dropdown label="All Training Types" items={categoryOptions} selected={category} onSelect={pick(setCategory)} variant="sm" className="w-full" /></div>}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-light-gray shadow-xs overflow-hidden">
        <div className="px-5 pt-4 border-b border-light-gray/70 flex items-center gap-4" role="tablist">
          {[["assignment", "By Assignment", assignments.length], ["employee", "By Employee", employees.length]].map(([id, label, total]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={view === id}
              onClick={() => { setView(id); setCurrentPage(1); }}
              className={`pb-3 px-1 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${view === id ? "border-primary text-primary" : "border-transparent text-medium-black hover:text-dark-black"}`}
            >
              {label} ({total})
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {view === "assignment" ? (
                <tr className="border-b border-light-gray bg-[#FAFCFC] text-[11px] font-semibold text-light-black tracking-wider">
                  <th className="py-3.5 pl-6 pr-3 whitespace-nowrap">EMPLOYEE</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">TRAINING</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">CATEGORY</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">ASSIGNED ON</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">DUE DATE</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">STATUS</th>
                  <th className="py-3.5 pl-1 pr-4 whitespace-nowrap"><span className="sr-only">Actions</span></th>
                </tr>
              ) : (
                <tr className="border-b border-light-gray bg-[#FAFCFC] text-[11px] font-semibold text-light-black tracking-wider">
                  <th className="py-3.5 pl-6 pr-3 whitespace-nowrap">EMPLOYEE</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">TRAININGS</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">NEXT DUE</th>
                  <th className="py-3.5 pl-3 pr-6 whitespace-nowrap">STATUS</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-light-gray/60">
              {visible.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-light-black">{data ? "No training matches these filters." : "Loading training..."}</td></tr>
              )}
              {view === "assignment"
                ? visible.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F9FAFB]/70 transition-colors">
                      <td className="py-3.5 pl-5 pr-3"><Person employee={item.employee} /></td>
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-dark-black/90 whitespace-nowrap">{item.trainingTitle}</span>
                        <span className="block text-[11px] text-light-black">{item.requirement}{item.source === "onboarding" ? " · onboarding" : ""}</span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${CATEGORY_STYLES[item.category.toLowerCase()] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>{item.category}</span>
                      </td>
                      <td className="py-3.5 px-3 text-medium-black whitespace-nowrap">{day(item.assignedOn)}</td>
                      <td className={`py-3.5 px-3 whitespace-nowrap ${item.status === "Overdue" ? "text-[#F04438] font-semibold" : "text-medium-black"}`}>{day(item.dueDate)}</td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusBadge(item.status)}`}>{item.status}</span>
                        {item.completedOn && <span className="block text-[10px] text-light-black mt-0.5">on {day(item.completedOn)}</span>}
                        {item.certificate && (
                          <span className={`flex items-center gap-1 text-[10px] mt-0.5 ${item.certificate.expired ? "text-[#F04438]" : "text-light-black"}`} title={item.certificate.number}>
                            <Award className="w-3 h-3" />
                            {item.certificate.expired ? "Certificate expired" : item.certificate.expiresOn ? `Valid to ${day(item.certificate.expiresOn)}` : "Certificate issued"}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 pl-1 pr-4 text-right">
                        {canManage && item.status !== "Completed" && item.source !== "onboarding" && <RowActions item={item} onChanged={onChanged} />}
                      </td>
                    </tr>
                  ))
                : visible.map((row) => (
                    <tr key={row.employee.id} className="hover:bg-[#F9FAFB]/70 transition-colors align-top">
                      <td className="py-3.5 pl-6 pr-3"><Person employee={row.employee} /></td>
                      <td className="py-3.5 px-3">
                        <ul className="space-y-1">
                          {row.assignments.map((item) => (
                            <li key={item.id} className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.status === "Completed" ? "bg-[#12B76A]" : item.status === "Overdue" ? "bg-[#F04438]" : item.status === "In Progress" ? "bg-[#F79009]" : "bg-gray-300"}`} />
                              <span className="text-dark-black/85">{item.trainingTitle}</span>
                              <span className="text-light-black">· {item.status}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="py-3.5 px-3 text-medium-black whitespace-nowrap">{day(row.nextDue)}</td>
                      <td className="py-3.5 pl-3 pr-6 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusBadge(row.status)}`}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 sm:px-6 border-t border-light-gray/70">
          <Pagination
            currentPage={page}
            totalItems={rows.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            itemLabel={view === "assignment" ? "assignments" : "employees"}
          />
        </div>
      </div>
    </div>
  );
}
