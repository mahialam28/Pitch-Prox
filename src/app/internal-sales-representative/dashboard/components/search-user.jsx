"use client";

import React, { useState } from "react";
import { Search, UserX } from "lucide-react";
import Link from "next/link";
import Dropdown from "@/components/shared/dropdown/dropdown";

const usersData = [
  {
    id: "1",
    name: "Jennifer Smith",
    company: "Acme Inc.",
    initials: "JS",
    initialsBg: "bg-primary text-white",
    accountId: "ACC-001234",
    subscription: "PREMIUM",
    subscriptionClass: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    status: "Active",
    statusDot: "bg-emerald-500",
    lastActive: "Just now",
  },
  {
    id: "2",
    name: "Michael Chen",
    company: "Innovate Digital",
    initials: "MC",
    initialsBg: "bg-purple-500 text-white",
    accountId: "ACC-001235",
    subscription: "PRO",
    subscriptionClass: "bg-blue-50 text-blue-600 border border-blue-100",
    status: "Active",
    statusDot: "bg-emerald-500",
    lastActive: "12m ago",
  },
  {
    id: "3",
    name: "Sarah Williams",
    company: "Global Solutions",
    initials: "SW",
    initialsBg: "bg-orange-500 text-white",
    accountId: "ACC-001236",
    subscription: "STARTER",
    subscriptionClass: "bg-slate-100 text-slate-600 border border-slate-200",
    status: "Trial",
    statusDot: "bg-blue-500",
    lastActive: "45m ago",
  },
];

const statusOptions = [
  { value: "All Statuses", label: "All Statuses" },
  { value: "Active", label: "Active" },
  { value: "Trial", label: "Trial" },
  { value: "Inactive", label: "Inactive" },
];

const ACCOUNT_STATUS = { active: ["Active", "bg-emerald-500"], trialing: ["Trial", "bg-sky-500"], pending_payment: ["Pending payment", "bg-amber-500"], canceled: ["Inactive", "bg-red-500"] };
const ago = (value) => {
  if (!value) return "Never";
  const minutes = Math.round((Date.now() - new Date(value)) / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
  return `${Math.round(minutes / 1440)}d ago`;
};

// accounts: recent customer accounts from the dashboard API
const SearchUser = ({ accounts } = {}) => {
  const rows = accounts
    ? accounts.map((account) => {
        const [status, statusDot] = ACCOUNT_STATUS[account.status] ?? ACCOUNT_STATUS.active;
        return {
          id: account.id,
          name: account.name,
          company: account.company,
          initials: account.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase(),
          initialsBg: "bg-primary text-white",
          accountId: `ACC-${account.id.slice(-6).toUpperCase()}`,
          subscription: (account.planName ?? "—").toUpperCase(),
          subscriptionClass: "bg-indigo-50 text-indigo-600 border border-indigo-100",
          status,
          statusDot,
          lastActive: ago(account.lastActiveAt),
        };
      })
    : usersData;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  const filteredUsers = rows.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.accountId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All Statuses" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
          Search User
        </h3>
      </div>

      {/* Filter Row: Search Input + Status Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, account..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-light-gray text-xs text-dark-black/80 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
        </div>

        {/* Status Dropdown */}
        <div className="w-full sm:w-[150px] shrink-0">
          <Dropdown
            items={statusOptions}
            selected={statusFilter}
            onSelect={setStatusFilter}
            variant="small"
            className="w-full"
          />
        </div>
      </div>

      {/* Users Table or Empty State */}
      {filteredUsers.length > 0 ? (
        <div className="overflow-x-auto w-full [-ms-overflow-style:none] [scrollbar-width:thin]">
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr className="border-b border-light-gray text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider">
                <th className="pb-3 text-left">USER</th>
                <th className="pb-3 text-left">ACCOUNT ID</th>
                <th className="pb-3 text-center">SUBSCRIPTION</th>
                <th className="pb-3 text-center">STATUS</th>
                <th className="pb-3 text-left">LAST ACTIVE</th>
                <th className="pb-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/60 text-xs">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-light-gray/30 transition-colors">
                  {/* User column (Initials circle + Name & Company) */}
                  <td className="py-3 text-left">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full ${user.initialsBg} flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
                      >
                        {user.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-dark-black/80 text-xs leading-tight whitespace-nowrap">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-light-black font-normal mt-0.5 whitespace-nowrap">
                          {user.company}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Account ID */}
                  <td className="py-3 text-left text-xs font-medium text-medium-black whitespace-nowrap">
                    {user.accountId}
                  </td>

                  {/* Subscription */}
                  <td className="py-3 text-center">
                    <span
                      className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap ${user.subscriptionClass}`}
                    >
                      {user.subscription}
                    </span>
                  </td>

                  {/* Status with Dot */}
                  <td className="py-3 text-center">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-dark-black/80 whitespace-nowrap">
                      <span className={`w-2 h-2 rounded-full ${user.statusDot}`} />
                      <span>{user.status}</span>
                    </span>
                  </td>

                  {/* Last Active */}
                  <td className="py-3 text-left whitespace-nowrap">
                    <span className="text-xs font-normal text-medium-black">
                      {user.lastActive}
                    </span>
                  </td>

                  {/* View Details Action Button */}
                  <td className="py-3 text-right">
                    <Link
                      href={`/internal-sales-representative/users/${user.id}`}
                      className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl border border-light-gray hover:bg-light-gray hover:border-slate-300 text-xs font-semibold text-medium-black hover:text-dark-black/90 transition-colors shadow-2xs whitespace-nowrap"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl bg-light-gray/40 border border-dashed border-light-gray my-2">
          <div className="w-12 h-12 rounded-2xl bg-light-gray flex items-center justify-center text-light-black mb-2.5">
            <UserX className="w-6 h-6 text-light-black" />
          </div>
          <h4 className="text-sm font-bold text-dark-black/80">
            No user found
          </h4>
          <p className="text-xs text-light-black mt-1 max-w-xs leading-relaxed">
            {searchTerm
              ? `No user matching "${searchTerm}". Try checking your search or clear filters.`
              : "No user found with the selected status filter."}
          </p>
          {(searchTerm || statusFilter !== "All Statuses") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All Statuses");
              }}
              className="mt-3 px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchUser;
