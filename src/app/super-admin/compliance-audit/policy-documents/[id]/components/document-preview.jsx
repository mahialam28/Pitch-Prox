"use client";

import React, { useState } from "react";
import { ZoomIn, ZoomOut, Download, ChevronDown, FileText } from "lucide-react";
import { formatDate } from "@/lib/client-api";

const zoomOptions = [75, 90, 100, 110, 125, 150].map((value) => ({ value, label: `${value}%` }));

// Shows one version: an uploaded PDF in the browser's viewer; otherwise the policy text
// (the sections employees read during onboarding). Word files are downloaded.
export default function DocumentPreview({ policy, version }) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isZoomDropdownOpen, setIsZoomDropdownOpen] = useState(false);
  if (!version) return null;

  const fileUrl = `/api/v1/compliance/policies/${policy.id}/file?version=${version.id}`;
  const isPdf = Boolean(version.file?.isPdf);
  const sections = version.sections?.length ? version.sections : version.description ? [{ heading: "Summary", text: version.description }] : [];
  const effective = version.effectiveDate ? formatDate(`${version.effectiveDate}T12:00:00`) : "Not set";

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col h-full">
      <div className="flex items-center justify-between gap-3 pb-3">
        <h2 className="text-base sm:text-lg font-bold text-dark-black/90 font-secondary tracking-tight">Document Preview</h2>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-light-gray/60 text-dark-black/75 border border-light-gray">
          {version.versionLabel} · {version.statusLabel}
        </span>
      </div>

      {isPdf ? (
        <iframe title={`${version.title} ${version.versionLabel}`} src={`${fileUrl}&inline=1`} className="w-full flex-1 min-h-[640px] rounded-2xl border border-light-gray/60 bg-[#F8FAFA]" />
      ) : (
        <div className="flex-1 bg-[#F8FAFA] rounded-2xl border border-light-gray/60 p-6 sm:p-10 flex flex-col items-center overflow-auto min-h-[520px]">
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center", transition: "transform 0.25s ease-out" }}
            className="w-full max-w-[620px] bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-light-gray/80 p-8 sm:p-11 space-y-6"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-base shadow-sm">P</div>
              <span className="font-extrabold text-base tracking-tight text-dark-black/90 font-secondary">PitchPro<span className="text-primary">X</span></span>
            </div>
            <div className="space-y-1.5 pt-2">
              <h3 className="text-xl sm:text-2xl font-black text-dark-black/95 font-secondary tracking-tight">{version.title}</h3>
              <p className="text-xs text-light-black">Effective Date: {effective} | Version {version.version}</p>
            </div>
            <div className="w-full h-px bg-light-gray/80 my-2" />
            {version.file && (
              <a href={fileUrl} className="flex items-center gap-2 p-3 rounded-xl border border-light-gray hover:border-primary/50 text-xs font-semibold text-dark-black/80">
                <FileText className="w-4 h-4 text-blue-500" />
                {version.file.name} ({version.file.size}). Word documents open after downloading.
              </a>
            )}
            {sections.length === 0 && !version.file && <p className="text-xs text-light-black">No content yet. Upload the policy file or add a description.</p>}
            {sections.map((section) => (
              <div key={section.heading} className="space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-dark-black/90 uppercase tracking-wider font-secondary">{section.heading}</h4>
                <p className="text-xs text-dark-black/75 leading-relaxed font-normal whitespace-pre-line">{section.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isPdf && (
        <div className="pt-4 flex items-center justify-center">
          <div className="bg-white border border-light-gray/90 shadow-md rounded-2xl px-4 py-2 flex items-center gap-4 relative">
            <button type="button" onClick={() => setZoomLevel((level) => Math.max(75, level - 25))} disabled={zoomLevel <= 75} className="text-light-black hover:text-dark-black disabled:opacity-40 transition-colors cursor-pointer" title="Zoom Out" aria-label="Zoom out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <div className="relative">
              <button type="button" onClick={() => setIsZoomDropdownOpen(!isZoomDropdownOpen)} className="flex items-center gap-1 text-xs font-semibold text-dark-black/85 hover:text-primary transition-colors cursor-pointer">
                <span>{zoomLevel}%</span>
                <ChevronDown className="w-3.5 h-3.5 text-light-black" />
              </button>
              {isZoomDropdownOpen && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white border border-light-gray rounded-xl shadow-lg py-1 w-20 z-30">
                  {zoomOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => { setZoomLevel(option.value); setIsZoomDropdownOpen(false); }}
                      className={`w-full px-2.5 py-1 text-center text-xs font-semibold hover:bg-light-gray/60 transition-colors cursor-pointer ${zoomLevel === option.value ? "text-primary bg-primary/5" : "text-dark-black/85"}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" onClick={() => setZoomLevel((level) => Math.min(150, level + 25))} disabled={zoomLevel >= 150} className="text-light-black hover:text-dark-black disabled:opacity-40 transition-colors cursor-pointer" title="Zoom In" aria-label="Zoom in">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {version.file && (
              <>
                <div className="w-px h-3.5 bg-light-gray" />
                <a href={fileUrl} className="text-light-black hover:text-primary transition-colors" title="Download Document" aria-label="Download document">
                  <Download className="w-3.5 h-3.5" />
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
