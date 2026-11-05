"use client";

import React from "react";
import {
  Info,
  RotateCcw,
  Target,
  Heart,
  Shield,
  AlertTriangle,
  Flag,
  Bell,
  Clock,
  Layers,
  CheckCircle2,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

export const DEFAULT_RULES_BY_CATEGORY = {
  "intent-detection": [
    {
      id: "intent-buying",
      title: "Buying Intent Rule",
      subtitle: "Detect readiness to buy.",
      howItWorks:
        "Analyzes keywords, phrases, and sentence structure to identify high purchase intent.",
      icon: Target,
      active: true,
    },
    {
      id: "intent-inquiry",
      title: "Inquiry Intent Rule",
      subtitle: "Understand questions.",
      howItWorks:
        "Detects informational questions regarding features, onboarding, and deliverables.",
      icon: Target,
      active: true,
    },
    {
      id: "intent-price",
      title: "Price Comparison Rule",
      subtitle: "Catch budget queries.",
      howItWorks:
        "Identifies when prospect asks about pricing tiers, ROI, or competitor packages.",
      icon: Target,
      active: true,
    },
    {
      id: "intent-timeline",
      title: "Timeline Sensitivity Rule",
      subtitle: "Gauge time urgency.",
      howItWorks:
        "Evaluates target deployment dates, deadlines, and urgency cues in speech.",
      icon: Target,
      active: true,
    },
    {
      id: "intent-hesitation",
      title: "Hesitation Detection Rule",
      subtitle: "Catch decision stalls.",
      howItWorks:
        "Detects non-committal phrasing ('maybe', 'let me think') to trigger clarity cues.",
      icon: Target,
      active: true,
    },
  ],
  "emotion-analysis": [
    {
      id: "emotion-skeptical",
      title: "Skeptical & Guarded Rule",
      subtitle: "Catch resistance early.",
      howItWorks:
        "Detects defensive tone, sighs, and guarded phrasing to prompt empathy validation.",
      icon: Heart,
      active: true,
    },
    {
      id: "emotion-enthusiastic",
      title: "Enthusiastic & Receptive Rule",
      subtitle: "Recognize excitement.",
      howItWorks:
        "Identifies positive sentiment and high receptivity to accelerate value delivery.",
      icon: Heart,
      active: true,
    },
    {
      id: "emotion-frustrated",
      title: "Frustration Analysis Rule",
      subtitle: "De-escalate tension.",
      howItWorks:
        "Flags tension, impatience, or past negative experiences to calm the prospect.",
      icon: Heart,
      active: true,
    },
    {
      id: "emotion-analytical",
      title: "Analytical Mindset Rule",
      subtitle: "Provide structured data.",
      howItWorks:
        "Recognizes data-driven questions and switches prompt style to facts and metrics.",
      icon: Heart,
      active: true,
    },
    {
      id: "emotion-rushed",
      title: "Rushed & Impatient Rule",
      subtitle: "Keep cues punchy.",
      howItWorks:
        "Detects time-pressured prospects and trims talking points to bottom-line points.",
      icon: Heart,
      active: true,
    },
  ],
  "trust-logic": [
    {
      id: "trust-scoring",
      title: "Trust Scoring Engine",
      subtitle: "Measure trust in real time.",
      howItWorks:
        "Evaluates verbal openness and engagement to calculate a dynamic trust score (0–100).",
      icon: Shield,
      active: true,
    },
    {
      id: "trust-drop-alert",
      title: "Trust Drop Alert Rule",
      subtitle: "Recover lost trust.",
      howItWorks:
        "Triggers empathy validation cues and social proof when trust score drops below 40.",
      icon: Shield,
      active: true,
    },
    {
      id: "trust-credibility",
      title: "Credibility Anchor Rule",
      subtitle: "Reinforce authority.",
      howItWorks:
        "Surfaces proven track record and local market case studies when doubt is sensed.",
      icon: Shield,
      active: true,
    },
    {
      id: "trust-transparency",
      title: "Transparency Trigger Rule",
      subtitle: "Maintain honesty.",
      howItWorks:
        "Ensures clear disclosures and avoids over-promising on sensitive topics.",
      icon: Shield,
      active: true,
    },
  ],
  "objection-logic": [
    {
      id: "objection-price",
      title: "Price Objection Rule",
      subtitle: "Reframe budget concerns.",
      howItWorks:
        "Matches budget pushback and deploys 4-step Cost-of-Inaction reframing framework.",
      icon: AlertTriangle,
      active: true,
    },
    {
      id: "objection-timing",
      title: "Timing Objection Rule",
      subtitle: "Handle delay requests.",
      howItWorks:
        "Catches 'call me next month' responses and tests underlying decision timeline.",
      icon: AlertTriangle,
      active: true,
    },
    {
      id: "objection-competitor",
      title: "Competitor Objection Rule",
      subtitle: "Differentiate cleanly.",
      howItWorks:
        "Identifies competitor names and highlights key unique value differentiators.",
      icon: AlertTriangle,
      active: true,
    },
    {
      id: "objection-authority",
      title: "Authority Objection Rule",
      subtitle: "Navigate partner hesitations.",
      howItWorks:
        "Provides joint decision-making frameworks when spouse or partner is cited.",
      icon: AlertTriangle,
      active: true,
    },
    {
      id: "objection-need",
      title: "Need & Priority Rule",
      subtitle: "Uncover hidden pain.",
      howItWorks:
        "Handles 'we are happy with current setup' by asking strategic diagnosis questions.",
      icon: AlertTriangle,
      active: true,
    },
  ],
  "response-selection": [
    {
      id: "response-ranking",
      title: "Multi-Variable Ranker",
      subtitle: "Choose the best prompt.",
      howItWorks:
        "Ranks talking points based on intent + emotion + trust score + stage progress.",
      icon: Flag,
      active: true,
    },
    {
      id: "response-stage",
      title: "Stage Progression Rule",
      subtitle: "Advance conversation.",
      howItWorks:
        "Ensures prompt advances the deal logically to the next conversational milestone.",
      icon: Flag,
      active: true,
    },
    {
      id: "response-brevity",
      title: "Rep Brevity Filter",
      subtitle: "Keep cues readable.",
      howItWorks:
        "Limits prompt length to short, punchy sentences that reps can absorb instantly.",
      icon: Flag,
      active: true,
    },
    {
      id: "response-alternatives",
      title: "Backup Options Rule",
      subtitle: "Provide 2 alternates.",
      howItWorks:
        "Supplies 1 primary prompt plus 2 quick alternative angles for rep flexibility.",
      icon: Flag,
      active: true,
    },
  ],
  "escalation-logic": [
    {
      id: "escalation-conflict",
      title: "Conflict De-escalation Rule",
      subtitle: "Defuse heated moments.",
      howItWorks:
        "Detects frustrated or confrontational language and switches to calm holding cues.",
      icon: Bell,
      active: true,
    },
    {
      id: "escalation-manager",
      title: "Manager Request Rule",
      subtitle: "Alert supervisor live.",
      howItWorks:
        "Flags team lead dashboard immediately when prospect asks for management.",
      icon: Bell,
      active: true,
    },
    {
      id: "escalation-compliance",
      title: "Compliance Guardrail Rule",
      subtitle: "Prevent risk exposure.",
      howItWorks:
        "Enforces zero tolerance on prohibited terms, legal disclaimers, and claims.",
      icon: Bell,
      active: true,
    },
    {
      id: "escalation-deadlock",
      title: "Deadlock Resolution Rule",
      subtitle: "Break stalled loops.",
      howItWorks:
        "Suggests consultative reset questions when repeated objections stall the call.",
      icon: Bell,
      active: true,
    },
  ],
  "timing-pacing": [
    {
      id: "timing-silence",
      title: "Silence Detection Rule",
      subtitle: "Respect tactical pauses.",
      howItWorks:
        "Detects silence > 3s and prompts rep to pause before asking a soft check-in.",
      icon: Clock,
      active: true,
    },
    {
      id: "timing-interruption",
      title: "Interruption Guard Rule",
      subtitle: "Let prospect finish.",
      howItWorks:
        "Flags fast speech collisions and cues rep to yield conversational floor.",
      icon: Clock,
      active: true,
    },
    {
      id: "timing-ratio",
      title: "Talk-to-Listen Ratio Rule",
      subtitle: "Maintain balance.",
      howItWorks:
        "Alerts rep when talk time exceeds 60% of total call duration.",
      icon: Clock,
      active: true,
    },
    {
      id: "timing-cadence",
      title: "Cadence Modulation Rule",
      subtitle: "Control delivery speed.",
      howItWorks:
        "Slows prompt pacing during complex numbers and accelerates on warm closes.",
      icon: Clock,
      active: true,
    },
  ],
  "follow-up-logic": [
    {
      id: "followup-scheduled",
      title: "Meeting Scheduled Rule",
      subtitle: "Lock next step.",
      howItWorks:
        "Auto-generates follow-up email with calendar invite and recap agenda.",
      icon: Layers,
      active: true,
    },
    {
      id: "followup-resource",
      title: "Resource Request Rule",
      subtitle: "Send promised assets.",
      howItWorks:
        "Drafts tailored email pre-attached with relevant case studies and guides.",
      icon: Layers,
      active: true,
    },
    {
      id: "followup-objection",
      title: "Unresolved Objection Rule",
      subtitle: "Address remaining doubts.",
      howItWorks:
        "Schedules follow-up touchpoint tailored specifically to unanswered concerns.",
      icon: Layers,
      active: true,
    },
    {
      id: "followup-nurture",
      title: "Long-Term Nurture Rule",
      subtitle: "Stay top of mind.",
      howItWorks:
        "Enrolls qualified cold leads into strategic monthly value-add touch cadence.",
      icon: Layers,
      active: true,
    },
  ],
  "success-indicators": [
    {
      id: "success-buying-signals",
      title: "Buying Signal Detection Rule",
      subtitle: "Recognize progress.",
      howItWorks:
        "Identifies commitment cues and timeline questions to move toward closing.",
      icon: CheckCircle2,
      active: true,
    },
    {
      id: "success-timeline",
      title: "Timeline Agreement Rule",
      subtitle: "Verify launch schedule.",
      howItWorks:
        "Flags specific start dates as high-velocity indicators to initiate close.",
      icon: CheckCircle2,
      active: true,
    },
    {
      id: "success-stakeholder",
      title: "Stakeholder Buy-In Rule",
      subtitle: "Confirm decision unit.",
      howItWorks:
        "Detects team alignment signals and surfaces mutual agreement bridge prompts.",
      icon: CheckCircle2,
      active: true,
    },
    {
      id: "success-assumptive",
      title: "Assumptive Close Trigger",
      subtitle: "Lock the agreement.",
      howItWorks:
        "Triggers seamless closing bridges when readiness score exceeds 85%.",
      icon: CheckCircle2,
      active: true,
    },
  ],
};

const LogicRulesOverviewSection = ({
  category = "intent-detection",
  rules = null,
  onChange = () => {},
  onResetDefaults = () => {},
}) => {
  const currentCategoryKey =
    category && DEFAULT_RULES_BY_CATEGORY[category]
      ? category
      : "intent-detection";

  const categoryRules =
    rules && rules[currentCategoryKey]
      ? rules[currentCategoryKey]
      : DEFAULT_RULES_BY_CATEGORY[currentCategoryKey] || [];

  const handleToggleRule = (ruleId, e) => {
    e.stopPropagation();
    const updated = categoryRules.map((r) => {
      if (r.id === ruleId) {
        const nextActive = !r.active;
        toast.success(
          `${r.title} ${nextActive ? "activated" : "deactivated"}`
        );
        return { ...r, active: nextActive };
      }
      return r;
    });

    if (rules && typeof rules === "object" && !Array.isArray(rules)) {
      onChange({
        ...rules,
        [currentCategoryKey]: updated,
      });
    } else {
      onChange(updated);
    }
  };

  const handleReset = () => {
    if (onResetDefaults) {
      onResetDefaults(currentCategoryKey);
    } else {
      onChange(DEFAULT_RULES_BY_CATEGORY[currentCategoryKey]);
    }
    toast.success("Reset Logic & Rules to defaults!");
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-7 shadow-sm space-y-6">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-dark-black font-secondary">
              Logic &amp; Rules
            </h2>
            <div className="relative group cursor-pointer">
              <Info className="w-4 h-4 text-medium-black/70 hover:text-dark-black transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2.5 bg-dark-black text-white text-[11px] rounded-xl shadow-lg z-20 font-normal leading-relaxed pointer-events-none">
                Set the logic and rules that control how the AI analyzes and decides.
              </div>
            </div>
          </div>
          <p className="text-xs text-medium-black mt-1 font-normal leading-relaxed">
            Set the logic and rules that control how the AI analyzes and decides.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-3.5 py-1.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-medium-black hover:text-dark-black text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Default</span>
        </button>
      </div>

      {/* ── Table Header ── */}
      <div className="flex items-center justify-between gap-3 px-3.5 text-[11px] font-bold text-light-black uppercase tracking-wider select-none">
        <div className="w-[180px] sm:w-[200px] shrink-0">LOGIC RULE</div>
        <div className="flex-1 min-w-0 hidden sm:block">HOW IT WORKS</div>
        <div className="w-[85px] shrink-0 text-right">STATUS</div>
      </div>

      {/* ── Rules Rows ── */}
      <div className="space-y-2.5">
        {categoryRules.map((rule) => {
          const Icon = rule.icon || Target;

          return (
            <div
              key={rule.id}
              className="p-3.5 sm:p-4 rounded-xl border flex items-center justify-between gap-3 bg-white hover:bg-light-gray/30 border-light-gray hover:border-medium-black/20 shadow-2xs transition-all"
            >
              {/* Left Column: Icon + Title + Subtitle */}
              <div className="w-[180px] sm:w-[200px] flex items-center gap-3 shrink-0 min-w-0">
                <div className="w-8 h-8 rounded-full bg-teal-50 text-primary border border-teal-200/70 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0 pr-1">
                  <h4 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary leading-snug">
                    {rule.title}
                  </h4>
                  <p className="text-[11px] text-medium-black font-normal mt-0.5 leading-tight">
                    {rule.subtitle}
                  </p>
                </div>
              </div>

              {/* Middle Column: How it Works */}
              <div className="flex-1 min-w-0 hidden sm:block pr-2">
                <p className="text-xs text-medium-black font-normal leading-relaxed">
                  {rule.howItWorks}
                </p>
              </div>

              {/* Right Column: Status Button (NO ARROW) */}
              <div className="w-[85px] shrink-0 flex items-center justify-end">
                <button
                  type="button"
                  onClick={(e) => handleToggleRule(rule.id, e)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-2xs shrink-0 select-none ${
                    rule.active
                      ? "bg-teal-50 border border-primary/40 text-primary hover:bg-teal-100/60"
                      : "bg-light-gray border border-light-gray text-medium-black hover:bg-light-gray/80"
                  }`}
                >
                  {rule.active && (
                    <Check className="w-3.5 h-3.5 text-primary stroke-[2.5]" />
                  )}
                  <span>{rule.active ? "Active" : "Inactive"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LogicRulesOverviewSection;
