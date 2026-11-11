"use client";

import { useEffect, useState } from "react";

const POLL_MS = 60000;

// The bell's unread count: loaded on mount, every minute while the tab is visible, and when
// the tab comes back into focus. The dropdown corrects it right away after read/delete.
export function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const response = await fetch("/api/v1/notifications?unread=1&limit=1");
        if (!response.ok) return;
        const result = await response.json();
        if (!cancelled) setUnreadCount(result.unreadCount ?? 0);
      } catch {
        // Offline or signed out: keep the last count
      }
    };
    load();
    const timer = setInterval(load, POLL_MS);
    document.addEventListener("visibilitychange", load);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
    };
  }, []);
  return { unreadCount, setUnreadCount };
}
