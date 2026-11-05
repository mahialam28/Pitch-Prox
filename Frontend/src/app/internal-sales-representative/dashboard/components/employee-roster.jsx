"use client";

import React from "react";
import { Sprout, Briefcase, Shield, Eye, Headphones } from "lucide-react";

const rolesData = [
  {
    id: "sales_reps",
    label: "SALES REPS",
    count: 98,
    icon: Sprout,
    iconColor: "text-emerald-600 bg-emerald-50",
  },
  {
    id: "managers",
    label: "MANAGERS",
    count: 24,
    icon: Briefcase,
    iconColor: "text-purple-600 bg-purple-50",
  },
  {
    id: "admins",
    label: "ADMINS",
    count: 12,
    icon: Shield,
    iconColor: "text-blue-600 bg-blue-50",
  },
  {
    id: "auditors",
    label: "AUDITORS",
    count: 9,
    icon: Eye,
    iconColor: "text-orange-500 bg-orange-50",
  },
  {
    id: "support",
    label: "SUPPORT",
    count: 13,
    icon: Headphones,
    iconColor: "text-teal-600 bg-teal-50",
  },
];

// roster: [{ role, count }] from the dashboard API
const ROSTER_ROLES = { sales_reps: ["sales_rep"], managers: ["admin_manager"], admins: ["super_admin"], auditors: ["auditor"], support: ["support"] };
const EmployeeRoster = ({ roster } = {}) => {
  const pillars = roster ? rolesData.map((pillar) => ({ ...pillar, count: roster.filter((row) => ROSTER_ROLES[pillar.id]?.includes(row.role)).reduce((sum, row) => sum + row.count, 0) })) : rolesData;
  const total = pillars.reduce((sum, pillar) => sum + pillar.count, 0);
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
          Employee Roster
        </h3>
        <span className="text-xs font-semibold text-light-black">
          Total Employees: {total}
        </span>
      </div>

      {/* 5 Role Pillars */}
      <div className="grid grid-cols-5 gap-2 sm:gap-4 text-center items-center">
        {pillars.map((role) => {
          const Icon = role.icon;
          return (
            <div key={role.id} className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${role.iconColor}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold text-light-black uppercase tracking-wider line-clamp-1">
                {role.label}
              </span>
              <span className="text-lg sm:text-xl font-bold text-dark-black/85 tracking-tight font-secondary">
                {role.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmployeeRoster;
