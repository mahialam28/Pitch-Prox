"use client";

import { useCallback, useEffect, useState } from "react";
import PlaybookHeader from "@/app/user/playbook/components/playbook-header";
import PlaybookList from "@/app/user/playbook/components/playbook-list";
import CreatePlaybookModal from "./components/create-playbook-modal";
import { apiRequest } from "@/lib/client-api";
import { showError, showSuccess } from "@/lib/alerts";
import { showSavedToast } from "@/lib/toast";

// Sales rep playbooks: the platform playbooks (premium ones are included for staff) plus the
// custom playbooks this rep built. Custom playbooks are created in a modal from a base playbook.
const toCard = (playbook) => ({
  ...playbook,
  subtitle: playbook.isCustom ? (playbook.status === "draft" ? "Draft" : "Custom") : playbook.subtitle,
});

export default function SalesRepPlaybookPage() {
  const [playbooks, setPlaybooks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [editor, setEditor] = useState(null); // { playbook } when open

  const load = useCallback(
    () =>
      apiRequest("/api/v1/playbooks")
        .then((data) => setPlaybooks(data.results.map(toCard)))
        .catch((error) => showError("Playbooks not loaded", error.message))
        .finally(() => setLoaded(true)),
    []
  );

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const activePlaybook = playbooks.find((playbook) => playbook.isActive);

  const activate = async (playbook) => {
    try {
      await apiRequest("/api/v1/playbooks/active", { method: "PUT", body: { playbookId: playbook.id } });
      await load();
      showSuccess("Playbook activated", `${playbook.title} is now your active playbook.`);
    } catch (error) {
      showError("Playbook not changed", error.message);
    }
  };

  const remove = async (playbook) => {
    if (!playbook?.isCustom) return;
    try {
      await apiRequest(`/api/v1/playbooks/${playbook.id}`, { method: "DELETE" });
      await load();
      showSuccess("Playbook deleted", `${playbook.title} was removed.`);
    } catch (error) {
      showError("Playbook not deleted", error.message);
    }
  };

  const save = async (saved) => {
    const body = { title: saved.title, description: saved.description, status: "published", content: { baseId: saved.baseId } };
    try {
      if (editor?.playbook) await apiRequest(`/api/v1/playbooks/${editor.playbook.id}`, { method: "PATCH", body });
      else await apiRequest("/api/v1/playbooks", { method: "POST", body });
    } catch (error) {
      showError("Playbook not saved", error.message);
      throw error;
    }
    await load();
    showSavedToast(editor?.playbook ? "Playbook updated" : "Playbook created", `${saved.title} is in your Custom playbooks.`);
  };

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      <PlaybookHeader playbooks={playbooks} activePlaybook={activePlaybook} onActivate={activate} />
      <PlaybookList
        playbooks={playbooks}
        loaded={loaded}
        onActivate={activate}
        onDelete={remove}
        onCreate={(playbook) => setEditor({ playbook: playbook?.isCustom ? playbook : null })}
      />
      <CreatePlaybookModal
        key={editor ? editor.playbook?.id ?? "new" : "closed"}
        isOpen={Boolean(editor)}
        playbook={editor?.playbook}
        onClose={() => setEditor(null)}
        onSave={save}
      />
    </div>
  );
}
