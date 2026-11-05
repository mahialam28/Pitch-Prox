"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ActionButton from "@/components/buttons/action-button";
import Text from "@/components/texts/text";

// Activates an employee invite: signs the employee in and opens onboarding.
const AcceptInviteForm = ({ token }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(token ? "" : "This invite link is incomplete. Open the full link you were sent.");

  const activate = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/v1/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "This invite link couldn't be used.");
      router.push(result.next || "/onboarding");
      router.refresh();
    } catch (activateError) {
      setError(activateError.message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <Text className="text-medium-black">
        Activating your account signs you in and starts your onboarding: company policies, security setup and training. It takes about 18 minutes.
      </Text>
      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}
      <ActionButton type="button" onClick={activate} loading={loading} disabled={!token} text="Activate my account" loadingText="Activating..." className="w-full" />
      <p className="text-center text-sm text-medium-black">
        Already activated?{" "}
        <Link href="/sign-in" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default AcceptInviteForm;
