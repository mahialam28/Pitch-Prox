"use client";

import React, { useRef, useState } from "react";
import { ChevronDown, CircleCheck, CircleChevronDown, Download, Lock, Maximize2, Minus, PenLine, Plus } from "lucide-react";
import { showSavedToast } from "@/lib/toast";
import { showError } from "@/lib/alerts";
import { Card, CheckboxRow, LogDataRecorded, StepFooter, WhyThisMatters } from "./onboarding-ui";

const ZOOMS = [75, 100, 125];

// One policy list + document viewer + acknowledgment. The checkbox unlocks only after the
// reader scrolls to the end, and each policy needs its own typed signature.
const PolicyReviewStep = ({ title, subtitle, policies, acknowledged, onAcknowledge, onBack, onNext, why }) => {
  const firstOpen = policies.find((policy) => !acknowledged[policy.id]) ?? policies[0];
  const [activeId, setActiveId] = useState(firstOpen.id);
  const [scrolledToEnd, setScrolledToEnd] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState("");
  const [zoomIndex, setZoomIndex] = useState(1);
  const viewerRef = useRef(null);

  const active = policies.find((policy) => policy.id === activeId);
  const isDone = Boolean(acknowledged[activeId]);
  const canAgree = isDone || scrolledToEnd[activeId];
  const allDone = policies.every((policy) => acknowledged[policy.id]);

  const open = (id) => {
    setActiveId(id);
    setAgreed(false);
    setSignature("");
    viewerRef.current?.scrollTo({ top: 0 });
  };

  const handleScroll = (event) => {
    const el = event.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 12 && !scrolledToEnd[activeId]) {
      setScrolledToEnd((prev) => ({ ...prev, [activeId]: true }));
    }
  };

  const [saving, setSaving] = useState(false);

  // onAcknowledge may be async (live onboarding saves the signature); errors keep the policy open
  const acknowledge = async () => {
    setSaving(true);
    try {
      await onAcknowledge(activeId, signature.trim());
      showSavedToast("Policy acknowledged", `${active.title} (v${active.version}) was signed.`);
      const next = policies.find((policy) => policy.id !== activeId && !acknowledged[policy.id]);
      if (next) open(next.id);
    } catch (error) {
      showError("Not acknowledged", error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <h2 className="text-xl font-semibold text-dark-black">{title}</h2>
        <p className="text-xs text-medium-black mt-1 mb-5">{subtitle}</p>

        <div className="grid grid-cols-1 lg:grid-cols-[210px_minmax(0,1fr)] gap-4">
          {/* Policy list */}
          <ul className="rounded-xl border border-light-gray divide-y divide-light-gray overflow-hidden self-start">
            {policies.map((policy) => {
              const selected = policy.id === activeId;
              const done = acknowledged[policy.id];
              return (
                <li key={policy.id}>
                  <button
                    type="button"
                    onClick={() => open(policy.id)}
                    aria-current={selected}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors cursor-pointer ${
                      selected ? "bg-light-teal/40 ring-2 ring-inset ring-primary rounded-xl" : "hover:bg-light-gray/60"
                    }`}
                  >
                    <policy.icon className={`w-4 h-4 mt-0.5 shrink-0 ${selected ? "text-primary" : "text-medium-black"}`} />
                    <span className="min-w-0">
                      <span className={`block text-sm font-medium ${selected ? "text-primary" : "text-dark-black"}`}>{policy.title}</span>
                      <span className={`block text-[10px] font-semibold uppercase tracking-wide ${done ? "text-emerald-600" : selected ? "text-primary" : "text-light-black"}`}>
                        {done ? "Acknowledged" : "Required"}
                      </span>
                    </span>
                    {done && <CircleCheck className="w-4 h-4 ml-auto text-emerald-600 shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Viewer */}
          <div className="rounded-xl overflow-hidden bg-light-gray flex flex-col min-w-0">
            <div className="flex items-center justify-between gap-3 bg-[#2B2F36] text-white px-4 py-2.5">
              <span className="text-sm truncate">{active.title}</span>
              <div className="flex items-center gap-3 text-xs text-white/80 shrink-0">
                <span className="flex items-center gap-1">1 / 24 <ChevronDown className="w-3 h-3" /></span>
                <span className="w-px h-4 bg-white/20" />
                <button type="button" aria-label="Zoom out" disabled={zoomIndex === 0} onClick={() => setZoomIndex((v) => v - 1)} className="disabled:opacity-40 cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
                <span>{ZOOMS[zoomIndex]}%</span>
                <button type="button" aria-label="Zoom in" disabled={zoomIndex === ZOOMS.length - 1} onClick={() => setZoomIndex((v) => v + 1)} className="disabled:opacity-40 cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
                <span className="w-px h-4 bg-white/20" />
                <button type="button" aria-label="Full screen" onClick={() => viewerRef.current?.requestFullscreen?.()} className="cursor-pointer"><Maximize2 className="w-3.5 h-3.5" /></button>
                <button type="button" aria-label="Download policy" onClick={() => showSavedToast("Download started", `${active.title}.pdf is downloading.`)} className="cursor-pointer"><Download className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="relative p-4">
              <div ref={viewerRef} onScroll={handleScroll} className="h-[320px] overflow-y-auto rounded-lg bg-white">
                <article className="px-10 py-8 origin-top transition-transform" style={{ transform: `scale(${ZOOMS[zoomIndex] / 100})` }}>
                  <h3 className="text-2xl font-bold text-dark-black text-center uppercase">{active.title}</h3>
                  <p className="text-[11px] text-medium-black text-center mt-1 mb-6">Version {active.version} • Effective: April 15, 2024</p>
                  {active.body.map((section) => (
                    <section key={section.heading} className="mb-5">
                      <h4 className="text-sm font-medium text-primary mb-2">{section.heading}</h4>
                      <p className="text-xs leading-5 text-dark-black/80">{section.text}</p>
                    </section>
                  ))}
                  <p className="text-[11px] text-light-black text-center pt-2">— End of document —</p>
                </article>
              </div>
              {!canAgree && (
                <div className="absolute right-8 bottom-8 flex items-center gap-2 bg-white rounded-xl shadow-[0px_8px_24px_rgba(0,0,0,0.12)] border border-gray-100 px-4 py-3 text-sm font-medium text-dark-black max-w-[230px]">
                  <CircleChevronDown className="w-4 h-4 text-primary shrink-0" /> Scroll to the bottom to enable acknowledgment
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Acknowledgment */}
        <div className="grid grid-cols-1 lg:grid-cols-[210px_minmax(0,1fr)_190px] gap-4 mt-4">
          <WhyThisMatters>{why}</WhyThisMatters>
          <div className="space-y-2">
            <div className="rounded-xl bg-light-gray/80 p-4">
              <CheckboxRow checked={isDone || agreed} onChange={setAgreed} disabled={!canAgree || isDone}>
                I have read and understand the <span className="font-medium">{active.title} (v{active.version})</span> and agree to comply with its terms.
              </CheckboxRow>
            </div>
            <div className="relative">
              <input
                aria-label="Type your full name"
                value={isDone ? acknowledged[activeId] : signature}
                onChange={(event) => setSignature(event.target.value)}
                disabled={!canAgree || isDone}
                placeholder="Type your full name"
                className="w-full h-11 px-4 pr-10 rounded-xl border border-gray-300 bg-white text-sm text-dark-black placeholder:text-gray-500 outline-none focus:border-primary disabled:bg-light-gray/60"
              />
              <PenLine className="w-4 h-4 text-medium-black absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[10px] text-medium-black">This will be used as your electronic signature</p>
          </div>
          <LogDataRecorded />
        </div>
      </Card>

      <StepFooter
        onBack={onBack}
        onNext={allDone ? onNext : acknowledge}
        nextLabel={allDone ? "Next Step" : "Acknowledge Policy"}
        nextIcon={allDone ? undefined : Lock}
        nextDisabled={!allDone && (saving || isDone || !agreed || signature.trim().length < 3)}
      />
    </div>
  );
};

export default PolicyReviewStep;
