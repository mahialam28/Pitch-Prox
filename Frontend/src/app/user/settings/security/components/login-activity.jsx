"use client";

import React, { useEffect, useState } from "react";
import { FiBarChart2, FiTv, FiArrowRight } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import Text from "@/components/texts/text";
import { apiRequest, formatDate } from "@/lib/client-api";
import { showError } from "@/lib/alerts";
import { LoginHistoryModal } from "./security-modals";

const PREVIEW_ROWS = 5;

const LoginActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    apiRequest("/api/v1/me/login-activity")
      .then((data) => setActivities(data.results.map((item) => {
        const when = new Date(item.createdAt);
        return {
          id: item.id,
          dateTime: formatDate(when),
          time: when.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          device: item.device,
          browser: item.browser,
          // Location needs a paid IP-lookup service, so it isn't shown yet
          location: "—",
          ip: item.ip || "—",
          status: item.success ? "Success" : "Failed",
        };
      })))
      .catch((error) => showError("Login activity not loaded", error.message))
      .finally(() => setLoaded(true));
  }, []);


  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 md:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary flex-shrink-0">
          <FiBarChart2 className="w-5 h-5" />
        </div>
        <div>
          <Text variant="regular" className="font-bold">
            Login Activity
          </Text>
          <Text variant="smaller" className="mt-0.5">
            Review recent activity on your account.
          </Text>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[600px]">
          <thead>
            <tr className="text-[11px] font-semibold text-light-black border-b border-light-gray">
              <th className="pb-3 font-medium">Date & Time</th>
              <th className="pb-3 font-medium">Device</th>
              <th className="pb-3 font-medium">Browser</th>
              <th className="pb-3 font-medium">Location</th>
              <th className="pb-3 font-medium">IP Address</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray">
            {activities.slice(0, PREVIEW_ROWS).map((item, index) => (
              <tr
                key={item.id ?? index}
                className="hover:bg-primary/5 transition-colors"
              >
                <td className="py-3.5 pr-2">
                  <span className="font-semibold text-dark-black block">
                    {item.dateTime}
                  </span>
                  <span className="text-[10px] text-medium-black">{item.time}</span>
                </td>

                <td className="py-3.5 pr-2">
                  <div className="flex items-center gap-2 text-medium-black font-medium">
                    <FiTv className="w-3.5 h-3.5 text-light-black" />
                    <span>{item.device}</span>
                  </div>
                </td>

                <td className="py-3.5 pr-2">
                  <div className="flex items-center gap-2 text-medium-black font-medium">
                    <FcGoogle className="w-3.5 h-3.5" />
                    <span>{item.browser}</span>
                  </div>
                </td>

                <td className="py-3.5 pr-2 text-medium-black font-medium">
                  {item.location}
                </td>

                <td className="py-3.5 pr-2 text-light-black">{item.ip}</td>

                <td className="py-3.5">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === "Success"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-500"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
            {loaded && activities.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-light-black">No sign-ins recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Link */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline cursor-pointer"
        >
          View full login history <FiArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <LoginHistoryModal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} activities={activities} />
    </div>
  );
};

export default LoginActivity;