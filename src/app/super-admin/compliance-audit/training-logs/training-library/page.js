"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Search, Pencil, Archive } from "lucide-react";
import toast from "react-hot-toast";
import Dropdown from "@/components/shared/dropdown/dropdown";
import LibraryStats from "./components/library-stats";
import BrowseFormat from "./components/browse-format";
import MaterialsGrid from "./components/materials-grid";
import { UploadMaterialModal } from "./components/training-material-modals";
import CreateTrainingModal from "../components/create-training-modal";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";
import { MATERIAL_FORMATS } from "../training-options";

const formatOptions = [{ value: "All", label: "All Formats" }, ...MATERIAL_FORMATS.map((value) => ({ value, label: value }))];
const sortOptions = [
  { value: "Recently Added", label: "Sort: Recently Added" },
  { value: "Alphabetical", label: "Sort: Alphabetical" },
  { value: "Most Used", label: "Sort: Most Used" },
];

// Training Library: the materials (PDF / Doc / Video) and the Trainings built from them
export default function TrainingLibraryPage() {
  const [library, setLibrary] = useState(null);
  const [trainings, setTrainings] = useState(null);
  const [permissions, setPermissions] = useState({ manage: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [format, setFormat] = useState("All");
  const [sort, setSort] = useState("Recently Added");
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(
    () =>
      Promise.all([apiRequest("/api/v1/compliance/training/materials"), apiRequest("/api/v1/compliance/training/courses"), apiRequest("/api/v1/compliance/training")])
        .then(([materials, courses, overview]) => {
          setLibrary(materials);
          setTrainings(courses.results);
          setPermissions(overview.permissions);
        })
        .catch((error) => showError("Library not loaded", error.message)),
    []
  );
  useEffect(() => {
    load();
  }, [load]);

  const term = searchTerm.trim().toLowerCase();
  const materials = (library?.results ?? [])
    .filter((item) => (!term || `${item.title} ${item.description}`.toLowerCase().includes(term)) && (category === "All" || item.category === category) && (format === "All" || item.format === format))
    .sort((a, b) => (sort === "Alphabetical" ? a.title.localeCompare(b.title) : sort === "Most Used" ? b.usedIn - a.usedIn : new Date(b.createdAt) - new Date(a.createdAt)));
  const categoryOptions = [{ value: "All", label: "All Categories" }, ...(library?.categories ?? []).map((item) => ({ value: item.name, label: item.name }))];

  const retire = async (training) => {
    try {
      await apiRequest(`/api/v1/compliance/training/courses/${training.id}`, { method: "DELETE" });
      toast.success(`${training.title} retired. Completed records are kept.`);
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5 min-w-0">
          <Link href="/super-admin/compliance-audit/training-logs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-colors w-fit">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Training Logs</span>
            <span className="text-light-black">/</span>
            <span className="text-medium-black">Training Library</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-black font-secondary tracking-tight">Training Library</h1>
          <p className="text-xs sm:text-sm text-medium-black">Browse and manage training materials, guides, and videos for your team.</p>
        </div>
        {permissions.manage && (
          <button type="button" onClick={() => setUploading(true)} className="px-4 py-2.5 rounded-xl bg-primary hover:bg-[#0ca09e] text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Upload Material</span>
          </button>
        )}
      </div>

      <LibraryStats stats={library?.stats} />

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0 sm:min-w-[240px]">
          <Search className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input type="text" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search training materials..." aria-label="Search training materials" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-gray bg-white text-xs text-dark-black placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs" />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-[140px]"><Dropdown items={categoryOptions} selected={category} onSelect={setCategory} variant="compact" className="w-full" buttonClassName="py-2.5 text-xs font-semibold" /></div>
          <div className="w-[130px]"><Dropdown items={formatOptions} selected={format} onSelect={setFormat} variant="compact" className="w-full" buttonClassName="py-2.5 text-xs font-semibold" /></div>
          <div className="w-[170px]"><Dropdown items={sortOptions} selected={sort} onSelect={setSort} variant="compact" className="w-full" buttonClassName="py-2.5 text-xs font-semibold" /></div>
        </div>
      </div>

      <BrowseFormat counts={library?.stats} activeFormat={format === "All" ? null : format} onSelectFormat={(value) => setFormat((current) => (current === value ? "All" : value))} />

      <MaterialsGrid materials={materials} loading={!library} canManage={permissions.manage} onChanged={load} />

      {/* Trainings built from the library */}
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-bold text-dark-black font-secondary tracking-tight">Trainings</h3>
        <div className="bg-white rounded-2xl border border-light-gray shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-light-gray bg-[#FAFCFC] text-[11px] font-semibold text-light-black tracking-wider">
                <th className="py-3 pl-6 pr-3">TRAINING</th>
                <th className="py-3 px-3">CATEGORY</th>
                <th className="py-3 px-3">MATERIALS</th>
                <th className="py-3 px-3">REQUIREMENT</th>
                <th className="py-3 px-3">CERTIFICATE</th>
                <th className="py-3 px-3">COMPLETED</th>
                <th className="py-3 pl-3 pr-6"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/60">
              {(trainings ?? []).map((training) => (
                <tr key={training.id}>
                  <td className="py-3 pl-6 pr-3">
                    <span className="font-semibold text-dark-black">{training.title}</span>
                    {training.onboarding && <span className="block text-[11px] text-light-black">Onboarding · {training.modules} modules</span>}
                  </td>
                  <td className="py-3 px-3 text-medium-black">{training.category}</td>
                  <td className="py-3 px-3 text-medium-black">{training.onboarding ? "—" : `${training.materials.length} (${training.formats.join(", ") || "—"})`}</td>
                  <td className="py-3 px-3 text-medium-black">{training.requirement}</td>
                  <td className="py-3 px-3 text-medium-black">{training.issueCertificate ? (training.certificateValidity === "Custom" ? `${training.certificateMonths} months` : training.certificateValidity) : "No"}</td>
                  <td className="py-3 px-3 text-medium-black">{training.completed} of {training.assigned}</td>
                  <td className="py-3 pl-3 pr-6">
                    {permissions.manage && !training.onboarding && (
                      <div className="flex items-center gap-1.5 justify-end">
                        <button type="button" onClick={() => setEditing(training)} className="p-1.5 rounded-lg hover:bg-light-gray cursor-pointer" aria-label={`Edit ${training.title}`}><Pencil className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => retire(training)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 cursor-pointer" aria-label={`Retire ${training.title}`} title="Retire (open assignments are removed)"><Archive className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {trainings?.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-light-black">No Trainings yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {uploading && <UploadMaterialModal categories={library?.categories ?? []} onClose={() => setUploading(false)} onSaved={() => { setUploading(false); load(); }} />}
      {editing && <CreateTrainingModal isOpen training={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}
