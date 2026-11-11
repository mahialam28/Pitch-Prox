"use client";

import React, { useState } from "react";

const SCOPES = [
  { value: "account", label: "My whole account and its data" },
  { value: "calls", label: "Call recordings and transcripts" },
  { value: "contact", label: "My contact details (I'm not a customer)" },
  { value: "other", label: "Something else (explain below)" },
];

const inputClass = "w-full px-3.5 py-2.5 text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black";

export default function DeletionRequestForm() {
  const [form, setForm] = useState({ name: "", email: "", scope: "account", details: "" });
  const [state, setState] = useState({ sending: false, error: "", reference: null });
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setState({ sending: true, error: "", reference: null });
    try {
      const response = await fetch("/api/v1/public/data-deletion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Something went wrong. Please try again or email support@pitchprox.com.");
      setState({ sending: false, error: "", reference: result.reference });
    } catch (error) {
      setState({ sending: false, error: error.message, reference: null });
    }
  };

  if (state.reference) {
    return (
      <p role="status" className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        Thanks, we received your request. Your reference is <strong>{state.reference}</strong>, and we&apos;ve emailed you a confirmation.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="block text-xs font-semibold text-medium-black mb-1.5">Your name</span>
          <input required value={form.name} onChange={set("name")} autoComplete="name" className={inputClass} />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold text-medium-black mb-1.5">Email address (on your account)</span>
          <input required type="email" value={form.email} onChange={set("email")} autoComplete="email" className={inputClass} />
        </label>
      </div>
      <fieldset>
        <legend className="text-xs font-semibold text-medium-black mb-1.5">What should we delete?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {SCOPES.map((scope) => (
            <label key={scope.value} className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm cursor-pointer ${form.scope === scope.value ? "border-primary bg-primary/5" : "border-light-gray bg-white"}`}>
              <input type="radio" name="scope" value={scope.value} checked={form.scope === scope.value} onChange={set("scope")} className="accent-primary" />
              {scope.label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="block text-xs font-semibold text-medium-black mb-1.5">Anything else we should know {form.scope === "other" ? "(required)" : "(optional)"}</span>
        <textarea rows={3} maxLength={3000} required={form.scope === "other"} value={form.details} onChange={set("details")} className={`${inputClass} resize-none`} />
      </label>
      {state.error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={state.sending} className="px-5 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-sm font-bold cursor-pointer disabled:opacity-60">
        {state.sending ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
