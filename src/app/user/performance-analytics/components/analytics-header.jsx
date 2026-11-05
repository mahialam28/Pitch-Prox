"use client";

import React from "react";
import { TrendingUp, MessageSquare, Smile, Target } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import { motion } from "framer-motion";

export const AnalyticsHeader = () => {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col gap-1 min-w-0">
        <Title variant="small" className="!text-dark-black/80">
          Analytics
        </Title>
        <Text variant="small">
          Deep insights to help you close more deals.
        </Text>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Conversion Momentum */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white p-4 sm:p-6 rounded-2xl border border-light-gray shadow-sm flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-100/60 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <Title variant="small" className="!text-dark-black/80 font-bold leading-tight">
              Conversion Momentum
            </Title>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-semibold text-dark-black/90 tracking-tight">37%</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
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
            <div className="h-10 w-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <Title variant="small" className="!text-dark-black/80 font-bold leading-tight">
              Prompt Adherence
            </Title>
          </div>

          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-end gap-3 mt-1">
            <div className="flex flex-col gap-2">
              <span className="text-3xl sm:text-4xl font-semibold text-dark-black/90 tracking-tight leading-none">82%</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-600 text-[11px] font-bold rounded-full w-fit">
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
            <div className="w-full h-2 bg-light-gray rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-300 rounded-full"
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
            <div className="h-10 w-10 rounded-2xl bg-emerald-100/60 text-emerald-600 flex items-center justify-center shrink-0">
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
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span>^ 214% vs baseline</span>
            </div>
          </div>

          <Text variant="small" className="leading-relaxed mt-auto text-dark-black/70">
            Average trust increase across all calls.
          </Text>
        </motion.div>

        {/* Card 4: Quota Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white p-4 sm:p-6 rounded-2xl border border-light-gray shadow-sm flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
              <Target className="h-5 w-5" />
            </div>
            <Title variant="small" className="!text-dark-black/80 font-bold leading-tight">
              Quota Progress
            </Title>
          </div>

          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-semibold text-dark-black/90 tracking-tight">57</span>
              <span className="text-sm font-bold text-light-black/50">/ 100</span>
            </div>
            <div className="inline-block self-start px-2 py-0.5 bg-orange-50 text-orange-500 rounded text-[10px] font-bold tracking-wider">
              ON TRACK
            </div>
          </div>

          <div className="space-y-1.5 mt-auto">
            <div className="w-full h-2 bg-light-gray rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: "57%" }}
              />
            </div>
            <Text variant="small" className="text-dark-black/70 font-medium">
              57% of your weekly goal completed.
            </Text>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AnalyticsHeader;