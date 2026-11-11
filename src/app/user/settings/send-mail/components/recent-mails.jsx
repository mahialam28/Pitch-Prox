"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mailHref, useMail } from "../mail-view";
import Text from "@/components/texts/text";
import { usePortal } from "@/components/shared/use-portal";

export default function RecentMails() {
  const portal = usePortal();
  const router = useRouter();
  const { mails, loaded } = useMail();
  const recentMailsData = mails.slice(0, 6);

  const openEmail = (item) => {
    router.push(mailHref(portal.mailBase, item));
  };

  return (
    <div className="grow bg-white rounded-2xl border border-light-gray p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Text variant="regular" className="font-bold text-dark-black">
          Recent emails
        </Text>
        <Link
          href={`${portal.mailBase}/emails`}
          className="text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          View all
        </Link>
      </div>

      <div className="divide-y divide-light-gray">
        {loaded && recentMailsData.length === 0 && (
          <p className="py-6 text-center text-xs text-light-black">No emails yet.</p>
        )}
        {recentMailsData.map((item) => (
          <div
            key={item.id}
            onClick={() => openEmail(item)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openEmail(item);
              }
            }}
            role="link"
            tabIndex={0}
            aria-label={`Preview email to ${item.email}: ${item.subject}`}
            className="py-2.5 px-2 rounded-xl hover:bg-primary/5 transition-colors cursor-pointer border border-transparent hover:border-primary/20"
          >
            {/* Desktop / Tablet Grid (sm and up) */}
            <div className="hidden sm:grid grid-cols-12 items-center gap-2 text-xs">
              {/* Dot + Email */}
              <div className="col-span-5 flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${item.dotBg}`} />
                <span className="font-medium text-dark-black/80 truncate">
                  {item.email}
                </span>
              </div>

              {/* Subject */}
              <div className="col-span-3 text-light-black truncate font-normal min-w-0">
                {item.subject}
              </div>

              {/* Status Badge */}
              <div className="col-span-2 flex items-center justify-center">
                <span
                  className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold min-w-[56px] text-center ${item.statusBg}`}
                >
                  {item.status}
                </span>
              </div>

              {/* Time */}
              <div className="col-span-2 text-right text-[11px] text-light-black font-medium">
                {item.time}
              </div>
            </div>

            {/* Mobile View (< sm) */}
            <div className="flex sm:hidden flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${item.dotBg}`} />
                  <span className="font-medium text-dark-black/80 truncate">
                    {item.email}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${item.statusBg}`}
                >
                  {item.status}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-[11px] text-light-black pl-4">
                <span className="truncate">{item.subject}</span>
                <span className="shrink-0 font-medium">{item.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
