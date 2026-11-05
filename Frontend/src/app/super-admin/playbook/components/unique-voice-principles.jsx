"use client";

import React, { useState } from "react";
import { Plus, X, GripVertical, Trash2 } from "lucide-react";

const initialVoicePhrases = [
  "Here's the thing",
  "Bottom line",
  "What I've seen is...",
  "At the end of the day",
  "Let's be real",
];

const initialSellingPrinciples = [
  { id: 1, text: "Build instant credibility and trust" },
  { id: 2, text: "Value-driven questioning to uncover real needs" },
  { id: 3, text: "Objection handling with confidence and clarity" },
  { id: 4, text: "Closing techniques used by top entrepreneurs and investors" },
  { id: 5, text: "Always lead with value, not pressure" },
];

const UniqueVoicePrinciples = ({
  voicePhrases = initialVoicePhrases,
  principles = initialSellingPrinciples,
  onVoicePhrasesChange = () => {},
  onPrinciplesChange = () => {},
}) => {
  const [phrases, setPhrases] = useState(voicePhrases);
  const [principleList, setPrincipleList] = useState(principles);
  const [newPhraseInput, setNewPhraseInput] = useState("");
  const [isAddingPhrase, setIsAddingPhrase] = useState(false);
  const [newPrincipleText, setNewPrincipleText] = useState("");
  const [isAddingPrinciple, setIsAddingPrinciple] = useState(false);

  const handleAddPhrase = () => {
    const trimmed = newPhraseInput.trim();
    if (trimmed && !phrases.includes(trimmed)) {
      const updated = [...phrases, trimmed];
      setPhrases(updated);
      onVoicePhrasesChange(updated);
      setNewPhraseInput("");
      setIsAddingPhrase(false);
    }
  };

  const handleRemovePhrase = (phraseToRemove) => {
    const updated = phrases.filter((p) => p !== phraseToRemove);
    setPhrases(updated);
    onVoicePhrasesChange(updated);
  };

  const handleAddPrinciple = () => {
    const trimmed = newPrincipleText.trim();
    if (trimmed) {
      const updated = [
        ...principleList,
        { id: Date.now(), text: trimmed },
      ];
      setPrincipleList(updated);
      onPrinciplesChange(updated);
      setNewPrincipleText("");
      setIsAddingPrinciple(false);
    }
  };

  const handleRemovePrinciple = (id) => {
    const updated = principleList.filter((p) => p.id !== id);
    setPrincipleList(updated);
    onPrinciplesChange(updated);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-7 items-start pt-2 border-t border-light-gray">
      {/* LEFT COLUMN: Your Unique Voice */}
      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-bold text-dark-black/80">
            Your Unique Voice
          </h4>
          <p className="text-[11px] text-light-black font-normal mt-0.5">
            Add words, phrases, or expressions you (or the coach) use often.
          </p>
        </div>

        {/* Phrases Tags Container */}
        <div className="p-3 rounded-2xl border border-light-gray bg-white space-y-3 min-h-[140px] flex flex-col justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {phrases.map((phrase) => (
              <span
                key={phrase}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 border border-sky-100 text-xs font-medium rounded-lg transition-colors"
              >
                <span>{phrase}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePhrase(phrase)}
                  className="text-sky-400 hover:text-rose-500 transition-colors cursor-pointer"
                  aria-label={`Remove ${phrase}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {isAddingPhrase ? (
              <div className="flex items-center gap-1.5 pt-1 w-full">
                <input
                  type="text"
                  value={newPhraseInput}
                  onChange={(e) => setNewPhraseInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddPhrase();
                    }
                  }}
                  placeholder="e.g. Let's make it happen"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-primary text-xs focus:outline-none text-dark-black/80 placeholder:text-light-black"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddPhrase}
                  className="px-2.5 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-medium-teal cursor-pointer"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingPhrase(false);
                    setNewPhraseInput("");
                  }}
                  className="px-2 py-1.5 rounded-lg border border-light-gray text-light-black text-xs hover:bg-light-gray cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingPhrase(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-primary text-xs font-semibold hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add more</span>
              </button>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <span className="text-[11px] font-normal text-light-black">
              {phrases.length} / 20
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Core Selling Principles */}
      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-bold text-dark-black/80">
            Core Selling Principles{" "}
            <span className="text-light-black font-normal">
              (3-6 recommended)
            </span>
          </h4>
          <p className="text-[11px] text-light-black font-normal mt-0.5">
            Define the beliefs and principles this playbook is built on.
          </p>
        </div>

        {/* Principles List */}
        <div className="space-y-2">
          {principleList.map((principle) => (
            <div
              key={principle.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-light-gray bg-light-gray/30 hover:bg-white hover:border-light-gray transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <GripVertical className="w-4 h-4 text-light-black shrink-0 cursor-grab active:cursor-grabbing" />
                <span className="text-xs font-normal text-dark-black/80 leading-snug truncate">
                  {principle.text}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePrinciple(principle.id)}
                className="text-rose-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                aria-label="Delete principle"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Principle Inline Button */}
        {isAddingPrinciple ? (
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newPrincipleText}
              onChange={(e) => setNewPrincipleText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddPrinciple();
                }
              }}
              placeholder="e.g. Focus on mutual value creation"
              className="flex-1 px-3 py-1.5 rounded-xl border border-primary text-xs focus:outline-none text-dark-black/80 placeholder:text-light-black"
              autoFocus
            />
            <button
              type="button"
              onClick={handleAddPrinciple}
              className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-medium-teal cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingPrinciple(false);
                setNewPrincipleText("");
              }}
              className="px-2.5 py-1.5 rounded-xl border border-light-gray text-light-black text-xs hover:bg-light-gray cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingPrinciple(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-medium-teal transition-colors cursor-pointer pt-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Principle</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default UniqueVoicePrinciples;
