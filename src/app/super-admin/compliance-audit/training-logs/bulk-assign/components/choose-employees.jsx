"use client";

import React from "react";
import { Search } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import Checkbox from "@/components/shared/checkbox";
import { departmentFilterOptions } from "../../training-options";

// Employees from /api/v1/compliance/training/employees (department = Training department)
export default function ChooseEmployees({ employees, selectedEmployees, setSelectedEmployees, searchTerm, setSearchTerm, selectedDepartment, setSelectedDepartment, selectedRole, setSelectedRole }) {
  const roles = [{ value: "All", label: "All Roles" }, ...[...new Set((employees ?? []).map((person) => person.role))].sort().map((value) => ({ value, label: value }))];
  const term = searchTerm.trim().toLowerCase();
  const visible = (employees ?? []).filter((person) =>
    (!term || `${person.name} ${person.email} ${person.jobTitle ?? ""}`.toLowerCase().includes(term)) &&
    (selectedDepartment === "All" || person.department === selectedDepartment) &&
    (selectedRole === "All" || person.role === selectedRole)
  );
  const allVisibleSelected = visible.length > 0 && visible.every((person) => selectedEmployees.includes(person.id));
  const toggleAll = () =>
    setSelectedEmployees((current) => (allVisibleSelected ? current.filter((id) => !visible.some((person) => person.id === id)) : [...new Set([...current, ...visible.map((person) => person.id)])]));
  const toggle = (id) => setSelectedEmployees((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-dark-black font-secondary tracking-tight">Choose Employees</h3>
        <span className="text-xs text-light-black">{selectedEmployees.length} selected</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input type="text" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search employees..." aria-label="Search employees" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-gray bg-white text-xs text-dark-black placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>
        <div className="w-full sm:w-44"><Dropdown items={departmentFilterOptions} selected={selectedDepartment} onSelect={setSelectedDepartment} variant="compact" className="w-full" buttonClassName="py-2.5 text-xs font-semibold" /></div>
        <div className="w-full sm:w-40"><Dropdown items={roles} selected={selectedRole} onSelect={setSelectedRole} variant="compact" className="w-full" buttonClassName="py-2.5 text-xs font-semibold" /></div>
      </div>
      <Checkbox checked={allVisibleSelected} onChange={toggleAll} label="Select all visible" />
      <div className="divide-y divide-light-gray/60 max-h-96 overflow-y-auto">
        {!employees && <p className="text-xs text-light-black py-4 text-center">Loading employees...</p>}
        {employees && visible.length === 0 && <p className="text-xs text-light-black py-4 text-center">No employees match.</p>}
        {visible.map((person) => (
          <div key={person.id} onClick={() => toggle(person.id)} className="py-3 flex items-center gap-3 cursor-pointer">
            <div onClick={(event) => event.stopPropagation()}>
              <Checkbox checked={selectedEmployees.includes(person.id)} onChange={() => toggle(person.id)} label="" />
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0">{person.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-dark-black truncate">{person.name}</p>
              <p className="text-[11px] text-light-black truncate">{person.role} · {person.department}{person.status !== "active" ? ` · ${person.status}` : ""}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
