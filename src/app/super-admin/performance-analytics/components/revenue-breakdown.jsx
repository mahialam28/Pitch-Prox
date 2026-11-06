"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#0EADAB", "#6366F1", "#F59E0B", "#3B82F6", "#EC4899", "#10B981", "#8B5CF6"];
const money = (cents) => `$${Math.round(cents / 100).toLocaleString("en-US")}`;

// Live: monthly value of paying subscriptions by plan, plus playbook sales in the last 30 days.
// Report purchases and call overages appear once usage billing (Stripe + calling) is connected.
export const RevenueBreakdown = ({ revenue }) => {
  const plans = revenue?.byPlan ?? [];
  const total = revenue?.totalCents ?? 0;
  const rows = plans.map((plan, index) => ({
    id: plan.id,
    name: `${plan.name} (${plan.accounts})`,
    value: plan.mrrCents,
    color: COLORS[index % COLORS.length],
    amount: money(plan.mrrCents),
    percentage: total ? `${Math.round((plan.mrrCents / total) * 100)}%` : "0%",
  }));
  const playbooks = revenue?.playbookSales;

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs hover:shadow-sm transition-all duration-200 p-5 sm:p-6 flex flex-col h-full">
      <div className="shrink-0">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">Revenue Breakdown</h3>
          <span className="px-3 py-1.5 bg-light-gray/60 rounded-xl text-xs font-semibold text-medium-black">MRR by plan</span>
        </div>
        <p className="text-xs sm:text-sm font-medium text-medium-black mt-1">
          Total MRR: <span className="font-semibold text-dark-black/80">{money(total)}</span>
        </p>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row lg:flex-row xl:flex-col 2xl:flex-row items-center justify-center gap-5 sm:gap-6 xl:gap-4 2xl:gap-8 my-auto py-4 w-full">
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={rows.length ? rows : [{ value: 1 }]} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={rows.length > 1 ? 2 : 0} dataKey="value" strokeWidth={0} isAnimationActive={false}>
                {(rows.length ? rows : [{ color: "#EEF0F2" }]).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-dark-black/80 leading-none tracking-tight">{plans.reduce((sum, plan) => sum + plan.accounts, 0)}</span>
            <span className="text-[9px] font-bold text-medium-black uppercase tracking-wider mt-1">PAYING ACCOUNTS</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full min-w-[200px] max-w-[280px]">
          {!rows.length && <p className="text-xs text-light-black">No paying accounts yet.</p>}
          {rows.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs py-0.5">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-medium-black font-medium truncate">{item.name}</span>
              </div>
              <span className="font-bold text-dark-black/80 whitespace-nowrap">
                {item.amount} ({item.percentage})
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between text-xs py-0.5 pt-2 border-t border-light-gray">
            <span className="text-medium-black font-medium">Playbook sales (30 days)</span>
            <span className="font-bold text-dark-black/80 whitespace-nowrap">{playbooks ? `${money(playbooks.cents)} (${playbooks.purchases})` : "—"}</span>
          </div>
          <p className="text-[10px] text-light-black leading-relaxed">Report purchases and call overages appear once payments and calling are connected.</p>
        </div>
      </div>
    </div>
  );
};

export default RevenueBreakdown;
