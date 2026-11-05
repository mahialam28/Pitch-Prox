"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FiMonitor,
  FiSmartphone,
  FiLogOut,
  FiInfo,
  FiTrash2,
  FiRefreshCw,
  FiMoreVertical,
  FiHardDrive,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Text from "@/components/texts/text";
import { apiRequest, formatDateTime } from "@/lib/client-api";
import { showError, showSuccess } from "@/lib/alerts";
import { LogOutOthersModal } from "./security-modals";

// "16h ago" style label for the last time a device was used
const timeAgo = (value) => {
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 5) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)}h ago`;
  const days = Math.round(minutes / 60 / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const toDevice = (session) => ({
  id: session.id,
  title: `${session.device}${session.isCurrent ? " (This Device)" : ""}`,
  subtitle: `${session.browser}${session.ip ? ` • ${session.ip}` : ""}`,
  icon: session.isMobile ? FiSmartphone : FiMonitor,
  iconBg: session.isCurrent ? "bg-primary/10 text-primary" : session.isMobile ? "bg-indigo-50 text-indigo-500" : "bg-blue-50 text-blue-500",
  statusText: session.isCurrent ? "Just now" : timeAgo(session.lastSeenAt || session.createdAt),
  isCurrent: session.isCurrent,
  signedInAt: session.createdAt,
});

const deviceActions = [
  { label: "Device Info", icon: FiInfo },
  { label: "Refresh Session", icon: FiRefreshCw },
  { label: "Remove Device", icon: FiTrash2, danger: true },
];

const DeviceManagement = () => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [devices, setDevices] = useState([]);
  const [logOutOpen, setLogOutOpen] = useState(false);
  const menuRef = useRef(null);

  const loadDevices = useCallback(() =>
    apiRequest("/api/v1/me/sessions")
      .then((data) => setDevices(data.results.map(toDevice)))
      .catch((error) => showError("Devices not loaded", error.message)), []);

  useEffect(() => { loadDevices(); }, [loadDevices]);

  const handleAction = async (label, device) => {
    setOpenMenuId(null);
    try {
      if (label === "Device Info") {
        showSuccess(device.title, `${device.subtitle} · Signed in ${formatDateTime(device.signedInAt)}`);
      } else if (label === "Refresh Session") {
        await apiRequest(`/api/v1/me/sessions/${device.id}`, { method: "PATCH" });
        showSuccess("Session refreshed", "This device stays signed in for another 7 days.");
      } else if (device.isCurrent) {
        showError("This is your current device", "Use Log out in the sidebar to sign out here.");
      } else {
        await apiRequest(`/api/v1/me/sessions/${device.id}`, { method: "DELETE" });
        await loadDevices();
        showSuccess("Device removed", `${device.title} has been signed out.`);
      }
    } catch (error) {
      showError("Action failed", error.message);
    }
  };

  const logOutOthers = async () => {
    try {
      const { revoked } = await apiRequest("/api/v1/me/sessions", { method: "DELETE" });
      await loadDevices();
      showSuccess("Other devices signed out", revoked ? `${revoked} other device${revoked === 1 ? " was" : "s were"} signed out.` : "No other devices were signed in.");
    } catch (error) {
      showError("Action failed", error.message);
      throw error;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 md:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary flex-shrink-0">
          <FiHardDrive className="w-5 h-5" />
        </div>
        <div>
          <Text variant="regular" className="font-bold">
            Device Management
          </Text>
          <Text variant="smaller" className="mt-0.5">
            Manage devices that have access to your account.
          </Text>
        </div>
      </div>

      {/* Device Cards */}
      <div className="space-y-3">
        {devices.map((device) => {
          const DeviceIcon = device.icon;
          return (
            <div
              key={device.id}
              className="p-4 rounded-xl bg-light-gray/60 border border-light-gray hover:bg-light-gray transition-colors"
            >
              {/* ── Desktop (sm+): single row with three dots inline ── */}
              <div className="hidden sm:flex sm:flex-row sm:items-center justify-between gap-3">
                {/* Left Info */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 ${device.iconBg}`}
                  >
                    <DeviceIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <Text variant="small" className="font-bold">{device.title}</Text>
                    <Text variant="smaller" className="mt-1">
                      {device.subtitle}
                    </Text>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center gap-3">
                  <div className="text-right text-[11px]">
                    <span className="text-light-black">Last active: </span>
                    <span
                      className={
                        device.isCurrent
                          ? "font-bold text-primary"
                          : "font-semibold text-medium-black"
                      }
                    >
                      {device.statusText}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId(openMenuId === device.id ? null : device.id)
                    }
                    className="p-1.5 text-light-black hover:text-dark-black rounded-lg transition-colors cursor-pointer hover:bg-light-gray"
                    aria-label="Device actions"
                  >
                    <FiMoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ── Mobile: three dots at top-right corner ── */}
              <div className="relative flex sm:hidden flex-col gap-3 pr-8">
                {/* Three dots — absolute top-right */}
                <div className="absolute top-0 right-0 z-10">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId(openMenuId === device.id ? null : device.id)
                    }
                    className="p-1.5 text-light-black hover:text-dark-black rounded-lg transition-colors cursor-pointer hover:bg-light-gray"
                    aria-label="Device actions"
                  >
                    <FiMoreVertical className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {openMenuId === device.id && (
                      <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1.5 z-50 w-44 bg-white rounded-xl border border-light-gray shadow-lg py-1.5"
                      >
                        {deviceActions.map((action, idx) => {
                          const ActionIcon = action.icon;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleAction(action.label, device)}
                              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors duration-150 cursor-pointer ${
                                action.danger
                                  ? "text-rose-500 hover:bg-rose-50"
                                  : "text-medium-black hover:bg-primary/5 hover:text-primary"
                              }`}
                            >
                              <ActionIcon className="w-3.5 h-3.5" />
                              {action.label}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Left Info */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 ${device.iconBg}`}
                  >
                    <DeviceIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <Text variant="small" className="font-bold">{device.title}</Text>
                    <Text variant="smaller" className="mt-1">
                      {device.subtitle}
                    </Text>
                  </div>
                </div>

                {/* Last active */}
                <div className="text-left text-[11px]">
                  <span className="text-light-black">Last active: </span>
                  <span
                    className={
                      device.isCurrent
                        ? "font-bold text-primary"
                        : "font-semibold text-medium-black"
                    }
                  >
                    {device.statusText}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Logout All Action */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setLogOutOpen(true)}
          className="inline-flex items-center gap-2 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
        >
          <FiLogOut className="w-4 h-4" /> Log out of all other devices
        </button>
      </div>

      <LogOutOthersModal
        isOpen={logOutOpen}
        onClose={() => setLogOutOpen(false)}
        otherDeviceNames={devices.filter((device) => !device.isCurrent).map((device) => device.title)}
        onConfirm={logOutOthers}
      />
    </div>
  );
};

export default DeviceManagement;