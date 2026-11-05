"use client";

import React, { useState } from "react";
import { FiLock, FiChevronDown } from "react-icons/fi";
import { Link2, RefreshCw, RotateCw } from "lucide-react";
import Image from "next/image";
import Text from "@/components/texts/text";
import ActionMenu from "@/components/shared/dropdown/action-menu";
import ConfirmDialog from "@/components/modals/confirm-dialog";
import { showError } from "@/lib/alerts";
import zohoIcon from "@/assets/images/user/setting/zoho.png";
import gmailIcon from "@/assets/images/user/setting/gmail.png";
import outlookIcon from "@/assets/images/user/setting/outlook.png";
import calendarIcon from "@/assets/images/user/setting/calendar.png";

// Third-party connections run through each provider's OAuth flow, which
// the client hasn't set up yet, so these actions explain that for now.
const notConnectedYet = (appName) =>
  showError("Not available yet", `Connecting ${appName} needs the ${appName} app keys, which the client hasn't set up yet.`);

// ----------------------------------------------------------------------
// Manage menu (Reconnect / Sync settings / Disconnect)
// ----------------------------------------------------------------------
const ManageMenu = ({ app, onDisconnect }) => (
  <ActionMenu
    label={`Manage ${app.name}`}
    triggerClassName="flex items-center justify-between gap-3 min-w-[180px] p-3 rounded-xl border border-light-gray hover:border-medium-black/20 bg-white transition-all duration-200 cursor-pointer"
    trigger={
      <>
        <span className="text-xs font-semibold text-dark-black">Manage</span>
        <FiChevronDown className="w-4 h-4 text-light-black" />
      </>
    }
    items={[
      { label: "Reconnect", icon: RefreshCw, onClick: () => notConnectedYet(app.name) },
      { label: "Sync settings", icon: RotateCw, onClick: () => notConnectedYet(app.name) },
      { divider: true },
      { label: "Disconnect", icon: Link2, danger: true, onClick: () => onDisconnect(app) },
    ]}
  />
);

// ----------------------------------------------------------------------
// Integration Apps Component
// ----------------------------------------------------------------------
const IntegrationApps = () => {
  const [disconnecting, setDisconnecting] = useState(null);
  const apps = [
    {
      id: "zoho",
      name: "Zoho",
      description: "Sync leads, contacts, and activities with Zoho CRM.",
      connectedDate: "Connected on May 10, 2025",
      icon: zohoIcon,
      alt: "Zoho",
      iconSize: 48,
    },
    {
      id: "gmail",
      name: "Gmail",
      description: "Connect your Gmail account to log calls and send email follow-ups.",
      connectedDate: "Connected on May 8, 2025",
      icon: gmailIcon,
      alt: "Gmail",
      iconSize: 40,
    },
    {
      id: "outlook",
      name: "Outlook",
      description: "Connect Outlook to sync emails and calendar events.",
      connectedDate: "Connected on May 9, 2025",
      icon: outlookIcon,
      alt: "Outlook",
      iconSize: 40,
    },
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Sync your calendar to manage calls, appointments, and reminders.",
      connectedDate: "Connected on May 7, 2025",
      icon: calendarIcon,
      alt: "Google Calendar",
      iconSize: 40,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 md:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div>
        <Text variant="regular" className="font-bold text-dark-black">
          Integration Apps
        </Text>
        <Text variant="smaller" className="mt-1 text-medium-black">
          Manage the apps and services connected to your PitchProX account.
        </Text>
      </div>

      {/* Integration List */}
      <div className="space-y-4">
        {apps.map((app) => (            <div
            key={app.id}
            className="p-4 sm:p-5 rounded-xl border border-light-gray hover:border-primary/50 bg-light-gray/30 transition-all"
          >
            {/* ── Desktop (sm+): single horizontal row ── */}
            <div className="hidden sm:flex sm:flex-row sm:items-center justify-between gap-4">
              {/* App Icon + Name + Description */}
              <div className="flex items-center gap-5 md:gap-6">
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: app.iconSize, height: app.iconSize }}
                >
                  <Image
                    src={app.icon}
                    alt={app.alt}
                    width={app.iconSize}
                    height={app.iconSize}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <Text variant="small" className="font-bold text-dark-black">
                    {app.name}
                  </Text>
                  <Text variant="smaller" className="mt-0.5 text-medium-black max-w-sm">
                    {app.description}
                  </Text>
                </div>
              </div>

              {/* Connected + Date + Manage */}
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 block">
                    Connected
                  </span>
                  <span className="text-[10px] text-light-black font-medium block mt-0.5">
                    {app.connectedDate}
                  </span>
                </div>
                <ManageMenu app={app} onDisconnect={setDisconnecting} />
              </div>
            </div>

            {/* ── Mobile: 3-row vertical stack ── */}
            <div className="flex sm:hidden flex-col gap-3">
              {/* Row 1: Logo + Title */}
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: 40, height: 40 }}
                >
                  <Image
                    src={app.icon}
                    alt={app.alt}
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <Text variant="small" className="font-bold text-dark-black">
                    {app.name}
                  </Text>
                  <Text variant="smaller" className="text-medium-black">
                    {app.description}
                  </Text>
                </div>
              </div>

              {/* Row 2: Connection texts — stacked, left-aligned */}
              <div className="text-left">
                <span className="text-xs font-bold text-emerald-600">
                  Connected
                </span>
                <span className="text-[10px] text-light-black font-medium block mt-0.5">
                  {app.connectedDate}
                </span>
              </div>

              {/* Row 3: Manage button — left-aligned on mobile */}
              <div className="flex justify-start w-full">
                <ManageMenu app={app} onDisconnect={setDisconnecting} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="pt-2 flex items-center justify-center gap-2 text-xs text-light-black">
        <FiLock className="w-3.5 h-3.5 text-light-black flex-shrink-0" />
        <span>
          Your data is encrypted and secure. Learn more about our{" "}
          <a href="#" className="font-semibold text-primary hover:underline">
            security practices.
          </a>
        </span>
      </div>

      <ConfirmDialog
        isOpen={Boolean(disconnecting)}
        onClose={() => setDisconnecting(null)}
        title={`Disconnect ${disconnecting?.name ?? ""}?`}
        icon={Link2}
        message={`PitchProX will stop logging calls and sending follow-up emails through ${disconnecting?.name ?? "this app"}. Existing data stays in your account.`}
        note="You can reconnect at any time."
        confirmLabel="Disconnect"
        onConfirm={() => notConnectedYet(disconnecting?.name)}
      />
    </div>
  );
};

export default IntegrationApps;