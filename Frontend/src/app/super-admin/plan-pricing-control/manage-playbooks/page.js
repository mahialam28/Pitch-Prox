"use client";

import React, { useState } from "react";
import ManagePlaybooksHeader from "./components/manage-playbooks-header";
import PlaybookKpiCards from "./components/playbook-kpi-cards";
import PlaybookDefaultPricing from "./components/playbook-default-pricing";
import PlaybookManagementTable, { initialPlaybooksData } from "./components/playbook-management-table";
import toast from "react-hot-toast";

export default function ManagePlaybooksPage() {
  const [playbooks, setPlaybooks] = useState(initialPlaybooksData);

  const handleDeletePlaybook = (id, name) => {
    setPlaybooks((prev) => prev.filter((item) => item.id !== id));
    toast.error(`Playbook "${name}" removed.`);
  };

  const handlePriceChange = (id, newPrice) => {
    setPlaybooks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price: newPrice } : item))
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 sm:gap-7 pb-12 max-w-full overflow-hidden">
      {/* 1. Header */}
      <ManagePlaybooksHeader />

      {/* 2. Top 4 Metric KPI Cards */}
      <PlaybookKpiCards />

      {/* 3. Playbook Default Pricing Section */}
      <PlaybookDefaultPricing />

      {/* 4. Playbook Management Table Section */}
      <PlaybookManagementTable
        playbooks={playbooks}
        onDeletePlaybook={handleDeletePlaybook}
        onPriceChange={handlePriceChange}
      />
    </div>
  );
}
