"use client";

import React, { useEffect, useState } from "react";
import { FiUser, FiMail } from "react-icons/fi";
import ProfileInput from "@/components/forms/profile-input";
import DashboardButton from "@/components/buttons/dashboardButton";
import Text from "@/components/texts/text";
import { showError, showSuccess } from "@/lib/alerts";
import { apiRequest } from "@/lib/client-api";
import { AvatarActions, ProfileAvatar, useAvatar } from "@/components/shared/avatar-editor";

const ProfileSection = () => {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [message, setMessage] = useState("");
  // Photo upload isn't stored yet; the preview stays in this browser session
  const avatar = useAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");

  useEffect(() => { apiRequest("/api/v1/settings/profile").then((data) => setProfile({ name: data.profile?.name || "", email: data.profile?.email || "" })).catch((error) => showError("Profile not loaded", error.message)); }, []);
  const saveProfile = async (event) => {
    event.preventDefault(); setMessage("");
    try {
      const data = await apiRequest("/api/v1/settings/profile", { method: "PATCH", body: { name: profile.name } });
      window.dispatchEvent(new CustomEvent("pitchprox-profile-updated", { detail: data.profile }));
      setMessage("Profile saved.");
      await showSuccess("Profile updated", "Your name has been saved successfully.");
    } catch (error) {
      setMessage(error.message);
      await showError("Profile not saved", error.message);
    }
  };
  return (
    <form onSubmit={saveProfile} className="bg-white rounded-2xl border border-light-gray p-6 shadow-sm space-y-6">
      {/* Header with Avatar and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ProfileAvatar src={avatar.src} name={profile.name} />
          <div>
            <Text variant="regular" className="font-bold">
              Profile Information
            </Text>
            <Text variant="smaller" className="mt-0.5">
              Update your personal details and how others see you.
            </Text>
          </div>
        </div>
        <AvatarActions hasPhoto={Boolean(avatar.src)} onUpload={avatar.upload} onDelete={avatar.remove} />
      </div>

      {/* Form Fields — top row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <ProfileInput
          label="Full Name"
          name="fullName"
          icon={FiUser}
          value={profile.name}
          onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
        />
        <ProfileInput
          label="Email"
          name="email"
          type="email"
          icon={FiMail}
          value={profile.email}
          readOnly
        />
      </div>

      {/* Save Button — bottom-right */}
      <div className="flex items-center justify-end gap-3">
        {message && <span className="text-xs font-medium text-primary">{message}</span>}
        <DashboardButton type="submit" className="whitespace-nowrap w-full sm:w-auto">
          Save Changes
        </DashboardButton>
      </div>
    </form>
  );
};

export default ProfileSection;
