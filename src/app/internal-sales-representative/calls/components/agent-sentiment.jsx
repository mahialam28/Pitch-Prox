import React from 'react';
import { 
  MessageSquare, 
  Clock, 
  Maximize2, 
  PlusCircle, 
  ExternalLink,
  Info,
  X,
  Circle
} from 'lucide-react';

export const AgentSentiment = () => {
  return (
    <div className="w-full font-sans text-[#1e293b]">
      {/* Section Header */}
      <h2 className="text-[18px] font-bold flex items-center gap-2 text-[#0f172a] mb-5 tracking-tight">
        <MessageSquare className="w-5 h-5 text-[#00a884]" />
        <span>5. Agent Sentiment & Responsiveness</span>
      </h2>

      {/* Main Card Wrapper */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Column 1: Sentiment Signal */}
        <div className="lg:col-span-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-100/80 pb-6 lg:pb-0 lg:pr-8">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-[#00a884] uppercase">
              Sentiment Signal
            </span>

            {/* SVG Arc Gauge */}
            <div className="mt-3 flex flex-col items-center justify-center relative">
              <div className="w-[220px] h-[110px] relative flex justify-center items-end">
                <svg className="w-[220px] h-[110px] overflow-visible" viewBox="0 0 100 50">
                  {/* Gray Track */}
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="9"
                    strokeLinecap="round"
                  />
                  {/* Teal Active Track */}
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#00a884"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray="125.66"
                    strokeDashoffset="31"
                  />
                </svg>

                {/* Gauge Score Overlay */}
                <div className="absolute bottom-0 text-center flex flex-col items-center">
                  <span className="text-[22px] font-black text-[#0f172a] tracking-tight leading-none">
                    +0.61
                  </span>
                  <div className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider mt-1 leading-snug text-center">
                    <span className="block">POSITIVE</span>
                    <span className="block">COACHING</span>
                    <span className="block">ALIGNMENT</span>
                  </div>
                </div>
              </div>

              {/* Gauge Range Labels */}
              <div className="w-[220px] flex justify-between text-xs text-[#94a3b8] font-medium px-1 mt-2">
                <span>-1.0</span>
                <span>+1.0</span>
              </div>
            </div>

            {/* Score System Description */}
            <div className="mt-4 text-center px-2">
              <span className="text-[13px] font-bold text-[#475569]">
                Score System: -1.0 (Negative) to +1.0 (Positive)
              </span>
              <p className="text-[13px] text-[#94a3b8] leading-relaxed mt-1">
                This score reflects the positivity, confidence, and clarity in your speech. Positive sentiment improves rapport and drives better call outcomes.
              </p>
            </div>
          </div>

          {/* Key Moments Section */}
          <div className="mt-6 pt-4 border-t border-gray-100/80">
            <span className="text-[11px] font-bold tracking-wider text-[#94a3b8] uppercase">
              Key Moments
            </span>
            <div className="mt-3 space-y-2.5 text-[13px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[#cbd5e1] font-mono">02:55</span>
                  <span className="font-bold text-[#00a884]">+0.48</span>
                </div>
                <span className="text-[#334155] font-semibold">Confident opening</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[#cbd5e1] font-mono">04:12</span>
                  <span className="font-bold text-[#00a884]">+0.62</span>
                </div>
                <span className="text-[#334155] font-semibold">Reassuring tone shift</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[#cbd5e1] font-mono">06:42</span>
                  <span className="font-bold text-[#00a884]">+0.71</span>
                </div>
                <span className="text-[#334155] font-semibold">Strong closing attempt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Adaptability Moments */}
        <div className="lg:col-span-4 flex flex-col justify-start border-b lg:border-b-0 lg:border-r border-gray-100/80 pb-6 lg:pb-0 lg:pr-8 space-y-5">
          <span className="text-[11px] font-bold tracking-wider text-[#00a884] uppercase">
            Adaptability Moments
          </span>

          <div className="space-y-5">
            {/* Moment 1 */}
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-[#f1f5f9] rounded-xl text-[#64748b] shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="pt-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold font-mono text-[#0f172a]">04:12</span>
                  <h4 className="text-[13px] font-bold text-[#0f172a]">Pacing Shift</h4>
                </div>
                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                  You slowed your pacing after early hesitation — supports trust-building.
                </p>
                <a href="#" className="inline-flex items-center gap-1 text-[11px] text-[#3b82f6] hover:underline mt-1">
                  <span>Harvard Study on Trust & Pace</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Moment 2 */}
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-[#f1f5f9] rounded-xl text-[#64748b] shrink-0">
                <Maximize2 className="w-5 h-5" />
              </div>
              <div className="pt-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold font-mono text-[#0f172a]">07:20</span>
                  <h4 className="text-[13px] font-bold text-[#0f172a]">Strategy Shift</h4>
                </div>
                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                  You softened rebuttal phrasing which helped keep the conversation open.
                </p>
                <a href="#" className="inline-flex items-center gap-1 text-[11px] text-[#3b82f6] hover:underline mt-1">
                  <span>Salesforce Research on Adaptability</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Moment 3 */}
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-[#f1f5f9] rounded-xl text-[#64748b] shrink-0">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div className="pt-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold font-mono text-[#0f172a]">02:30</span>
                  <h4 className="text-[13px] font-bold text-[#0f172a]">Tone Adjustment</h4>
                </div>
                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                  You matched the tone to stay aligned with the conversation flow.
                </p>
                <a href="#" className="inline-flex items-center gap-1 text-[11px] text-[#3b82f6] hover:underline mt-1">
                  <span>Psychology Today: Mirroring Effect</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Coaching Tags */}
        <div className="lg:col-span-4 space-y-5">
          <span className="text-[11px] font-bold tracking-wider text-[#00a884] uppercase">
            Coaching Tags
          </span>

          <div className="space-y-4">
            {/* Tag 1 */}
            <div className="space-y-1 pb-3 border-b border-gray-100/80">
              <div className="flex items-center justify-between">
                <span className="bg-[#e6f7f3] text-[#00a884] text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <X className="w-3 h-3 stroke-[3]" /> Reassuring
                </span>
                <span className="text-[11px] font-mono text-[#cbd5e1]">03:18</span>
              </div>
              <p className="text-xs text-[#64748b] leading-relaxed pt-1">
                You acknowledged the concern and provided reassurance with calm tone.
              </p>
            </div>

            {/* Tag 2 */}
            <div className="space-y-1 pb-3 border-b border-gray-100/80">
              <div className="flex items-center justify-between">
                <span className="bg-[#eff6ff] text-[#2563eb] text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <Info className="w-3 h-3" /> Assertive
                </span>
                <span className="text-[11px] font-mono text-[#cbd5e1]">05:44</span>
              </div>
              <p className="text-xs text-[#64748b] leading-relaxed pt-1">
                You stated value clearly and confidently without being pushy.
              </p>
            </div>

            {/* Tag 3 */}
            <div className="space-y-1 pb-3 border-b border-gray-100/80">
              <div className="flex items-center justify-between">
                <span className="bg-[#fff7ed] text-[#ea580c] text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <Circle className="w-2.5 h-2.5 fill-[#ea580c] stroke-none" /> Empathetic
                </span>
                <span className="text-[11px] font-mono text-[#cbd5e1]">04:12</span>
              </div>
              <p className="text-xs text-[#64748b] leading-relaxed pt-1">
                You showed understanding which improved connection.
              </p>
            </div>

            {/* Tag 4 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="bg-[#faf5ff] text-[#9333ea] text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <X className="w-3 h-3 stroke-[3]" /> Confident
                </span>
                <span className="text-[11px] font-mono text-[#cbd5e1]">06:42</span>
              </div>
              <p className="text-xs text-[#64748b] leading-relaxed pt-1">
                You closed with confidence and clarity.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};