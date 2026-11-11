"use client";

import React from "react";
import { TrendingUp, MessageSquareText, Smile, Target, ArrowUpRight } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

const OverviewStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
      {/* ── Card 1: Conversion Momentum ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-light-gray shadow-xs flex flex-col justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <Title
            variant="small"
            className="!text-dark-black/80 font-bold leading-tight !text-base sm:!text-lg"
          >
            Conversion Momentum
          </Title>
        </div>

        <div className="flex flex-col gap-1 mt-1">
          <span className="text-3xl sm:text-4xl font-bold text-dark-black/85 tracking-tight font-secondary">
            37%
          </span>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>4.2x</span>
            <span className="text-light-black font-medium ml-1">vs PitchProX Benchmark</span>
          </div>
        </div>

        <Text
          variant="smaller"
          className="leading-relaxed text-light-black mt-auto text-xs"
        >
          Weighted score of booked meetings, follow-ups, trials and subscriptions.
        </Text>
      </div>

      {/* ── Card 2: Prompt Adherence ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-light-gray shadow-xs flex flex-col justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <MessageSquareText className="h-5 w-5" />
          </div>
          <Title
            variant="small"
            className="!text-dark-black/80 font-bold leading-tight !text-base sm:!text-lg"
          >
            Prompt Adherence
          </Title>
        </div>

        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-3xl sm:text-4xl font-bold text-dark-black/85 tracking-tight font-secondary">
              82%
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded-full">
              Optimal Zone
            </span>
          </div>
          <Text
            variant="smaller"
            className="text-light-black leading-snug text-xs"
          >
            Great job! You&apos;re in the optimal adherence range.
          </Text>
        </div>

        {/* Slider bar with purple gradient fill */}
        <div className="mt-auto pt-2 flex flex-col gap-1 relative w-full">
          <div className="w-full h-2 bg-light-gray rounded-full relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[82%] rounded-full bg-gradient-to-r from-purple-500 to-indigo-400" />
          </div>

          <div className="relative w-full h-4 mt-0.5 text-[10px] text-light-black font-semibold select-none">
            <span className="absolute left-0">80%</span>

            <div className="absolute left-[82%] top-0 -translate-x-1/2">
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-dark-black/80" />
            </div>

            <span className="absolute right-0">85%</span>
          </div>
        </div>
      </div>

      {/* ── Card 3: Trust Gain ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-light-gray shadow-xs flex flex-col justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Smile className="h-5 w-5" />
          </div>
          <Title
            variant="small"
            className="!text-dark-black/80 font-bold leading-tight !text-base sm:!text-lg"
          >
            Trust Gain
          </Title>
        </div>

        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-bold text-dark-black/85 tracking-tight font-secondary">
              +21
            </span>
            <span className="text-sm font-semibold text-light-black ml-0.5">pts</span>
          </div>
          <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>214% vs baseline</span>
          </div>
        </div>

        <Text
          variant="smaller"
          className="leading-relaxed text-light-black mt-auto text-xs"
        >
          Average trust increase across all calls.
        </Text>
      </div>

      {/* ── Card 4: Lead to Subscription ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-light-gray shadow-xs flex flex-col justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <Title
            variant="small"
            className="!text-dark-black/80 font-bold leading-tight !text-base sm:!text-lg"
          >
            Lead to Subscription
          </Title>
        </div>

        <div className="flex flex-col gap-1 mt-1">
          <span className="text-3xl sm:text-4xl font-bold text-dark-black/85 tracking-tight font-secondary">
            21.6%
          </span>
          <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>2.1%</span>
          </div>
        </div>

        <Text
          variant="smaller"
          className="leading-relaxed text-light-black mt-auto text-xs"
        >
          Average lead to subscription increase across all calls.
        </Text>
      </div>
    </div>
  );
};

export default OverviewStats;
