"use client";

import { useEffect, useState } from "react";
import { MAIL_DRAFT_KEY } from "@/utils.js/follow-up";

// After-call drafts travel to the Mail tab through sessionStorage (read once, never sent automatically)
export function saveMailDraft(draft) {
  sessionStorage.setItem(MAIL_DRAFT_KEY, JSON.stringify({ ...draft, id: `draft-${Date.now()}` }));
}

// The draft waiting for this Mail page, or null. It is removed only once it is shown, so React's
// development double-run of effects can't lose it. The state update is deferred out of the effect.
export function useMailDraft() {
  const [draft, setDraft] = useState(null);
  useEffect(() => {
    let raw = null;
    try {
      raw = sessionStorage.getItem(MAIL_DRAFT_KEY);
    } catch {
      return undefined;
    }
    if (!raw) return undefined;
    const timer = setTimeout(() => {
      sessionStorage.removeItem(MAIL_DRAFT_KEY);
      try {
        setDraft(JSON.parse(raw));
      } catch {
        setDraft(null);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  return draft;
}
