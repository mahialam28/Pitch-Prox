"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Upload,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Archive,
  Mail,
  MessageSquare,
  Pin,
  Paperclip,
} from "lucide-react";
import AddResourceModal, { formatResourceDate } from "./add-resource-modal";
import ImportResourceModal from "./import-resource-modal";
import ViewResourceModal from "./view-resource-modal";
import QuickScriptBuilderCard from "./quick-script-builder-card";
import { apiRequest } from "@/lib/client-api";
import { showError, showSuccess } from "@/lib/alerts";

// New playbooks start with no resources: add them, or import pinned ones from the Resource Library
export const DEFAULT_RESOURCES = [];

// The library fields of a playbook resource
// Email Template purpose/subject and Follow Up kind travel with the resource (phase 8)
const libraryFields = ({ name, type, description, content, iconColor, file, purpose, subject, followUpKind, templatePurpose }) => ({
  name, type, description, content, iconColor, file: file ?? null,
  ...(type === "Email Template" && { purpose: purpose ?? null, subject: subject ?? "" }),
  ...(type === "Follow Up" && { followUpKind: followUpKind ?? null, templatePurpose: templatePurpose ?? null }),
});

const TABS = [
  { id: "all", label: "All Resources" },
  { id: "Scripts", label: "Scripts" },
  { id: "Email Templates", label: "Email Templates" },
  { id: "Call Openers", label: "Call Openers" },
  { id: "Objection Responses", label: "Objection Responses" },
  { id: "Follow Up", label: "Follow Up" },
  { id: "Guides", label: "Guides" },
  { id: "Other", label: "Other" },
];

const TYPE_BADGES = {
  Script: "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Call Openers": "bg-sky-50 text-sky-600 border-sky-100",
  "Email Template": "bg-purple-50 text-purple-600 border-purple-100",
  "Objection Script": "bg-rose-50 text-rose-600 border-rose-100",
  "Follow Up": "bg-purple-50 text-purple-600 border-purple-100",
  Guide: "bg-amber-50 text-amber-600 border-amber-100",
  Other: "bg-slate-50 text-slate-600 border-slate-200",
};

const ResourcesScriptsSection = ({
  resources = DEFAULT_RESOURCES,
  onChange = () => {},
}) => {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [viewingResource, setViewingResource] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [initialModalType, setInitialModalType] = useState("Script");
  const [currentUserName, setCurrentUserName] = useState("");

  // Who is signed in: stamped as "Added by" on new resources
  useEffect(() => {
    let cancelled = false;
    apiRequest("/api/v1/me").then((data) => !cancelled && setCurrentUserName(data.user?.name ?? "")).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const ITEMS_PER_PAGE = 8;

  // Filter resources by tab
  const filteredResources = resources.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "Scripts") return item.type === "Script" || item.category === "Scripts";
    if (activeTab === "Email Templates") return item.type === "Email Template" || item.category === "Email Templates";
    if (activeTab === "Call Openers") return item.type === "Call Openers" || item.category === "Call Openers";
    if (activeTab === "Objection Responses") return item.type === "Objection Script" || item.category === "Objection Responses";
    if (activeTab === "Follow Up") return item.type === "Follow Up" || item.category === "Follow Up";
    if (activeTab === "Guides") return item.type === "Guide" || item.category === "Guides";
    if (activeTab === "Other") return item.type === "Other" || item.category === "Other";
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredResources.length / ITEMS_PER_PAGE));
  const paginatedList = filteredResources.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenAdd = (type = "Script") => {
    setEditingResource(null);
    setInitialModalType(type);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (res) => {
    setEditingResource(res);
    setInitialModalType(res.type || "Script");
    setIsAddModalOpen(true);
    setActiveMenuId(null);
  };

  const handleOpenView = (res) => {
    setViewingResource(res);
    setIsViewModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDuplicate = (res) => {
    const { libraryId, ...rest } = res;
    const duplicated = {
      ...rest,
      id: Date.now(),
      name: `${res.name} (Copy)`,
      addedBy: currentUserName || res.addedBy,
      addedDate: formatResourceDate(Date.now()),
    };
    onChange([duplicated, ...resources]);
    setActiveMenuId(null);
  };

  const handleDelete = (id) => {
    const updated = resources.filter((item) => item.id !== id);
    onChange(updated);
    setActiveMenuId(null);
  };

  // Pin to the Resource Library → the library id, or null when it failed
  const pinToLibrary = async (res) => {
    try {
      const { resource, alreadyPinned } = await apiRequest("/api/v1/admin/playbook-resources", { method: "POST", body: libraryFields(res) });
      if (alreadyPinned) showSuccess("Already in the library", `"${resource.name}" was pinned before; this resource is now linked to it.`);
      return resource.id;
    } catch (error) {
      showError("Couldn't pin it to the library", error.message);
      return null;
    }
  };

  const handlePin = async (res) => {
    setActiveMenuId(null);
    const libraryId = await pinToLibrary(res);
    if (libraryId) onChange(resources.map((item) => (item.id === res.id ? { ...item, libraryId } : item)));
  };

  const handleSaveResource = async (resData, { pin = false, updateLibrary = false } = {}) => {
    const saved = resData.id ? resData : { ...resData, id: Date.now() };
    if (pin) {
      const libraryId = await pinToLibrary(saved);
      if (libraryId) saved.libraryId = libraryId;
    }
    if (updateLibrary && saved.libraryId) {
      try {
        await apiRequest(`/api/v1/admin/playbook-resources/${saved.libraryId}`, { method: "PATCH", body: libraryFields(saved) });
      } catch (error) {
        showError("The library copy wasn't updated", error.message);
      }
    }
    onChange(resData.id ? resources.map((item) => (item.id === saved.id ? { ...item, ...saved } : item)) : [saved, ...resources]);
  };

  // Imported resources are copies linked to the library entry (libraryId)
  const handleImportLibrary = (picked) => {
    const present = new Set(resources.map((item) => item.libraryId).filter(Boolean));
    const now = Date.now();
    const imported = picked
      .filter((item) => !present.has(item.id))
      .map((item, index) => ({
        ...libraryFields(item),
        id: now + index,
        libraryId: item.id,
        addedBy: item.addedBy,
        addedDate: formatResourceDate(item.addedAt),
      }));
    if (imported.length) {
      onChange([...imported, ...resources]);
      setActiveTab("all");
      setCurrentPage(1);
    }
  };

  const getFileIcon = (res) => {
    const color = res.iconColor || "emerald";
    let colorClass = "text-emerald-500";
    if (color === "rose") colorClass = "text-rose-500";
    else if (color === "sky" || color === "blue") colorClass = "text-sky-500";
    else if (color === "amber") colorClass = "text-amber-500";
    else if (color === "purple") colorClass = "text-purple-500";
    else if (color === "teal") colorClass = "text-teal-500";

    if (res.type === "Email Template") {
      return <Mail className={`w-4 h-4 ${colorClass}`} />;
    }
    if (res.type === "Objection Script") {
      return <MessageSquare className={`w-4 h-4 ${colorClass}`} />;
    }
    return <FileText className={`w-4 h-4 ${colorClass}`} />;
  };

  return (
    <>
    <div className="bg-white rounded-2xl border border-light-gray p-6 sm:p-7 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-dark-black/80 font-secondary">
              Resources & Scripts
            </h2>
            <p className="text-xs text-medium-black mt-0.5 font-normal">
              Upload or create the content that supports this playbook.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => handleOpenAdd("Script")}
            className="px-3.5 py-1.5 rounded-xl border border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Resource</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl border border-light-gray hover:border-medium-black/30 text-medium-black hover:text-dark-black bg-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import from Library</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-light-gray">
        <div className="flex items-center gap-6 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`pb-2.5 text-xs font-medium whitespace-nowrap transition-all relative cursor-pointer ${
                  isActive
                    ? "text-primary font-bold"
                    : "text-medium-black hover:text-dark-black"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resources Table */}
      <div className="overflow-x-auto rounded-xl border border-light-gray">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-light-gray/40 border-b border-light-gray text-[10px] font-bold text-light-black uppercase tracking-wider">
              <th className="py-3 px-4 min-w-[200px]">Name</th>
              <th className="py-3 px-3 min-w-[120px]">Type</th>
              <th className="py-3 px-3 min-w-[240px]">Description</th>
              <th className="py-3 px-3 min-w-[120px]">Added By</th>
              <th className="py-3 px-4 text-right min-w-[80px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray">
            {!paginatedList.length && (
              <tr>
                <td colSpan={5} className="py-10 px-4 text-center text-xs text-light-black">
                  {resources.length ? "No resources of this type yet." : "No resources yet. Add one, or import pinned resources from the library."}
                </td>
              </tr>
            )}
            {paginatedList.map((item) => {
              const badgeClass = TYPE_BADGES[item.type] || "bg-light-gray text-medium-black border-light-gray";

              return (
                <tr
                  key={item.id}
                  onClick={() => handleOpenView(item)}
                  className="bg-white hover:bg-light-gray/30 transition-colors cursor-pointer"
                >
                  {/* Name + Icon */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="shrink-0">
                        {getFileIcon(item)}
                      </div>
                      <h4 className="font-bold text-dark-black/90 font-secondary text-xs truncate max-w-[220px]">
                        {item.name}
                      </h4>
                      {item.libraryId && <Pin className="w-3 h-3 text-primary shrink-0" aria-label="Pinned in the Resource Library" />}
                      {item.file && <Paperclip className="w-3 h-3 text-light-black shrink-0" aria-label="Has a file" />}
                    </div>
                  </td>

                  {/* Type Badge */}
                  <td className="py-3.5 px-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-medium ${badgeClass}`}>
                      {item.type}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-3 text-medium-black text-xs">
                    <p className="truncate max-w-[280px]" title={item.description}>
                      {item.description}
                    </p>
                  </td>

                  {/* Added By & Date */}
                  <td className="py-3.5 px-3">
                    <div>
                      <span className="font-semibold text-dark-black/80 text-xs block">
                        {item.addedBy || "—"}
                      </span>
                      <span className="text-[10px] text-light-black font-normal block mt-0.5">
                        {item.addedDate || ""}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenView(item)}
                        className="p-1 rounded-lg text-light-black hover:text-dark-black hover:bg-light-gray transition-colors cursor-pointer"
                        title="View resource"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                        className="p-1 rounded-lg text-light-black hover:text-dark-black hover:bg-light-gray transition-colors cursor-pointer"
                        title="More actions"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === item.id && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl border border-light-gray shadow-lg py-1 z-20 text-left">
                          <button
                            type="button"
                            onClick={() => handleOpenView(item)}
                            className="w-full px-3 py-1.5 text-xs text-medium-black hover:text-dark-black hover:bg-light-gray flex items-center gap-2 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="w-full px-3 py-1.5 text-xs text-medium-black hover:text-dark-black hover:bg-light-gray flex items-center gap-2 cursor-pointer"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          {!item.libraryId && (
                            <button
                              type="button"
                              onClick={() => handlePin(item)}
                              className="w-full px-3 py-1.5 text-xs text-medium-black hover:text-dark-black hover:bg-light-gray flex items-center gap-2 cursor-pointer"
                            >
                              <Pin className="w-3 h-3" />
                              <span>Pin to Library</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDuplicate(item)}
                            className="w-full px-3 py-1.5 text-xs text-medium-black hover:text-dark-black hover:bg-light-gray flex items-center gap-2 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Duplicate</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="w-full px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
        <span className="text-light-black font-normal">
          {filteredResources.length
            ? `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1} to ${(currentPage - 1) * ITEMS_PER_PAGE + paginatedList.length} of ${filteredResources.length} resources`
            : "0 resources"}
        </span>

        <div className="flex items-center gap-1 self-center sm:self-auto">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-light-gray text-light-black hover:bg-light-gray disabled:opacity-30 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                currentPage === page
                  ? "bg-primary text-white"
                  : "border border-light-gray text-medium-black hover:bg-light-gray"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg border border-light-gray text-light-black hover:bg-light-gray disabled:opacity-30 cursor-pointer transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddResourceModal
          key={editingResource?.id ?? `new-${initialModalType}`}
          isOpen
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveResource}
          editResource={editingResource}
          initialType={initialModalType}
          currentUserName={currentUserName}
        />
      )}

      {isImportModalOpen && (
        <ImportResourceModal
          isOpen
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportLibrary}
          alreadyImported={new Set(resources.map((item) => item.libraryId).filter(Boolean))}
        />
      )}

      <ViewResourceModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        resource={viewingResource}
      />
    </div>

    {/* Quick Script Builder: opens the same Add Resource window */}
    <QuickScriptBuilderCard onCreate={handleOpenAdd} />
    </>
  );
};

export default ResourcesScriptsSection;
