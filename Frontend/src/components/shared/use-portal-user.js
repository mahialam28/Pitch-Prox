"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ROLE_LABELS } from "@/utils.js/roles";

// Signed-in user for a portal shell (provided by the server layout guard),
// kept in sync with profile edits, plus the real sign-out action.
export function usePortalUser(initialUser) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    const updateProfile = (event) => setUser((current) => ({ ...current, ...event.detail }));
    window.addEventListener("pitchprox-profile-updated", updateProfile);
    return () => window.removeEventListener("pitchprox-profile-updated", updateProfile);
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/v1/auth/sign-out", { method: "POST" });
    } finally {
      router.replace("/sign-in");
      router.refresh();
    }
  };

  return { userName: user?.name || "", roleLabel: ROLE_LABELS[user?.role] || "Member", logout };
}
