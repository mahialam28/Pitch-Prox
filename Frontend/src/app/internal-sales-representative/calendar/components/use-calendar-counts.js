"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/client-api";

// Fired by the Internal Calendar after it (re)loads, so the header counts follow adds and deletes
export const CALENDAR_CHANGED = "pitchprox:calendar-changed";

const pad = (value) => String(value).padStart(2, "0");
const keyOf = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const clockOf = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

// Header cards: events today, and events still to come this week (through Saturday)
export function useCalendarCounts() {
  const [counts, setCounts] = useState(null);
  const load = useCallback(async () => {
    const now = new Date();
    const saturday = new Date(now);
    saturday.setDate(now.getDate() + (6 - now.getDay()));
    try {
      const { results } = await apiRequest(`/api/v1/calendar/events?from=${keyOf(now)}&to=${keyOf(saturday)}`);
      const today = keyOf(now);
      const nowKey = `${today}T${clockOf(now)}`;
      setCounts({
        today: results.filter((event) => event.startsAt.slice(0, 10) <= today && event.endsAt.slice(0, 10) >= today).length,
        upcoming: results.filter((event) => event.endsAt >= nowKey).length,
      });
    } catch {
      setCounts(null);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    window.addEventListener(CALENDAR_CHANGED, load);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(CALENDAR_CHANGED, load);
    };
  }, [load]);

  return counts;
}
