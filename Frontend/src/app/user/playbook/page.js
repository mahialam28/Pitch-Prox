"use client";

import React, { useCallback, useEffect, useState } from "react";
import PlaybookHeader from "./components/playbook-header";
import PlaybookList from "./components/playbook-list";
import { apiRequest } from "@/lib/client-api";
import { showError, showSuccess } from "@/lib/alerts";

// API playbook → the fields the existing cards and modals read
const toCard = (playbook) => ({
  ...playbook,
  isPremium: playbook.kind === "premium",
  author: playbook.kind === "premium" ? playbook.subtitle : undefined,
  subtitle: playbook.isCustom ? (playbook.status === "draft" ? "Draft" : "Custom") : playbook.subtitle,
});

const Playbook = () => {
  const [playbooks, setPlaybooks] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const loadPlaybooks = useCallback(() => {
    return apiRequest("/api/v1/playbooks")
      .then((data) => setPlaybooks(data.results.map(toCard)))
      .catch((error) => showError("Playbooks not loaded", error.message))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => { loadPlaybooks(); }, [loadPlaybooks]);

  const activatePlaybook = async (playbook) => {
    try {
      await apiRequest("/api/v1/playbooks/active", { method: "PUT", body: { playbookId: playbook.id } });
      await loadPlaybooks();
      showSuccess("Playbook activated", `${playbook.title} is now your active playbook.`);
    } catch (error) {
      showError("Playbook not changed", error.message);
    }
  };

  const deletePlaybook = async (playbook) => {
    try {
      await apiRequest(`/api/v1/playbooks/${playbook.id}`, { method: "DELETE" });
      await loadPlaybooks();
      showSuccess("Playbook deleted", `${playbook.title} was removed.`);
    } catch (error) {
      showError("Playbook not deleted", error.message);
    }
  };

  const activePlaybook = playbooks.find((playbook) => playbook.isActive);

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      <PlaybookHeader playbooks={playbooks} activePlaybook={activePlaybook} onActivate={activatePlaybook} />
      <PlaybookList playbooks={playbooks} loaded={loaded} onActivate={activatePlaybook} onDelete={deletePlaybook} />
    </div>
  );
};

export default Playbook;
