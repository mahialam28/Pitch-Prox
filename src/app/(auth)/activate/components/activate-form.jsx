"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiLock } from "react-icons/fi";
import AuthPassword from "@/components/forms/auth-password";
import ActionButton from "@/components/buttons/action-button";

// Customer activation: choose a password, then go straight to the dashboard.
const ActivateForm = ({ token }) => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(token ? "" : "This activation link is incomplete. Open the full link you were sent.");

  const submit = async (event) => {
    event.preventDefault();
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords don't match.");
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/v1/auth/activate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "This activation link couldn't be used.");
      router.push(result.next || "/user/dashboard");
      router.refresh();
    } catch (activateError) {
      setError(activateError.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full space-y-5">
      <AuthPassword name="password" placeholder="Choose a password (8+ characters)" icon={FiLock} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
      <AuthPassword name="confirm" placeholder="Confirm password" icon={FiLock} value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" />
      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}
      <ActionButton type="submit" loading={loading} disabled={!token} text="Activate account" loadingText="Activating..." className="w-full" />
      <p className="text-center text-sm text-medium-black">
        Already activated?{" "}
        <Link href="/sign-in" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
};

export default ActivateForm;
