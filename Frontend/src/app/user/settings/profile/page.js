"use client";

import React from "react";
import ProfileSection from "./components/profile-section";
import ChangePasswordSection from "./components/change-password-section";
import LanguageSection from "./components/language-section";
import DangerZoneSection from "./components/danger-zone-section";
import { usePortal } from "@/components/shared/use-portal";

// Shared by the staff portals; deleting the account is a customer-only action
export default function ProfilePage() {
  const portal = usePortal();
  return (
    <div className="space-y-6">
      <ProfileSection />
      <ChangePasswordSection />
      <LanguageSection />
      {!portal.internal && <DangerZoneSection />}
    </div>
  );
}
