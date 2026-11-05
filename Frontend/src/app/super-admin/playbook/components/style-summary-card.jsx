"use client";

import React from "react";

const StyleSummaryCard = ({
  tone = "Confident, Direct",
  communicationStyle = "Consultative",
  energyLevel = "High",
  sentenceStyle = "Short & Conversational",
  formality = "Professional",
  humor = "Light",
  uniqueVoiceCount = 6,
  corePrinciplesCount = 5,
}) => {
  const summaryItems = [
    { label: "Tone", value: tone },
    { label: "Communication Style", value: communicationStyle },
    { label: "Energy Level", value: energyLevel },
    { label: "Sentence Style", value: sentenceStyle },
    { label: "Formality", value: formality },
    { label: "Humor", value: humor },
    { label: "Unique Voice Phrases", value: uniqueVoiceCount },
    { label: "Core Principles", value: corePrinciplesCount },
  ];

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-3.5">
      <h3 className="text-sm font-bold text-dark-black/80 font-secondary">
        Style Summary
      </h3>

      <div className="space-y-2 divide-y divide-light-gray/60 text-xs">
        {summaryItems.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between gap-3 ${
              idx > 0 ? "pt-2" : ""
            }`}
          >
            <span className="text-medium-black font-normal">{item.label}:</span>
            <span className="font-semibold text-dark-black/80 text-right truncate">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StyleSummaryCard;
