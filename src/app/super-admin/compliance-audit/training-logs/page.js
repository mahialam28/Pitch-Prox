"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import TrainingStats from "./components/training-stats";
import TrainingTable from "./components/training-table";
import UpcomingExpirations from "./components/upcoming-expirations";
import CompletionOverview from "./components/completion-overview";
import QuickActions from "./components/quick-actions";
import CreateTrainingModal from "./components/create-training-modal";
import ManageCategoriesModal from "./components/manage-categories-modal";

const initialTrainingLogs = [
  {
    id: "TR-1",
    employeeName: "Sarah Johnson",
    role: "Security Lead",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140",
    trainingTitle: "Security Awareness Training",
    category: "Security",
    department: "Security",
    assignedOn: "Apr 15, 2024",
    dueDate: "May 15, 2024",
    status: "Completed",
    completedOn: "Apr 20, 2024",
    score: "94%",
  },
  {
    id: "TR-2",
    employeeName: "Mike Davis",
    role: "Operations",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160",
    trainingTitle: "AI Ethics & Responsible Use",
    category: "AI Ethics",
    department: "Operations",
    assignedOn: "Apr 15, 2024",
    dueDate: "May 15, 2024",
    status: "Completed",
    completedOn: "Apr 19, 2024",
    score: "96%",
  },
  {
    id: "TR-3",
    employeeName: "Emily Brown",
    role: "HR Manager",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=140",
    trainingTitle: "Data Privacy & Protection",
    category: "Privacy",
    department: "HR & People",
    assignedOn: "Apr 10, 2024",
    dueDate: "May 10, 2024",
    status: "Completed",
    completedOn: "Apr 12, 2024",
    score: "92%",
  },
  {
    id: "TR-4",
    employeeName: "Daniel Miller",
    role: "Admin",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140",
    trainingTitle: "Incident Response Procedures",
    category: "Compliance",
    department: "Admin",
    assignedOn: "Apr 5, 2024",
    dueDate: "May 5, 2024",
    status: "Completed",
    completedOn: "Apr 5, 2024",
    score: "100%",
  },
  {
    id: "TR-5",
    employeeName: "Tom Wilson",
    role: "Sales Rep",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=140",
    trainingTitle: "Phishing Awareness Program",
    category: "Security",
    department: "Sales & Growth",
    assignedOn: "Apr 20, 2024",
    dueDate: "May 20, 2024",
    status: "In Progress",
    completedOn: "—",
    score: "—",
  },
  {
    id: "TR-6",
    employeeName: "Jessica Lee",
    role: "Billing Specialist",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=140",
    trainingTitle: "Access Handling Standards",
    category: "Compliance",
    department: "Admin",
    assignedOn: "Apr 18, 2024",
    dueDate: "May 18, 2024",
    status: "Not Started",
    completedOn: "—",
    score: "—",
  },
  {
    id: "TR-7",
    employeeName: "Alex Rodriguez",
    role: "Support Agent",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=140",
    trainingTitle: "Customer Data Protection",
    category: "Privacy",
    department: "Support",
    assignedOn: "Apr 1, 2024",
    dueDate: "May 1, 2024",
    status: "Overdue",
    completedOn: "—",
    score: "—",
  },
];

export default function TrainingLogsPage() {
  const [logs] = useState(initialTrainingLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);

  // Filter logic
  const filteredLogs = logs.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.trainingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "All" ||
      item.status.toLowerCase() === selectedStatus.toLowerCase();

    const matchesDepartment =
      selectedDepartment === "All" ||
      item.department.toLowerCase() === selectedDepartment.toLowerCase();

    const matchesType =
      selectedType === "All" ||
      item.category.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesStatus && matchesDepartment && matchesType;
  });

  const handleCreateTraining = () => {
    setIsCreateModalOpen(true);
  };

  const handleSaveTraining = (newTraining) => {
    toast.success(`Training "${newTraining.title}" created successfully!`);
  };

  const handleActionClick = (actionId) => {
    if (actionId === "manage_categories") {
      setIsCategoriesModalOpen(true);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-black font-secondary tracking-tight">
          Training Logs
        </h1>
        <p className="text-xs sm:text-sm text-medium-black">
          Track employee training assignments, completions, and compliance acknowledgments.
        </p>
      </div>

      {/* Top Stats Cards */}
      <TrainingStats />

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section: Table & Filters (col-span-8) */}
        <div className="lg:col-span-8 w-full min-w-0">
          <TrainingTable
            logs={filteredLogs}
            onCreateTraining={handleCreateTraining}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalItems={256}
          />
        </div>

        {/* Right Section: Sidebar Cards (col-span-4) */}
        <div className="lg:col-span-4 w-full flex flex-col gap-6">
          {/* Upcoming Due Dates */}
          <UpcomingExpirations onActionClick={handleActionClick} />

          {/* Training Completion Overview */}
          <CompletionOverview onActionClick={handleActionClick} />

          {/* Quick Actions */}
          <QuickActions onActionClick={handleActionClick} />
        </div>
      </div>

      {/* Create New Training Modal */}
      <CreateTrainingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleSaveTraining}
      />

      {/* Manage Categories Modal */}
      <ManageCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
      />
    </div>
  );
}
