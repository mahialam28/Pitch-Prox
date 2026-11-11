"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { RxDashboard } from "react-icons/rx";
import { BsStars } from "react-icons/bs";
import { FaTableList } from "react-icons/fa6";
import {
  PhoneCall,
  Users2,
  Users,
  Phone,
  Ticket,
  Calendar,
  Mail,
  CreditCard,
  Mic,
  Settings,
  Snowflake,
  BookOpen,
} from "lucide-react";
import Sidebar from "@/components/shared/sidebar/sidebar";
import Header from "@/components/shared/header/header";
import PolicyPrompt from "@/components/shared/policy-prompt";
import TrainingPrompt from "@/components/shared/training-prompt";
import { usePortalUser } from "@/components/shared/use-portal-user";

export default function InternalSalesRepPortalShell({ user, children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { userName, roleLabel, logout } = usePortalUser(user);

  const navItems = [
    { label: "Dashboard", icon: RxDashboard, href: "/internal-sales-representative/dashboard" },
    { label: "Users", icon: Users, href: "/internal-sales-representative/users" },
    { label: "Live Calling", icon: PhoneCall, href: "/internal-sales-representative/live-calling" },
    { label: "Leads", icon: Users2, href: "/internal-sales-representative/leads" },
    { label: "CRM", icon: FaTableList, href: "/internal-sales-representative/crm" },
    { label: "Calls", icon: Phone, href: "/internal-sales-representative/calls" },
    { label: "Support Tickets", icon: Ticket, href: "/internal-sales-representative/support-tickets" },
    { label: "Performance Analytics", icon: BsStars, href: "/internal-sales-representative/performance-analytics" },
    { label: "AI Training", icon: Snowflake, href: "/internal-sales-representative/ai-training" },
    { label: "Playbook", icon: BookOpen, href: "/internal-sales-representative/playbook" },
    { label: "Calendar", icon: Calendar, href: "/internal-sales-representative/calendar" },
    { label: "Mail", icon: Mail, href: "/internal-sales-representative/mail" },
    { label: "Billing", icon: CreditCard, href: "/internal-sales-representative/billing" },
    { label: "Calibration", icon: Mic, href: "/internal-sales-representative/calibration" },
    { label: "Settings", icon: Settings, href: "/internal-sales-representative/settings/profile" },
  ];

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
          <PolicyPrompt />
          <TrainingPrompt />
          {children}
        </main>
      </div>
    </div>
  );
}
