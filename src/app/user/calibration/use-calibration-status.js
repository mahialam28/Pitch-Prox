"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/client-api";

// Calibration gate for the customer portal: { required, completed, deferredAt, sessions } or
// null while loading. `locked` = calling is blocked (customer who hasn't calibrated yet).
export function useCalibrationStatus() {
  const [status, setStatus] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    apiRequest("/api/v1/calibration/status")
      .then((data) => active && setStatus(data))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, []);
  return { status, failed, locked: Boolean(status?.required && !status.completed), setStatus };
}
