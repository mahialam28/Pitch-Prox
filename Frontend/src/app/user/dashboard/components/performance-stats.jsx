import React from "react";
import { TrendingUp, MessageSquareText, Smile } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import NoCallData from "./no-call-data";

const PerformanceStatsGrid = ({ metrics = { totalLeads: 0, qualifiedLeads: 0, conversionRate: 0 } }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
      
      {/* --- Card 1: Conversion Momentum (Emerald) --- */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-light-gray shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-100/60 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <Title
            variant="small"
            className=" !text-dark-black/80 font-bold leading-tight"
          >
            Conversion Momentum
          </Title>
        </div>
        
        <div className="flex flex-col gap-1 mt-1">
          <span className="text-3xl sm:text-4xl font-semibold text-dark-black/90 tracking-tight">{metrics.conversionRate}%</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <span>{metrics.qualifiedLeads} of {metrics.totalLeads} leads qualified</span>
          </div>
        </div>
        
        <Text
          variant="small"
          className="leading-relaxed mt-auto text-dark-black/70"
        >
          Share of your leads that reached Qualified or Appointment Set.
        </Text>
      </div>

      {/* --- Card 2: Prompt Adherence (Purple) --- */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-light-gray shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
            <MessageSquareText className="h-5 w-5" />
          </div>
          <Title
            variant="small"
            className=" !text-dark-black/80 font-bold leading-tight"
          >
            Prompt Adherence
          </Title>
        </div>

        <NoCallData message="Adherence to your playbook is scored on every call." className="flex-1" />
      </div>

      {/* --- Card 3: Trust Gain (Emerald) --- */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-light-gray shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-100/60 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Smile className="h-5 w-5" />
          </div>
          <Title
            variant="small"
            className=" !text-dark-black/80 font-bold leading-tight"
          >
            Trust Gain
          </Title>
        </div>

        <NoCallData message="Trust gain is measured across your completed calls." className="flex-1" />
      </div>

    </div>
  );
};

export default PerformanceStatsGrid;
