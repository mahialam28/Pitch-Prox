"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, ZoomIn, ZoomOut } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import { showSavedToast } from "@/lib/toast";

// Design-only viewers: sample page content and a placeholder player (no real files yet).

const SECTIONS = ["Purpose", "Scope", "Responsibilities"];
const ZOOM_STEPS = [75, 100, 125, 150];

const subtitleFor = (material) => [material?.format, material?.meta, material?.updatedDate].filter(Boolean).join(" · ");
const pageCount = (material) => Number.parseInt(material?.meta, 10) || 1;

export const TrainingPreviewModal = ({ material, onClose, onDownload }) => {
  const [zoomIndex, setZoomIndex] = useState(1);
  const [page, setPage] = useState(1);
  const pages = material?.format === "PDF" ? pageCount(material) : 1;
  const zoom = ZOOM_STEPS[zoomIndex];
  const topic = material?.title?.split(" ")[0].toLowerCase() ?? "";

  return (
    <DialogModal
      isOpen={Boolean(material)}
      onClose={onClose}
      title={material?.title}
      subtitle={subtitleFor(material)}
      size="2xl"
      footer={
        <>
          <DialogButton onClick={() => onDownload(material)}>Download</DialogButton>
          <DialogButton onClick={onClose}>Close</DialogButton>
        </>
      }
    >
      <div className="rounded-xl border border-gray-200 bg-light-gray/70 p-6 sm:p-8 h-[340px] overflow-auto flex justify-center">
        <article
          className="bg-white border border-gray-200 shadow-xs w-full max-w-[420px] px-8 py-7 origin-top transition-transform h-fit"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          <h3 className="text-lg font-semibold text-dark-black mb-3">{material?.title}</h3>
          {SECTIONS.map((section, index) => (
            <section key={section} className="mb-3">
              <h4 className="text-sm font-semibold text-dark-black mb-1.5">
                {index + 1 + (page - 1) * SECTIONS.length}. {section}
              </h4>
              <p className="text-[11px] leading-4 text-medium-black">
                This document explains how employees recognise and report {topic === "security" ? "security threats" : "risks"} and keep company data safe.
              </p>
            </section>
          ))}
        </article>
      </div>

      <div className="flex items-center justify-center gap-3 mt-4 text-xs text-medium-black">
        <button
          type="button"
          aria-label="Zoom out"
          disabled={zoomIndex === 0}
          onClick={() => setZoomIndex((value) => value - 1)}
          className="p-1 rounded text-dark-black/70 hover:bg-light-gray disabled:opacity-40 cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="font-semibold text-dark-black w-10 text-center">{zoom}%</span>
        <button
          type="button"
          aria-label="Zoom in"
          disabled={zoomIndex === ZOOM_STEPS.length - 1}
          onClick={() => setZoomIndex((value) => value + 1)}
          className="p-1 rounded text-dark-black/70 hover:bg-light-gray disabled:opacity-40 cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="p-1 rounded hover:bg-light-gray disabled:opacity-40 cursor-pointer">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span>
          Page {page} of {pages}
        </span>
        <button type="button" aria-label="Next page" disabled={page === pages} onClick={() => setPage((value) => value + 1)} className="p-1 rounded hover:bg-light-gray disabled:opacity-40 cursor-pointer">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </DialogModal>
  );
};

export const TrainingVideoModal = ({ material, onClose, onDownload }) => {
  const [playing, setPlaying] = useState(false);
  const duration = `${Number.parseInt(material?.meta, 10) || 0}:24`;

  const complete = () => {
    onClose();
    showSavedToast("Marked as complete", `"${material?.title}" was added to your completed training.`);
  };

  return (
    <DialogModal
      isOpen={Boolean(material)}
      onClose={onClose}
      title={material?.title}
      subtitle={subtitleFor(material)}
      size="2xl"
      footer={
        <>
          <DialogButton onClick={() => onDownload(material)}>Download</DialogButton>
          <DialogButton variant="primary" onClick={complete}>Mark as complete</DialogButton>
        </>
      }
    >
      <div className="relative aspect-video max-h-[380px] w-full rounded-xl bg-[#0b1320] flex flex-col items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setPlaying((value) => !value)}
          aria-label={playing ? "Pause video" : "Play video"}
          className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center hover:bg-medium-teal transition-colors cursor-pointer"
        >
          {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
        <p className="text-sm font-medium text-white">{playing ? "Video preview isn't connected yet" : material?.title}</p>
      </div>
      <div className="mt-5">
        <div className="h-1 rounded-full bg-gray-200 overflow-hidden">
          <div className={`h-full bg-primary transition-all duration-700 ${playing ? "w-[4%]" : "w-0"}`} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-medium-black">
          <span>0:00</span>
          <span>{duration}</span>
        </div>
      </div>
    </DialogModal>
  );
};
