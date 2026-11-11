"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { RxDashboard } from "react-icons/rx";
import {
  Users,
  Users2,
  CreditCard,
  Headphones,
  Gauge,
  Calendar,
  Megaphone,
  Mail,
  Receipt,
  ClipboardCheck,
  BookOpen,
  Settings,
  Sheet,
  ShieldOff,
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/shared/sidebar/sidebar";
import Header from "@/components/shared/header/header";
import PolicyPrompt from "@/components/shared/policy-prompt";
import TrainingPrompt from "@/components/shared/training-prompt";
import { usePortalUser } from "@/components/shared/use-portal-user";
import { ADMIN_SECTIONS, ROLES } from "@/utils.js/roles";

export default function SuperAdminPortalShell({ user, children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { userName, roleLabel, logout } = usePortalUser(user);

  const allNavItems = [
    { key: "dashboard", label: "Dashboard", icon: RxDashboard, href: "/super-admin/dashboard" },
    { key: "users", label: "Users", icon: Users, href: "/super-admin/users" },
    { key: "sales-reps", label: "Sales Reps", icon: Users2, href: "/super-admin/sales-reps" },
    { key: "crm", label: "CRM", icon: Sheet, href: "/super-admin/crm" },
    { key: "plans", label: "Plan & Pricing Control", icon: CreditCard, href: "/super-admin/plan-pricing-control" },
    { key: "support", label: "Support Tickets", icon: Headphones, href: "/super-admin/support-tickets" },
    { key: "performance", label: "Performance Analytics", icon: Gauge, href: "/super-admin/performance-analytics" },
    { key: "calendar", label: "Calendar & Announcements", icon: Calendar, href: "/super-admin/calendar-announcements" },
    { key: "campaigns", label: "Campaigns & Journeys", icon: Megaphone, href: "/super-admin/campaigns-journeys" },
    { key: "mail", label: "Mail", icon: Mail, href: "/super-admin/mail" },
    { key: "billing", label: "Billing", icon: Receipt, href: "/super-admin/billing" },
    {
      key: "compliance",
      label: "Compliance & Audit",
      icon: ClipboardCheck,
      href: "/super-admin/compliance-audit/policy-documents",
      subItems: [
        { label: "Compliance Overview", href: "/super-admin/compliance-audit/overview" },
        { label: "Policy Documents", href: "/super-admin/compliance-audit/policy-documents" },
        { label: "Training Logs", href: "/super-admin/compliance-audit/training-logs" },
        { label: "Incident Management", href: "/super-admin/compliance-audit/incident-management" },
        { label: "Audit Logs", href: "/super-admin/compliance-audit/audit-logs" },
        { label: "Access Records", href: "/super-admin/compliance-audit/access-records" },
        { label: "SOC 2 Readiness", href: "/super-admin/compliance-audit/soc2-readiness" },
        { label: "Evidence Repository", href: "/super-admin/compliance-audit/evidence-repository" },
        { label: "Data Deletion", href: "/super-admin/compliance-audit/data-deletion" },
      ],
    },
    { key: "playbook", label: "Playbook", icon: BookOpen, href: "/super-admin/playbook" },
    { key: "settings", label: "Settings", icon: Settings, href: "/super-admin/settings/profile" },
  ];

  const byKey = Object.fromEntries(allNavItems.map((item) => [item.key, item]));
  // Sidebar sections per role come from utils.js/roles (also used by the API permission checks)
  const navItems = (ADMIN_SECTIONS[user?.role] ?? []).map((key) =>
    // Support's Dashboard is the Support Dashboard
    key === "dashboard" && user?.role === ROLES.SUPPORT ? { ...byKey.dashboard, href: "/super-admin/support-dashboard" } : byKey[key]
  );
  // Sections outside this role's sidebar show a no-access message (the server should enforce this too)
  const sectionOf = (href) => href.split("/").slice(0, 3).join("/");
  const allowedSections = new Set(navItems.map((item) => sectionOf(item.href)));
  // The Support Dashboard goes with the Support Tickets section (Super Admin and Support)
  const onSupportDashboard = pathname === "/super-admin/support-dashboard" || pathname.startsWith("/super-admin/support-dashboard/");
  const blocked =
    (onSupportDashboard && !navItems.some((item) => item.key === "support")) ||
    allNavItems.some((item) => {
      const section = sectionOf(item.href);
      return !allowedSections.has(section) && (pathname === section || pathname.startsWith(`${section}/`));
    });

  return (
    <div className="flex min-h-screen bg-light-gray">
      <Sidebar
        navItems={navItems}
        pathname={pathname}
        userName={userName}
        userRole={roleLabel}
        onLogout={logout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isSidebarOpen={sidebarOpen}
          notifOpen={notifOpen}
          onNotificationClick={() => setNotifOpen((prev) => !prev)}
          onCloseNotif={() => setNotifOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {blocked ? (
            <div className="max-w-md mx-auto mt-16 bg-white rounded-2xl border border-light-gray p-8 text-center">
              <ShieldOff className="w-10 h-10 mx-auto text-light-black" />
              <h1 className="text-lg font-semibold text-dark-black mt-3">You don&apos;t have access to this page</h1>
              <p className="text-sm text-medium-black mt-1">Your role ({roleLabel}) can&apos;t open this section. Ask a Super Admin if you need it.</p>
              <Link href={navItems[0].href} className="inline-block mt-5 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-medium-teal">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <>
              <PolicyPrompt />
              <TrainingPrompt />
              {children}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
