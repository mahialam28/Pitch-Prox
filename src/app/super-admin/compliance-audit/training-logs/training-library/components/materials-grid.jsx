"use client";

import React, { useState } from "react";
import { Eye, Download, Play, Trash2, Layers } from "lucide-react";
import toast from "react-hot-toast";
import { apiRequest, formatDate } from "@/lib/client-api";
import { MaterialIcon } from "../../components/create-training-modal";
import { MaterialViewer } from "./training-material-modals";

const CATEGORY_STYLES = {
  security: "bg-[#E8F8F0] text-[#12B76A]",
  privacy: "bg-[#EFF8FF] text-[#175CD3]",
  "ai ethics": "bg-[#F4EBFF] text-[#7F56D9]",
  compliance: "bg-[#FFF4ED] text-[#FF692E]",
};

// materials: from /api/v1/compliance/training/materials (already filtered by the page)
export default function MaterialsGrid({ materials, loading, canManage, onChanged }) {
  const [viewing, setViewing] = useState(null);

  const remove = async (material) => {
    try {
      await apiRequest(`/api/v1/compliance/training/materials/${material.id}`, { method: "DELETE" });
      toast.success("Material deleted.");
      onChanged();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-bold text-dark-black font-secondary tracking-tight">All Training Materials</h3>

      {materials.length === 0 && (
        <div className="bg-white rounded-2xl border border-light-gray p-10 text-center text-sm text-light-black">
          {loading ? "Loading materials..." : "No materials match. Upload PDFs, Word documents or videos to build Trainings."}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {materials.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-light-gray p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-light-black/40 transition-all hover:shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <MaterialIcon format={item.format} />
                <div className="flex flex-col min-w-0">
                  <h4 className="text-xs sm:text-[13px] font-bold text-dark-black truncate leading-snug" title={item.title}>{item.title}</h4>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-light-gray text-medium-black">{item.format}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${CATEGORY_STYLES[item.category.toLowerCase()] ?? "bg-gray-100 text-gray-700"}`}>{item.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-light-black pt-1 flex-wrap">
                <span>{item.file ? item.file.size : item.videoUrl ? "Video link" : "—"}</span>
                {item.minutes && <><span>•</span><span>{item.minutes} min</span></>}
                <span>•</span>
                <span>Added {formatDate(item.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-light-gray/60">
              <div className="flex items-center gap-1.5 text-[11px] text-light-black font-medium">
                <Layers className="w-3.5 h-3.5" />
                <span>In {item.usedIn} Training{item.usedIn === 1 ? "" : "s"}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewing(item)}
                  className="px-3.5 py-1.5 rounded-lg border border-light-gray hover:border-primary/40 hover:bg-primary/5 text-xs font-semibold text-dark-black/85 hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {item.format === "Video" ? <Play className="w-3 h-3 fill-current" /> : <Eye className="w-3 h-3" />}
                  <span>{item.format === "Video" ? "Watch" : "Preview"}</span>
                </button>
                {item.file && (
                  <a href={`/api/v1/compliance/training/materials/${item.id}/file`} className="p-1.5 rounded-lg border border-light-gray hover:border-primary/40 hover:bg-primary/5 text-light-black hover:text-primary transition-colors" title="Download" aria-label={`Download ${item.title}`}>
                    <Download className="w-3.5 h-3.5" />
                  </a>
                )}
                {canManage && item.usedIn === 0 && (
                  <button type="button" onClick={() => remove(item)} className="p-1.5 rounded-lg border border-light-gray hover:border-rose-300 hover:bg-rose-50 text-light-black hover:text-rose-600 transition-colors cursor-pointer" title="Delete" aria-label={`Delete ${item.title}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <MaterialViewer material={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
