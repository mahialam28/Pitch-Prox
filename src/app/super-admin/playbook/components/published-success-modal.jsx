"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  BookOpen,
  Users,
  Calendar,
  GitBranch,
  MessageSquare,
  FileText,
  Sparkles,
  Eye,
  ArrowRight,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function PublishedSuccessModal({
  isOpen = false,
  onClose = () => {},
  formData = {},
  onPreview = () => {},
  onManageAccess = () => {},
  onViewDetails = () => {},
}) {
  const router = useRouter();

  if (!isOpen) return null;

  const playbookName = formData.playbookName || "FSBO Playbook";
  const visibility = formData.visibility || "Team Only";
  const leadTypesCount = formData.leadTypes?.length || 16;
  const stagesCount = formData.stages?.length || 7;
  const objectionsCount = formData.objections?.length || "400+";
  const resourcesCount = formData.resources?.length || 8;

  // Format current date e.g. "May 31, 2025 at 2:45 PM PST"
  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-dark-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-light-gray z-10 space-y-6 overflow-hidden"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-light-gray/60 hover:bg-light-gray text-medium-black hover:text-dark-black flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Celebration Art / Icon Banner */}
          <div className="flex flex-col items-center text-center space-y-3 pt-2 relative">
            {/* Colorful Confetti particles decoration */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center -top-4">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 absolute -top-1 left-20 animate-bounce opacity-80" />
              <span className="w-2 h-2 rounded-sm bg-teal-400 absolute top-4 right-20 animate-pulse opacity-80" />
              <span className="w-2 h-2 rounded-full bg-amber-400 absolute bottom-12 left-16 opacity-70" />
              <span className="w-3 h-1.5 rounded-full bg-blue-400 absolute bottom-10 right-16 rotate-45 opacity-80" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1 right-28 opacity-70" />
            </div>

            {/* Circular Paper Plane Badge */}
            <div className="w-20 h-20 rounded-full bg-teal-50 border-2 border-teal-200/80 flex items-center justify-center text-primary shadow-sm relative z-10">
              <Send className="w-9 h-9 stroke-[2.2] translate-x-0.5 -translate-y-0.5 text-primary" />
            </div>

            <div className="space-y-1.5 relative z-10">
              <h2 className="text-xl sm:text-2xl font-bold text-dark-black font-secondary">
                Playbook Published!
              </h2>
              <p className="text-xs sm:text-sm text-medium-black max-w-md mx-auto leading-relaxed">
                Your playbook is now live and ready to help your team win more conversations.
              </p>
            </div>
          </div>

          {/* Summary Details Card (3 Rows) */}
          <div className="border border-light-gray rounded-2xl p-4 sm:p-5 space-y-3.5 bg-white shadow-2xs">
            {/* Row 1: Playbook Name */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-light-gray/60">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-primary border border-teal-100 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-light-black block font-normal">
                    Playbook Name
                  </span>
                  <h4 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary truncate">
                    {playbookName}
                  </h4>
                </div>
              </div>

              <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Active</span>
              </div>
            </div>

            {/* Row 2: Visibility */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-light-gray/60">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-light-black block font-normal">
                    Visibility
                  </span>
                  <h4 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary truncate">
                    {visibility}
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={onManageAccess}
                className="px-3.5 py-1.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-dark-black hover:text-primary text-xs font-semibold transition-all shadow-2xs cursor-pointer shrink-0"
              >
                Manage Access
              </button>
            </div>

            {/* Row 3: Published On */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-light-black block font-normal">
                    Published On
                  </span>
                  <h4 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary truncate">
                    {formattedDate} at 2:45 PM PST
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={onViewDetails}
                className="px-3.5 py-1.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-dark-black hover:text-primary text-xs font-semibold transition-all shadow-2xs cursor-pointer shrink-0"
              >
                View Details
              </button>
            </div>
          </div>

          {/* 4 Stat Indicators (Horizontal row) */}
          <div className="grid grid-cols-4 gap-2 text-center py-1">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-full bg-teal-50 text-primary border border-teal-200/70 mx-auto flex items-center justify-center">
                <GitBranch className="w-4 h-4" />
              </div>
              <div className="text-sm sm:text-base font-bold text-dark-black font-secondary">
                {leadTypesCount}
              </div>
              <div className="text-[10px] text-medium-black leading-tight">
                Lead Types Configured
              </div>
            </div>

            <div className="space-y-1">
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 border border-purple-200/70 mx-auto flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="text-sm sm:text-base font-bold text-dark-black font-secondary">
                {objectionsCount}
              </div>
              <div className="text-[10px] text-medium-black leading-tight">
                Objections Mapped
              </div>
            </div>

            <div className="space-y-1">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-200/70 mx-auto flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-sm sm:text-base font-bold text-dark-black font-secondary">
                {resourcesCount}
              </div>
              <div className="text-[10px] text-medium-black leading-tight">
                Scripts &amp; Resources
              </div>
            </div>

            <div className="space-y-1">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 border border-amber-200/70 mx-auto flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-sm sm:text-base font-bold text-dark-black font-secondary">
                6
              </div>
              <div className="text-[10px] text-medium-black leading-tight">
                Advanced Settings
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons (2 buttons side-by-side) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onPreview}
              className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-dark-black hover:bg-dark-black/90 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Playbook</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                router.push("/super-admin/playbook");
              }}
              className="w-full sm:flex-1 py-3 px-5 rounded-2xl border border-light-gray hover:border-medium-black/30 bg-white hover:bg-light-gray/30 text-dark-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
            >
              <span>Go to Playbooks</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom small note */}
          <div className="text-center text-[11px] text-medium-black flex items-center justify-center gap-1.5 pt-1">
            <svg
              className="w-3.5 h-3.5 text-medium-black/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>You can edit and republish anytime.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
