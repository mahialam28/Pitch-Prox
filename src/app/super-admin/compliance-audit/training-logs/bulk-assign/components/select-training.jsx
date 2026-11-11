"use client";

import React from "react";
import { Search } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import Checkbox from "@/components/shared/checkbox";

// Only complete Trainings are listed (never single materials), and there's no Format filter because
// a Training can mix PDF, Doc and Video (client items). Several can be picked.
export default function SelectTraining({ trainings, selectedCourses, setSelectedCourses, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory }) {
  const list = (trainings ?? []).filter((training) => !training.onboarding);
  const categories = [{ value: "All", label: "All Categories" }, ...[...new Set(list.map((training) => training.category))].sort().map((value) => ({ value, label: value }))];
  const term = searchTerm.trim().toLowerCase();
  const visible = list.filter((training) => (!term || `${training.title} ${training.description}`.toLowerCase().includes(term)) && (selectedCategory === "All" || training.category === selectedCategory));
  const toggle = (id) => setSelectedCourses((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-dark-black font-secondary tracking-tight">Select Training</h3>
        <span className="text-xs text-light-black">{selectedCourses.length} selected</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input type="text" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search Trainings..." aria-label="Search Trainings" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-gray bg-white text-xs text-dark-black placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>
        <div className="w-full sm:w-44"><Dropdown items={categories} selected={selectedCategory} onSelect={setSelectedCategory} variant="compact" className="w-full" buttonClassName="py-2.5 text-xs font-semibold" /></div>
      </div>
      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
        {!trainings && <p className="text-xs text-light-black py-4 text-center">Loading Trainings...</p>}
        {trainings && visible.length === 0 && <p className="text-xs text-light-black py-4 text-center">No Trainings match. Create one from Training Logs.</p>}
        {visible.map((training) => {
          const selected = selectedCourses.includes(training.id);
          return (
            <div key={training.id} onClick={() => toggle(training.id)} className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${selected ? "border-primary bg-primary/5" : "border-light-gray hover:border-light-black/40"}`}>
              <div onClick={(event) => event.stopPropagation()}>
                <Checkbox checked={selected} onChange={() => toggle(training.id)} label="" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-dark-black">{training.title}</p>
                <p className="text-[11px] text-light-black mt-0.5">
                  {training.category} · {training.materials.length} material{training.materials.length === 1 ? "" : "s"} ({training.formats.join(", ")}){training.minutes ? ` · ${training.minutes} min` : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
