"use client";

import React, { useState } from "react";
import { BookOpen, CheckCircle, Zap, ArrowRight } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import ChangePlaybookModal from "./change-playbook-modal";
import LearnPlaybookModal from "./learn-playbook-modal";

const PlaybookHeader = ({ playbooks = [], activePlaybook, onActivate }) => {
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isLearnModalOpen, setIsLearnModalOpen] = useState(false);
  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      {/* Header Title Row — matching dashboard pattern */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <Title variant="small" className="!text-dark-black/80">
            Playbook
          </Title>
          <Text variant="small">
            Manage your playbooks 
          </Text>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Primary Section) */}
        <div className="lg:col-span-8 space-y-6">
          <div>
            <Title
              variant="regular"
              className="!text-primary !font-semibold tracking-tight mb-2"
            >
              Power your AI with proven selling methodologies.
            </Title>
            <Text variant="regular" className="leading-relaxed">
              Choose a playbook to change your AI&apos;s prompting style and conversation approach.
              Each playbook brings a unique framework, tone, and strategy to help you close more deals.
            </Text>
          </div>

          {/* Active Playbook Card */}
          <div className="bg-white rounded-2xl border border-light-gray p-5 lg:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Book Icon & Title info */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-light-teal flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>

              <div>
                <Text variant="smaller" className="font-bold tracking-wider text-light-black uppercase block mb-0.5">
                  ACTIVE PLAYBOOK
                </Text>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Title variant="small" className="!text-lg !font-bold !text-dark-black">
                    {activePlaybook?.title || "PitchProX Standard"}
                  </Title>
                  <CheckCircle className="w-4 h-4 text-primary fill-primary stroke-white shrink-0" />
                  <span className="bg-light-teal text-primary text-[10px] font-bold px-2 py-0.5 rounded tracking-wide">
                    ACTIVE
                  </span>
                </div>
                <Text variant="small" className="text-light-black mt-0.5">
                  {activePlaybook?.subtitle || "Factory Default"}
                </Text>
              </div>
            </div>

            {/* Description Text */}
            <Text variant="small" className="leading-relaxed max-w-xs hidden xl:block">
              {activePlaybook?.description || "Our proven framework built on emotional intelligence, trust-building, and strategic conversation flow."}
            </Text>

            {/* Action Button */}
            <button
              onClick={() => setIsChangeModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-colors duration-200 shrink-0 cursor-pointer"
            >
              Change Playbook
            </button>
          </div>
        </div>

        {/* Change Playbook Modal */}
        <ChangePlaybookModal
          isOpen={isChangeModalOpen}
          onClose={() => setIsChangeModalOpen(false)}
          playbooks={playbooks}
          activeId={activePlaybook?.id}
          onSelect={onActivate}
        />

        {/* Right Column (Info Card) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-light-gray p-6 lg:p-8 shadow-sm flex flex-col items-center text-center">
            {/* Lightning Icon Header */}
            <div className="w-12 h-12 rounded-2xl bg-light-teal/70 flex items-center justify-center mb-5">
              <Zap className="w-5 h-5 text-primary" />
            </div>

            <Title variant="small" className="!text-lg !font-bold !text-dark-black mb-3">
              About Playbooks
            </Title>

            <Text variant="small" className="leading-relaxed mb-6">
              Playbooks define how your AI thinks, communicates, and guides conversations. Switch anytime to match your preferred sales methodology or coaching style.
            </Text>

            <button
              type="button"
              onClick={() => setIsLearnModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80 transition-opacity cursor-pointer"
            >
              <span>Learn More</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Learn More Modal */}
      <LearnPlaybookModal
        isOpen={isLearnModalOpen}
        onClose={() => setIsLearnModalOpen(false)}
      />
    </div>
  );
};

export default PlaybookHeader;