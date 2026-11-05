"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CategoryList from "./components/category-list";

export default function ManageCategoriesPage() {
  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      {/* Header with Breadcrumb */}
      <div className="flex flex-col gap-1.5 max-w-2xl mx-auto w-full">
        <Link
          href="/super-admin/compliance-audit/training-logs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Training Logs</span>
          <span className="text-light-black">/</span>
          <span className="text-medium-black">Manage Categories</span>
        </Link>
      </div>

      <CategoryList />
    </div>
  );
}
