"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/client-api";

// Live template list (built-in library + team + the employee's own), from lib/mail-templates
export function useMailTemplates() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const reload = useCallback(
    () =>
      apiRequest("/api/v1/mail/templates")
        .then((result) => {
          setData(result);
          setError(null);
        })
        .catch((failure) => setError(failure.message)),
    []
  );
  useEffect(() => {
    reload();
  }, [reload]);
  return { templates: data?.results ?? [], categories: data?.categories ?? [], canShare: Boolean(data?.canShare), loaded: Boolean(data), error, reload };
}

export const SCOPE_LABELS = { library: "PitchProX", team: "Team", personal: "Mine" };
