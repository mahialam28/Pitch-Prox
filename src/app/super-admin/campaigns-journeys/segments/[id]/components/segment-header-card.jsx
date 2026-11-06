"use client";

import React from "react";
import {
  Flame,
  AlertCircle,
  Clock,
  UserX,
  Users,
  Calendar,
  User,
  Copy,
  Download,
  Edit3,
} from "lucide-react";

export default function SegmentHeaderCard({
  segment,
  onDuplicate,
  onExport,
  onEdit,
}) {
  const getIcon = (type) => {
    switch (type) {
      case "flame":
        return {
          Icon: Flame,
          bg: "bg-orange-50 text-orange-500",
        };
      case "alert":
        return {
          Icon: AlertCircle,
          bg: "bg-sky-50 text-sky-600",
        };
      case "clock":
        return {
          Icon: Clock,
          bg: "bg-purple-50 text-purple-600",
        };
      case "user":
      default:
        return {
          Icon: UserX,
          bg: "bg-slate-100 text-slate-600",
        };
    }
  };

  const iconConfig = getIcon(segment?.iconType);
  const IconComponent = iconConfig.Icon;

  return (
    <div className="w-full bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
      {/* Left: Icon, Title, Description, Metadata */}
      <div className="flex items-start gap-4 min-w-0">
        <div
          className={`w-12 h-12 rounded-2xl ${iconConfig.bg} flex items-center justify-center shrink-0 shadow-2xs mt-0.5 overflow-hidden`}
        >
          {segment?.iconUrl ? (
            <img
              src={segment.iconUrl}
              alt={segment?.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <IconComponent className="w-6 h-6 stroke-[2.2]" />
          )}
        </div>

        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-dark-black font-secondary tracking-tight">
              {segment?.name || "Segment Name"}
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-light-black max-w-2xl leading-relaxed">
            {segment?.description ||
              "High-intent leads ready for immediate outreach and targeted campaigns."}
          </p>

          {/* Metadata Badges Row */}
          <div className="flex items-center flex-wrap gap-4 sm:gap-5 text-xs text-light-black pt-1">
            <div className="flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-medium-black" />
              <span className="text-dark-black/90 font-bold">{segment?.usersCount}</span>
              <span>users</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">{segment?.type ?? "Dynamic"}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-medium-black" />
              <span>Created {segment?.createdAt || "May 12, 2025"}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-medium-black" />
              <span>Last updated {segment?.updatedAt || "May 18, 2025"}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-medium-black" />
              <span>Creator {segment?.creator || "Daniel Miller"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: 3 Action Buttons */}
      <div className="flex items-center flex-wrap gap-2.5 shrink-0 self-start lg:self-center">
        {onDuplicate && <button
          type="button"
          onClick={onDuplicate}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-light-gray hover:bg-light-gray text-xs sm:text-sm font-semibold text-dark-black/85 rounded-xl transition-colors shadow-2xs cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5 text-light-black" />
          <span>Duplicate</span>
        </button>}

        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-light-gray hover:bg-light-gray text-xs sm:text-sm font-semibold text-dark-black/85 rounded-xl transition-colors shadow-2xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-light-black" />
          <span>Export</span>
        </button>

        {onEdit && <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-medium-teal text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Edit Segment</span>
        </button>}
      </div>
    </div>
  );
}
