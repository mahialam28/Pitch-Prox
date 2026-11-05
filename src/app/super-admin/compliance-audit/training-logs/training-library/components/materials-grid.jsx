"use client";

import React, { useState } from "react";
import {
  FileText,
  FileCode,
  Video,
  Download,
  Users,
  Eye,
  Play,
} from "lucide-react";
import toast from "react-hot-toast";
import { TrainingPreviewModal, TrainingVideoModal } from "./training-material-modals";

const initialMaterialsList = [
  {
    id: "lib-1",
    title: "Security Awareness Training",
    format: "PDF",
    category: "Security",
    meta: "24 pages",
    updatedDate: "Updated May 10, 2024",
    assignedCount: "156 assigned",
    actionLabel: "Preview",
    iconType: "pdf",
  },
  {
    id: "lib-2",
    title: "Data Privacy & Protection",
    format: "Video",
    category: "Privacy",
    meta: "18 min",
    updatedDate: "Updated May 8, 2024",
    assignedCount: "142 assigned",
    actionLabel: "Watch",
    iconType: "video",
  },
  {
    id: "lib-3",
    title: "AI Ethics & Responsible Use",
    format: "Document",
    category: "AI Ethics",
    meta: "1.8 MB",
    updatedDate: "Updated May 5, 2024",
    assignedCount: "128 assigned",
    actionLabel: "Preview",
    iconType: "doc",
  },
  {
    id: "lib-4",
    title: "Security Awareness Training",
    format: "PDF",
    category: "Security",
    meta: "24 pages",
    updatedDate: "Updated May 10, 2024",
    assignedCount: "156 assigned",
    actionLabel: "Preview",
    iconType: "pdf",
  },
  {
    id: "lib-5",
    title: "Data Privacy & Protection",
    format: "Video",
    category: "Privacy",
    meta: "18 min",
    updatedDate: "Updated May 8, 2024",
    assignedCount: "142 assigned",
    actionLabel: "Watch",
    iconType: "video",
  },
  {
    id: "lib-6",
    title: "AI Ethics & Responsible Use",
    format: "Document",
    category: "AI Ethics",
    meta: "1.8 MB",
    updatedDate: "Updated May 5, 2024",
    assignedCount: "128 assigned",
    actionLabel: "Preview",
    iconType: "doc",
  },
];

export default function MaterialsGrid({ materials = initialMaterialsList }) {
  const [viewing, setViewing] = useState(null);
  const isVideo = viewing?.format === "Video";
  const getCategoryBadge = (category) => {
    switch (category?.toLowerCase()) {
      case "security":
        return "bg-[#E8F8F0] text-[#12B76A]";
      case "privacy":
        return "bg-[#EFF8FF] text-[#175CD3]";
      case "ai ethics":
        return "bg-[#F4EBFF] text-[#7F56D9]";
      case "compliance":
        return "bg-[#FFF4ED] text-[#FF692E]";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const renderIcon = (type) => {
    switch (type) {
      case "pdf":
        return (
          <div className="w-9 h-9 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
        );
      case "video":
        return (
          <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
            <Video className="w-4 h-4" />
          </div>
        );
      case "doc":
        return (
          <div className="w-9 h-9 rounded-xl bg-[#EFF8FF] text-[#175CD3] flex items-center justify-center shrink-0">
            <FileCode className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
        );
    }
  };

  const downloadMaterial = (material) => handleDownload(material.title);

  const handleDownload = (title) => {
    toast.success(`Downloading "${title}"...`);
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-bold text-dark-black font-secondary tracking-tight">
        All Training Materials
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {materials.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-light-gray p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-light-black/40 transition-all hover:shadow-sm"
          >
            {/* Top section: Icon + Title */}
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                {renderIcon(item.iconType)}
                <div className="flex flex-col min-w-0">
                  <h4 className="text-xs sm:text-[13px] font-bold text-dark-black truncate leading-snug">
                    {item.title}
                  </h4>
                  {/* Badges */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-light-gray text-medium-black">
                      {item.format}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getCategoryBadge(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Meta information */}
              <div className="flex items-center gap-2 text-[11px] text-light-black pt-1">
                <span>{item.meta}</span>
                <span>•</span>
                <span>{item.updatedDate}</span>
              </div>
            </div>

            {/* Bottom section: Assigned Count + Action Button + Download */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-light-gray/60">
              <div className="flex items-center gap-1.5 text-[11px] text-light-black font-medium">
                <Users className="w-3.5 h-3.5" />
                <span>{item.assignedCount}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Preview / Watch Button */}
                <button
                  type="button"
                  onClick={() => setViewing(item)}
                  className="px-3.5 py-1.5 rounded-lg border border-light-gray hover:border-primary/40 hover:bg-primary/5 text-xs font-semibold text-dark-black/85 hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {item.actionLabel === "Watch" ? (
                    <Play className="w-3 h-3 fill-current" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                  <span>{item.actionLabel}</span>
                </button>

                {/* Download Button */}
                <button
                  type="button"
                  onClick={() => handleDownload(item.title)}
                  className="p-1.5 rounded-lg border border-light-gray hover:border-primary/40 hover:bg-primary/5 text-light-black hover:text-primary transition-colors cursor-pointer"
                  title="Download resource"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <TrainingPreviewModal key={`preview-${viewing?.id}`} material={isVideo ? null : viewing} onClose={() => setViewing(null)} onDownload={downloadMaterial} />
      <TrainingVideoModal key={`video-${viewing?.id}`} material={isVideo ? viewing : null} onClose={() => setViewing(null)} onDownload={downloadMaterial} />
    </div>
  );
}
