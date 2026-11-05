"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye, BookOpen } from "lucide-react";
import { CATALOG } from "@/lib/playbook-catalog";

// Playbook Library (Super Admin): every platform playbook, with a way to open one for
// editing ("View details") or start a new one in the builder (/super-admin/playbook/create).
const KIND_LABEL = { standard: "Factory Default", premium: "Premium", custom: "Custom" };
const KIND_STYLE = {
  standard: "bg-primary/10 text-primary",
  premium: "bg-purple-50 text-purple-600",
  custom: "bg-amber-50 text-amber-600",
};

export default function PlaybookLibraryPage() {
  const router = useRouter();
  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-black/90 font-secondary tracking-tight">Playbook Library</h1>
          <p className="text-xs sm:text-sm text-medium-black">All PitchProX playbooks. Open one to review and edit it, or create a new playbook.</p>
        </div>
        <Link
          href="/super-admin/playbook/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-medium-teal text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create a New Playbook
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {CATALOG.map((playbook) => (
          <div key={playbook.id} className="bg-white rounded-2xl border border-light-gray p-5 shadow-sm flex flex-col gap-4 hover:border-primary/40 transition-colors">
            <div className="flex items-start gap-3">
              {playbook.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={playbook.avatarUrl} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" />
              ) : (
                <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                  {playbook.iconLetter ?? <BookOpen className="w-5 h-5" />}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-dark-black truncate">{playbook.title}</h2>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap ${KIND_STYLE[playbook.kind] ?? KIND_STYLE.custom}`}>
                    {KIND_LABEL[playbook.kind] ?? "Custom"}
                  </span>
                </div>
                <p className="text-xs text-light-black mt-0.5">{playbook.subtitle}</p>
              </div>
            </div>
            <p className="text-xs text-medium-black leading-relaxed flex-1">{playbook.description}</p>
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-light-gray">
              <span className="text-xs font-semibold text-dark-black">{playbook.priceCents ? `$${(playbook.priceCents / 100).toFixed(2)}` : "Included"}</span>
              <button
                type="button"
                onClick={() => router.push(`/super-admin/playbook/create?id=${playbook.id}`)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary border border-primary rounded-xl hover:bg-primary/5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                View details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
