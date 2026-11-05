"use client";

import React, { useState } from "react";
import { FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import AlertModal from "@/components/modals/alert-modal";
import Text from "@/components/texts/text";

const DangerZoneSection = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-rose-50 text-rose-500">
          <FiAlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <Text variant="regular" className="font-bold">Danger Zone</Text>
          <Text variant="smaller" className="mt-0.5">
            Irreversible actions that affect your account.
          </Text>
        </div>
      </div>

      {/* Delete Callout Card */}
      <div className="p-5 rounded-2xl border border-rose-100 bg-rose-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold text-rose-600">Delete Your Account</h3>
          <p className="text-xs text-medium-black mt-1 max-w-md cursor-pointer">
            Once you delete your account, there is no going back. Please be certain.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-rose-200 bg-white hover:bg-rose-600 text-rose-600 hover:text-rose-50 text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer"
        >
          <FiTrash2 className="w-4 h-4" /> Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        type="warning"
        title="Delete Your Account?"
        message="This action cannot be undone. All your data, calls, and settings will be permanently removed."
        confirmLabel="Yes, Delete My Account"
        onConfirm={() => {
          console.log("Account deleted");
          setShowDeleteModal(false);
        }}
      />
    </div>
  );
};

export default DangerZoneSection;