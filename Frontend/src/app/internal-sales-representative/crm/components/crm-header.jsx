"use client";

import React from "react";
import { TrendingUp, MessageSquare, Smile } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import { motion } from "framer-motion";

export const CrmHeader = () => {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full flex flex-col gap-1 min-w-0">
        <Title variant="small" className="!text-dark-black/80">
          CRM
        </Title>
        <Text variant="small">
          Manage and track your prospects in one place.
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Conversion Momentum */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white p-4 sm:p-6 rounded-2xl border border-light-gray shadow-sm flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-100/60 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <Title variant="small" className="!text-dark-black/80 font-bold leading-tight">
              Conversion Momentum
            </Title>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-semibold text-dark-black/90 tracking-tight">37%</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
              <span>^ 4.2x</span>
              <span className="text-light-black/60 font-medium">vs PitchProX Benchmark</span>
            </div>
          </div>

          <Text variant="small" className="leading-relaxed mt-auto text-dark-black/70">
            Weighted score of booked meetings, follow-ups, trials and subscriptions.
          </Text>
        </motion.div>

        {/* Card 2: Prompt Adherence */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white p-4 sm:p-6 rounded-2xl border border-light-gray shadow-sm flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <Title variant="small" className="!text-dark-black/80 font-bold leading-tight">
              Prompt Adherence
            </Title>
          </div>

          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-end gap-3 mt-1">
            <div className="flex flex-col gap-2">
              <span className="text-3xl sm:text-4xl font-semibold text-dark-black/90 tracking-tight leading-none">82%</span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded-full w-fit">
                Optimal Zone
              </span>
            </div>
            <Text
              variant="small"
              className="max-w-full xs:max-w-[140px] sm:max-w-[180px] leading-snug text-dark-black/70 pb-1"
            >
              Great job! You&apos;re in the optimal adherence range.
            </Text>
          </div>

          <div className="space-y-1 pt-2">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: "82%" }}
              />
            </div>
            <div className="relative flex justify-between text-[10px] text-light-black/60 font-semibold px-0.5">
              <span>80%</span>
              <span className="absolute left-[82%] -translate-x-1/2 -top-1 font-bold text-dark-black">
                ▼
              </span>
              <span>85%</span>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Trust Gain */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white p-4 sm:p-6 rounded-2xl border border-light-gray shadow-sm flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-teal-50 text-teal-500 flex items-center justify-center flex-shrink-0">
              <Smile className="h-5 w-5" />
            </div>
            <Title variant="small" className="!text-dark-black/80 font-bold leading-tight">
              Trust Gain
            </Title>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-semibold text-dark-black/90 tracking-tight">+21</span>
              <span className="text-sm font-bold text-light-black/50">pts</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
              <span>^ 214% vs baseline</span>
            </div>
          </div>

          <Text variant="small" className="leading-relaxed mt-auto text-dark-black/70">
            Average trust increase across all calls.
          </Text>
        </motion.div>
      </div>
    </div>
  );
};

export default CrmHeader;
