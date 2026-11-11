"use client";

import React, { useState } from "react";
import {
  Plus,
  Eye,
  MoreVertical,
  FileText,
  Presentation,
  Video,
  File,
  Trash2,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Text from "@/components/texts/text";
import AddAssetModal from "./add-asset-modal";

// Files attached to the playbook (uploaded through the builder; saved with the draft)

const PlaybookAssetsCard = ({
  assets = [],
  onAssetsChange = () => {},
}) => {
  const [assetList, setAssetList] = useState(assets);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const getAssetIcon = (type) => {
    switch (type?.toUpperCase()) {
      case "PDF":
        return { icon: FileText, color: "text-rose-500 bg-rose-50" };
      case "PPTX":
      case "PPT":
        return { icon: Presentation, color: "text-amber-500 bg-amber-50" };
      case "MP4":
      case "MOV":
      case "VIDEO":
        return { icon: Video, color: "text-emerald-500 bg-emerald-50" };
      default:
        return { icon: File, color: "text-blue-500 bg-blue-50" };
    }
  };

  const handleAddAsset = (newAsset) => {
    // Only plain data is kept (the icon is worked out from the type when shown), so it saves as JSON
    const updated = [...assetList, newAsset];
    setAssetList(updated);
    onAssetsChange(updated);
    setShowAddModal(false);
  };

  const handleDeleteAsset = (id) => {
    const updated = assetList.filter((a) => a.id !== id);
    setAssetList(updated);
    onAssetsChange(updated);
    setActiveMenuId(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-dark-black/80 font-secondary">
            Playbook Assets
          </h3>
          <Text variant="smaller" className="text-light-black mt-0.5 text-[11px] font-normal">
            Upload assets that support this playbook.
          </Text>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 rounded-xl border border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Asset</span>
        </button>
      </div>

      {/* Assets List */}
      <div className="space-y-2 pt-1">
        {assetList.length === 0 && <p className="text-xs text-light-black">No assets yet. Attach guides, decks or videos for this playbook.</p>}
        {assetList.map((asset) => {
          const { icon: IconComp, color } = getAssetIcon(asset.type);
          return (
            <div
              key={asset.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-light-gray/80 hover:border-light-gray hover:bg-light-gray/20 transition-all group"
            >
              {/* Left File Info */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    color
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-semibold text-dark-black/80 truncate leading-tight">
                    {asset.url ? <a href={asset.url} target="_blank" rel="noreferrer" className="hover:text-primary hover:underline">{asset.title}</a> : asset.title}
                  </h5>
                  <span className="text-[10px] text-light-black font-normal block mt-0.5">
                    {asset.size} • {asset.type}
                  </span>
                </div>
              </div>

              {/* Right Action Icons */}
              <div className="flex items-center gap-1 shrink-0 relative">
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-light-black hover:text-dark-black/80 hover:bg-light-gray transition-colors cursor-pointer"
                  title="Preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveMenuId(activeMenuId === asset.id ? null : asset.id)
                  }
                  className="p-1.5 rounded-lg text-light-black hover:text-dark-black/80 hover:bg-light-gray transition-colors cursor-pointer"
                  title="More actions"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {activeMenuId === asset.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      className="absolute right-0 top-full mt-1 z-30 w-36 bg-white rounded-xl border border-light-gray shadow-lg py-1"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(null)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-dark-black/80 hover:bg-light-gray transition-colors text-left cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-medium-black" />
                        <span>Download</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Asset Modal */}
      <AddAssetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddAsset}
      />
    </div>
  );
};

export default PlaybookAssetsCard;
