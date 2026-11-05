"use client";

import React from "react";
import {
  UserCheck,
  Building2,
  FileText,
  ShieldCheck,
  Presentation,
  TrendingUp,
  FolderOpen,
  ArrowRight,
  Upload,
} from "lucide-react";

export const AiTrainingContent = ({ onUpload, onViewGuidelines }) => {
  const cards = [
    {
      id: "sales-bio",
      title: "Sales Bio",
      description: "Your background, experience, achievements, and selling style.",
      icon: UserCheck,
    },
    {
      id: "company-info",
      title: "Company Info",
      description: "Company details, team, values, services, and differentiators.",
      icon: Building2,
    },
    {
      id: "scripts-flows",
      title: "Scripts & Flows",
      description: "Call scripts, talk tracks, voicemails, emails, and workflow templates.",
      icon: FileText,
    },
    {
      id: "objections",
      title: "Objections",
      description: "Common objections and your proven response strategies.",
      icon: ShieldCheck,
    },
    {
      id: "marketing-presentation",
      title: "Marketing & Listing Presentation",
      description: "Listing presentations, marketing materials, offers, and brochures.",
      icon: Presentation,
    },
    {
      id: "past-sales",
      title: "Past Sales Data",
      description: "Anonymized deals, outcomes, pricing, and win/loss insights.",
      icon: TrendingUp,
    },
    {
      id: "other-resources",
      title: "Other Resources",
      description: "Documents, PDFs, videos, images, links, and more.",
      icon: FolderOpen,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-dark-black/80">
          Add Training Content
        </h2>
        <p className="text-medium-black text-sm mt-0.5">
          Choose the type of content you want PitchProX AI to Learn from.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm hover:border-medium-black/20 transition flex flex-col justify-between items-center text-center min-h-[220px]"
            >
              <div className="space-y-3 flex flex-col items-center">
                <div className="p-3 text-primary bg-light-teal rounded-2xl">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-dark-black/80 text-base leading-snug">
                  {card.title}
                </h3>
                <p className="text-light-black text-xs leading-relaxed max-w-[210px]">
                  {card.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onUpload && onUpload(card.id)}
                className="mt-5 py-2.5 px-5 bg-primary/5 hover:bg-primary/10 border border-primary/15 hover:border-primary/30 rounded-xl text-sm font-semibold text-primary hover:text-primary/90 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-xs hover:shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
          );
        })}

        {/* View Guidelines Button Tile */}
        <div className="bg-gradient-to-br from-primary/5 to-light-teal/30 rounded-2xl p-6 border border-primary/10 flex flex-col items-center justify-center gap-4 min-h-[220px]">
          <div className="flex flex-col items-center text-center gap-1.5">
            <div className="p-2.5 rounded-xl bg-light-teal text-primary">
              <ArrowRight className="w-5 h-5" />
            </div>
            <p className="text-[11px] text-light-black leading-relaxed max-w-[180px]">
              View our guidelines to get the best results.
            </p>
          </div>
          <button
            type="button"
            onClick={onViewGuidelines}
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            View Training Guidelines
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiTrainingContent;