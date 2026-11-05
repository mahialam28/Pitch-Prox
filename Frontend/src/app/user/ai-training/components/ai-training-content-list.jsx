"use client";

import React, { useState } from "react";
import { PauseCircle, PlayCircle, Trash2, FileText, Pencil, Upload, Download } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import AlertModal from "@/components/modals/alert-modal";
import ActionMenu from "@/components/shared/dropdown/action-menu";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";

// Name without its extension, for the rename field
const baseName = (name = "") => (name.includes(".") ? name.slice(0, name.lastIndexOf(".")) : name);

const RenameDialog = ({ item, onClose, onRename }) => {
  const [name, setName] = useState(baseName(item?.name));
  const [saving, setSaving] = useState(false);

  const save = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onRename(item, name.trim());
      onClose();
    } catch {
      // The page shows the error
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogModal
      isOpen={Boolean(item)}
      onClose={saving ? undefined : onClose}
      title="Rename file"
      size="sm"
      footer={
        <>
          <DialogButton onClick={onClose} disabled={saving}>Cancel</DialogButton>
          <DialogButton variant="primary" type="submit" form="rename-training-file" disabled={saving || !name.trim()}>
            {saving ? "Saving…" : "Save"}
          </DialogButton>
        </>
      }
    >
      <form id="rename-training-file" onSubmit={save}>
        <label htmlFor="training-file-name" className="block text-xs font-medium leading-4 text-medium-black mb-2">File name</label>
        <input
          id="training-file-name"
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full min-h-[44px] px-4 py-3 rounded-xl border border-gray-300 text-base text-dark-black outline-none focus:border-primary"
        />
        <p className="text-xs text-medium-black mt-2">The file extension is kept automatically.</p>
      </form>
    </DialogModal>
  );
};

export const AiTrainingContentList = ({
  items = [],
  loaded = true,
  onDelete,
  onPause,
  onRename,
  onReplace,
  onDownload = (item) => window.location.assign(`/api/v1/ai-training/assets/${item.id}`),
}) => {
  const [renaming, setRenaming] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete && itemToDelete) {
      onDelete(itemToDelete);
    }
    setItemToDelete(null);
    setDeleteModalOpen(false);
  };
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-light-gray border border-light-gray flex items-center justify-center text-light-black">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <Title variant="small" className="!text-lg !text-dark-black/80 !font-bold">
            Training Content
          </Title>
          <Text variant="smaller" className="mt-0.5">
            Manage your uploaded training materials.
          </Text>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-light-gray shadow-sm w-full overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px] table-fixed">
            <thead>
              <tr className="border-b border-light-gray">
                <th className="p-4 pl-6 text-[11px] font-bold text-light-black tracking-wider uppercase w-[220px]">Name</th>
                <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[140px]">Category</th>
                <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[100px]">Type</th>
                <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[100px]">Size</th>
                <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[140px]">Upload</th>
                <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[90px]">Status</th>
                <th className="p-4 pr-6 text-[11px] font-bold text-light-black tracking-wider uppercase text-right w-[100px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/60">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-primary/5 transition-colors group"
                >
                  <td className="p-4 pl-6 text-sm font-bold text-dark-black/90 truncate w-[220px]">
                    {item.name}
                  </td>
                  <td className="p-4 text-sm font-medium text-medium-black w-[140px]">{item.category}</td>
                  <td className="p-4 text-sm font-medium text-medium-black w-[100px]">{item.type}</td>
                  <td className="p-4 text-sm font-medium text-medium-black w-[100px]">{item.size}</td>
                  <td className="p-4 text-sm font-medium text-medium-black w-[140px]">{item.uploadDate}</td>
                  <td className="p-4 text-sm font-medium text-medium-black w-[90px]">{item.status}</td>
                  <td className="p-4 pr-6 w-[100px]">
                    <div className="flex items-center justify-end">
                      <ActionMenu
                        label={`Actions for ${item.name}`}
                        items={[
                          { label: "Rename", icon: Pencil, onClick: () => setRenaming(item) },
                          { label: "Replace file", icon: Upload, onClick: () => onReplace?.(item) },
                          { label: "Download", icon: Download, onClick: () => onDownload(item) },
                          {
                            label: item.status === "Paused" ? "Resume" : "Pause",
                            icon: item.status === "Paused" ? PlayCircle : PauseCircle,
                            onClick: () => onPause?.(item),
                          },
                          { divider: true },
                          { label: "Delete", icon: Trash2, danger: true, onClick: () => handleDeleteClick(item) },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {loaded && items.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-light-black">
                    No training material yet. Use the Upload buttons above to add your first file.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {renaming && <RenameDialog item={renaming} onClose={() => setRenaming(null)} onRename={onRename} />}

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        type="warning"
        title="Delete Content"
        message={`Are you sure you want to delete "${itemToDelete?.name || "this item"}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default AiTrainingContentList;