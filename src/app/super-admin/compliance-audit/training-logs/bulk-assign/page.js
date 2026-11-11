"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import SelectTraining from "./components/select-training";
import ChooseEmployees from "./components/choose-employees";
import AssignmentSettings from "./components/assignment-settings";
import AssignmentSummary from "./components/assignment-summary";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

export default function BulkAssignPage() {
  const router = useRouter();
  const [trainings, setTrainings] = useState(null);
  const [employees, setEmployees] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [courseCategory, setCourseCategory] = useState("All");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeDept, setEmployeeDept] = useState("All");
  const [employeeRole, setEmployeeRole] = useState("All");
  const [dueDate, setDueDate] = useState(() => new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [priority, setPriority] = useState("Required");
  const [sendNotification, setSendNotification] = useState(true);
  // Off by default; when on, a completed Training gets a new assignment record (the old one is kept)
  const [allowReassignment, setAllowReassignment] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([apiRequest("/api/v1/compliance/training/courses"), apiRequest("/api/v1/compliance/training/employees")])
      .then(([courses, people]) => {
        setTrainings(courses.results);
        setEmployees(people.results);
      })
      .catch((error) => showError("Not loaded", error.message));
  }, []);

  const handleAssign = async () => {
    setBusy(true);
    try {
      const result = await apiRequest("/api/v1/compliance/training/assignments", {
        method: "POST",
        body: { courseIds: selectedCourses, userIds: selectedEmployees, dueDate, requirement: priority, notify: sendNotification, allowReassign: allowReassignment },
      });
      const skipped = result.skipped.length ? ` ${result.skipped.length} skipped (already assigned or completed).` : "";
      toast.success(`${result.created} assignment${result.created === 1 ? "" : "s"} created.${skipped}`);
      if (result.created) router.push("/super-admin/compliance-audit/training-logs");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
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
          Assign one or more Trainings to several employees at once.
        </p>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6 w-full min-w-0">
          <SelectTraining
            trainings={trainings}
            selectedCourses={selectedCourses}
            setSelectedCourses={setSelectedCourses}
            searchTerm={courseSearch}
            setSearchTerm={setCourseSearch}
            selectedCategory={courseCategory}
            setSelectedCategory={setCourseCategory}
          />

          <ChooseEmployees
            employees={employees}
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
            busy={busy}
          />
        </div>
      </div>
    </div>
  );
}
