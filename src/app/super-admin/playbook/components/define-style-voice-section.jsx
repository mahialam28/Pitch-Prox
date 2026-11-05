"use client";

import React from "react";
import { RotateCcw, Info } from "lucide-react";
import Text from "@/components/texts/text";
import ToneSelection from "./tone-selection";
import CommunicationStyleControls from "./communication-style-controls";
import UniqueVoicePrinciples from "./unique-voice-principles";
import LanguageVoiceGuidance from "./language-voice-guidance";

const DefineStyleVoiceSection = ({
  formData,
  onChange = () => {},
  onRestoreDefaults = () => {},
}) => {
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 sm:p-7 shadow-sm space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-dark-black/80 font-secondary">
            Define Style & Voice
          </h2>
          <Text variant="smaller" className="text-medium-black mt-0.5">
            Configure how the AI should communicate, prompt, and coach using this playbook.
          </Text>
        </div>

        <button
          type="button"
          onClick={onRestoreDefaults}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl border border-light-gray hover:border-medium-black/30 text-medium-black hover:text-dark-black/90 bg-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Defaults</span>
        </button>
      </div>

      {/* 1. Overall Tone Selection */}
      <ToneSelection
        selectedTones={formData.tones || ["confident", "direct"]}
        onChange={(tones) => onChange("tones", tones)}
      />

      {/* 2. Communication Style Dropdowns & Sliders */}
      <CommunicationStyleControls
        communicationStyle={formData.communicationStyle || "consultative"}
        sentenceStyle={formData.sentenceStyle || "short-conversational"}
        formality={formData.formality || "professional"}
        energyLevel={formData.energyLevel !== undefined ? formData.energyLevel : 95}
        useOfHumor={formData.useOfHumor !== undefined ? formData.useOfHumor : 25}
        onChange={onChange}
      />

      {/* 3. Your Unique Voice & Core Selling Principles */}
      <UniqueVoicePrinciples
        voicePhrases={formData.voicePhrases}
        principles={formData.principles}
        onVoicePhrasesChange={(phrases) => onChange("voicePhrases", phrases)}
        onPrinciplesChange={(principles) => onChange("principles", principles)}
      />

      {/* 4. Language Preferences, Words to Avoid & Voice Notes */}
      <LanguageVoiceGuidance
        langPrefs={formData.langPrefs}
        wordsToAvoid={formData.wordsToAvoid}
        audioFile={formData.audioFile}
        onLangPrefsChange={(prefs) => onChange("langPrefs", prefs)}
        onWordsToAvoidChange={(words) => onChange("wordsToAvoid", words)}
        onAudioChange={(audio) => onChange("audioFile", audio)}
      />

      {/* 5. Bottom Style Configuration Notice Banner */}
      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center gap-2.5 text-xs text-blue-800">
        <Info className="w-4 h-4 text-blue-500 shrink-0" />
        <span className="font-normal">
          This style configuration will be applied across all prompts, feedback, and coaching moments.
        </span>
      </div>
    </div>
  );
};

export default DefineStyleVoiceSection;
