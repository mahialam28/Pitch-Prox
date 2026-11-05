"use client";

import { departmentFilterOptions } from "../../training-options";

import React from "react";
import { Search } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import Checkbox from "@/components/shared/checkbox";

const initialEmployees = [
  {
    id: "emp-1",
    name: "Sarah Johnson",
    role: "Sales Rep",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140",
    status: "Completed",
    department: "Sales & Growth",
  },
  {
    id: "emp-2",
    name: "Mike Davis",
    role: "Sales Rep",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160",
    status: "Completed",
    department: "Sales & Growth",
  },
  {
    id: "emp-3",
    name: "Emily Brown",
    role: "Sales Rep",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=140",
    status: "Completed",
    department: "Sales & Growth",
  },
  {
    id: "emp-4",
    name: "Daniel Miller",
    role: "Sales Rep",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140",
    status: "Completed",
    department: "Sales & Growth",
  },
  {
    id: "emp-5",
    name: "Tom Wilson",
    role: "Sales Rep",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=140",
    status: "Pending",
    department: "Sales & Growth",
  },
];

const departmentOptions = departmentFilterOptions;

const roleOptions = [
  { value: "All", label: "All Roles" },
  { value: "Sales Rep", label: "Sales Rep" },
  { value: "Manager", label: "Manager" },
  { value: "Agent", label: "Agent" },
];

export default function ChooseEmployees({
  selectedEmployees,
  setSelectedEmployees,
  searchTerm,
  setSearchTerm,
  selectedDepartment,
  setSelectedDepartment,
  selectedRole,
  setSelectedRole,
}) {
  const isAllSelected =
    initialEmployees.length > 0 &&
    selectedEmployees.length === initialEmployees.length;
  const isIndeterminate =
    selectedEmployees.length > 0 &&
    selectedEmployees.length < initialEmployees.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(initialEmployees.map((e) => e.id));
    }
  };

  const handleToggleEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredEmployees = initialEmployees.filter((emp) => {
    const matchesSearch =
      !searchTerm || emp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept =
      selectedDepartment === "All" ||
      emp.department.toLowerCase() === selectedDepartment.toLowerCase();
    const matchesRole =
      selectedRole === "All" ||
      emp.role.toLowerCase() === selectedRole.toLowerCase();

    return matchesSearch && matchesDept && matchesRole;
  });

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-dark-black font-secondary tracking-tight">
          Choose Employees
        </h3>
        <span className="text-xs font-semibold text-primary">
          {selectedEmployees.length || 24} employees selected
        </span>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employees..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-gray bg-white text-xs text-dark-black placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
          />
        </div>

        {/* Departments Dropdown */}
        <div className="w-full sm:w-40">
          <Dropdown
            items={departmentOptions}
            selected={selectedDepartment}
            onSelect={(val) => setSelectedDepartment(val)}
            variant="compact"
            className="w-full"
            buttonClassName="py-2.5 text-xs font-semibold"
          />
        </div>

        {/* Roles Dropdown */}
        <div className="w-full sm:w-32">
          <Dropdown
            items={roleOptions}
            selected={selectedRole}
            onSelect={(val) => setSelectedRole(val)}
            variant="compact"
            className="w-full"
            buttonClassName="py-2.5 text-xs font-semibold"
          />
        </div>

        {/* Select All Visible toggle */}
        <Checkbox
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onChange={handleToggleSelectAll}
          label="Select all visible"
          className="shrink-0 px-1 py-1 font-semibold text-dark-black/85"
        />
      </div>

      {/* Employees Table */}
      <div className="border border-light-gray rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-light-gray text-light-black font-semibold uppercase tracking-wider text-[11px] bg-light-gray/20">
                <th className="py-3 pl-4 pr-2 w-10">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={handleToggleSelectAll}
                  />
                </th>
                <th className="py-3 px-3 whitespace-nowrap">EMPLOYEE</th>
                <th className="py-3 px-3 whitespace-nowrap">ROLE</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">
                  CURRENT STATUS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/60">
              {filteredEmployees.map((emp) => {
                const isSelected = selectedEmployees.includes(emp.id);
                return (
                  <tr
                    key={emp.id}
                    onClick={() => handleToggleEmployee(emp.id)}
                    className={`hover:bg-[#F9FAFB]/70 transition-colors cursor-pointer ${
                      isSelected ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="py-3 pl-4 pr-2">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggleEmployee(emp.id)}
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-7 h-7 rounded-full object-cover border border-light-gray"
                        />
                        <span className="font-bold text-dark-black truncate">
                          {emp.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-medium-black">{emp.role}</td>
                    <td className="py-3 px-4 text-right">
                      {emp.status === "Completed" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E8F8F0] text-[#12B76A]">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF6E7] text-[#F79009]">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 px-4 bg-white border-t border-light-gray/60 text-[11px] text-light-black">
          Showing 5 of {selectedEmployees.length || 24} selected employees
        </div>
      </div>
    </div>
  );
}
