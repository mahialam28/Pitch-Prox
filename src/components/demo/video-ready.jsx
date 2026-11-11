"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Play } from "lucide-react";
import { DEMO_VIDEO } from "@/utils.js/demo-video";
import { PLANS } from "@/lib/plan-catalog";

// "Your Video Is Ready" (client's mockup, Nov 10): the explainer right away, then start free or pick
// a plan, so visitors sign up while they're here instead of leaving to wait for an email.
// Used in the pop-up after the website form and on /see-how-it-works (the emailed link).

const FALLBACK_PLANS = PLANS.map((plan) => ({ id: plan.id, name: plan.name, isTrial: Boolean(plan.isTrial), callsPerMonth: plan.callsPerMonth, reportsPerMonth: plan.reportsPerMonth, priceMonthly: `$${(plan.priceMonthlyCents / 100).toFixed(0)}` }));
const wholeDollars = (price) => String(price ?? "").replace(/\.00$/, "");

const signUpHref = ({ name, email, plan }) => {
  const params = new URLSearchParams(Object.entries({ name, email, plan }).filter(([, value]) => value));
  const query = params.toString();
  return `/sign-up${query ? `?${query}` : ""}`;
};

export default function VideoReady({ requestId = null, name = "", email = "", onClose = null, emailed = true }) {
  const videoRef = useRef(null);
  const sent = useRef({ started: false, completed: false });
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [chosen, setChosen] = useState("pro");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/public/plans")
      .then((response) => (response.ok ? response.json() : null))
      .then((result) => !cancelled && result?.results?.length && setPlans(result.results))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Watching is recorded once per visit (started / finished) for the sales team
  const track = (event) => {
    if (!requestId || sent.current[event]) return;
    sent.current[event] = true;
    fetch(`/api/v1/public/demo-requests/${encodeURIComponent(requestId)}/events`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event }) }).catch(() => {});
  };

  const play = () => {
    const video = videoRef.current;
    if (!video) return;
    video.scrollIntoView({ behavior: "smooth", block: "center" });
    video.play().catch(() => {});
  };

  const trial = plans.find((plan) => plan.isTrial);
  const paid = plans.filter((plan) => !plan.isTrial);
  const selected = paid.find((plan) => plan.id === chosen) ?? paid[0];

  return (
    <div className="w-full max-w-2xl mx-auto text-dark-black">
      <div className="text-center space-y-1.5">
        <h2 id="video-ready-title" className="text-2xl sm:text-3xl font-bold tracking-tight">Your Video Is Ready</h2>
        <p className="text-sm text-medium-black">You&apos;re one step closer to better conversations. See PitchProX in action below.</p>
      </div>

      {/* Video */}
      <div className="mt-6">
        <p className="text-[11px] font-bold tracking-[0.18em] text-primary uppercase mb-2">See how it works</p>
        <div className="relative overflow-hidden rounded-2xl bg-dark-black shadow-lg">
          <video
            ref={videoRef}
            src={DEMO_VIDEO.src}
            poster={DEMO_VIDEO.poster}
            controls
            playsInline
            preload="metadata"
            className="block w-full aspect-video bg-dark-black"
            aria-label={DEMO_VIDEO.title}
            onPlay={() => {
              setPlaying(true);
              track("started");
            }}
            onPause={() => setPlaying(false)}
            onEnded={() => track("completed")}
          />
          {!playing && (
            <button type="button" onClick={play} aria-label="Play video" className="absolute inset-0 flex items-center justify-center bg-dark-black/10 hover:bg-dark-black/20 transition-colors cursor-pointer">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-primary shadow-xl">
                <Play className="h-7 w-7 translate-x-0.5" fill="currentColor" />
              </span>
            </button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-medium-black">
            {DEMO_VIDEO.caption} · <span className="font-semibold text-dark-black">{DEMO_VIDEO.duration}</span>
          </p>
          <button type="button" onClick={play} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-black text-white text-sm font-semibold hover:bg-dark-black/85 cursor-pointer">
            <Play className="h-4 w-4" /> Watch the Video
          </button>
        </div>
        {emailed && <p className="mt-1.5 text-xs text-light-black">We&apos;ll email you this link as well.</p>}
      </div>

      {/* Plans */}
      <div className="mt-8 rounded-2xl border border-light-gray bg-white p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold">Make your next call count.</h3>
          <p className="text-sm text-medium-black">Start free, or choose the plan that fits how you sell.</p>
        </div>

        {trial && (
          <div className="rounded-xl border-2 border-primary bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold">Free trial</p>
              <p className="text-sm text-medium-black">
                {trial.callsPerMonth} live AI-guided calls + {trial.reportsPerMonth} detailed call report{trial.reportsPerMonth === 1 ? "" : "s"}
              </p>
            </div>
            <Link href={signUpHref({ name, email })} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-sm font-bold whitespace-nowrap">
              Start My Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {paid.length > 0 && (
          <fieldset>
            <legend className="text-xs font-semibold text-light-black uppercase tracking-wider mb-2">or choose a plan</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {paid.map((plan) => (
                <label key={plan.id} className={`relative rounded-xl border p-3.5 cursor-pointer transition-colors ${plan.id === selected?.id ? "border-primary bg-primary/5" : "border-light-gray hover:border-primary/40"}`}>
                  <input type="radio" name="video-ready-plan" value={plan.id} checked={plan.id === selected?.id} onChange={() => setChosen(plan.id)} className="sr-only" />
                  {plan.id === "pro" && <span className="absolute -top-2.5 left-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">MOST POPULAR</span>}
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold">{plan.name}</span>
                    {plan.id === selected?.id && <Check className="h-4 w-4 text-primary" />}
                  </span>
                  <span className="block text-xs text-medium-black mt-1">{plan.callsPerMonth} calls/month</span>
                  <span className="block text-base font-bold mt-1">
                    {wholeDollars(plan.priceMonthly)}
                    <span className="text-xs font-medium text-light-black">/mo</span>
                  </span>
                </label>
              ))}
            </div>
            {selected && (
              <Link href={signUpHref({ name, email, plan: selected.id })} className="mt-3 inline-flex w-full items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-dark-black text-dark-black text-sm font-bold hover:bg-dark-black hover:text-white transition-colors">
                Continue with {selected.name} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <p className="mt-2 text-center text-xs text-light-black">Monthly pricing · Additional calls billed per plan.</p>
          </fieldset>
        )}
      </div>

      {onClose ? (
        <button type="button" onClick={onClose} className="mt-5 block mx-auto text-sm font-medium text-medium-black hover:text-primary underline-offset-4 hover:underline cursor-pointer">
          Maybe later — continue to the website
        </button>
      ) : (
        <Link href="/" className="mt-5 block text-center text-sm font-medium text-medium-black hover:text-primary hover:underline underline-offset-4">
          Maybe later — continue to the website
        </Link>
      )}
    </div>
  );
}
