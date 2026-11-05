"use client";

import React, { useState } from "react";
import { FiPhoneCall, FiBarChart2 } from "react-icons/fi";
import Text from "@/components/texts/text";
import SettingsDropdown from "@/components/shared/dropdown/settings-dropdown";


const Usage = ({ subscription }) => {
  const usage = subscription?.usage;
  const periodStart = subscription ? new Date(subscription.currentPeriodStart) : null;
  // One option per month since the subscription started (most recent first)
  const monthOptions = [];
  if (periodStart) {
    const cursor = new Date();
    cursor.setDate(1);
    while (monthOptions.length < 12) {
      monthOptions.push({ value: `${cursor.getFullYear()}-${cursor.getMonth()}`, label: cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" }) });
      if (cursor.getFullYear() === periodStart.getFullYear() && cursor.getMonth() === periodStart.getMonth()) break;
      cursor.setMonth(cursor.getMonth() - 1);
    }
  }
  const [pickedMonth, setSelectedMonth] = useState(null);
  const selectedMonth = pickedMonth ?? monthOptions[0]?.value;
  const monthLabel = monthOptions.find((option) => option.value === selectedMonth)?.label ?? "this month";

  const item = (id, label, counts, icon, iconBg, progressBg) => {
    const used = counts?.used ?? 0;
    const total = counts?.total ?? 0;
    return {
      id, label, used, total, icon, iconBg, progressBg,
      percentage: total ? Math.round((used / total) * 100) : 0,
      remainingText: `${Math.max(total - used, 0)} remaining`,
    };
  };
  const usageItems = [
    item("calls", "CALLS USED", usage?.calls, FiPhoneCall, "bg-primary/10 text-primary", "bg-primary"),
    item("reports", "REPORTS USED", usage?.reports, FiBarChart2, "bg-blue-50 text-blue-600", "bg-blue-500"),
  ];

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 md:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Text variant="regular" className="font-bold text-dark-black">
            Usage Overview
          </Text>
          <Text variant="smaller" className="mt-0.5 text-medium-black">
            Your usage for {monthLabel}. Calls and reports are counted once calling is connected.
          </Text>
        </div>

        <SettingsDropdown
          label="Select billing period"
          items={monthOptions}
          selected={selectedMonth}
          onSelect={setSelectedMonth}
          className="min-w-[240px] self-start sm:self-auto"
        />
      </div>

      {/* Progress Items */}
      <div className="space-y-6 pt-2">
        {usageItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 ${item.iconBg}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-light-black tracking-wider block">
                      {item.label}
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-sm font-extrabold text-dark-black">
                        {item.used}
                      </span>
                      <span className="text-xs font-semibold text-light-black">
                        / {item.total}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-dark-black block">
                    {item.percentage}%
                  </span>
                  <span className="text-[10px] font-semibold text-light-black uppercase tracking-wider block">
                    OF PLAN
                  </span>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div className="space-y-1">
                <div className="w-full bg-light-gray rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.progressBg}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-medium text-light-black">
                    {item.remainingText}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Usage;