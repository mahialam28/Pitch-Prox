"use client";

import AiGuideline from "./components/ai-guidnine";
import AiGuidelineModal from "./components/ai-guidline-modal";
import AiTrainingContent from "./components/ai-training-content";
import AiTrainingContentList from "./components/ai-training-content-list";
import AiTrainingHeader from "./components/ai-training-header";
import AiTrainingProgress from "./components/ai-training-progress";
import UploadTrainingModal from "./components/upload-training-modal";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest, formatDate } from "@/lib/client-api";
import { showError, showSuccess } from "@/lib/alerts";
import { TRAINING_FILE_TYPES } from "@/utils.js/ai-training";

const ACCEPT = Object.values(TRAINING_FILE_TYPES).flat().map((extension) => `.${extension}`).join(",");

export const AiTrainingPage = () => {
  const [guidelineModalOpen, setGuidelineModalOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [uploadCategory, setUploadCategory] = useState(null);
  const [replacing, setReplacing] = useState(false);
  const replaceInputRef = useRef(null);
  const replaceTargetRef = useRef(null);

  const loadAssets = useCallback(() => {
    return apiRequest("/api/v1/ai-training/assets")
      .then((data) => {
        setAssets(data.results.map((item) => ({ ...item, uploadDate: formatDate(item.createdAt) })));
        setSummary(data.summary);
      })
      .catch((error) => showError("Training material not loaded", error.message))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => { loadAssets(); }, [loadAssets]);

  // Replace file: upload the new file into the same category, then remove the old one
  const handleReplace = (item) => {
    if (replacing) return;
    replaceTargetRef.current = item;
    replaceInputRef.current?.click();
  };

  const handleReplacementChosen = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    const target = replaceTargetRef.current;
    if (!file || !target) return;
    const form = new FormData();
    form.append("category", target.categoryId);
    form.append("file", file);
    setReplacing(true);
    try {
      await apiRequest("/api/v1/ai-training/assets", { method: "POST", body: form });
      await apiRequest(`/api/v1/ai-training/assets/${target.id}`, { method: "DELETE" });
      await loadAssets();
      showSuccess("File replaced", `${target.name} was replaced with ${file.name}.`);
    } catch (error) {
      await loadAssets();
      showError("File not replaced", error.message);
    } finally {
      setReplacing(false);
    }
  };

  const renameAsset = async (item, name) => {
    try {
      await apiRequest(`/api/v1/ai-training/assets/${item.id}`, { method: "PATCH", body: { name } });
      await loadAssets();
    } catch (error) {
      showError("Not renamed", error.message);
      throw error;
    }
  };

  const togglePause = async (item) => {
    try {
      await apiRequest(`/api/v1/ai-training/assets/${item.id}`, { method: "PATCH", body: { status: item.status === "Paused" ? "active" : "paused" } });
      await loadAssets();
    } catch (error) {
      showError("Not updated", error.message);
    }
  };

  const deleteAsset = async (item) => {
    try {
      await apiRequest(`/api/v1/ai-training/assets/${item.id}`, { method: "DELETE" });
      await loadAssets();
    } catch (error) {
      showError("Not deleted", error.message);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6 relative">
      {/* Top-left corner gradient decoration */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/8 via-emerald-300/6 to-purple-400/8 rounded-full blur-3xl pointer-events-none" />
      {/* 1. Lead Header */}
      <AiTrainingHeader />

      {/* 2. AI Training Progress: share of the 7 categories with active material */}
      <AiTrainingProgress
        key={summary?.progress ?? "loading"}
        progressPercentage={summary?.progress ?? 0}
        lastUpdated={summary?.lastUpdated ? formatDate(summary.lastUpdated) : "No uploads yet"}
        subtitle={summary
          ? `${summary.coveredCategories} of ${summary.totalCategories} categories have training material.`
          : "Loading your training material…"}
      />

      {/* 3. AI Training Content Grid */}
      <AiTrainingContent
        onUpload={setUploadCategory}
        onViewGuidelines={() => setGuidelineModalOpen(true)}
      />

      <AiTrainingContentList
        items={assets}
        loaded={loaded}
        onPause={togglePause}
        onDelete={deleteAsset}
        onRename={renameAsset}
        onReplace={handleReplace}
      />

      <AiGuideline onOpenModal={() => setGuidelineModalOpen(true)} />

      <AiGuidelineModal
        isOpen={guidelineModalOpen}
        onClose={() => setGuidelineModalOpen(false)}
      />

      <UploadTrainingModal
        isOpen={Boolean(uploadCategory)}
        initialCategory={uploadCategory}
        onClose={() => setUploadCategory(null)}
        onUploaded={(count) => {
          showSuccess("Uploaded", `${count} file${count === 1 ? " was" : "s were"} added to your training material.`);
          return loadAssets();
        }}
      />

      <input ref={replaceInputRef} type="file" accept={ACCEPT} className="hidden" onChange={handleReplacementChosen} />
    </div>
  );
};

export default AiTrainingPage;
