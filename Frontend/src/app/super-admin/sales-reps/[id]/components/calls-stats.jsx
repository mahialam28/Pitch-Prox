import React from "react";
import { Phone, Smartphone, Clock, Star, CheckCircle2 } from "lucide-react";

const stats = [
  {
    icon: Phone,
    iconBg: "bg-emerald-50 text-emerald-600",
    label: "Total Calls",
    value: "186",
    trend: "12.4% vs last 30 days",
    positive: true,
  },
  {
    icon: Smartphone,
    iconBg: "bg-blue-50 text-blue-600",
    label: "Connected Calls",
    value: "142 (76.3%)",
    trend: "8.7% vs last 30 days",
    positive: true,
  },
  {
    icon: Clock,
    iconBg: "bg-purple-50 text-purple-600",
    label: "Avg Call Duration",
    value: "18m 42s",
    trend: "6.3% vs last 30 days",
    positive: true,
  },
  {
    icon: Star,
    iconBg: "bg-orange-50 text-orange-600",
    label: "Avg Call Score",
    value: "78 / 100",
    trend: "5.7 pts vs last 30 days",
    positive: true,
  },
  {
    icon: CheckCircle2,
    iconBg: "bg-teal-50 text-teal-600",
    label: "Positive Outcomes",
    value: "138 (74.2%)",
    trend: "10.2% vs last 30 days",
    positive: true,
  },
];

export default function CallsStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 w-full">
      {stats.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl p-3.5 sm:p-4 border border-light-gray shadow-xs flex flex-col justify-between gap-2"
          >
            {/* Top Icon & Label */}
            <div className="flex items-center gap-2">
              <div
                className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg}`}
              >
                <IconComponent className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-semibold text-light-black">
                {item.label}
              </span>
            </div>

            {/* Value & Trend */}
            <div className="mt-1">
              <h3 className="text-xl font-bold text-dark-black/90 font-secondary tracking-tight">
                {item.value}
              </h3>
              <p className="text-[10.5px] font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
                <span>↑</span>
                <span>{item.trend}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
