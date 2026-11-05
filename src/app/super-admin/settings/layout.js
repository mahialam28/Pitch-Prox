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
  FiHelpCircle,
} from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import Wrapper from "@/components/wrappers/wrapper";

const navItems = [
  {
    title: "Profile",
    description: "Personal info & security",
    href: "/super-admin/settings/profile",
    icon: FiUser,
  },
  {
    title: "Notifications",
    description: "Manage alerts & updates",
    href: "/super-admin/settings/notifications",
    icon: FiBell,
  },
  {
    title: "Preferences",
    description: "App & call preferences",
    href: "/super-admin/settings/preferences",
    icon: FiSliders,
  },
  {
    title: "Security",
    description: "Password & 2FA",
    href: "/super-admin/settings/security",
    icon: FiShield,
  },
  {
    title: "Integrations",
    description: "Connected tools",
    href: "/super-admin/settings/integrations",
    icon: FiLink,
  },
  {
    title: "Need Help?",
    description: "Support & common questions",
    href: "/super-admin/settings/help",
    icon: FiHelpCircle,
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
      (pathname === "/super-admin/settings" && item.href === "/super-admin/settings/profile")
  );

  // Slide the active item into view when the route changes
  useEffect(() => {
    if (activeIndex < 0) return;
    swiperRef.current?.slideTo(activeIndex, 300);
  }, [activeIndex]);

  return (
    <Wrapper variant="bottomSection" className="min-h-screen text-dark-black/80">
      {/* Page Header / Breadcrumbs */}
      <div className="mb-6 lg:mb-8">
        <Title variant="small" className="!text-xl md:!text-2xl lg:!text-3xl !font-bold tracking-tight !text-dark-black">
          Settings / <span className="text-primary">{activeTitle}</span>
        </Title>
        <Text variant="small" className="mt-1 text-medium-black">
          Manage your personal information, security, and preferences.
        </Text>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Navigation — swipeable on mobile, vertical on desktop */}
        <aside className="lg:col-span-4 xl:col-span-3 flex flex-col justify-between gap-6">
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
                (pathname === "/super-admin/settings" && item.href === "/super-admin/settings/profile");

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
        <main className="lg:col-span-8 xl:col-span-9">{children}</main>
      </div>
    </Wrapper>
  );
}
