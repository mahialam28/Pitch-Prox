"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import logo from "@/assets/logos/blue-logo.png";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

export default function DemoPicker({ roles }) {
  const [opening, setOpening] = useState(null);

  const open = async (role) => {
    setOpening(role.key);
    try {
      const { redirectTo } = await apiRequest("/api/v1/demo/sign-in", { method: "POST", body: { role: role.key } });
      window.location.assign(redirectTo);
    } catch (error) {
      setOpening(null);
      showError("Couldn't open the preview", error.message);
    }
  };

  return (
    <main className="min-h-screen bg-light-gray/40 px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex flex-col items-center text-center gap-4 mb-10">
          <Image src={logo} alt="PitchProX" className="h-10 w-auto" priority />
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-black">Explore PitchProX</h1>
          <p className="text-sm text-medium-black max-w-xl">
            This is a preview with sample data. Choose a role to see the app the way that person would. To switch roles, use Logout in the sidebar and you&apos;ll come back here.
            Some features (calling, payments, sending email) are still being connected; a note at the bottom of those pages explains what&apos;s pending.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roles.map((role) => (
            <button
              key={role.key}
              type="button"
              disabled={Boolean(opening)}
              onClick={() => open(role)}
              className="group text-left bg-white rounded-2xl border border-light-gray p-5 shadow-sm hover:border-primary/60 hover:shadow-md transition-all cursor-pointer disabled:cursor-wait disabled:opacity-70 flex items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-dark-black">{role.label}</p>
                <p className="text-xs text-medium-black mt-1 leading-relaxed">{role.description}</p>
              </div>
              {opening === role.key ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0 mt-0.5" />
              ) : (
                <ArrowRight className="w-5 h-5 text-light-black group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
              )}
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-medium-black mt-8">
          Prefer the public website? <Link href="/" className="font-semibold text-primary hover:underline">Open the home page</Link>
        </p>
      </div>
    </main>
  );
}
