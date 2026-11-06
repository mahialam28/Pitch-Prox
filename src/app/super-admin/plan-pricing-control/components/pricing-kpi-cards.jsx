"use client";

import React from "react";
import { motion } from "framer-motion";
import { Tag, DollarSign, Users, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

// stats: from /api/v1/admin/pricing (MRR counts active paid subscriptions; payments are taken once Stripe is connected)
const dollars = (cents) => `$${Math.round(cents / 100).toLocaleString("en-US")}`;
export const PricingKpiCards = ({ onOpenPromoCodes, stats = null }) => {
  const kpiData = [
    {
      id: "promo-codes",
      title: "Active Promo Codes",
      value: stats ? String(stats.activePromos) : "—",
      badge: "Active",
      badgeStyle: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      actionText: "View all promo codes",
      icon: Tag,
      iconBg: "bg-emerald-50 text-emerald-600",
      onClick: onOpenPromoCodes,
    },
    {
      id: "monthly-revenue",
      title: "Monthly Subscription Revenue",
      value: stats ? dollars(stats.mrrCents) : "—",
      subtext: "Monthly recurring (active plans)",
      actionText: "View revenue report",
      icon: DollarSign,
      iconBg: "bg-purple-50 text-purple-600",
      href: "/super-admin/performance-analytics",
    },
    {
      id: "active-accounts",
      title: "Active Paid Accounts",
      value: stats ? stats.payingCustomers.toLocaleString() : "—",
      subtext: "Accounts",
      actionText: "View accounts",
      icon: Users,
      iconBg: "bg-sky-50 text-sky-600",
      href: "/super-admin/users",
    },
    {
      id: "trial-conversion",
      title: "Accounts on Free Trial",
      value: stats ? stats.trialing.toLocaleString() : "—",
      subtext: "Trialing now",
      actionText: "View accounts",
      icon: TrendingUp,
      iconBg: "bg-amber-50 text-amber-600",
      href: "/super-admin/performance-analytics",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            className="bg-white rounded-2xl border border-light-gray shadow-xs hover:shadow-md transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between group"
          >
            {/* Top Row: Icon + Title & Value */}
            <div className="flex items-start gap-3.5">
              {/* Icon Container */}
              <div
                className={`w-10 h-10 rounded-xl ${kpi.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Title & Value */}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-medium-black truncate">
                  {kpi.title}
                </span>

                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl sm:text-[28px] font-bold text-dark-black/85 tracking-tight leading-none font-secondary">
                    {kpi.value}
                  </h3>

                  {kpi.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full leading-tight ${kpi.badgeStyle}`}
                    >
                      {kpi.badge}
                    </span>
                  )}

                  {kpi.subtext && (
                    <span className="text-xs text-medium-black font-normal">
                      {kpi.subtext}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Action Link */}
            <div className="mt-5 pt-3 border-t border-light-gray/40">
              {kpi.onClick ? (
                <button
                  type="button"
                  onClick={kpi.onClick}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer group-hover:translate-x-0.5 transform duration-150"
                >
                  <span>{kpi.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Link
                  href={kpi.href || "#"}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group-hover:translate-x-0.5 transform duration-150"
                >
                  <span>{kpi.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PricingKpiCards;
