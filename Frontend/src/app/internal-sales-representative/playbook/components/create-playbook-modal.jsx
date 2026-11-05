"use client";

import React, { useState } from "react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import { Field, Select, fieldClass } from "@/app/super-admin/users/[id]/components/account-dialogs";
import { CATALOG } from "@/lib/playbook-catalog";

// Design-only: creates or edits a custom playbook card in local state.
const CreatePlaybookModal = ({ isOpen, playbook, onClose, onSave }) => {
  const isEdit = Boolean(playbook);
  const [title, setTitle] = useState(playbook?.title ?? "");
  const [description, setDescription] = useState(playbook?.description ?? "");
  const [base, setBase] = useState(playbook?.baseId ?? CATALOG[0].id);

  const [saving, setSaving] = useState(false);
  // onSave may be async; the modal stays open if it throws (the caller shows the error)
  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSave({
      ...(playbook ?? { id: `custom-${Date.now()}`, kind: "custom", isCustom: true, isAvailable: true, status: "active", isPremium: false, price: null }),
      title: title.trim(),
      subtitle: "Custom",
      description: description.trim() || `Based on ${CATALOG.find((item) => item.id === base)?.title}.`,
      baseId: base,
      });
    } catch {
      return;
    } finally {
      setSaving(false);
    }
    onClose();
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Playbook" : "Create Playbook"}
      subtitle={isEdit ? "Update your custom playbook." : "Start from a proven playbook and make it your own."}
      size="md"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={save} disabled={!title.trim() || saving}>{isEdit ? "Save Changes" : "Create Playbook"}</DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Playbook name" htmlFor="playbook-name">
          <input id="playbook-name" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g., Expired Listing Follow-Up" className={fieldClass} />
        </Field>
        <Field label="Start from" htmlFor="playbook-base">
          <Select id="playbook-base" value={base} onChange={setBase} options={CATALOG.map((item) => ({ value: item.id, label: item.title }))} />
        </Field>
        <Field label="Description (optional)" htmlFor="playbook-description">
          <textarea id="playbook-description" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What this playbook is for" className={`${fieldClass} resize-none`} />
        </Field>
      </div>
    </DialogModal>
  );
};

export default CreatePlaybookModal;
