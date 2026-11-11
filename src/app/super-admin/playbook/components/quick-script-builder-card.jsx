"use client";

import React from "react";
import {
  Code2,
  Phone,
  ShieldCheck,
  Mail,
  BookOpen,
  PlusCircle,
} from "lucide-react";

const BUILDER_ITEMS = [
  {
    id: "call-opener",
    type: "Call Openers",
    icon: Phone,
    title: "New Call Opener",
    description: "Create a new opening line or script",
  },
  {
    id: "objection-script",
    type: "Objection Script",
    icon: ShieldCheck,
    title: "New Objection Script",
    description: "Add a new objection response",
  },
  {
    id: "email-template",
    type: "Email Template",
    icon: Mail,
    title: "New Email Template",
    description: "Create a follow-up email",
  },
  {
    id: "guide-resource",
    type: "Guide",
    icon: BookOpen,
    title: "New Guide / Resource",
    description: "Add a training guide or resource",
  },
  {
    id: "other-resource",
    type: "Other",
    icon: PlusCircle,
    title: "New Other Resource",
    description: "Add any other type of resource",
  },
];

// Each card opens the Resources & Scripts "Add Resource" window with that type (onCreate(type))
const QuickScriptBuilderCard = ({ onCreate = () => {} }) => {
  const handleCardClick = (type) => onCreate(type);

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 sm:p-7 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-mono text-base font-bold">
          &lt;/&gt;
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-dark-black/80 font-secondary">
            Quick Script Builder
          </h3>
          <p className="text-xs text-medium-black mt-0.5 font-normal">
            Create new scripts and templates directly in the platform.
          </p>
        </div>
      </div>

      {/* Grid of 5 action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {BUILDER_ITEMS.map((item) => {
          const IconComp = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleCardClick(item.type)}
              className="flex flex-col items-start p-4 rounded-2xl border border-light-gray hover:border-primary/40 hover:bg-primary/[0.02] bg-white transition-all cursor-pointer group text-left shadow-2xs hover:shadow-xs"
            >
              {/* Icon */}
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <IconComp className="w-4 h-4" />
              </div>

              {/* Title */}
              <h4 className="text-xs font-bold text-dark-black/90 font-secondary group-hover:text-primary transition-colors">
                {item.title}
              </h4>

              {/* Description */}
              <p className="text-[11px] text-light-black font-normal mt-1 leading-snug">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default QuickScriptBuilderCard;
