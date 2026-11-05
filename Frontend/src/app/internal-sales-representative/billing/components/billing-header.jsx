"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CircleDollarSign,
  Clock,
  CreditCard,
  RotateCcw,
  Calendar,
  UserX,
} from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

const kpiData = [
  {
    id: "mrr",
    title: "Monthly Recurring Revenue",
    value: "$78,420",
    subtitle: "vs last month",
    trend: { value: "12.4%", isPositive: true },
    icon: CircleDollarSign,
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "past-due",
    title: "Past Due Accounts",
    value: "18",
    subtitle: "$12,430 overdue",
    trend: { value: "5", isPositive: false },
    icon: Clock,
    iconBg: "bg-red/10 text-red",
  },
  {
    id: "failed-payments",
    title: "Failed Payments",
    value: "7",
    subtitle: "$3,210 failed",
    trend: { value: "3", isPositive: false },
    icon: CreditCard,
    iconBg: "bg-amber-50 text-amber-600",
  },
  {
    id: "refunds",
    title: "Refunds This Month",
    value: "$2,110",
    subtitle: "vs last month",
    trend: { value: "8.1%", isPositive: true },
    icon: RotateCcw,
    iconBg: "bg-indigo-50 text-indigo-600",
  },
  {
    id: "renewals",
    title: "Upcoming Renewals",
    value: "24",
    subtitle: "Next 7 days",
    trend: null,
    icon: Calendar,
    iconBg: "bg-sky-50 text-sky-600",
  },
  {
    id: "canceled-accounts",
    title: "Canceled Accounts",
    value: "5",
    subtitle: "This month",
    trend: null,
    icon: UserX,
    iconBg: "bg-orange-50 text-orange-600",
  },
];

export const BillingHeader = () => {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Title & Subtitle */}
      <div className="w-full flex flex-col gap-1 min-w-0">
        <Title variant="small" className="!text-dark-black/80 font-bold">
          Billing Dashboard
        </Title>
        <Text variant="small" className="text-medium-black">
          Manage customer billing, payments, invoices, and subscriptions.
        </Text>
      </div>

      {/* KPI Cards Grid without view buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiData.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-light-gray shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              {/* Card Top: Icon & Trend */}
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0 shadow-xs`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {card.trend && (
                    <div
                      className={`flex items-center gap-0.5 text-xs font-semibold ${card.trend.isPositive ? "text-emerald-600" : "text-red"
                        }`}
                    >
                      <span className="text-[10px]">
                        {card.trend.isPositive ? "▲" : "▼"}
                      </span>
                      <span>{card.trend.value}</span>
                    </div>
                  )}
                </div>

                {/* Card Title & Value */}
                <div className="mt-3.5">
                  <p className="text-xs font-medium text-medium-black leading-tight">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-dark-black/80 tracking-tight mt-1">
                    {card.value}
                  </p>
                  <p className="text-[11px] text-light-black font-medium mt-0.5">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BillingHeader;
