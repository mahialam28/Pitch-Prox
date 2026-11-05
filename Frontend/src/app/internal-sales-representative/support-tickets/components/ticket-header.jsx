"use client";

import React from "react";
import { Mail, Clock, AlertCircle, CheckCircle2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export const TicketHeader = ({
  openCount = 32,
  inProgressCount = 18,
  urgentCount = 7,
  avgResponseTime = "1h 24m",
  // Pass null to hide "Add Ticket"; actions renders extra header buttons (admin portals)
  addTicketHref = "/internal-sales-representative/mail?tab=support-tickets",
  actions = null,
}) => {
  const statCards = [
    {
      id: "open",
      title: "Open Tickets",
      value: openCount,
      icon: Mail,
      iconBg: "bg-[#EBF5FF]",
      iconColor: "text-[#2563EB]",
    },
    {
      id: "in-progress",
      title: "In Progress",
      value: inProgressCount,
      icon: Clock,
      iconBg: "bg-[#EFF6FF]",
      iconColor: "text-[#3B82F6]",
    },
    {
      id: "urgent",
      title: "Urgent / High Priority",
      value: urgentCount,
      icon: AlertCircle,
      iconBg: "bg-[#FEF2F2]",
      iconColor: "text-[#EF4444]",
    },
    {
      id: "performance",
      title: "Avg Response Time",
      value: avgResponseTime,
      icon: CheckCircle2,
      iconBg: "bg-[#ECFDF5]",
      iconColor: "text-[#10B981]",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-5 sm:gap-6">
      {/* ── Page Title & Add Ticket Action ── */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-dark-black tracking-tight">
            Support Tickets
          </h1>
        </div>

        <div className="flex items-center gap-3">
        {actions}
        {addTicketHref && (
        <Link
          href={addTicketHref}
          className="flex items-center gap-1.5 px-4 py-2 sm:py-2.5 bg-primary hover:bg-medium-teal text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </Link>
        )}
        </div>
      </div>

      {/* ── KPI Stat Cards Grid (4 Columns) without view links ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group"
            >
              {/* Left Rounded Icon Box */}
              <div
                className={`w-12 h-12 rounded-2xl ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105`}
              >
                <IconComponent className="w-6 h-6 stroke-[2.2]" />
              </div>

              {/* Right Content Column */}
              <div className="min-w-0 flex flex-col">
                <span className="text-xs font-medium text-light-black truncate leading-tight">
                  {card.title}
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-dark-black tracking-tight leading-none mt-1">
                  {card.value}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TicketHeader;
