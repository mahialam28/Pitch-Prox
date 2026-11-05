"use client";

import React, { useEffect, useState } from "react";
import { Check, CircleCheck, Circle, Copy, Link2 } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import { Field, Select, fieldClass } from "@/app/super-admin/users/[id]/components/account-dialogs";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";
import { EMPLOYEE_ROLE_OPTIONS } from "@/utils.js/roles";

// Dialogs for the Access Records row actions.

// Shows the one-time activation link so the admin can send it (until email sending is connected)
export const InviteLinkDialog = ({ invite, onClose }) => {
  const [copied, setCopied] = useState(false);
  const link = invite && typeof window !== "undefined" ? `${window.location.origin}/accept-invite?token=${invite.token}` : "";
  const expires = invite ? new Date(invite.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showError("Couldn't copy", "Select the link and copy it manually.");
    }
  };

  return (
    <DialogModal
      isOpen={Boolean(invite)}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2.5">
          <Link2 className="w-6 h-6 text-primary" /> Invite link ready
        </span>
      }
      subtitle={`Send this link to ${invite?.name ?? "the employee"}. It works once and expires on ${expires}.`}
      size="md"
      footer={<DialogButton variant="primary" onClick={onClose}>Done</DialogButton>}
    >
      <div className="space-y-3">
        <div className="flex gap-2">
          <input readOnly value={link} onFocus={(event) => event.target.select()} aria-label="Invite link" className={`${fieldClass} bg-light-gray/60 text-sm text-medium-black`} />
          <button type="button" onClick={copy} className="inline-flex items-center gap-2 px-4 rounded-xl border border-primary text-primary text-sm font-medium hover:bg-primary/5 whitespace-nowrap cursor-pointer">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
        <p className="text-xs text-medium-black">Opening the link signs them in and starts their onboarding. Email delivery is added once an email service is connected.</p>
      </div>
    </DialogModal>
  );
};

export const ChangeRoleDialog = ({ employee, onClose, onSave }) => {
  const [role, setRole] = useState(employee?.role ?? "");
  const [saving, setSaving] = useState(false);
  return (
    <DialogModal
      isOpen={Boolean(employee)}
      onClose={onClose}
      title="Change role"
      subtitle={`${employee?.name ?? ""} · currently ${employee?.roleLabel ?? ""}`}
      size="sm"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton
            variant="primary"
            disabled={saving || role === employee?.role}
            onClick={async () => {
              setSaving(true);
              try {
                await onSave(role);
                onClose();
              } catch (error) {
                showError("Role not changed", error.message);
              } finally {
                setSaving(false);
              }
            }}
          >
            Save Role
          </DialogButton>
        </>
      }
    >
      <Field label="Role" htmlFor="employee-role">
        <Select id="employee-role" value={role} onChange={setRole} options={EMPLOYEE_ROLE_OPTIONS.map((option) => ({ value: option.role, label: option.label }))} />
      </Field>
      <p className="text-xs text-medium-black mt-3">The new role takes effect the next time they load a page; their sidebar changes to match.</p>
    </DialogModal>
  );
};

const STEP_LABELS = { welcome: "Welcome", policies: "Review Policies", ethics: "AI Ethics", security: "Security Setup", training: "Training Modules", final: "Final Acknowledgment", voice: "Voice Calibration" };

export const OnboardingProgressDialog = ({ employee, onClose }) => {
  const [progress, setProgress] = useState(null);
  useEffect(() => {
    if (!employee) return undefined;
    let cancelled = false;
    apiRequest(`/api/v1/admin/employees/${employee.id}/onboarding`)
      .then((data) => !cancelled && setProgress(data))
      .catch((error) => !cancelled && setProgress({ error: error.message }));
    return () => {
      cancelled = true;
    };
  }, [employee]);

  return (
    <DialogModal
      isOpen={Boolean(employee)}
      onClose={onClose}
      title="Onboarding progress"
      subtitle={employee ? `${employee.name} · due ${employee.onboardingDue ? new Date(`${employee.onboardingDue}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}` : ""}
      size="sm"
      footer={<DialogButton onClick={onClose}>Close</DialogButton>}
    >
      {!progress ? (
        <p className="text-sm text-medium-black">Loading…</p>
      ) : progress.error ? (
        <p className="text-sm text-red-600">{progress.error}</p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-dark-black">
            {progress.done} of {progress.total} steps done
          </p>
          <ul className="space-y-2">
            {progress.steps
              .filter((step) => step.id !== "complete")
              .map((step) => (
                <li key={step.id} className="flex items-center gap-2 text-sm">
                  {step.done ? <CircleCheck className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4 text-light-black" />}
                  <span className={step.done ? "text-dark-black" : "text-medium-black"}>{STEP_LABELS[step.id] ?? step.id}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </DialogModal>
  );
};

// employee: the person to offboard, or { choose: true } to pick one from `managers` (active staff)
export const StartOffboardingDialog = ({ employee, managers, onClose, onStart }) => {
  const choosing = Boolean(employee?.choose);
  const [userId, setUserId] = useState("");
  const [lastDay, setLastDay] = useState(() => new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
  const [ownerId, setOwnerId] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  return (
    <DialogModal
      isOpen={Boolean(employee)}
      onClose={onClose}
      title="Start offboarding"
      subtitle={choosing ? "Choose who is leaving and when." : `${employee?.name ?? ""} · ${employee?.roleLabel ?? ""}`}
      size="sm"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton
            variant="primary"
            disabled={saving || !lastDay || (choosing && !userId)}
            onClick={async () => {
              setSaving(true);
              try {
                await onStart({ userId: choosing ? userId : employee.id, lastDay, ownerId: ownerId || null, reason });
                onClose();
              } catch (error) {
                showError("Offboarding not started", error.message);
              } finally {
                setSaving(false);
              }
            }}
          >
            Start Offboarding
          </DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        {choosing && (
          <Field label="Employee" htmlFor="offboard-employee">
            <Select id="offboard-employee" value={userId} onChange={setUserId} placeholder="Select an employee" options={managers.map((manager) => ({ value: manager.id, label: `${manager.name}${manager.jobTitle ? ` · ${manager.jobTitle}` : ""}` }))} />
          </Field>
        )}
        <Field label="Last day" htmlFor="offboard-last-day">
          <input id="offboard-last-day" type="date" value={lastDay} onChange={(event) => setLastDay(event.target.value)} className={fieldClass} />
        </Field>
        <Field label="Checklist owner" htmlFor="offboard-owner">
          <Select
            id="offboard-owner"
            value={ownerId}
            onChange={setOwnerId}
            placeholder="Me"
            options={managers.filter((manager) => manager.id !== (choosing ? userId : employee?.id)).map((manager) => ({ value: manager.id, label: `${manager.name}${manager.jobTitle ? ` · ${manager.jobTitle}` : ""}` }))}
          />
        </Field>
        <Field label="Reason (optional)" htmlFor="offboard-reason">
          <input id="offboard-reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="e.g. Resigned" className={fieldClass} />
        </Field>
        <p className="text-xs text-medium-black">Their access stays on until the checklist&apos;s &quot;Revoke application access&quot; step is ticked.</p>
      </div>
    </DialogModal>
  );
};
