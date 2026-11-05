"use client";

import React from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronRight } from "lucide-react";

// Fixed colour per stage so a stage looks the same on every visit
const stageColors = {
  New: "#3B82F6",
  Attempted: "#94A3B8",
  Contacted: "#0EADAB",
  "In Conversation": "#6366F1",
  "Follow-Up": "#F59E0B",
  Qualified: "#2DD4BF",
  "Appointment Set": "#10B981",
  Archived: "#CBD5E1",
};

const LeadPipeline = ({ pipeline = [] }) => {
  const totalLeads = pipeline.reduce((acc, curr) => acc + curr.value, 0);
  const pipelineData = pipeline.map((item) => ({
    ...item,
    percentage: totalLeads ? Math.round((item.value / totalLeads) * 100) : 0,
    color: stageColors[item.name] || "#94A3B8",
  }));

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-sm flex flex-col h-full w-full justify-between overflow-hidden">
      <div className="p-4 sm:p-6 pb-4">
        {/* Header / Label at Top */}
        <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-bold text-dark-black/80">
            Lead Pipeline Overview
          </h2>
        </div>

        {totalLeads === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-2 py-10">
            <p className="text-sm font-semibold text-dark-black/70">No leads yet</p>
            <p className="text-xs text-light-black max-w-[220px]">Add your first lead to see how your pipeline is distributed.</p>
            <Link
              href="/user/leads/add"
              className="mt-2 px-4 py-2 text-xs font-semibold text-primary border border-primary rounded-xl hover:bg-primary/5 transition-colors"
            >
              Add a lead
            </Link>
          </div>
        ) : (
        <>
        {/* Donut Chart */}
        <div className="relative w-full h-[160px] sm:h-[180px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pipelineData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={68}
                paddingAngle={0}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {pipelineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute text-center flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-dark-black/90 tracking-tight">
              {totalLeads}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-dark-black/60 mt-0.5">
              Total Leads
            </span>
          </div>
        </div>

        {/* Pipeline List */}
        <div className="mt-4 space-y-3 px-2">
          {pipelineData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm font-semibold">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-dark-black/80 font-medium">{item.name}</span>
              </div>
              <div className="flex items-baseline gap-1 text-dark-black/90">
                <span>{item.value}</span>
                <span className="text-xs text-dark-black/60 font-normal">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
        </>
        )}
      </div>

      {/* Footer Link */}
      <Link
        href="/user/leads"
        className="w-full border-t border-light-gray py-3 sm:py-4 px-4 sm:px-6 flex items-center justify-between text-sm font-bold text-dark-black/80 hover:bg-primary/5 hover:border-primary/30 transition-colors group cursor-pointer"
      >
        <span>View All Leads</span>
        <ChevronRight className="w-4 h-4 text-light-black group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
};

export default LeadPipeline;
