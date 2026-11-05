"use client";

import React from "react";
import { AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";

const alertsData = [
  {
    id: "1",
    title: "Churn rate increased 15% this week",
    time: "10m ago",
    icon: AlertTriangle,
    iconColor: "text-rose-500 bg-rose-50",
  },
  {
    id: "2",
    title: "23 accounts have payment failures",
    time: "1h ago",
    icon: AlertCircle,
    iconColor: "text-orange-500 bg-orange-50",
  },
  {
    id: "3",
    title: "Low prompt adherence detected for 8 reps",
    time: "2h ago",
    icon: AlertTriangle,
    iconColor: "text-amber-500 bg-amber-50",
  },
  {
    id: "4",
    title: "Twilio connection latency is above normal",
    time: "3h ago",
    icon: RefreshCw,
    iconColor: "text-blue-500 bg-blue-50",
  },
];

const OperationalAlerts = () => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
          Operational Alerts
        </h3>
      </div>

      {/* Alerts List */}
      <div className="space-y-3.5">
        {alertsData.map((alert) => {
          const Icon = alert.icon;
          return (
            <div
              key={alert.id}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${alert.iconColor}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-medium text-dark-black/80 truncate text-xs">
                  {alert.title}
                </span>
              </div>
              <span className="text-[11px] text-light-black shrink-0 font-normal">
                {alert.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OperationalAlerts;
