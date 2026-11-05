"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, Bot, FileText, History, KeyRound, Mic, ShieldCheck, UserMinus } from "lucide-react";
import { apiRequest } from "@/lib/client-api";
import { AI_POLICIES, COMPANY_POLICIES, DUE_DATE, EMPLOYEE_ID, EMPLOYEE_NAME, TRAINING_DOCUMENTS, TRAINING_MODULES, VARIANTS } from "./onboarding-data";

// One data source for the onboarding screens:
//  - live: the signed-in employee's real onboarding (/api/v1/onboarding); every action is saved
//  - preview: sample data in local state, for admins viewing the flow from Access Records

const ICONS = { file: FileText, key: KeyRound, shield: ShieldCheck, history: History, "user-minus": UserMinus, badge: BadgeCheck, bot: Bot, mic: Mic };

const formatDate = (value) => (value ? new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—");

const fromApi = (state) => {
  const policy = (item) => ({ ...item, icon: ICONS[item.icon] ?? FileText });
  const signatures = (list) => Object.fromEntries(list.filter((item) => item.acknowledged).map((item) => [item.id, item.signature]));
  const course = state.training[0];
  const modules = state.training.flatMap((item) => item.modules);
  return {
    steps: state.steps.map((step) => step.id),
    done: Object.fromEntries(state.steps.map((step) => [step.id, step.done])),
    current: state.current,
    details: {
      Role: state.profile.roleLabel,
      Department: state.profile.department ?? "—",
      Manager: state.profile.managerName ?? "—",
      "Start Date": formatDate(state.profile.startDate),
    },
    dueDate: formatDate(state.profile.onboardingDue),
    name: state.profile.name,
    employeeId: state.profile.employeeId,
    companyPolicies: state.policies.map(policy),
    aiPolicies: state.aiPolicies.map(policy),
    policyAcks: signatures(state.policies),
    ethicsAcks: signatures(state.aiPolicies),
    security: { mfa: state.security.mfaMethod, passwordSet: state.security.passwordSet },
    training: {
      title: course?.title ?? "Onboarding Training",
      documents: course?.resources ?? [],
      modules: modules.map(({ id, title, minutes }) => ({ id, title, minutes })),
      completed: Object.fromEntries(modules.filter((item) => item.completed).map((item) => [item.id, true])),
    },
  };
};

export function useOnboarding(variant, live) {
  const steps = VARIANTS[variant].steps;
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);

  // Preview: sample data kept locally
  const [preview, setPreview] = useState({
    policyAcks: {},
    ethicsAcks: {},
    security: { mfa: "sms", passwordSet: false },
    completed: { m1: true, m2: true },
    final: false,
    voice: false,
  });

  const load = useCallback(async () => {
    try {
      setState(fromApi(await apiRequest("/api/v1/onboarding")));
      setError(null);
    } catch (loadError) {
      setError(loadError.message);
    }
  }, []);

  useEffect(() => {
    if (!live) return undefined;
    let cancelled = false;
    apiRequest("/api/v1/onboarding")
      .then((data) => !cancelled && setState(fromApi(data)))
      .catch((loadError) => !cancelled && setError(loadError.message));
    return () => {
      cancelled = true;
    };
  }, [live]);

  // Every live action returns the full updated state
  const send = async (url, options) => setState(fromApi(await apiRequest(url, options)));

  if (live) {
    return {
      loading: !state && !error,
      error,
      reload: load,
      data: state,
      actions: {
        start: () => send("/api/v1/onboarding/start", { method: "POST" }),
        acknowledge: (id, signature) => send(`/api/v1/onboarding/policies/${id}/acknowledge`, { method: "POST", body: { signature } }),
        selectMfa: (mfaMethod) => send("/api/v1/onboarding/security", { method: "PUT", body: { mfaMethod } }),
        setPassword: (password, confirm) => send("/api/v1/onboarding/password", { method: "POST", body: { password, confirm } }),
        completeModule: (moduleId) => send(`/api/v1/onboarding/training/modules/${moduleId}/complete`, { method: "POST" }),
        signFinal: (payload) => send("/api/v1/onboarding/final", { method: "POST", body: payload }),
        completeVoice: (durationSeconds) => send("/api/v1/onboarding/voice", { method: "POST", body: { durationSeconds } }),
      },
    };
  }

  // ── Preview mode ──
  const update = (changes) => setPreview((prev) => ({ ...prev, ...changes }));
  const done = {
    welcome: true,
    policies: COMPANY_POLICIES.every((item) => preview.policyAcks[item.id]),
    ethics: AI_POLICIES.every((item) => preview.ethicsAcks[item.id]),
    security: Boolean(preview.security.mfa && preview.security.passwordSet),
    training: TRAINING_MODULES.every((item) => preview.completed[item.id]),
    final: preview.final,
    voice: preview.voice,
  };
  done.complete = steps.filter((id) => id !== "complete").every((id) => done[id]);

  return {
    loading: false,
    error: null,
    preview: true,
    data: {
      steps,
      done,
      current: steps.find((id) => !done[id]) ?? "complete",
      details: VARIANTS[variant].details,
      dueDate: DUE_DATE,
      name: EMPLOYEE_NAME,
      employeeId: EMPLOYEE_ID,
      companyPolicies: COMPANY_POLICIES,
      aiPolicies: AI_POLICIES,
      policyAcks: preview.policyAcks,
      ethicsAcks: preview.ethicsAcks,
      security: preview.security,
      training: { title: "Onboarding Training", documents: TRAINING_DOCUMENTS, modules: TRAINING_MODULES, completed: preview.completed },
    },
    actions: {
      start: async () => {},
      acknowledge: async (id, signature) => {
        const key = AI_POLICIES.some((item) => item.id === id) ? "ethicsAcks" : "policyAcks";
        update({ [key]: { ...preview[key], [id]: signature } });
      },
      selectMfa: async (mfa) => update({ security: { ...preview.security, mfa } }),
      setPassword: async () => update({ security: { ...preview.security, passwordSet: true } }),
      completeModule: async (id) => update({ completed: { ...preview.completed, [id]: true } }),
      signFinal: async () => update({ final: true }),
      completeVoice: async () => update({ voice: true }),
    },
  };
}
