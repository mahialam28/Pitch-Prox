"use client";

import React from "react";
import { BookOpen, Check, FolderKanban } from "lucide-react";
import Link from "next/link";

const playbookFeatures = [
  "Attached to account",
  "Can be revoked by admin",
  "Track purchase, activation, assigned users & lead types",
];

export const PlaybookAddOns = ({ onManagePlaybooks }) => {
  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs hover:shadow-sm transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between h-full">
      {/* Top Header & Content */}
      <div className="flex flex-col">
        {/* Header */}
        <div>
          <h3 className="text-base font-bold text-dark-black/80 font-secondary">
            Playbook Add-Ons
          </h3>
          <p className="text-xs text-medium-black mt-0.5">
            Purchase additional playbooks for your account.
          </p>
        </div>

        {/* Pricing Display */}
        <div className="flex items-center gap-3.5 mt-5">
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-dark-black/85 font-secondary">
              $49
            </span>
            <span className="text-xs text-medium-black font-medium">
              / playbook
            </span>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="mt-6 space-y-3">
          {playbookFeatures.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5] mt-0.5" />
              <span className="text-medium-black font-medium leading-tight">
                {feat}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Button */}
      <div className="mt-6 pt-2">
        {onManagePlaybooks ? (
          <button
            type="button"
            onClick={onManagePlaybooks}
            className="w-full py-2.5 px-3 rounded-xl border border-light-gray hover:bg-light-gray/40 text-dark-black/80 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Manage Playbooks</span>
          </button>
        ) : (
          <Link
            href="/super-admin/plan-pricing-control/manage-playbooks"
            className="w-full py-2.5 px-3 rounded-xl border border-light-gray hover:bg-light-gray/40 text-dark-black/80 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Manage Playbooks</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default PlaybookAddOns;
