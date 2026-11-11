"use client";

import React, { useEffect, useState } from "react";
import { FiShield, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import Text from "@/components/texts/text";
import { apiRequest, formatDate } from "@/lib/client-api";
import { DisableTwoFactorModal, EnableTwoFactorModal, RecoveryCodesModal } from "./security-modals";

// Two-step login with an authenticator app: status, turn on/off, new recovery codes
const TwoFactor = () => {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(null); // "enable" | "disable" | "codes"

  useEffect(() => {
    let cancelled = false;
    apiRequest("/api/v1/me/mfa")
      .then((result) => !cancelled && setStatus(result))
      .catch((requestError) => !cancelled && setError(requestError.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const enabled = Boolean(status?.enabled);
  const close = () => setOpen(null);
  const changed = (result) => setStatus({ enabled: result.enabled, enabledAt: result.enabledAt, recoveryCodesLeft: result.recoveryCodesLeft });

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 md:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary flex-shrink-0">
            <FiShield className="w-5 h-5" />
          </div>
          <div>
            <Text variant="regular" className="font-bold">
              Two-Factor Authentication (2FA)
            </Text>
            <Text variant="smaller" className="mt-0.5">
              After your password, PitchProX asks for a 6-digit code from an authenticator app on your phone.
            </Text>
          </div>
        </div>

        {status &&
          (enabled ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full w-fit">
              <FiCheckCircle className="w-3.5 h-3.5" />
              <span>2FA is ON</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-500 text-xs font-semibold rounded-full w-fit">
              <FiAlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>2FA is OFF</span>
            </div>
          ))}
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <p className="text-xs italic text-medium-black">
          {enabled
            ? `On since ${formatDate(status.enabledAt)} · ${status.recoveryCodesLeft} recovery code${status.recoveryCodesLeft === 1 ? "" : "s"} left`
            : "Secure your account with two-factor authentication."}
        </p>
        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          {enabled ? (
            <>
              <button type="button" onClick={() => setOpen("codes")} className="px-4 py-2.5 border border-light-gray hover:border-primary/40 text-dark-black/80 text-xs font-semibold rounded-xl cursor-pointer">
                New recovery codes
              </button>
              <button type="button" onClick={() => setOpen("disable")} className="px-4 py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl cursor-pointer">
                Turn off 2FA
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={!status}
              onClick={() => setOpen("enable")}
              className="px-5 py-2.5 bg-primary hover:bg-medium-teal text-white text-xs font-semibold rounded-xl transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-60"
            >
              Enable 2FA
            </button>
          )}
        </div>
      </div>

      {open === "enable" && <EnableTwoFactorModal onClose={close} onChanged={changed} />}
      {open === "disable" && <DisableTwoFactorModal onClose={close} onChanged={changed} />}
      {open === "codes" && <RecoveryCodesModal onClose={close} onChanged={changed} />}
    </div>
  );
};

export default TwoFactor;
