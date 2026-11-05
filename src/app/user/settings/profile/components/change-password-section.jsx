"use client";

import React, { useState } from "react";
import { FiShield, FiCheckCircle } from "react-icons/fi";
import ProfilePassword from "@/components/forms/profile-password";
import DashboardButton from "@/components/buttons/dashboardButton";
import Text from "@/components/texts/text";
import { showError, showSuccess } from "@/lib/alerts";
import { apiRequest } from "@/lib/client-api";

const ChangePasswordSection = () => {
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const changePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) { setMessage("New passwords do not match."); await showError("Password not updated", "Your new passwords do not match."); return; }
    try {
      await apiRequest("/api/v1/settings/password", { method: "PATCH", body: { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword } });
      setMessage("Password updated.");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      await showSuccess("Password updated", "Your new password has been saved.");
    } catch (error) {
      setMessage(error.message);
      await showError("Password not updated", error.message);
    }
  };
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
          <FiShield className="w-5 h-5" />
        </div>
        <div>
          <Text variant="regular" className="font-bold">Change Password</Text>
          <Text variant="smaller" className="mt-0.5">
            Keep your account secure by using a strong password.
          </Text>
        </div>
      </div>

      {/* Password Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ProfilePassword
          label="Current Password"
          name="currentPassword"
          value={passwords.currentPassword}
          onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))}
          placeholder="Enter current password"
        />
        <ProfilePassword
          label="New Password"
          name="newPassword"
          value={passwords.newPassword}
          onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))}
          placeholder="Enter new password"
        />
        <ProfilePassword
          label="Confirm Password"
          name="confirmPassword"
          value={passwords.confirmPassword}
          onChange={(event) => setPasswords((current) => ({ ...current, confirmPassword: event.target.value }))}
          placeholder="Confirm new password"
        />
      </div>

      {/* Footer Info & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs font-medium text-primary">
          <FiCheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>Use 8+ characters with a mix of letters, numbers & symbols.</span>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto sm:shrink-0">
          {message && <span className="text-xs font-medium text-primary">{message}</span>}
          <DashboardButton type="button" onClick={changePassword} className="whitespace-nowrap w-full sm:w-auto">
            Save Changes
          </DashboardButton>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordSection;
