"use client";

import React from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";

// Dashboard building blocks shared by the admin overview screens (Compliance Overview,
// AI Ethics, SOC 2, Incident Details, Broadcast Campaigns): KPI row, cards, tables, lists.

export const PageHeader = ({ title, subtitle }) => (
  <div>
    <h1 className="text-2xl font-semibold text-dark-black font-secondary">{title}</h1>
    <p className="text-sm text-medium-black mt-1">{subtitle}</p>
  </div>
);

// kpis: [{ label, value, note, trend: "up" | "down" | undefined, good?: boolean }]
export const KpiRow = ({ kpis }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
    {kpis.map((kpi) => (
      <div key={kpi.label} className="bg-white rounded-xl border border-light-gray shadow-xs p-4">
        <p className="text-xs text-medium-black">{kpi.label}</p>
        <p className="text-2xl font-semibold text-dark-black mt-1">{kpi.value}</p>
        <p className={`flex items-center gap-1 text-[11px] font-medium mt-1 ${kpi.good === false ? "text-red-600" : "text-emerald-600"}`}>
          {kpi.trend === "up" && <ArrowUp className="w-3 h-3" />}
          {kpi.trend === "down" && <ArrowDown className="w-3 h-3" />}
          {kpi.note}
        </p>
      </div>
    ))}
  </div>
);

export const Card = ({ title, action, children, className = "" }) => (
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

export const CardLink = ({ href, onClick, children }) =>
  href ? (
    <Link href={href} className="text-xs font-medium text-primary hover:underline">{children}</Link>
  ) : (
    <button type="button" onClick={onClick} className="text-xs font-medium text-primary hover:underline cursor-pointer">{children}</button>
  );

const TONES = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-red-50 text-red-600 border-red-200",
  blue: "bg-blue-50 text-blue-600 border-blue-200",
  gray: "bg-light-gray text-medium-black border-light-gray",
};

export const Badge = ({ tone = "gray", children }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium whitespace-nowrap ${TONES[tone]}`}>{children}</span>
);

export const Progress = ({ value, tone }) => {
  const color = tone ?? (value >= 88 ? "bg-primary" : value >= 75 ? "bg-amber-500" : "bg-red-500");
  return (
    <span className="flex items-center gap-3">
      <span className="w-32 h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <span className={`block h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </span>
      <span className="text-xs text-dark-black">{value}%</span>
    </span>
  );
};

export const Person = ({ name, role }) => (
  <span>
    <span className="block text-xs font-medium text-dark-black">{name}</span>
    {role && <span className="block text-[11px] text-light-black">{role}</span>}
  </span>
);

// columns: [{ key, label, render?(row) }]
export const DataTable = ({ columns, rows, rowKey = (row) => row.id ?? row[columns[0].key] }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[640px] text-left text-xs">
      <thead>
        <tr className="bg-light-gray/60 text-[10px] font-semibold uppercase tracking-wider text-light-black">
          {columns.map((column) => (
            <th key={column.key} className="px-3 py-2.5 font-semibold">{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-light-gray">
        {rows.map((row) => (
          <tr key={rowKey(row)}>
            {columns.map((column) => (
              <td key={column.key} className="px-3 py-3 text-dark-black">{column.render ? column.render(row) : row[column.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// items: [{ title, subtitle, badge?: { tone, label }, href? }]
export const StackedList = ({ items, chevron = false }) => (
  <ul className="divide-y divide-light-gray">
    {items.map((item) => {
      const content = (
        <>
          <span className="flex-1 min-w-0">
            <span className="block text-sm text-dark-black">{item.title}</span>
            {item.subtitle && <span className="block text-[11px] text-light-black">{item.subtitle}</span>}
          </span>
          {item.badge && <Badge tone={item.badge.tone}>{item.badge.label}</Badge>}
          {chevron && <ChevronRight className="w-4 h-4 text-light-black" />}
        </>
      );
      return (
        <li key={item.title}>
          {item.href ? (
            <Link href={item.href} className="flex items-center gap-3 py-3 hover:text-primary">{content}</Link>
          ) : (
            <div className="flex items-center gap-3 py-3">{content}</div>
          )}
        </li>
      );
    })}
  </ul>
);

export const DashboardGrid = ({ main, side }) => (
  <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-5 items-start">
    <div className="flex flex-col gap-5 min-w-0">{main}</div>
    <div className="flex flex-col gap-5">{side}</div>
  </div>
);
