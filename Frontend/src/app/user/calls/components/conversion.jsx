"use client";

import React from "react";
import { 
  FileText, 
  Check, 
  Calendar, 
  Star, 
  Activity, 
  ExternalLink 
} from "lucide-react";

export const ConversionIndicators = () => {
  return (
    <div className="w-full font-sans text-[#1e293b]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ================= LEFT CARD: 3. Conversion Indicators ================= */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            {/* Section Header */}
            <h2 className="text-[18px] font-bold flex items-center gap-2 text-[#0f172a] mb-5 tracking-tight">
              <FileText className="w-5 h-5 text-[#00a884]" />
              <span>3. Conversion Indicators</span>
            </h2>

            {/* Call Status Section */}
            <div>
              <span className="text-[11px] font-bold tracking-wider text-[#94a3b8] uppercase">
                Call Status
              </span>
              <div className="mt-2.5 inline-flex items-center gap-2 bg-[#dcfce7] text-[#15803d] px-4 py-1.5 rounded-full font-black text-sm tracking-wide">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>SUCCESS</span>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            {/* Status Description */}
            <p className="text-[13px] text-[#64748b] leading-relaxed mt-4">
              You issued a strong CTA and attempted to schedule a follow-up. Your
              closing was clear and confident, increasing the likelihood of
              conversion.
            </p>
          </div>

          {/* Follow-up Suggestion Box */}
          <div className="mt-8 pt-4 border-t border-gray-100/80 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#f1f5f9] text-[#64748b] shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider text-[#94a3b8] uppercase">
                Follow-Up Suggestion
              </span>
              <h4 className="text-[13px] font-bold text-[#0f172a] mt-1">
                Re-engage within 3 days
              </h4>
              <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                Send a calendar link and short value recap.
              </p>
            </div>
          </div>
        </div>

        {/* ================= RIGHT CARD: 4. Agent Tone & Delivery Feedback ================= */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            {/* Section Header */}
            <h2 className="text-[18px] font-bold flex items-center gap-2 text-[#0f172a] mb-5 tracking-tight">
              <Star className="w-5 h-5 text-[#00a884]" />
              <span>4. Agent Tone & Delivery Feedback</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Subsection: Tone Alignment Waveform */}
              <div className="md:col-span-7">
                <span className="text-[11px] font-bold tracking-wider text-[#00a884] uppercase">
                  Tone Alignment
                </span>

                {/* SVG Waveform Curve */}
                <div className="mt-3 relative h-12 w-full flex items-center">
                  <svg className="w-full h-12 overflow-visible" viewBox="0 0 240 40">
                    <path
                      d="M 0 20 Q 30 10 60 20 T 120 20 T 180 15 T 240 22"
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="2"
                    />
                    {/* Key Moment Dots */}
                    <circle cx="50" cy="18" r="3.5" fill="#22c55e" />
                    <circle cx="108" cy="20" r="3.5" fill="#3b82f6" />
                    <circle cx="162" cy="16" r="3.5" fill="#a855f7" />
                  </svg>
                </div>

                {/* Wave Timeline Timestamps */}
                <div className="flex justify-between text-[11px] text-[#cbd5e1] font-mono px-1 mt-1">
                  <span>00:00</span>
                  <span>02:00</span>
                  <span>04:00</span>
                  <span>06:00</span>
                  <span>07:11</span>
                </div>

                {/* Legend Items */}
                <div className="mt-4 space-y-2 text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e] shrink-0" />
                    <span className="font-bold text-[#0f172a] font-mono">02:55</span>
                    <span className="text-[#64748b]">Warm and confident opening</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#3b82f6] shrink-0" />
                    <span className="font-bold text-[#0f172a] font-mono">04:12</span>
                    <span className="text-[#64748b]">Calmer tone to build trust</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#a855f7] shrink-0" />
                    <span className="font-bold text-[#0f172a] font-mono">06:10</span>
                    <span className="text-[#64748b]">Confident close</span>
                  </div>
                </div>
              </div>

              {/* Right Subsection: Energy Profile */}
              <div className="md:col-span-5 flex flex-col justify-start">
                <span className="text-[11px] font-bold tracking-wider text-[#00a884] uppercase">
                  Energy Profile
                </span>

                <div className="mt-3 flex items-center gap-3">
                  {/* Energy Ring Icon */}
                  <div className="w-12 h-12 rounded-full border-[3px] border-[#00a884] border-t-transparent flex items-center justify-center shrink-0 -rotate-45">
                    <Activity className="w-5 h-5 text-[#00a884] rotate-45" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#0f172a] leading-none">High</h3>
                    <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider mt-1 block">
                      ENERGY LEVEL
                    </span>
                  </div>
                </div>

                <p className="text-[13px] text-[#64748b] leading-relaxed mt-4">
                  Your vocal energy was consistently high and engaging. This kept momentum throughout the call and helped maintain attention.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Reference */}
          <div className="mt-6 pt-4 border-t border-gray-100/80 flex flex-col sm:flex-row sm:items-center justify-between text-[13px] gap-2">
            <div className="text-[#475569]">
              <span className="font-bold">Reference: </span>
              <span className="text-[#64748b]">High energy in sales calls is linked to higher conversion rates.</span>
            </div>
            <a 
              href="#" 
              className="inline-flex items-center gap-1 text-[#3b82f6] hover:underline shrink-0 font-medium"
            >
              <span>Frontiers in Psychology Study</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};