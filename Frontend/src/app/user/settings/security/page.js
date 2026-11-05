"use client";

import React from "react";
import TwoFactor from "./components/two-factor";
import LoginActivity from "./components/login-activity";
import DeviceManagement from "./components/device-management";


const SecuritySettings = () => {
  return (
    <div className="space-y-6">
      <TwoFactor />
      <LoginActivity />
      <DeviceManagement />
    </div>
  );
};

export default SecuritySettings;