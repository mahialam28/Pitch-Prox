"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiUser,
  FiBell,
  FiSliders,
  FiShield,
  FiLink,
  FiCreditCard,
  FiSend,
  FiLifeBuoy,
} from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

const navItems = [
  {
    title: "Profile",
    description: "Personal info & security",
    href: "/user/settings/profile",
    icon: FiUser,
  },
  {
    title: "Notifications",
    description: "Manage alerts & updates",
    href: "/user/settings/notifications",
    icon: FiBell,
  },
  {
    title: "Preferences",
    description: "App & call preferences",
    href: "/user/settings/preferences",
    icon: FiSliders,
  },
  {
    title: "Security",
    description: "Password & 2FA",
    href: "/user/settings/security",
    icon: FiShield,
  },
  {
    title: "Integrations",
    description: "Connected tools",
    href: "/user/settings/integrations",
    icon: FiLink,
  },
  {
    title: "Billing",
    description: "Billing & subscription",
    href: "/user/settings/billing",
    icon: FiCreditCard,
  },
  {
    title: "Send Mail",
    description: "Email your prospects",
    href: "/user/settings/send-mail",
    icon: FiSend,
  },
  {
    title: "Support Ticket",
    description: "Get help from our team",
    href: "/user/settings/support-ticket",
    icon: FiLifeBuoy,
  },
];

export default function SettingsLayout({ children }) {
  const pathname = usePathname();
  const swiperRef = useRef(null);

  // Active title for dynamic breadcrumbs
  const currentItem = navItems.find((item) => pathname.startsWith(item.href));
  const activeTitle = currentItem ? currentItem.title : "Profile";

  // Active index based on URL pathname (works for both mobile & desktop)
  const activeIndex = navItems.findIndex(
    (item) =>
      pathname.startsWith(item.href) ||
      (pathname === "/user/settings" && item.href === "/user/settings/profile")
  );

  // Slide the active item into view when the route changes
  useEffect(() => {
    if (activeIndex < 0) return;
    swiperRef.current?.slideTo(activeIndex, 300);
  }, [activeIndex]);

  // Mail & Support sub-pages (emails, templates, tickets) render as standalone
  // full-width pages without the settings tab sidebar.
  const isMailSupportPage =
    pathname?.startsWith("/user/settings/send-mail/emails") ||
    pathname?.startsWith("/user/settings/send-mail/templates") ||
    pathname?.startsWith("/user/settings/support-ticket/tickets") ||
    pathname?.startsWith("/user/settings/mail-and-support");

  if (isMailSupportPage) {
    return (
      <div className="min-h-screen text-dark-black/80">
        {children}
      </div>
    );
  }

  return (    <div className="min-h-screen text-dark-black/80">
      {/* Page Header / Breadcrumbs */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-dark-black">
          Settings / <span className="text-primary">{activeTitle}</span>
        </h1>
        <p className="mt-1 text-xs md:text-sm text-medium-black">
          Manage your personal information, security, and preferences.
        </p>
      </div>

      {/* Main Settings Layout */}
      <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">
        {/* Left Sidebar Navigation — swipeable on mobile, vertical on desktop */}
        <aside className="w-full lg:w-[240px] xl:w-[260px] shrink-0 flex flex-col justify-between gap-6">
          {/* Mobile: horizontal swipeable carousel (Swiper) */}
          <div className="relative lg:hidden">
            <Swiper
              modules={[FreeMode]}
              slidesPerView="auto"
              initialSlide={activeIndex > 0 ? activeIndex : 0}
              spaceBetween={12}
              freeMode
              grabCursor
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              className="!pb-3"
            >
              {navItems.map((item, i) => {
                const Icon = item.icon;
                const isActive = activeIndex === i;

                return (
                  <SwiperSlide key={item.href} className="!w-auto">
                    <Link
                      href={item.href}
                      className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 min-w-[160px] ${
                        isActive
                          ? "bg-white border-primary shadow-sm"
                          : "bg-white/80 border-light-gray hover:bg-white hover:border-primary/50"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "bg-light-gray text-light-black group-hover:bg-primary/10 group-hover:text-primary"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-semibold leading-tight ${
                            isActive ? "text-dark-black" : "text-dark-black/70"
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {/* Scroll dots indicator */}
            <div className="flex items-center justify-center gap-1.5 pb-1 pr-[1px]">
              {navItems.map((item, i) => (
                <span
                  key={item.href}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    activeIndex === i ? "bg-primary w-3" : "bg-light-black"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Desktop: vertical sidebar */}
          <nav className="hidden lg:flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (pathname === "/user/settings" && item.href === "/user/settings/profile");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all duration-300 ${
                    isActive
                      ? "bg-white border-primary"
                      : "bg-transparent border-transparent hover:bg-white hover:border-primary/50"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-light-gray text-light-black group-hover:bg-primary/10 group-hover:text-primary"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-bold leading-tight ${
                        isActive ? "text-dark-black" : "text-dark-black/70"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="text-xs text-light-black mt-0.5 leading-normal">
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}

          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 w-full">{children}</main>
      </div>
    </div>
  );
}
