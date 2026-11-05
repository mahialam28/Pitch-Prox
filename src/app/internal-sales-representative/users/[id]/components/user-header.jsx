"use client";

import React, { useRef, useEffect } from "react";
import { UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import toast from "react-hot-toast";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "call-history", label: "Call History" },
  { id: "subscription", label: "Subscription & Billing" },
  { id: "usage", label: "Usage & Activity" },
  { id: "reports", label: "Reports" },
  { id: "calibration", label: "Calibration" },
  { id: "settings", label: "Account Settings" },
  { id: "support", label: "Support History" },
  { id: "notes", label: "Notes" },
];

const UserHeader = ({
  user = {
    name: "Jennifer Smith",
    status: "Active",
    company: "Acme Inc.",
    accountId: "ACC-001234",
    userId: "USR-78234",
    customerSince: "Jan 15, 2024",
    initials: "JS",
  },
  activeTab = "overview",
  onTabChange = () => {},
  onImpersonate = () => {},
}) => {
  const swiperRef = useRef(null);
  const activeTabIndex = tabs.findIndex((t) => t.id === activeTab);

  // Sync Swiper position when active tab changes
  useEffect(() => {
    if (swiperRef.current && activeTabIndex >= 0) {
      swiperRef.current.slideTo(activeTabIndex, 300);
    }
  }, [activeTabIndex]);

  const handleImpersonate = () => {
    onImpersonate();
  };

  const renderTab = (tab) => {
    const isActive = activeTab === tab.id;
    return (
      <button
        type="button"
        onClick={() => onTabChange(tab.id)}
        className={`relative pb-3 text-xs sm:text-sm font-semibold transition-colors cursor-pointer select-none whitespace-nowrap ${
          isActive
            ? "text-primary font-bold"
            : "text-light-black hover:text-dark-black/80"
        }`}
      >
        <span>{tab.label}</span>
        {isActive && (
          <motion.div
            layoutId="active-user-details-tab"
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
          />
        )}
      </button>
    );
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* ── Top Row: User Identity & Action Buttons ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Avatar, Name, Status, Subtitle, & Meta Details */}
        <div className="flex items-start gap-4">
          {/* Avatar Initials Circle */}
          <div className="w-14 h-14 rounded-full bg-[#0EADAB] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
            {user.initials}
          </div>

          {/* Name, Subtitle, & Metadata */}
          <div className="flex flex-col">
            {/* Title & Active Badge */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-dark-black tracking-tight">
                {user.name}
              </h1>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {user.status}
              </span>
            </div>

            {/* Company Subtitle */}
            <p className="text-xs sm:text-sm text-light-black font-medium mt-0.5">
              {user.company}
            </p>

            {/* Account / User Meta Info */}
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-light-black">
              <span>
                Account ID: <strong className="font-semibold text-dark-black/80">{user.accountId}</strong>
              </span>
              <span className="hidden sm:inline text-light-gray">•</span>
              <span>
                User ID: <strong className="font-semibold text-dark-black/80">{user.userId}</strong>
              </span>
              <span className="hidden sm:inline text-light-gray">•</span>
              <span>
                Customer Since: <strong className="font-semibold text-dark-black/80">{user.customerSince}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Action CTAs & Close Button */}
        <div className="flex items-center gap-2.5 flex-wrap self-stretch sm:self-start lg:self-center">
          {/* Impersonate User Button */}
          <button
            type="button"
            onClick={handleImpersonate}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/80 transition-all duration-200 cursor-pointer shadow-2xs flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <UserCheck className="w-3.5 h-3.5 text-light-black" />
            <span>Impersonate User</span>
          </button>
        </div>
      </div>

      {/* ── Bottom Row: Navigation Tabs with Smooth Swiper / FreeMode ── */}
      <div className="w-full border-b border-light-gray min-w-0 overflow-hidden">
        <Swiper
          modules={[FreeMode]}
          freeMode={{
            enabled: true,
            sticky: false,
            momentumRatio: 0.8,
            momentumVelocityRatio: 0.8,
          }}
          slidesPerView="auto"
          spaceBetween={24}
          grabCursor={true}
          initialSlide={activeTabIndex >= 0 ? activeTabIndex : 0}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          className="w-full"
        >
          {tabs.map((tab) => (
            <SwiperSlide key={tab.id} className="!w-auto">
              {renderTab(tab)}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default UserHeader;
