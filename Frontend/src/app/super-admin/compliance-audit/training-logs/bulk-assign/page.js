"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import SelectTraining from "./components/select-training";
import ChooseEmployees from "./components/choose-employees";
import AssignmentSettings from "./components/assignment-settings";
import AssignmentSummary from "./components/assignment-summary";

export default function BulkAssignPage() {
  const [selectedCourses, setSelectedCourses] = useState(["course-1"]);
  const [courseSearch, setCourseSearch] = useState("");
  const [courseCategory, setCourseCategory] = useState("All");
  const [courseFormat, setCourseFormat] = useState("All");

  const [selectedEmployees, setSelectedEmployees] = useState([
    "emp-1",
    "emp-2",
    "emp-3",
    "emp-4",
    "emp-5",
  ]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeDept, setEmployeeDept] = useState("All");
  const [employeeRole, setEmployeeRole] = useState("All");

  const [dueDate, setDueDate] = useState("May 31, 2024");
  const [priority, setPriority] = useState("Required");
  const [sendNotification, setSendNotification] = useState(true);
  // Off by default; when on, a completed Training gets a new assignment record (the old one is kept)
  const [allowReassignment, setAllowReassignment] = useState(false);

  const handleAssign = () => {
    toast.success(
      `Successfully assigned training to ${selectedEmployees.length || 24} employees!`
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* Header with Back Navigation */}
      <div className="flex flex-col gap-1.5">
        <Link
          href="/super-admin/compliance-audit/training-logs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Training Logs</span>
          <span className="text-light-black">/</span>
          <span className="text-medium-black">Bulk Assign Training</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-black font-secondary tracking-tight">
          Bulk Assign Training
        </h1>
        <p className="text-xs sm:text-sm text-medium-black">
          Assign one or more training materials to multiple employees at once.
        </p>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6 w-full min-w-0">
          <SelectTraining
            selectedCourses={selectedCourses}
            setSelectedCourses={setSelectedCourses}
            searchTerm={courseSearch}
            setSearchTerm={setCourseSearch}
            selectedCategory={courseCategory}
            setSelectedCategory={setCourseCategory}
            selectedFormat={courseFormat}
            setSelectedFormat={setCourseFormat}
          />

          <ChooseEmployees
            selectedEmployees={selectedEmployees}
            setSelectedEmployees={setSelectedEmployees}
            searchTerm={employeeSearch}
            setSearchTerm={setEmployeeSearch}
            selectedDepartment={employeeDept}
            setSelectedDepartment={setEmployeeDept}
            selectedRole={employeeRole}
            setSelectedRole={setEmployeeRole}
          />
        </div>

        {/* Right Column (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6 w-full">
          <AssignmentSettings
            dueDate={dueDate}
            setDueDate={setDueDate}
            priority={priority}
            setPriority={setPriority}
            sendNotification={sendNotification}
            setSendNotification={setSendNotification}
            allowReassignment={allowReassignment}
            setAllowReassignment={setAllowReassignment}
          />

          <AssignmentSummary
            employeeCount={selectedEmployees.length}
            trainingCount={selectedCourses.length}
            dueDate={dueDate}
            notificationsOn={sendNotification}
            onAssign={handleAssign}
          />
        </div>
      </div>
    </div>
  );
}
