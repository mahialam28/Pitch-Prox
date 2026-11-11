"use client";

import React, { useEffect, useRef, useState } from "react";
import { Copy, Download, LogOut, QrCode } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import ConfirmDialog from "@/components/modals/confirm-dialog";
import { showSuccess } from "@/lib/alerts";
import { apiRequest } from "@/lib/client-api";

// ── Two-step login (authenticator app) ──────────────────────────────────────
// Render these only while open (conditional render), so each opening starts fresh.

// Six boxes for a 6-digit code; pasting the whole code fills them all
export const CodeInput = ({ value, onChange, autoFocus = true }) => {
  const inputs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "");
  const setDigit = (index, raw) => {
    const clean = raw.replace(/\D/g, "");
    if (clean.length > 1) {
      const next = clean.slice(0, 6);
      onChange(next);
      inputs.current[Math.min(next.length, 5)]?.focus();
      return;
    }
    const next = digits.map((digit, i) => (i === index ? clean : digit)).join("");
    onChange(next);
    if (clean && index < 5) inputs.current[index + 1]?.focus();
  };
  return (
    <div className="flex gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => (inputs.current[index] = element)}
          value={digit}
          onChange={(event) => setDigit(index, event.target.value)}
          onKeyDown={(event) => event.key === "Backspace" && !digits[index] && index > 0 && inputs.current[index - 1]?.focus()}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && index === 0}
          aria-label={`Digit ${index + 1}`}
          className="w-11 sm:w-[52px] h-14 rounded-xl border border-gray-300 text-center text-xl font-semibold text-dark-black outline-none focus:border-primary transition-colors"
        />
      ))}
    </div>
  );
};

// Recovery codes, shown once: copy or download
const RecoveryCodes = ({ codes }) => {
  const text = codes.join("\n");
  const download = () => {
    const url = URL.createObjectURL(new Blob([`PitchProX recovery codes\nEach code works once.\n\n${text}\n`], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "pitchprox-recovery-codes.txt";
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-4">
      <p className="text-sm text-medium-black leading-6">
        Keep these somewhere safe (a password manager or printed). If you lose your phone, each code lets you sign in once. They won&apos;t be shown again.
      </p>
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f2f4f6] p-4 font-mono text-sm text-dark-black">
        {codes.map((code) => (
          <span key={code}>{code}</span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <DialogButton onClick={() => navigator.clipboard?.writeText(text).then(() => showSuccess("Copied", "Recovery codes copied."))}>
          <Copy className="w-4 h-4" /> Copy
        </DialogButton>
        <DialogButton onClick={download}>
          <Download className="w-4 h-4" /> Download
        </DialogButton>
      </div>
    </div>
  );
};

// Turn on: QR code + key → first code → recovery codes
export const EnableTwoFactorModal = ({ onClose, onChanged }) => {
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [codes, setCodes] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiRequest("/api/v1/me/mfa/setup", { method: "POST" })
      .then((result) => !cancelled && setSetup(result))
      .catch((requestError) => !cancelled && setError(requestError.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const verify = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await apiRequest("/api/v1/me/mfa/confirm", { method: "POST", body: { code } });
      setCodes(result.recoveryCodes);
      onChanged(result);
    } catch (requestError) {
      setError(requestError.message);
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  if (codes) {
    return (
      <DialogModal isOpen onClose={onClose} title="Two-step login is on" subtitle="Step 2 of 2 · Save your recovery codes." size="md" footer={<DialogButton variant="primary" onClick={onClose}>I&apos;ve saved them</DialogButton>}>
        <RecoveryCodes codes={codes} />
      </DialogModal>
    );
  }

  return (
    <DialogModal
      isOpen
      onClose={onClose}
      title="Enable Two-Factor Authentication"
      subtitle="Step 1 of 2 · Scan the QR code with your authenticator app."
      size="md"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={verify} disabled={busy || code.length < 6 || !setup}>
            {busy ? "Checking…" : "Verify & Enable"}
          </DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-40 h-40 shrink-0 rounded-xl bg-white border border-gray-300 flex items-center justify-center overflow-hidden">
            {setup ? (
              // eslint-disable-next-line @next/next/no-img-element -- a generated data URL
              <img src={setup.qrCode} alt="QR code for your authenticator app" className="w-full h-full" />
            ) : (
              <QrCode className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-sm leading-5 text-medium-black">
              Use Google Authenticator, Microsoft Authenticator, 1Password or any authenticator app. Can&apos;t scan? Enter this key:
            </p>
            <div className="flex items-center justify-between gap-3 bg-[#f2f4f6] rounded-lg px-3 py-2.5">
              <span className="text-sm font-mono font-medium text-dark-black break-all">{setup?.secret ?? "Generating…"}</span>
              <button
                type="button"
                disabled={!setup}
                onClick={() => navigator.clipboard?.writeText(setup.secret.replace(/\s/g, "")).then(() => showSuccess("Copied", "Key copied."))}
                aria-label="Copy key"
                className="text-dark-black/60 hover:text-primary cursor-pointer disabled:cursor-not-allowed"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium leading-4 text-medium-black mb-2">Enter the 6-digit code the app shows</p>
          <CodeInput value={code} onChange={setCode} />
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <p className="text-xs text-light-black">Turning it on signs you out of your other devices.</p>
      </div>
    </DialogModal>
  );
};

// Turn off: password + a current code (or a recovery code)
export const DisableTwoFactorModal = ({ onClose, onChanged }) => {
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      onChanged(await apiRequest("/api/v1/me/mfa/disable", { method: "POST", body: { password, code } }));
      showSuccess("Two-step login is off", "You'll sign in with your password only.");
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <DialogModal
      isOpen
      onClose={onClose}
      title="Turn off two-step login?"
      subtitle="Your account will be protected by your password only."
      size="md"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="danger" onClick={submit} disabled={busy || !password || !code.trim()}>
            {busy ? "Turning off…" : "Turn off"}
          </DialogButton>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="block text-xs font-medium text-medium-black mb-1.5">Password</span>
          <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:border-primary" />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-medium-black mb-1.5">Code from your app (or a recovery code)</span>
          <input autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:border-primary" />
        </label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      </div>
    </DialogModal>
  );
};

// New recovery codes (the old ones stop working): needs a current app code
export const RecoveryCodesModal = ({ onClose, onChanged }) => {
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await apiRequest("/api/v1/me/mfa/recovery-codes", { method: "POST", body: { code } });
      setCodes(result.recoveryCodes);
      onChanged(result);
    } catch (requestError) {
      setError(requestError.message);
      setCode("");
    } finally {
      setBusy(false);
    }
  };
  return (
    <DialogModal
      isOpen
      onClose={onClose}
      title="New recovery codes"
      subtitle={codes ? "Your old recovery codes no longer work." : "Enter a code from your authenticator app to make new ones."}
      size="md"
      footer={
        codes ? (
          <DialogButton variant="primary" onClick={onClose}>I&apos;ve saved them</DialogButton>
        ) : (
          <>
            <DialogButton onClick={onClose}>Cancel</DialogButton>
            <DialogButton variant="primary" onClick={submit} disabled={busy || code.length < 6}>
              {busy ? "Checking…" : "Make new codes"}
            </DialogButton>
          </>
        )
      }
    >
      {codes ? (
        <RecoveryCodes codes={codes} />
      ) : (
        <div className="space-y-3">
          <CodeInput value={code} onChange={setCode} />
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </DialogModal>
  );
};

// ── Login History ────────────────────────────────────────────────────────────

export const LoginHistoryModal = ({ isOpen, onClose, activities }) => (
  <DialogModal
    isOpen={isOpen}
    onClose={onClose}
    title="Login History"
    subtitle="Recent sign-in activity on your account."
    size="2xl"
    footer={<DialogButton onClick={onClose}>Close</DialogButton>}
  >
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left border-collapse">
        <thead>
          <tr className="text-xs font-medium leading-4 text-gray-500 border-b border-gray-300">
            <th className="py-3 font-medium">Date &amp; Time</th>
            <th className="py-3 font-medium">Device</th>
            <th className="py-3 font-medium">Browser</th>
            <th className="py-3 font-medium">Location</th>
            <th className="py-3 font-medium">IP Address</th>
            <th className="py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((item) => (
            <tr key={item.id} className="border-b border-gray-300 text-sm leading-5 text-dark-black">
              <td className="py-3.5 pr-3 whitespace-nowrap">{item.dateTime} {item.time}</td>
              <td className="py-3.5 pr-3">{item.device}</td>
              <td className="py-3.5 pr-3">{item.browser}</td>
              <td className="py-3.5 pr-3">{item.location}</td>
              <td className="py-3.5 pr-3">{item.ip}</td>
              <td className="py-3.5">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium leading-4 ${
                    item.status === "Success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                  }`}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
          {activities.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-sm text-light-black">No sign-ins recorded yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    <p className="text-xs leading-4 text-medium-black mt-5">
      Showing {activities.length} most recent sign-in{activities.length === 1 ? "" : "s"}
    </p>
  </DialogModal>
);

// ── Log out other devices ────────────────────────────────────────────────────

const listNames = (names) => {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
};

export const LogOutOthersModal = ({ isOpen, onClose, otherDeviceNames, onConfirm }) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    title="Log out of all other devices?"
    icon={LogOut}
    message={
      otherDeviceNames.length
        ? `You'll be signed out of ${listNames(otherDeviceNames)}. You'll stay signed in on this device.`
        : "No other devices are signed in right now. You'll stay signed in on this device."
    }
    note="Use this if you notice activity you do not recognise."
    confirmLabel="Log Out Devices"
    onConfirm={onConfirm}
  />
);
