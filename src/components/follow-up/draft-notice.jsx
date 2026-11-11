"use client";

import React from "react";
import { Info } from "lucide-react";

// Shown above the Mail form when it was filled from an after-call template
export default function DraftNotice({ draft }) {
  if (!draft) return null;
  return (
    <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-xs text-medium-black leading-relaxed flex gap-2.5">
      <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-dark-black/80">
          Draft from &quot;{draft.templateName}&quot;{draft.playbook?.title ? ` (${draft.playbook.title})` : ""}. Review it, then send it yourself.
        </p>
        <p className="mt-0.5">Only facts we know are filled in. Nothing is attached or sent automatically.</p>
        {draft.leftOut?.length > 0 && (
          <p className="mt-0.5">
            Left out because we don&apos;t know them yet: {draft.leftOut.join(", ")}. Add them by hand if you need them.
          </p>
        )}
        {!draft.to && <p className="mt-0.5 font-medium text-amber-700">No email address on file for this contact: enter the recipient.</p>}
      </div>
    </div>
  );
}
