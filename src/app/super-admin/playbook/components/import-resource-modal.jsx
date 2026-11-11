"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Check, FileText, Search, Paperclip, Trash2, Loader2 } from "lucide-react";
import SettingsDropdown from "@/components/shared/dropdown/settings-dropdown";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";
import { RESOURCE_TYPES, formatResourceDate } from "./add-resource-modal";

const ALL = "__all";

// Resource Library picker. Render it only while open (it loads when mounted).
// onImport(libraryResources[]); alreadyImported: Set of library ids in this playbook.
const ImportResourceModal = ({ isOpen = false, onClose = () => {}, onImport = () => {}, alreadyImported = new Set() }) => {
  const [search, setSearch] = useState("");
  const [type, setType] = useState(ALL);
  const [addedBy, setAddedBy] = useState(ALL);
  const [data, setData] = useState({ key: null, resources: [], contributors: [] });
  const [selected, setSelected] = useState(new Map());
  const [reload, setReload] = useState(0);
  const [removing, setRemoving] = useState(null);

  const params = new URLSearchParams();
  if (search.trim()) params.set("search", search.trim());
  if (type !== ALL) params.set("type", type);
  if (addedBy !== ALL) params.set("addedBy", addedBy);
  const key = `${params}#${reload}`;
  const loading = data.key !== key;

  useEffect(() => {
    if (!isOpen) return undefined;
    let cancelled = false;
    const timer = setTimeout(() => {
      apiRequest(`/api/v1/admin/playbook-resources?${key.split("#")[0]}`)
        .then((result) => !cancelled && setData({ key, resources: result.resources, contributors: result.contributors }))
        .catch((error) => {
          if (cancelled) return;
          setData({ key, resources: [], contributors: [] });
          showError("Couldn't load the Resource Library", error.message);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, key]);

  if (!isOpen) return null;

  const toggle = (resource) => {
    setSelected((current) => {
      const next = new Map(current);
      if (next.has(resource.id)) next.delete(resource.id);
      else next.set(resource.id, resource);
      return next;
    });
  };

  const removeFromLibrary = async (resource) => {
    if (!window.confirm(`Remove "${resource.name}" from the Resource Library? Playbooks that already use it keep their copy.`)) return;
    setRemoving(resource.id);
    try {
      await apiRequest(`/api/v1/admin/playbook-resources/${resource.id}`, { method: "DELETE" });
      setSelected((current) => {
        const next = new Map(current);
        next.delete(resource.id);
        return next;
      });
      setReload((value) => value + 1);
    } catch (error) {
      showError("Couldn't remove it", error.message);
    } finally {
      setRemoving(null);
    }
  };

  const handleApply = () => {
    onImport([...selected.values()]);
    onClose();
  };

  const typeItems = [{ value: ALL, label: "All types" }, ...RESOURCE_TYPES];
  const contributorItems = [{ value: ALL, label: "Anyone" }, ...data.contributors.map((person) => ({ value: person.id, label: person.name }))];
  const filtered = Boolean(params.toString());

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-white rounded-2xl border border-light-gray shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-light-gray">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-dark-black/80 font-secondary">Import from Library</h3>
                <p className="text-[11px] text-light-black font-normal mt-0.5">
                  Resources pinned from any playbook. Importing adds a copy to this playbook.
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="text-light-black hover:text-dark-black p-1 rounded-lg transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filters */}
          <div className="px-5 sm:px-6 pt-4 grid grid-cols-1 sm:grid-cols-[1fr_160px_160px] gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-light-black absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, description or text"
                aria-label="Search the library"
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-light-gray text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>
            <SettingsDropdown label="Type" items={typeItems} selected={type} onSelect={setType} className="w-full" />
            <SettingsDropdown label="Added by" items={contributorItems} selected={addedBy} onSelect={setAddedBy} className="w-full" />
          </div>

          {/* List */}
          <div className="p-5 sm:p-6 space-y-2.5 max-h-[55vh] min-h-[200px] overflow-y-auto">
            {loading && !data.resources.length ? (
              <div className="flex items-center justify-center gap-2 py-10 text-xs text-light-black">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading the library…
              </div>
            ) : !data.resources.length ? (
              <div className="py-10 text-center text-xs text-light-black">
                {filtered ? "No library resources match these filters." : "The library is empty. Pin a resource (in Add Resource, or from a row's menu) to reuse it in other playbooks."}
              </div>
            ) : (
              data.resources.map((resource) => {
                const imported = alreadyImported.has(resource.id);
                const isSelected = selected.has(resource.id);
                return (
                  <div
                    key={resource.id}
                    onClick={() => !imported && toggle(resource)}
                    className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      imported
                        ? "border-light-gray bg-light-gray/30 opacity-70"
                        : isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-2xs cursor-pointer"
                          : "border-light-gray hover:border-light-black/30 bg-white cursor-pointer"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-light-gray/60 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-dark-black/90 font-secondary">{resource.name}</h4>
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-light-gray text-medium-black shrink-0">{resource.type}</span>
                          {imported && <span className="text-[9px] font-semibold text-primary">Already in this playbook</span>}
                        </div>
                        {resource.description && <p className="text-[11px] text-light-black font-normal mt-0.5 leading-relaxed">{resource.description}</p>}
                        <span className="text-[10px] text-light-black mt-1 flex items-center gap-2 flex-wrap">
                          <span>Added by {resource.addedBy} · {formatResourceDate(resource.addedAt)}</span>
                          {resource.file && (
                            <span className="flex items-center gap-1 text-primary"><Paperclip className="w-3 h-3" />{resource.file.name}</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromLibrary(resource);
                        }}
                        disabled={removing === resource.id}
                        className="p-1 rounded-lg text-light-black hover:text-rose-500 hover:bg-rose-50 cursor-pointer disabled:opacity-40"
                        title="Remove from library"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {!imported && (
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${isSelected ? "bg-primary text-white" : "border border-light-black/30"}`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2.5 p-4 px-6 border-t border-light-gray bg-white">
            <span className="text-[11px] text-light-black">{selected.size ? `${selected.size} selected` : `${data.resources.length} in library${filtered ? " (filtered)" : ""}`}</span>
            <div className="flex items-center gap-2.5">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-light-gray text-xs font-semibold text-medium-black hover:bg-light-gray transition-colors cursor-pointer">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!selected.size}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-medium-teal disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                {selected.size > 1 ? `Import ${selected.size} Resources` : "Import Resource"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ImportResourceModal;
