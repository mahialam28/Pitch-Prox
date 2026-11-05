"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import DialogModal, { DialogButton } from "./dialog-modal";

// "Add Note" dialog from the lead / prospect designs. The caller owns the text and
// the save; the pin choice is passed to onSave (not stored by the API yet).
const AddNoteModal = ({ isOpen, onClose, value, onChange, onSave, saving = false }) => {
  const [pinned, setPinned] = useState(false);

  const close = () => {
    setPinned(false);
    onClose();
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={saving ? undefined : close}
      title="Add Note"
      subtitle="Notes are saved to the lead and call history."
      size="sm"
      footer={
        <>
          <DialogButton onClick={close} disabled={saving}>Cancel</DialogButton>
          <DialogButton
            variant="primary"
            disabled={saving || !value.trim()}
            onClick={() => {
              onSave({ pinned });
              setPinned(false);
            }}
          >
            {saving ? "Saving…" : "Save Note"}
          </DialogButton>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="add-note-text" className="block text-xs font-medium leading-4 text-medium-black mb-2">Note</label>
          <textarea
            id="add-note-text"
            rows={5}
            autoFocus
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Write your note here..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-base text-dark-black placeholder:text-gray-500 outline-none focus:border-primary resize-none transition-colors"
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input type="checkbox" checked={pinned} onChange={(event) => setPinned(event.target.checked)} className="sr-only peer" />
          <span className="w-5 h-5 rounded-md border border-gray-300 flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
            {pinned && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
          </span>
          <span className="text-sm text-medium-black">Pin this note to the lead</span>
        </label>
      </div>
    </DialogModal>
  );
};

export default AddNoteModal;
