"use client";

import React, { useEffect, useState } from "react";
import { GraduationCap, X, FileText, FileCode, Video, Check, ExternalLink, Award } from "lucide-react";
import toast from "react-hot-toast";
import { apiRequest, formatDate } from "@/lib/client-api";

const ICONS = { PDF: FileText, Doc: FileCode, Video };

// Staff portals: Training assigned from Compliance → Training Logs. The employee opens every
// material, then marks the Training complete (a certificate is issued when the Training has one).
// Hidden when nothing is open. Onboarding training is done in onboarding, so it isn't listed here.
export default function TrainingPrompt() {
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiRequest("/api/v1/me/training")
      .then((result) => !cancelled && setData(result))
      .catch(() => { /* not available (e.g. design preview): stay hidden */ });
    return () => { cancelled = true; };
  }, []);

  const waiting = data?.results.filter((item) => item.status !== "Completed" && item.source !== "onboarding") ?? [];
  if (!waiting.length) return null;
  const overdue = waiting.filter((item) => item.status === "Overdue").length;

  const openMaterial = async (assignment, material) => {
    if (material.external) {
      // A link: record the view, then open it
      try {
        setData(await apiRequest(`/api/v1/me/training/${assignment.id}/materials/${material.id}/view`, { method: "POST" }));
      } catch (error) {
        return toast.error(error.message);
      }
      window.open(material.url, "_blank", "noopener");
      return;
    }
    window.open(material.url, "_blank", "noopener");
    // The file route records the view; refresh so the tick shows
    setTimeout(() => apiRequest("/api/v1/me/training").then(setData).catch(() => {}), 1200);
  };

  const complete = async (assignment) => {
    setBusy(assignment.id);
    try {
      const result = await apiRequest(`/api/v1/me/training/${assignment.id}/complete`, { method: "POST" });
      setData(result);
      const done = result.results.find((item) => item.id === assignment.id);
      toast.success(done?.certificate ? `Completed. Certificate ${done.certificate.number} issued.` : "Training completed.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <div className={`mb-6 rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${overdue ? "bg-rose-50/60 border-rose-200" : "bg-primary/5 border-primary/20"}`}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-white border border-light-gray flex items-center justify-center shrink-0">
            <GraduationCap className={`w-5 h-5 ${overdue ? "text-rose-500" : "text-primary"}`} />
          </div>
          <div>
            <p className="text-sm font-bold text-dark-black/85">
              {waiting.length} training{waiting.length === 1 ? "" : "s"} to complete{overdue ? ` (${overdue} overdue)` : ""}
            </p>
            <p className="text-xs text-medium-black">Open each material, then mark the training as complete.</p>
          </div>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="px-4 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold cursor-pointer shrink-0">My Training</button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-dark-black/40 backdrop-blur-xs" onClick={() => setOpen(false)} />
          <div role="dialog" aria-modal="true" aria-labelledby="training-prompt-title" className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-light-gray overflow-hidden z-10 max-h-[90vh] flex flex-col">
            <div className="p-5 sm:p-6 pb-4 border-b border-light-gray flex items-center justify-between">
              <div>
                <h2 id="training-prompt-title" className="text-lg font-bold text-dark-black/85 font-secondary">My Training</h2>
                <p className="text-xs text-light-black">Training assigned to you, with due dates.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="w-8 h-8 rounded-lg text-light-black hover:text-dark-black/80 hover:bg-light-gray/70 flex items-center justify-center cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {data.results.filter((item) => item.source !== "onboarding").map((assignment) => (
                <div key={assignment.id} className="rounded-xl border border-light-gray p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-dark-black/85">{assignment.trainingTitle}</p>
                      <p className={`text-[11px] ${assignment.status === "Overdue" ? "text-rose-600 font-semibold" : "text-light-black"}`}>
                        {assignment.requirement} · {assignment.status}{assignment.dueDate ? ` · due ${formatDate(`${assignment.dueDate}T12:00:00`)}` : ""}
                      </p>
                    </div>
                    {assignment.certificate && <span className="flex items-center gap-1 text-[11px] font-semibold text-[#12B76A] shrink-0"><Award className="w-3.5 h-3.5" /> {assignment.certificate.number}</span>}
                  </div>
                  {assignment.status !== "Completed" && (
                    <>
                      <ul className="space-y-1.5">
                        {assignment.materials.map((material) => {
                          const Icon = ICONS[material.format] ?? FileText;
                          return (
                            <li key={material.id}>
                              <button type="button" onClick={() => openMaterial(assignment, material)} className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-light-gray hover:border-primary/50 text-left cursor-pointer">
                                <Icon className="w-4 h-4 text-primary shrink-0" />
                                <span className="flex-1 min-w-0 text-xs font-semibold text-dark-black truncate">{material.title}</span>
                                <span className="text-[10px] text-light-black">{material.format}</span>
                                {material.viewed ? <Check className="w-4 h-4 text-[#12B76A]" aria-label="Opened" /> : <ExternalLink className="w-3.5 h-3.5 text-light-black" aria-label="Not opened yet" />}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                      <button
                        type="button"
                        disabled={!assignment.canComplete || busy === assignment.id}
                        onClick={() => complete(assignment)}
                        title={assignment.canComplete ? undefined : "Open every material first"}
                        className="px-4 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="w-4 h-4" /> {busy === assignment.id ? "Saving..." : "Mark as complete"}
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
