"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import Dropdown from "@/components/shared/dropdown/dropdown";
import { MAIL_STATUS, mailHref, useMail } from "../mail-view";
import { usePortal } from "@/components/shared/use-portal";

const filterOptions = [
  { value: "all", label: "All Status" },
  ...Object.values(MAIL_STATUS).filter((item, index, all) => all.findIndex((other) => other.label === item.label) === index).map((item) => ({ value: item.label, label: item.label })),
];

const PER_PAGE = 6;

export default function EmailsPage() {
  const portal = usePortal();
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { mails: allEmails, loaded } = useMail();

  const openEmail = (mail) => {
    router.push(mailHref(portal.mailBase, mail));
  };

  const filteredMails =
    filterStatus === "all"
      ? allEmails
      : allEmails.filter((m) => m.status === filterStatus);

  const totalPages = Math.ceil(filteredMails.length / PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(totalPages, 1));
  const pageMails = filteredMails.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE
  );

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      {/* ── Header ── */}
      <div className="w-full flex flex-col gap-3">
        <Link
          href={portal.mailBase}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-medium-teal transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {portal.mailBackLabel}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <Title variant="small" className="!text-dark-black/80 font-bold">
              Sent Emails
            </Title>
            <Text variant="small" className="text-medium-black">
              A complete history of emails sent to your prospects.
            </Text>
          </div>

          {/* Filter Dropdown */}
          <div className="w-44 shrink-0">
            <Dropdown
              label="All Status"
              items={filterOptions}
              selected={filterStatus}
              onSelect={(val) => {
                setFilterStatus(val);
                setCurrentPage(1);
              }}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* ── Emails Table Card ── */}
      <div className="bg-white rounded-2xl border border-light-gray p-6 shadow-sm flex flex-col justify-between min-h-[480px]">
        <div>
          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-light-gray text-[11px] font-bold text-light-black uppercase tracking-wider">
                  <th className="pb-3 w-[240px]">Recipient</th>
                  <th className="pb-3">Subject</th>
                  <th className="pb-3 text-center w-[120px]">Status</th>
                  <th className="pb-3 text-right w-[140px]">Date / Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray text-xs">
                {pageMails.map((mail) => (
                  <tr
                    key={mail.id}
                    onClick={() => openEmail(mail)}
                    className="hover:bg-primary/5 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 font-semibold text-dark-black group-hover:text-primary transition-colors">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${mail.dotBg}`} />
                        <span className="truncate">{mail.email}</span>
                      </div>
                    </td>
                    <td className="py-4 text-medium-black max-w-[280px] truncate">
                      {mail.subject}
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-semibold ${mail.statusBg}`}
                      >
                        {mail.status}
                      </span>
                    </td>
                    <td className="py-4 text-right text-light-black text-[11px]">
                      {mail.time}
                    </td>
                  </tr>
                ))}

                {loaded && pageMails.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-light-black text-xs">
                      {allEmails.length ? <>No emails found for &quot;{filterStatus}&quot;</> : "No emails yet. Emails you write appear here."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-light-gray text-xs text-light-black">
            <span>
              Showing {(safePage - 1) * PER_PAGE + 1}–
              {Math.min(safePage * PER_PAGE, filteredMails.length)} of{" "}
              {filteredMails.length}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className={`p-1.5 rounded-lg border border-light-gray transition-colors ${
                  safePage === 1
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-light-gray text-dark-black cursor-pointer"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  type="button"
                  onClick={() => setCurrentPage(pg)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                    safePage === pg
                      ? "bg-primary text-white"
                      : "hover:bg-light-gray text-dark-black cursor-pointer"
                  }`}
                >
                  {pg}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className={`p-1.5 rounded-lg border border-light-gray transition-colors ${
                  safePage === totalPages
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-light-gray text-dark-black cursor-pointer"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
