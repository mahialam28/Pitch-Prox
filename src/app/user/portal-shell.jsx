"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { RxDashboard } from "react-icons/rx";
import { BsStars } from "react-icons/bs";
import { FaTableList } from "react-icons/fa6";
import {
  PhoneCall,
  Users2,
  Phone,
  Snowflake,
  BookOpen,
  Mic,
  Settings,
} from "lucide-react";
import Sidebar from "@/components/shared/sidebar/sidebar";
import Header from "@/components/shared/header/header";
import { usePortalUser } from "@/components/shared/use-portal-user";
import ImpersonationBar from "@/components/shared/impersonation-bar";

export default function UserPortalShell({ user, children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { userName, roleLabel, logout } = usePortalUser(user);

  const navItems = [
    { label: "Dashboard", icon: RxDashboard, href: "/user/dashboard" },
    { label: "Live Calling", icon: PhoneCall, href: "/user/live-calling" },
    { label: "Leads", icon: Users2, href: "/user/leads" },
    { label: "CRM", icon: FaTableList, href: "/user/crm" },
    { label: "Calls", icon: Phone, href: "/user/calls" },
    { label: "Performance Analytics", icon: BsStars, href: "/user/performance-analytics" },
    { label: "AI Training", icon: Snowflake, href: "/user/ai-training" },
    { label: "Playbook", icon: BookOpen, href: "/user/playbook" },
    { label: "Calibration", icon: Mic, href: "/user/calibration" },
    { label: "Settings", icon: Settings, href: "/user/settings/profile" },
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
        <ImpersonationBar user={user} />
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isSidebarOpen={sidebarOpen}
          notifOpen={notifOpen}
          onNotificationClick={() => setNotifOpen((prev) => !prev)}
          onCloseNotif={() => setNotifOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
