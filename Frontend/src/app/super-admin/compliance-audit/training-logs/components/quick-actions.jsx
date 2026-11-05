"use client";

import React from "react";
import Link from "next/link";
import { Users, Download, BookOpen, Layers, ChevronRight } from "lucide-react";

export default function QuickActions({ onActionClick }) {
  const actions = [
    {
      id: "bulk_assign",
      title: "Bulk Assign Training",
      description: "Assign training to multiple employees",
      href: "/super-admin/compliance-audit/training-logs/bulk-assign",
      icon: Users,
      iconBg: "bg-[#EFF4FF]",
      iconColor: "text-[#3B82F6]",
    },
    {
      id: "export_report",
      title: "Export Training Report",
      description: "Download training completion report",
      href: "/super-admin/compliance-audit/training-logs/export-report",
      icon: Download,
      iconBg: "bg-[#F5F3FF]",
      iconColor: "text-[#7C3AED]",
    },
    {
      id: "training_library",
      title: "Training Library",
      description: "View available training courses",
      href: "/super-admin/compliance-audit/training-logs/training-library",
      icon: BookOpen,
      iconBg: "bg-[#ECFDF5]",
      iconColor: "text-[#10B981]",
    },
    {
      id: "manage_categories",
      title: "Manage Categories",
      description: "Add or edit training categories",
      isModal: true,
      icon: Layers,
      iconBg: "bg-[#FAF5FF]",
      iconColor: "text-[#A855F7]",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col gap-3">
      {/* Header */}
      <h3 className="text-base font-bold text-dark-black font-secondary tracking-tight">
        Quick Actions
      </h3>

      {/* Action List */}
      <div className="flex flex-col gap-1.5">
        {actions.map((action) => {
          const Icon = action.icon;

          if (action.isModal) {
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onActionClick?.(action.id)}
                className="w-full flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-light-gray/60 transition-all duration-150 cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl ${action.iconBg} ${action.iconColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
                  >
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs sm:text-[13px] font-bold text-dark-black/90 truncate group-hover:text-primary transition-colors">
                      {action.title}
                    </span>
                    <span className="text-[11px] text-light-black truncate mt-0.5">
                      {action.description}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-light-black/80 shrink-0 group-hover:text-dark-black group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          }

          return (
            <Link
              key={action.id}
              href={action.href}
              className="w-full flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-light-gray/60 transition-all duration-150 cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl ${action.iconBg} ${action.iconColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
                >
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-[13px] font-bold text-dark-black/90 truncate group-hover:text-primary transition-colors">
                    {action.title}
                  </span>
                  <span className="text-[11px] text-light-black truncate mt-0.5">
                    {action.description}
                  </span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-light-black/80 shrink-0 group-hover:text-dark-black group-hover:translate-x-0.5 transition-all" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
