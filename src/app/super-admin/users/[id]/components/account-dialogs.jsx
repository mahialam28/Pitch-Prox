"use client";

import React, { useState, useSyncExternalStore } from "react";
import { ArrowDown, Ban, Check, ChevronDown, CircleCheck, CircleX, Eye, RotateCw, Trash2 } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import ConfirmDialog from "@/components/modals/confirm-dialog";
import RadioCards from "@/components/shared/radio-cards";
import { showExportStartedToast, showSavedToast } from "@/lib/toast";
import { showError } from "@/lib/alerts";

// Design-only dialogs for Super Admin → Users. Confirming closes the dialog and
// shows a confirmation; nothing is charged, sent or deleted.

export const SAMPLE_ACCOUNT = {
  name: "Jennifer Smith",
  company: "Acme Inc.",
  email: "jennifer.smith@acme.com",
  plan: "Premium Plan",
  price: "$499 / month",
  renews: "Jun 15, 2025",
};

const labelClass = "block text-xs font-medium leading-4 text-medium-black mb-2";
export const fieldClass =
  "w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-base text-dark-black placeholder:text-gray-500 outline-none focus:border-primary transition-colors";

export const Field = ({ label, htmlFor, children }) => (
  <div>
    <label htmlFor={htmlFor} className={labelClass}>{label}</label>
    {children}
  </div>
);

export const Select = ({ id, value, onChange, options, placeholder }) => (
  <div className="relative">
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`${fieldClass} appearance-none pr-10 cursor-pointer ${value ? "" : "text-gray-500"}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => {
        const { value: optionValue, label } = typeof option === "string" ? { value: option, label: option } : option;
        return <option key={optionValue} value={optionValue}>{label}</option>;
      })}
    </select>
    <ChevronDown className="w-[18px] h-[18px] text-dark-black/70 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
  </div>
);

export const Checkbox = ({ checked, onChange, children }) => (
  <label className="flex items-center gap-3 cursor-pointer select-none">
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only peer" />
    <span className="w-5 h-5 rounded-md border border-gray-300 flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
      {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
    </span>
    <span className="text-sm text-medium-black">{children}</span>
  </label>
);

const TextArea = ({ id, value, onChange, placeholder, rows = 3 }) => (
  <textarea id={id} rows={rows} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`${fieldClass} resize-none`} />
);

const SUSPEND_REASONS = ["Payment issue", "Terms of service violation", "Customer request", "Security concern", "Other"];
const CANCEL_REASONS = ["Too expensive", "Not using it enough", "Switching to another tool", "Missing features", "Other"];
const CREDIT_REASONS = ["Goodwill gesture", "Service outage", "Billing correction", "Promotion", "Other"];

// ── Account status confirmations ─────────────────────────────────────────────

// Reason-required confirmation (suspend / cancel)
const ReasonConfirm = ({ isOpen, onClose, reasons, reasonLabel, onConfirm, ...props }) => {
  const [reason, setReason] = useState("");
  const close = () => {
    setReason("");
    onClose();
  };
  return (
    <ConfirmDialog isOpen={isOpen} onClose={close} confirmDisabled={!reason} onConfirm={() => onConfirm?.(reason)} {...props}>
      <Field label={reasonLabel} htmlFor="confirm-reason">
        <Select id="confirm-reason" value={reason} onChange={setReason} options={reasons} placeholder="Select a reason" />
      </Field>
    </ConfirmDialog>
  );
};

export const SuspendAccountModal = ({ isOpen, onClose, name = SAMPLE_ACCOUNT.name, onConfirm, iconTone = "danger" }) => (
  <ReasonConfirm
    isOpen={isOpen}
    onClose={onClose}
    title="Suspend this account?"
    icon={Ban}
    iconTone={iconTone}
    message={`${name} will be signed out and blocked from calling until the account is reactivated.`}
    note="Data is kept. You can reactivate any time."
    reasonLabel="Reason for suspending"
    reasons={SUSPEND_REASONS}
    confirmLabel="Suspend Account"
    onConfirm={(reason) => {
      onConfirm?.(reason);
      showSavedToast("Account suspended", `${name} can no longer sign in or place calls.`);
    }}
  />
);

export const CancelAccountModal = ({ isOpen, onClose, onConfirm }) => (
  <ReasonConfirm
    isOpen={isOpen}
    onClose={onClose}
    title="Cancel this account?"
    icon={CircleX}
    message="The subscription ends today and no further charges are made."
    note="Remaining credits are forfeited."
    reasonLabel="Reason for cancelling"
    reasons={CANCEL_REASONS}
    cancelLabel="Keep Account"
    confirmLabel="Cancel Account"
    onConfirm={(reason) => {
      onConfirm?.(reason);
      showSavedToast("Account cancelled", "The subscription has ended and billing has stopped.");
    }}
  />
);

export const ReactivateAccountModal = ({ isOpen, onClose, onConfirm }) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    title="Reactivate this account?"
    icon={CircleCheck}
    iconTone="primary"
    message="Access is restored immediately and billing resumes on the next cycle."
    confirmLabel="Reactivate Account"
    confirmVariant="primary"
    onConfirm={() => {
      onConfirm?.();
      showSavedToast("Account reactivated", "The user can sign in and place calls again.");
    }}
  />
);

export const DeactivateAccountModal = ({ isOpen, onClose, onConfirm }) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    title="Deactivate this account?"
    icon={Ban}
    iconTone="warning"
    message="The account is hidden from active lists and the user cannot sign in. Billing is paused."
    confirmLabel="Deactivate"
    confirmVariant="primary"
    onConfirm={() => {
      onConfirm?.();
      showSavedToast("Account deactivated", "Billing is paused until the account is reactivated.");
    }}
  />
);

export const ResetCalibrationModal = ({ isOpen, onClose, onConfirm }) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    title="Reset calibration?"
    icon={RotateCw}
    iconTone="warning"
    message="The user goes through all 7 calibration rounds again so PitchProX can re-learn their reading speed and style."
    note="Until they finish, AI prompts use default pacing and live calling stays locked."
    confirmLabel="Reset Calibration"
    confirmVariant="primary"
    onConfirm={() => {
      onConfirm?.();
      showSavedToast("Calibration reset", "The user will be asked to calibrate again at next sign-in.");
    }}
  />
);

export const DeleteAccountModal = ({ isOpen, onClose, company = SAMPLE_ACCOUNT.company, onConfirm }) => {
  const [typed, setTyped] = useState("");
  const close = () => {
    setTyped("");
    onClose();
  };
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={close}
      title="Delete this account?"
      icon={Trash2}
      message={`All leads, calls, reports, playbooks and training content for ${company} are permanently deleted.`}
      note="This can't be undone."
      noteClassName="text-red-600"
      confirmLabel="Delete Account"
      confirmDisabled={typed !== "DELETE"}
      onConfirm={() => {
        onConfirm?.();
        showSavedToast("Account deleted", `${company} and all of its data were removed.`);
      }}
    >
      <Field label="Type DELETE to confirm" htmlFor="delete-confirm">
        <input id="delete-confirm" value={typed} onChange={(event) => setTyped(event.target.value)} placeholder="DELETE" autoComplete="off" className={fieldClass} />
      </Field>
    </ConfirmDialog>
  );
};

export const DeleteNoteModal = ({ note, onClose, onConfirm }) => (
  <ConfirmDialog
    isOpen={Boolean(note)}
    onClose={onClose}
    title="Delete this note?"
    icon={Trash2}
    message={`"${note?.preview ?? ""}" will be removed from this account.`}
    note="This can't be undone."
    noteClassName="text-red-600"
    confirmLabel="Delete Note"
    onConfirm={() => onConfirm?.(note)}
  />
);

// ── Credits, discounts and plan changes ──────────────────────────────────────

export const AddCreditsModal = ({ isOpen, onClose, kind = "calls", onConfirm }) => {
  const isCalls = kind === "calls";
  const [amount, setAmount] = useState(isCalls ? "100" : "10");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);
  const valid = Number(amount) > 0 && reason;

  const submit = () => {
    onClose();
    onConfirm?.(Number(amount));
    showSavedToast(isCalls ? "Call credits added" : "Report credits added", `${Number(amount)} ${isCalls ? "calls were" : "report credits were"} added to this account.`);
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title={isCalls ? "Add Calls / Credits" : "Add Report Credits"}
      subtitle={isCalls ? "Manually add call credits to this account." : "Manually add report credits to this account."}
      size="sm"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={submit} disabled={!valid}>Add Credits</DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <Field label={isCalls ? "Number of calls" : "Number of reports"} htmlFor="credit-amount">
          <input id="credit-amount" inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))} className={fieldClass} />
        </Field>
        <Field label="Reason" htmlFor="credit-reason">
          <Select id="credit-reason" value={reason} onChange={setReason} options={CREDIT_REASONS} placeholder="Select a reason" />
        </Field>
        <Field label="Note (optional)" htmlFor="credit-note">
          <TextArea id="credit-note" value={note} onChange={setNote} placeholder="Add an internal note" />
        </Field>
        <Checkbox checked={notify} onChange={setNotify}>Notify the user by email</Checkbox>
      </div>
    </DialogModal>
  );
};

const DISCOUNT_TYPES = [
  { value: "percent", label: "Percentage discount", description: "Example: 20% off" },
  { value: "fixed", label: "Fixed amount credit", description: "Example: $50 off" },
];

export const ApplyDiscountModal = ({ isOpen, onClose }) => {
  const [type, setType] = useState("percent");
  const [value, setValue] = useState("20");
  const [duration, setDuration] = useState("One invoice");
  const [reason, setReason] = useState("");
  const isPercent = type === "percent";
  const valid = Number(value) > 0 && (!isPercent || Number(value) <= 100) && reason;

  const submit = () => {
    onClose();
    showSavedToast("Discount applied", `${isPercent ? `${value}% off` : `$${Number(value).toFixed(2)} credit`} applies to the next invoice.`);
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply Discount / Credit"
      subtitle="Applies to the next invoice."
      size="md"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={submit} disabled={!valid}>Apply Discount</DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <RadioCards label="Discount type" value={type} onChange={setType} options={DISCOUNT_TYPES} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Value" htmlFor="discount-value">
            <div className="relative">
              {!isPercent && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-black">$</span>}
              <input
                id="discount-value"
                inputMode="decimal"
                value={value}
                onChange={(event) => setValue(event.target.value.replace(/[^\d.]/g, ""))}
                className={`${fieldClass} ${isPercent ? "pr-9" : "pl-8"}`}
              />
              {isPercent && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-black">%</span>}
            </div>
          </Field>
          <Field label="Duration" htmlFor="discount-duration">
            <Select id="discount-duration" value={duration} onChange={setDuration} options={["One invoice", "3 months", "6 months", "12 months", "Forever"]} />
          </Field>
        </div>
        <Field label="Reason" htmlFor="discount-reason">
          <Select id="discount-reason" value={reason} onChange={setReason} options={CREDIT_REASONS} placeholder="Select a reason" />
        </Field>
      </div>
    </DialogModal>
  );
};

const PLANS = [
  { value: "Basic", price: 99, calls: 150, reports: 1 },
  { value: "Pro", price: 199, calls: 400, reports: 5 },
  { value: "ProX", price: 349, calls: 750, reports: 15 },
];

export const ChangePlanDialog = ({ isOpen, onClose, current = "Pro", onConfirm }) => {
  const [plan, setPlan] = useState(current);
  const [effective, setEffective] = useState("Next billing date");
  const currentPlan = PLANS.find((option) => option.value === current);
  const selectedPlan = PLANS.find((option) => option.value === plan);
  const immediate = effective === "Immediately";
  const prorated = immediate ? Math.max(0, (selectedPlan.price - currentPlan.price) / 2) : 0;

  const submit = () => {
    onClose();
    onConfirm?.(plan);
    showSavedToast("Plan changed", `The account moves to ${plan} ${immediate ? "today" : `on ${SAMPLE_ACCOUNT.renews}`}.`);
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Plan"
      subtitle={`Current plan: ${current}, $${currentPlan.price} / month.`}
      size="lg"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={submit} disabled={plan === current}>Change Plan</DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <RadioCards
          label="Plan"
          value={plan}
          onChange={setPlan}
          options={PLANS.map((option) => ({
            value: option.value,
            label: `${option.value}  ·  $${option.price} / month${option.value === current ? "  (current)" : ""}`,
            description: `${option.calls} calls and ${option.reports} report${option.reports === 1 ? "" : "s"} per month`,
          }))}
        />
        <Field label="Effective" htmlFor="plan-effective">
          <Select id="plan-effective" value={effective} onChange={setEffective} options={["Next billing date", "Immediately"]} />
        </Field>
        <div className="rounded-xl bg-light-gray px-4 py-3.5">
          <p className="text-sm font-medium text-dark-black">Prorated charge today: ${prorated.toFixed(2)}</p>
          <p className="text-xs text-medium-black mt-1">New plan starts {immediate ? "today" : `on ${SAMPLE_ACCOUNT.renews}`}.</p>
        </div>
      </div>
    </DialogModal>
  );
};

export const DowngradePlanModal = ({ isOpen, onClose, from = "Pro", to = "Basic", onConfirm }) => {
  const fromPlan = PLANS.find((plan) => plan.value === from);
  const toPlan = PLANS.find((plan) => plan.value === to);
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Downgrade to ${to}?`}
      icon={ArrowDown}
      iconTone="warning"
      message={`Limits drop from ${fromPlan.calls} to ${toPlan.calls} calls and from ${fromPlan.reports} to ${toPlan.reports} report per month at the next billing date.`}
      note="Unused credits above the new limit expire."
      confirmLabel="Downgrade Plan"
      confirmVariant="primary"
      onConfirm={() => {
        onConfirm?.(to);
        showSavedToast("Downgrade scheduled", `The account moves to ${to} on ${SAMPLE_ACCOUNT.renews}.`);
      }}
    />
  );
};

const CANCEL_TIMING = [
  { value: "end", label: "End of billing cycle", description: `Access until ${SAMPLE_ACCOUNT.renews}` },
  { value: "now", label: "Immediately", description: "Access ends now, no refund" },
];

export const CancelSubscriptionModal = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const [timing, setTiming] = useState("end");
  const close = () => {
    setReason("");
    setTiming("end");
    onClose();
  };
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={close}
      title="Cancel subscription?"
      icon={CircleX}
      message={`${SAMPLE_ACCOUNT.plan}, ${SAMPLE_ACCOUNT.price}.`}
      cancelLabel="Keep Subscription"
      confirmLabel="Cancel Subscription"
      confirmDisabled={!reason}
      onConfirm={() => {
        onConfirm?.({ reason, timing });
        showSavedToast(
          "Subscription cancelled",
          timing === "now" ? "Access has ended and no further charges are made." : `Access continues until ${SAMPLE_ACCOUNT.renews}.`
        );
      }}
    >
      <div className="space-y-4">
        <Field label="Reason" htmlFor="cancel-sub-reason">
          <Select id="cancel-sub-reason" value={reason} onChange={setReason} options={CANCEL_REASONS} placeholder="Select a reason" />
        </Field>
        <RadioCards label="When" value={timing} onChange={setTiming} options={CANCEL_TIMING} />
      </div>
    </ConfirmDialog>
  );
};

// ── Activity log ─────────────────────────────────────────────────────────────

const ACTIVITY = [
  { when: "May 16, 2025 10:30 AM", action: "Updated account settings", by: "Daniel Miller" },
  { when: "May 16, 2025 09:42 AM", action: "User logged in", by: "Jennifer Smith" },
  { when: "May 15, 2025 04:10 PM", action: "Generated Call Analysis Report", by: "Jennifer Smith" },
  { when: "May 15, 2025 11:02 AM", action: "Added 100 call credits", by: "Daniel Miller" },
  { when: "May 14, 2025 02:25 PM", action: "Completed calibration", by: "Jennifer Smith" },
];

export const ActivityLogModal = ({ isOpen, onClose }) => (
  <DialogModal
    isOpen={isOpen}
    onClose={onClose}
    title="Activity Log"
    subtitle="All actions on this account."
    size="xl"
    footer={
      <>
        <DialogButton onClick={onClose}>Cancel</DialogButton>
        <DialogButton
          variant="primary"
          onClick={() => {
            onClose();
            showExportStartedToast();
          }}
        >
          Export Log
        </DialogButton>
      </>
    }
  >
    <table className="w-full text-left text-sm">
      <tbody className="divide-y divide-gray-200 border-b border-gray-200">
        {ACTIVITY.map((row) => (
          <tr key={row.when + row.action}>
            <td className="py-3 pr-4 text-medium-black whitespace-nowrap">{row.when}</td>
            <td className="py-3 pr-4 font-medium text-dark-black">{row.action}</td>
            <td className="py-3 text-medium-black whitespace-nowrap">{row.by}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </DialogModal>
);

// ── Support ──────────────────────────────────────────────────────────────────

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

export const NewSupportTicketModal = ({ isOpen, onClose, onCreate }) => {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [notify, setNotify] = useState(true);
  const valid = subject.trim() && category && description.trim();

  const close = () => {
    setSubject("");
    setCategory("");
    setPriority("Medium");
    setDescription("");
    onClose();
  };

  const submit = () => {
    onCreate?.({ subject: subject.trim(), category, priority, description: description.trim() });
    showSavedToast("Ticket created", notify ? "The customer was emailed a copy of the ticket." : "The ticket was added to support history.");
    close();
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={close}
      title="New Support Ticket"
      subtitle="Create a ticket on behalf of this customer."
      size="md"
      footer={
        <>
          <DialogButton onClick={close}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={submit} disabled={!valid}>Create Ticket</DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Subject" htmlFor="ticket-subject">
          <input id="ticket-subject" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Short summary of the issue" className={fieldClass} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category" htmlFor="ticket-category">
            <Select id="ticket-category" value={category} onChange={setCategory} options={["Billing", "Technical", "Calibration", "Account", "Feature Request"]} placeholder="Select category" />
          </Field>
          <Field label="Priority" htmlFor="ticket-priority">
            <Select id="ticket-priority" value={priority} onChange={setPriority} options={PRIORITIES} />
          </Field>
        </div>
        <Field label="Description" htmlFor="ticket-description">
          <TextArea id="ticket-description" rows={4} value={description} onChange={setDescription} placeholder="Describe the issue in detail" />
        </Field>
        <Checkbox checked={notify} onChange={setNotify}>Notify the customer by email</Checkbox>
      </div>
    </DialogModal>
  );
};

const MANAGERS = ["Sarah Johnson (Manager)", "Mike Davis (Manager)", "Emily Brown (Manager)"];

// managers: [{ value, label }] (defaults to sample names); onConfirm may be async and throw to keep the dialog open
export const EscalateTicketModal = ({ ticketId, onClose, onConfirm, managers }) => {
  const options = managers ?? MANAGERS.map((name) => ({ value: name, label: name }));
  const [manager, setManager] = useState(options[0]?.value ?? "");
  const [priority, setPriority] = useState("High");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const managerName = options.find((option) => option.value === manager)?.label ?? manager;

  const submit = async () => {
    setSaving(true);
    try {
      await onConfirm?.({ ticketId, manager, priority, reason: reason.trim() });
      onClose();
      showSavedToast("Ticket escalated", `${ticketId} was assigned to ${managerName.replace(/ \(Manager\)$/, "")}.`);
    } catch (error) {
      showError("Not escalated", error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogModal
      isOpen={Boolean(ticketId)}
      onClose={onClose}
      title="Escalate to Manager"
      subtitle={`Ticket ${ticketId ?? ""} will be assigned to a manager.`}
      size="sm"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={submit} disabled={!reason.trim() || !manager || saving}>Escalate Ticket</DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Escalate to" htmlFor="escalate-manager">
          <Select id="escalate-manager" value={manager} onChange={setManager} options={options} />
        </Field>
        <Field label="Priority" htmlFor="escalate-priority">
          <Select id="escalate-priority" value={priority} onChange={setPriority} options={PRIORITIES} />
        </Field>
        <Field label="Reason for escalation" htmlFor="escalate-reason">
          <TextArea id="escalate-reason" value={reason} onChange={setReason} placeholder="Explain why this needs a manager" />
        </Field>
      </div>
    </DialogModal>
  );
};

// Date range + format export (Export Ticket History and similar)
export const ExportDialog = ({ isOpen, onClose, title, subtitle, ranges, formats, confirmLabel = "Export" }) => {
  const [range, setRange] = useState(ranges[0]);
  const [format, setFormat] = useState(formats[0].value);
  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size="sm"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton
            variant="primary"
            onClick={() => {
              onClose();
              showExportStartedToast();
            }}
          >
            {confirmLabel}
          </DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Date range" htmlFor="export-range">
          <Select id="export-range" value={range} onChange={setRange} options={ranges} />
        </Field>
        <RadioCards label="File format" value={format} onChange={setFormat} options={formats} />
      </div>
    </DialogModal>
  );
};

export const ExportTicketHistoryModal = ({ isOpen, onClose }) => (
  <ExportDialog
    isOpen={isOpen}
    onClose={onClose}
    title="Export Ticket History"
    ranges={["May 1, 2024 - May 16, 2025", "Last 30 days", "Last 90 days", "This year"]}
    formats={[
      { value: "csv", label: "CSV", description: "Spreadsheet" },
      { value: "pdf", label: "PDF", description: "Printable report" },
    ]}
  />
);

export const SendMessageModal = ({ recipient, onClose }) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [copyMe, setCopyMe] = useState(false);

  const close = () => {
    setSubject("");
    setMessage("");
    setCopyMe(false);
    onClose();
  };

  return (
    <DialogModal
      isOpen={Boolean(recipient)}
      onClose={close}
      title="Send Message"
      subtitle={`To: ${recipient ?? ""}`}
      size="sm"
      footer={
        <>
          <DialogButton onClick={close}>Cancel</DialogButton>
          <DialogButton
            variant="primary"
            disabled={!subject.trim() || !message.trim()}
            onClick={() => {
              showSavedToast("Message sent", `${recipient?.split(",")[0]} will see it in their inbox.`);
              close();
            }}
          >
            Send Message
          </DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Subject" htmlFor="message-subject">
          <input id="message-subject" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Subject" className={fieldClass} />
        </Field>
        <Field label="Message" htmlFor="message-body">
          <TextArea id="message-body" rows={4} value={message} onChange={setMessage} placeholder="Type your message..." />
        </Field>
        <Checkbox checked={copyMe} onChange={setCopyMe}>Copy me on this message</Checkbox>
      </div>
    </DialogModal>
  );
};

// ── Impersonation banner ─────────────────────────────────────────────────────

export const ImpersonationBanner = ({ name, access = "Full Access", remaining = "58:12", onExit }) => (
  <div role="status" className="w-full flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 font-secondary">
    <Eye className="w-5 h-5 text-amber-700 shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-dark-black">
        You are impersonating {name} ({access})
      </p>
      <p className="text-xs text-medium-black">Session ends in {remaining} · All actions are logged and attributed to you.</p>
    </div>
    <button type="button" onClick={onExit} className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium transition-colors cursor-pointer shrink-0">
      Exit impersonation
    </button>
  </div>
);

// The impersonation session is kept in sessionStorage so the banner survives the
// jump from the Users list to the user's page (design only; the backend issues real sessions).
const IMPERSONATION_KEY = "pitchprox-impersonation";
const noopSubscribe = () => () => {};

export const startImpersonation = (userId, options) => {
  try {
    sessionStorage.setItem(IMPERSONATION_KEY, JSON.stringify({ userId: String(userId), accessLevel: options?.accessLevel ?? "full" }));
  } catch {
    /* storage unavailable: the banner just won't carry over */
  }
};

export const endImpersonation = () => {
  try {
    sessionStorage.removeItem(IMPERSONATION_KEY);
  } catch {
    /* ignore */
  }
};

// Returns the stored session (as a JSON string) on the client, null during SSR
export const useStoredImpersonation = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => {
      try {
        return sessionStorage.getItem(IMPERSONATION_KEY);
      } catch {
        return null;
      }
    },
    () => null
  );
