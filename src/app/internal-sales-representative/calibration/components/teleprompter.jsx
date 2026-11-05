"use client";

import React from "react";

const suggestion =
  'Hi, John, this is <span class="text-white font-medium">[your name]</span> with <span class="text-white font-medium">PitchProX</span>. I noticed your team has been scaling listings in the area, and wanted to see how you\'re currently supporting your agents on outbound calls.';

const TeleprompterCard = () => {
  return (
    <div className="w-full">
      <span className="text-xs font-bold text-primary tracking-wider uppercase block mb-2">
        Your AI Teleprompter
      </span>
      <div className="bg-dark-teal text-white p-4 sm:p-6 rounded-2xl relative overflow-hidden min-h-[100px] sm:min-h-[120px] flex items-center shadow-sm">
        <div className="w-full text-left">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[11px] font-semibold text-primary block">
              Suggested Response for Round 2
            </span>
            <span className="text-[10px] text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full font-medium">
              Speak 1 Response Aloud
            </span>
          </div>
          <p
            className="text-sm text-white/90 leading-relaxed max-w-2xl"
            dangerouslySetInnerHTML={{ __html: suggestion }}
          />
        </div>
      </div>
    </div>
  );
};

export default TeleprompterCard;