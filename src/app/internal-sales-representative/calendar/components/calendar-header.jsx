"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  Volume2,
  Navigation,
} from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import { useCalendarCounts } from "@/app/internal-sales-representative/calendar/components/use-calendar-counts";

const metricCards = [
  {
    id: "today",
    label: "TODAY'S EVENTS",
    value: "5",
    icon: CalendarIcon,
    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  },
  {
    id: "upcoming",
    label: "UPCOMING THIS WEEK",
    value: "12",
    icon: Clock,
    iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-100",
  },
  {
    id: "announcements",
    label: "ACTIVE ANNOUNCEMENTS",
    value: "4",
    icon: Volume2,
    iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
  },
  {
    id: "broadcasts",
    label: "SCHEDULED BROADCASTS",
    value: "3",
    icon: Navigation,
    iconBg: "bg-sky-50 text-sky-600 border border-sky-100",
    iconClass: "-rotate-45",
  },
];

export const CalendarHeader = () => {
  // All four cards are live (events and announcements)
  const counts = useCalendarCounts();
  const valueOf = (card) => counts?.[{ today: "today", upcoming: "upcoming", announcements: "announcements", broadcasts: "scheduled" }[card.id]] ?? "—";
  return (
    <div className="w-full flex flex-col gap-5 sm:gap-6 min-w-0">
      {/* ── Title & Subtitle ── */}
      <div className="w-full flex flex-col gap-1 min-w-0">
        <Title variant="small" className="!text-dark-black/90 font-bold">
          Calendar & Announcements
        </Title>
        <Text variant="small" className="text-medium-black">
          Manage internal events, reminders, and company-wide updates.
        </Text>
      </div>

      {/* ── 4 Metric KPI Cards (without view buttons) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full min-w-0">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              className="bg-white p-5 rounded-2xl border border-light-gray shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 flex items-center gap-4 min-w-0"
            >
              {/* Left Icon Badge */}
              <div
                className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-xs`}
              >
                <Icon className={`w-5 h-5 ${card.iconClass || ""}`} />
              </div>

              {/* Right Content */}
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-light-black truncate">
                  {card.label}
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-dark-black leading-none">
                  {valueOf(card)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarHeader;
