"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye, BookOpen, Pencil, Trash2, FileEdit, History } from "lucide-react";
import toast from "react-hot-toast";
import AlertModal from "@/components/modals/alert-modal";
import VersionHistoryModal from "./components/version-history-modal";
import { apiRequest, formatDateTime } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

// Playbook Library (Super Admin): drafts being built (saved automatically by the builder) and every
// platform playbook. "View details" opens a playbook's draft, starting one if needed.
const KIND_LABEL = { standard: "Factory Default", premium: "Premium", custom: "Custom" };
const KIND_STYLE = {
  standard: "bg-primary/10 text-primary",
  premium: "bg-purple-50 text-purple-600",
  custom: "bg-amber-50 text-amber-600",
};
const STEP_NAMES = ["Basic Info", "Style & Voice", "Conversation Flow", "Objection Handling", "Resources & Scripts", "AI Prompt Framework", "Review & Publish"];

export default function PlaybookLibraryPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [history, setHistory] = useState(null);

  const load = useCallback(() => apiRequest("/api/v1/admin/playbook-builds").then(setData).catch((error) => showError("Playbooks not loaded", error.message)), []);
  useEffect(() => {
    load();
  }, [load]);

  const remove = async () => {
    try {
      await apiRequest(`/api/v1/admin/playbook-builds/${deleting.id}`, { method: "DELETE" });
      toast.success("Draft deleted.");
      setDeleting(null);
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-black/90 font-secondary tracking-tight">Playbook Library</h1>
          <p className="text-xs sm:text-sm text-medium-black">All PitchProX playbooks. Open one to review and edit it, or create a new playbook.</p>
        </div>
        <Link href="/super-admin/playbook/create" className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-medium-teal text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          Create a New Playbook
        </Link>
      </div>

      {/* Drafts */}
      <section className="bg-white rounded-2xl border border-light-gray shadow-sm">
        <div className="px-5 py-4 border-b border-light-gray flex items-center justify-between">
          <h2 className="text-base font-bold text-dark-black font-secondary">Drafts {data ? `(${data.drafts.length})` : ""}</h2>
          <span className="text-xs text-light-black">Saved automatically while you edit</span>
        </div>
        {!data && <p className="p-5 text-xs text-light-black">Loading...</p>}
        {data && data.drafts.length === 0 && <p className="p-5 text-xs text-light-black">No drafts. Create a playbook or open one below to start editing.</p>}
        <ul className="divide-y divide-light-gray/70">
          {data?.drafts.map((draft) => (
            <li key={draft.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><FileEdit className="w-4 h-4" /></span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-dark-black truncate">{draft.title}</p>
                  <p className="text-[11px] text-light-black">
                    {draft.playbookId ? `Editing ${draft.playbookTitle ?? "a published playbook"}${draft.baseVersion ? ` (from v${draft.baseVersion})` : ""}` : "New playbook"} · Step {draft.currentStep} of 7: {STEP_NAMES[draft.currentStep - 1]} · saved {formatDateTime(draft.updatedAt)} by {draft.updatedBy}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button type="button" onClick={() => router.push(`/super-admin/playbook/create?build=${draft.id}`)} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-primary rounded-xl hover:bg-medium-teal cursor-pointer">
                  <Pencil className="w-3.5 h-3.5" /> Continue
                </button>
                <button type="button" onClick={() => setDeleting(draft)} aria-label={`Delete draft ${draft.title}`} className="p-2 rounded-xl border border-light-gray text-rose-500 hover:bg-rose-50 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {(data?.playbooks ?? []).map((playbook) => (
          <div key={playbook.id} className="bg-white rounded-2xl border border-light-gray p-5 shadow-sm flex flex-col gap-4 hover:border-primary/40 transition-colors">
            <div className="flex items-start gap-3">
              {playbook.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={playbook.avatarUrl} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" />
              ) : (
                <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">{playbook.iconLetter ?? <BookOpen className="w-5 h-5" />}</span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-dark-black truncate">{playbook.title}</h2>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap ${KIND_STYLE[playbook.kind] ?? KIND_STYLE.custom}`}>{KIND_LABEL[playbook.kind] ?? "Custom"}</span>
                </div>
                <p className="text-xs text-light-black mt-0.5">
                  {playbook.subtitle}
                  {playbook.version ? ` · v${playbook.version}` : ""}
                  {playbook.visibility && playbook.visibility !== "marketplace" ? ` · ${{ private: "Private", team: "Team only", organization: "Organization" }[playbook.visibility]}` : ""}
                </p>
              </div>
            </div>
            <p className="text-xs text-medium-black leading-relaxed flex-1">{playbook.description}</p>
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-light-gray">
              <span className="text-xs font-semibold text-dark-black flex items-center gap-2">
                {playbook.priceCents ? `$${(playbook.priceCents / 100).toFixed(2)}` : playbook.kind === "standard" ? "Included" : "Free"}
                {playbook.version && (
                  <button type="button" onClick={() => setHistory(playbook.id)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-medium-black hover:text-primary cursor-pointer">
                    <History className="w-3.5 h-3.5" /> Versions
                  </button>
                )}
              </span>
              <button
                type="button"
                onClick={() => router.push(playbook.draftId ? `/super-admin/playbook/create?build=${playbook.draftId}` : `/super-admin/playbook/create?id=${playbook.id}`)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary border border-primary rounded-xl hover:bg-primary/5 cursor-pointer"
              >
                {playbook.draftId ? <Pencil className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {playbook.draftId ? "Continue draft" : "View details"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {history && <VersionHistoryModal playbookId={history} onClose={() => setHistory(null)} onChanged={load} />}

      <AlertModal
        isOpen={Boolean(deleting)}
        type="danger"
        title="Delete Draft"
        message={deleting ? `Delete the draft "${deleting.title}"? ${deleting.playbookId ? "The published playbook isn't changed." : "This can't be undone."}` : ""}
        confirmLabel="Delete Draft"
        onClose={() => setDeleting(null)}
        onConfirm={remove}
      />
    </div>
  );
}
