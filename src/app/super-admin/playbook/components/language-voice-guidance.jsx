"use client";

import toast from "react-hot-toast";
import { uploadBuilderFile } from "../builder-files";

import React, { useState, useRef } from "react";
import {
  Mic,
  Check,
  Plus,
  X,
  FileAudio,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import AddLanguagePrefModal from "./add-language-pref-modal";

const initialLangPrefs = [
  { id: "clear-simple", label: "Clear and simple language", checked: true },
  { id: "no-jargon", label: "No jargon or complex terms", checked: true },
  { id: "active-voice", label: "Active voice preferred", checked: true },
  { id: "conversational", label: "Conversational and natural", checked: true },
  { id: "industry-terms", label: "Industry-specific terminology", checked: false },
];

const initialWordsToAvoid = [
  "pushy",
  "guarantee",
  "close right now",
  "cheap",
  "act now",
];

const LanguageVoiceGuidance = ({
  langPrefs = initialLangPrefs,
  wordsToAvoid = initialWordsToAvoid,
  onLangPrefsChange = () => {},
  onWordsToAvoidChange = () => {},
  audioFile = { name: "Herjavec Style Guide.mp3", size: "3.2 MB" },
  onAudioChange = () => {},
}) => {
  const [preferences, setPreferences] = useState(langPrefs);
  const [words, setWords] = useState(wordsToAvoid);
  const [showAddPrefModal, setShowAddPrefModal] = useState(false);
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [newWordInput, setNewWordInput] = useState("");
  const [audio, setAudio] = useState(audioFile);
  const audioInputRef = useRef(null);

  const togglePref = (id) => {
    const updated = preferences.map((p) =>
      p.id === id ? { ...p, checked: !p.checked } : p
    );
    setPreferences(updated);
    onLangPrefsChange(updated);
  };

  const handleAddCustomPref = (label) => {
    const newPref = {
      id: label.toLowerCase().replace(/\s+/g, "-"),
      label,
      checked: true,
    };
    const updated = [...preferences, newPref];
    setPreferences(updated);
    onLangPrefsChange(updated);
    setShowAddPrefModal(false);
  };

  const handleAddWord = () => {
    const trimmed = newWordInput.trim();
    if (trimmed && !words.includes(trimmed)) {
      const updated = [...words, trimmed];
      setWords(updated);
      onWordsToAvoidChange(updated);
      setNewWordInput("");
      setIsAddingWord(false);
    }
  };

  const handleRemoveWord = (wordToRemove) => {
    const updated = words.filter((w) => w !== wordToRemove);
    setWords(updated);
    onWordsToAvoidChange(updated);
  };

  // Uploaded straight away so the saved playbook keeps the recording
  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const saved = await uploadBuilderFile(file, "audio");
      const newAudio = { name: saved.name, size: saved.size, url: saved.url };
      setAudio(newAudio);
      onAudioChange(newAudio);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pt-2 border-t border-light-gray">
      {/* COLUMN 1: Language Preferences */}
      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-bold text-dark-black/80">
            Language Preferences
          </h4>
          <p className="text-[11px] text-light-black font-normal mt-0.5">
            Select the language and phrasing guidelines.
          </p>
        </div>

        <div className="space-y-2">
          {preferences.map((pref) => (
            <label
              key={pref.id}
              onClick={() => togglePref(pref.id)}
              className="flex items-center gap-2.5 cursor-pointer group py-0.5 select-none"
            >
              <div
                className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                  pref.checked
                    ? "bg-primary text-white"
                    : "border border-light-black/40 bg-white group-hover:border-primary"
                }`}
              >
                {pref.checked && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span
                className={`text-xs transition-colors ${
                  pref.checked
                    ? "text-dark-black/90 font-medium"
                    : "text-medium-black group-hover:text-dark-black/80 font-normal"
                }`}
              >
                {pref.label}
              </span>
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowAddPrefModal(true)}
          className="mt-2 w-full py-2 rounded-xl border border-light-gray hover:border-primary/40 bg-white hover:bg-light-gray/30 text-primary text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Language Preferences</span>
        </button>
      </div>

      {/* COLUMN 2: Words to Avoid (Do Not Say) */}
      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-bold text-dark-black/80">
            Words to Avoid{" "}
            <span className="text-light-black font-normal">(Do Not Say)</span>
          </h4>
          <p className="text-[11px] text-light-black font-normal mt-0.5">
            Add words or phrases the AI should avoid.
          </p>
        </div>

        <div className="p-3 rounded-2xl border border-light-gray bg-white space-y-3 min-h-[140px] flex flex-col justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {words.map((word) => (
              <span
                key={word}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-light-gray/70 text-medium-black border border-light-gray text-xs font-medium rounded-lg transition-colors"
              >
                <span>{word}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveWord(word)}
                  className="text-light-black hover:text-rose-500 transition-colors cursor-pointer"
                  aria-label={`Remove ${word}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {isAddingWord ? (
              <div className="flex items-center gap-1.5 pt-1 w-full">
                <input
                  type="text"
                  value={newWordInput}
                  onChange={(e) => setNewWordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddWord();
                    }
                  }}
                  placeholder="e.g. impossible"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-primary text-xs focus:outline-none text-dark-black/80 placeholder:text-light-black"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddWord}
                  className="px-2.5 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-medium-teal cursor-pointer"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingWord(false);
                    setNewWordInput("");
                  }}
                  className="px-2 py-1.5 rounded-lg border border-light-gray text-light-black text-xs hover:bg-light-gray cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingWord(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-primary text-xs font-semibold hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add more</span>
              </button>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <span className="text-[11px] font-normal text-light-black">
              {words.length} / 25
            </span>
          </div>
        </div>
      </div>

      {/* COLUMN 3: Voice Notes / Guidance (Optional) */}
      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-bold text-dark-black/80">
            Voice Notes / Guidance{" "}
            <span className="text-light-black font-normal">(Optional)</span>
          </h4>
          <p className="text-[11px] text-light-black font-normal mt-0.5">
            Upload an audio clip of the coach explaining their style.
          </p>
        </div>

        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleAudioUpload}
        />

        {/* Upload Dropzone */}
        <div
          onClick={() => audioInputRef.current?.click()}
          className="p-4 rounded-2xl border-2 border-dashed border-light-gray hover:border-primary bg-light-gray/30 hover:bg-primary/5 transition-all text-center flex flex-col items-center justify-center cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <Mic className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-dark-black/80 group-hover:text-primary transition-colors">
            Upload Audio
          </span>
          <span className="text-[10px] text-light-black font-normal mt-0.5">
            MP3, WAV up to 25MB
          </span>
        </div>

        {/* Attached Audio Item */}
        {audio && (
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-light-gray bg-white shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                <FileAudio className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-semibold text-dark-black/80 truncate">
                  {audio.name}
                </h5>
                <span className="text-[10px] text-light-black font-normal">
                  {audio.size}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <ChevronRight className="w-4 h-4 text-light-black" />
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        )}
      </div>

      <AddLanguagePrefModal
        isOpen={showAddPrefModal}
        onClose={() => setShowAddPrefModal(false)}
        onAdd={handleAddCustomPref}
      />
    </div>
  );
};

export default LanguageVoiceGuidance;
