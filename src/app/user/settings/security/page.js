"use client";

import React from "react";
import Link from "next/link";
import TwoFactor from "./components/two-factor";
import LoginActivity from "./components/login-activity";
import DeviceManagement from "./components/device-management";


const SecuritySettings = () => {
  return (
    <div className="space-y-6">
      <TwoFactor />
      <LoginActivity />
      <DeviceManagement />
      {/* Data deletion (privacy): the same request form Facebook / Google point to */}
      <div className="bg-white rounded-2xl border border-light-gray p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-dark-black">Delete your account or data</p>
          <p className="text-xs text-medium-black mt-0.5">Ask us to delete your account, call recordings or other personal data. We confirm by email.</p>
        </div>
        <Link href="/data-deletion" className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 self-start sm:self-auto">
          Request deletion
        </Link>
      </div>
    </div>
  );
};

export default SecuritySettings;