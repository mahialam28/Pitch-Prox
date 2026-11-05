"use client";

import React from "react";
import { Info, Home, Clock, Calendar, UserPlus, MessageSquare, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Tooltip from "@/components/modals/tooltip";

const insights = [
  {
    id: 1,
    label: "BEST LEAD TYPE",
    title: "Best Lead Type",
    highlight: "Expired Listings",
    highlightColor: "text-sky-600",
    value: "24%",
    subtext: "Conversion Rate",
    icon: Home,
    iconBg: "bg-sky-50",
    iconColor: "text-sky-500",
    tooltip:
      "Identifies the lead types where you've achieved the strongest conversation outcomes during the selected reporting period. Comparing performance across lead types can help you focus on the opportunities where your approach is most effective.",
  },
  {
    id: 2,
    label: "BEST TIME OF DAY",
    title: "Best Time of Day",
    highlight: "4:00 PM - 6:00 PM",
    highlightColor: "text-indigo-600",
    value: "28%",
    subtext: "Conversion Rate",
    icon: Clock,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-500",
    tooltip:
      "Highlights the time of day when your conversations have produced the strongest results. Use this insight to schedule prospecting during periods when your communication consistently performs best.",
  },
  {
    id: 3,
    label: "BEST DAY OF WEEK",
    title: "Best Time of Week",
    highlight: "Tuesday",
    highlightColor: "text-emerald-600",
    value: "22%",
    subtext: "Conversion Rate",
    icon: Calendar,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    tooltip:
      "Shows which days of the week have generated your strongest conversation outcomes. This can help you prioritize your prospecting schedule and maximize productivity.",
  },
  {
    id: 4,
    label: "HIGHEST TRUST LEAD SOURCE",
    title: "Highest Trust Lead Source",
    highlight: "Pre-Expired Listings",
    highlightColor: "text-teal-600",
    value: "+28 pts",
    subtext: "Avg Trust Gain",
    icon: UserPlus,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-500",
    tooltip:
      "Compares trust development across your lead sources to identify where your conversations tend to build confidence most effectively. Stronger trust often leads to more productive conversations and improved outcomes.",
  },
  {
    id: 5,
    label: "MOST DIFFICULT OBJECTION",
    title: "Most Difficult Objection",
    highlight: "Price",
    highlightColor: "text-orange-500",
    value: "34%",
    subtext: "Of All Objections",
    icon: MessageSquare,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-400",
    tooltip:
      "Identifies the objection categories that have been the most challenging to navigate based on your recent conversations. Reviewing these patterns can help you strengthen your approach where it matters most.",
  },
  {
    id: 6,
    label: "HIGHEST CONVERSION OUTCOME",
    title: "Highest Conversation Outcome",
    highlight: "Appointment Set",
    highlightColor: "text-emerald-600",
    value: "32%",
    subtext: "Of All Outcomes",
    icon: CheckCircle2,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    tooltip:
      "Displays the conversation outcome you've achieved most successfully during the selected reporting period, helping you understand where your current methodology is producing the strongest results.",
  },
];

export const InsightsGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 w-full">
      {insights.map((card, index) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
            className="bg-white p-4 rounded-2xl border border-light-gray shadow-sm flex flex-col justify-between min-h-[175px]"
          >
            {/* Top Label & Info Icon */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] font-bold tracking-wider text-light-black uppercase">
                  {card.label}
                </span>
                <Tooltip title={card.title} text={card.tooltip} align="end">
                  <Info
                    tabIndex={0}
                    aria-label={`More about ${card.title}`}
                    className="w-3.5 h-3.5 text-medium-black/70 shrink-0 transition-colors duration-200 hover:text-primary outline-none"
                  />
                </Tooltip>
              </div>

              {/* Highlight Tagline */}
              <p className={`text-xs font-bold leading-tight ${card.highlightColor}`}>
                {card.highlight}
              </p>
            </div>

            {/* Stat & Subtext */}
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-bold text-dark-black/90 tracking-tight">
                {card.value}
              </div>
              <p className="text-[10px] text-light-black font-medium">
                {card.subtext}
              </p>
            </div>

            {/* Circular Icon Bottom Left */}
            <div
              className={`w-8 h-8 rounded-full ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}
            >
              <Icon className="w-4 h-4" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default InsightsGrid;