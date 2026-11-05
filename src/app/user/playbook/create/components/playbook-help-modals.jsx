"use client";

import React, { useState } from "react";
import { MessageSquare, Play } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";

// ── Watch Tutorial ───────────────────────────────────────────────────────────
// Set NEXT_PUBLIC_PLAYBOOK_TUTORIAL_URL to the walkthrough video (an .mp4 or other
// file the browser can play). Until then the player says the video is coming soon.

const TUTORIAL_URL = process.env.NEXT_PUBLIC_PLAYBOOK_TUTORIAL_URL || "";

export const WatchTutorialModal = ({ isOpen, onClose }) => (
  <DialogModal
    isOpen={isOpen}
    onClose={onClose}
    title="Getting started with custom playbooks"
    subtitle="A 3 minute walkthrough."
    size="xl"
    footer={<DialogButton onClick={onClose}>Close</DialogButton>}
  >
    {TUTORIAL_URL ? (
      <video src={TUTORIAL_URL} controls autoPlay className="w-full aspect-video rounded-xl bg-[#0b1829]" />
    ) : (
      <div className="w-full aspect-video rounded-xl bg-[#0b1829] flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="w-[72px] h-[72px] rounded-full bg-primary/90 flex items-center justify-center">
          <Play className="w-7 h-7 text-white" />
        </div>
        <p className="text-base font-medium text-white">Build a playbook step by step</p>
        <p className="text-xs text-white/60">The tutorial video is coming soon.</p>
      </div>
    )}
  </DialogModal>
);

// ── Example Playbooks ────────────────────────────────────────────────────────

const EXAMPLES = [
  {
    id: "consultative",
    title: "Consultative Seller",
    summary: "Ask questions first, then guide to value.",
    tags: "Calm · Consultative",
    template: {
      voiceDescription: "Avoid: 'Just checking in', 'I was wondering if...', pushing for a decision before understanding their situation.",
      uniqueVoiceTags: ["Help me understand...", "What matters most to you?", "Here's what I'm hearing"],
      corePrinciples: "Listen more than I talk. Ask open questions to uncover what the seller really needs before recommending anything. Tie every suggestion back to their goals.",
    },
  },
  {
    id: "direct",
    title: "Direct Closer",
    summary: "Short, confident prompts that drive to a clear next step.",
    tags: "Confident · Direct",
    template: {
      voiceDescription: "Avoid: long explanations, 'maybe', 'I think', hedging language and filler.",
      uniqueVoiceTags: ["Bottom line", "Here's the plan", "Let's lock it in"],
      corePrinciples: "Keep it brief and confident. Every call ends with one clear next step and a time on the calendar. Handle objections quickly and return to the ask.",
    },
  },
  {
    id: "relationship",
    title: "Relationship Builder",
    summary: "Warm tone with storytelling and trust-building.",
    tags: "Friendly · Empathetic",
    template: {
      voiceDescription: "Avoid: sounding scripted, rushing the conversation, hard-closing language.",
      uniqueVoiceTags: ["I hear you", "A family I worked with...", "No pressure at all"],
      corePrinciples: "Build trust before business. Use short stories from past clients to show how I help. Stay patient and make it easy for them to say yes later.",
    },
  },
];

export const ExamplePlaybooksModal = ({ isOpen, onClose, onUseTemplate }) => {
  const [previewId, setPreviewId] = useState(null);

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Example Playbooks"
      subtitle="Get ideas before you build your own."
      size="xl"
      footer={<DialogButton onClick={onClose}>Close</DialogButton>}
    >
      <div className="space-y-5">
        {EXAMPLES.map((example) => {
          const previewing = previewId === example.id;
          return (
            <div key={example.id} className="border border-gray-300 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-light-teal/60 text-primary flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-dark-black">{example.title}</p>
                    <p className="text-sm text-medium-black truncate">{example.summary}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-light-teal/60 text-primary text-xs font-medium">{example.tags}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewId(previewing ? null : example.id)}
                    className="px-3.5 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 cursor-pointer"
                  >
                    {previewing ? "Hide" : "Preview"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUseTemplate(example);
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-medium-teal cursor-pointer"
                  >
                    Use as template
                  </button>
                </div>
              </div>

              {previewing && (
                <dl className="mt-4 pt-4 border-t border-gray-200 space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-medium text-medium-black">Core principles</dt>
                    <dd className="text-dark-black mt-0.5">{example.template.corePrinciples}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-medium-black">Signature phrases</dt>
                    <dd className="text-dark-black mt-0.5">{example.template.uniqueVoiceTags.join(" · ")}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-medium-black">Words to avoid</dt>
                    <dd className="text-dark-black mt-0.5">{example.template.voiceDescription}</dd>
                  </div>
                </dl>
              )}
            </div>
          );
        })}
      </div>
    </DialogModal>
  );
};
