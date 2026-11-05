"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { PLATFORM_USERS, STATUS_TONE, formatDay, segmentNamesOf } from "../user-segments";

const Badge = ({ value }) => (
  <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${STATUS_TONE[value] ?? "bg-slate-100 text-slate-600"}`}>{value}</span>
);

const PAGE_SIZE = 8;

// PitchProX users (customers) for segments: User Name, Email, Plan, Subscription Status, Trial Status,
// Call Usage, Calibration Status, Payment Status, Last Login, Signup Date, Segment.
// selectable: checkboxes (used to build or add to Static segments)
export default function UsersTable({ users = PLATFORM_USERS, title = "Users", subtitle, selectable = false, selectedIds = [], onToggle, actions = null }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filtered = users.filter((item) => `${item.name} ${item.email} ${item.plan}`.toLowerCase().includes(query.trim().toLowerCase()));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div className="w-full bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col gap-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-dark-black/85 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-light-black mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-light-black absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search users..."
              aria-label="Search users"
              className="h-9 pl-8 pr-3 rounded-xl border border-light-gray text-xs outline-none focus:border-primary w-56"
            />
          </div>
          {actions}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1200px] text-left">
          <thead>
            <tr className="border-b border-light-gray text-[10px] font-bold text-light-black uppercase tracking-wider whitespace-nowrap">
              {selectable && <th className="py-2.5 pr-2 w-8" />}
              {["User Name", "Email", "Plan", "Subscription Status", "Trial Status", "Call Usage", "Calibration Status", "Payment Status", "Last Login", "Signup Date", "Segment"].map((label) => (
                <th key={label} className="py-2.5 px-2">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray/60 text-xs">
            {!rows.length && (
              <tr>
                <td colSpan={selectable ? 12 : 11} className="py-8 text-center text-light-black">No users match.</td>
              </tr>
            )}
            {rows.map((item) => {
              const segments = segmentNamesOf(item);
              return (
                <tr key={item.id} className="hover:bg-primary/5">
                  {selectable && (
                    <td className="py-3 pr-2">
                      <input type="checkbox" aria-label={`Select ${item.name}`} checked={selectedIds.includes(item.id)} onChange={() => onToggle?.(item.id)} className="accent-primary w-4 h-4 cursor-pointer" />
                    </td>
                  )}
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">{item.initials}</span>
                      <span className="font-semibold text-dark-black/85">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-medium-black">{item.email}</td>
                  <td className="py-3 px-2 font-semibold text-dark-black/80 whitespace-nowrap">{item.plan}</td>
                  <td className="py-3 px-2"><Badge value={item.subscriptionStatus} /></td>
                  <td className="py-3 px-2"><Badge value={item.trialStatus} /></td>
                  <td className="py-3 px-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 rounded-full bg-light-gray overflow-hidden">
                        <div className={`h-full ${item.callUsagePct >= 90 ? "bg-red-500" : item.callUsagePct >= 75 ? "bg-amber-500" : "bg-primary"}`} style={{ width: `${Math.min(100, item.callUsagePct)}%` }} />
                      </div>
                      <span className="text-medium-black">{item.callUsagePct}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-2"><Badge value={item.calibrationStatus} /></td>
                  <td className="py-3 px-2"><Badge value={item.paymentStatus} /></td>
                  <td className="py-3 px-2 text-medium-black whitespace-nowrap">{formatDay(item.lastLogin)}</td>
                  <td className="py-3 px-2 text-medium-black whitespace-nowrap">{formatDay(item.signupDate)}</td>
                  <td className="py-3 px-2 text-medium-black whitespace-nowrap" title={segments.join(", ")}>
                    {segments.length ? `${segments[0]}${segments.length > 1 ? ` +${segments.length - 1}` : ""}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-light-black">
        <span>
          Showing {filtered.length ? (current - 1) * PAGE_SIZE + 1 : 0}–{Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length} users
        </span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: pages }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPage(index + 1)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer ${current === index + 1 ? "bg-primary text-white" : "border border-light-gray text-medium-black hover:bg-light-gray"}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
