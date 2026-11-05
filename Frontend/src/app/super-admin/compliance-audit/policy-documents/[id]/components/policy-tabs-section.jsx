"use client";

import React, { useState } from "react";
import {
  Upload,
  Eye,
  Download,
  RotateCcw,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

const defaultHistoryData = [
  {
    id: "v2.1",
    version: "v2.1",
    status: "Current",
    statusType: "current",
    updatedBy: "Sarah Johnson",
    date: "May 19, 2024",
    changes: "Annual review and updated MFA requirement guidelines.",
  },
  {
    id: "v2.0",
    version: "v2.0",
    status: "Archived",
    statusType: "archived",
    updatedBy: "Sarah Johnson",
    date: "Jan 15, 2024",
    changes: "Added SOC2 Type II compliance controls and key rotation protocols.",
  },
  {
    id: "v1.0",
    version: "v1.0",
    status: "Archived",
    statusType: "archived",
    updatedBy: "Sarah Johnson",
    date: "Mar 10, 2023",
    changes: "Initial policy creation and baseline company approval.",
  },
];

export default function PolicyTabsSection({ policy, onUploadNewVersion }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [historyList, setHistoryList] = useState(defaultHistoryData);

  const handleDownloadVersion = (ver) => {
    toast.success(`Downloading version ${ver.version}...`);
  };

  const handleViewVersion = (ver) => {
    toast.success(`Viewing details for version ${ver.version}`);
  };

  const handleRestoreVersion = (ver) => {
    toast.success(`Version ${ver.version} restored as draft.`);
  };

  return (
    <div className="bg-white rounded-3xl border border-light-gray shadow-xs overflow-hidden w-full">
      {/* ── Top Tabs Navigation ── */}
      <div className="flex items-center border-b border-light-gray px-6 pt-4">
        {/* Overview Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`pb-3 px-1 text-xs sm:text-sm font-semibold transition-all relative cursor-pointer mr-6 ${
            activeTab === "overview"
              ? "text-primary font-bold"
              : "text-light-black hover:text-dark-black/80"
          }`}
        >
          Overview
          {activeTab === "overview" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-full" />
          )}
        </button>

        {/* Version History Tab */}
        <button
          type="button"
          onClick={() => setActiveTab("version_history")}
          className={`pb-3 px-1 text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === "version_history"
              ? "text-primary font-bold"
              : "text-light-black hover:text-dark-black/80"
          }`}
        >
          Version History
          {activeTab === "version_history" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* ── Tab Content ── */}
      <div>
        {activeTab === "overview" ? (
          <div className="p-6 space-y-2.5">
            <h4 className="text-xs sm:text-sm font-bold text-dark-black/85 font-secondary">
              Description
            </h4>
            <p className="text-xs sm:text-sm text-medium-black leading-relaxed font-normal">
              {policy?.longDescription ||
                policy?.description ||
                "Defines the standards and responsibilities required to protect company systems, customer data, and confidential information."}
            </p>
          </div>
        ) : (
          /* ── Version History Tab ── */
          <div className="p-6 space-y-5">
            {/* Top Bar inside Version History Tab */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
              <div className="space-y-0.5">
                <h4 className="text-base font-bold text-dark-black/85 font-secondary">
                  Version History
                </h4>
                <p className="text-xs text-light-black">
                  View, compare, download, or restore previous versions of this policy.
                </p>
              </div>

              {/* Upload New Version Button */}
              <button
                type="button"
                onClick={onUploadNewVersion}
                className="px-4 py-2 rounded-xl border border-light-gray hover:border-primary/40 bg-white text-xs font-semibold text-dark-black/85 hover:text-primary transition-all cursor-pointer shadow-2xs flex items-center gap-2 self-start sm:self-auto shrink-0"
              >
                <Upload className="w-4 h-4 text-primary" />
                Upload New Version
              </button>
            </div>

            {/* Version History Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-light-gray text-light-black font-semibold text-[11px] sm:text-xs">
                    <th className="py-2.5 pr-4 font-semibold">Version</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold">Updated By</th>
                    <th className="py-2.5 px-4 font-semibold">Date</th>
                    <th className="py-2.5 pl-4 font-semibold text-right sm:text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-gray/70">
                  {historyList.map((ver) => (
                    <tr
                      key={ver.id}
                      className="hover:bg-light-gray/30 transition-colors"
                    >
                      {/* Version */}
                      <td className="py-4 pr-4 font-bold text-dark-black/85 font-secondary text-xs sm:text-sm">
                        {ver.version}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {ver.statusType === "current" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#16A34A]">
                            Current
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-light-gray/80 text-dark-black/70">
                            Archived
                          </span>
                        )}
                      </td>

                      {/* Updated By */}
                      <td className="py-4 px-4 text-dark-black/80 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-light-gray/80 text-light-black flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span>{ver.updatedBy}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-light-black whitespace-nowrap">
                        {ver.date}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-4 whitespace-nowrap text-right sm:text-left">
                        <div className="flex items-center justify-end sm:justify-start gap-3">
                          <button
                            type="button"
                            onClick={() => handleViewVersion(ver)}
                            className="text-primary hover:text-[#0c9593] flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadVersion(ver)}
                            className="text-primary hover:text-[#0c9593] flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>

                          {ver.statusType === "archived" && (
                            <button
                              type="button"
                              onClick={() => handleRestoreVersion(ver)}
                              className="text-light-black hover:text-dark-black/90 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                              title="Restore version"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
