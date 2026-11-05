"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiMinus } from "react-icons/fi";
import { cn } from "@/utils.js/cn";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import Wrapper from "@/components/wrappers/wrapper";

const GuidanceItem = ({ question, answer, isOpen, onToggle, index }) => {
  return (
    <motion.div
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{ opacity: 0, transform: "translateY(15px)" }}
      transition={{ type: "spring", stiffness: 100, damping: 15, delay: index * 0.05 }}
      className={cn(
        "w-full border-b transition-all duration-300 py-5 sm:py-6",
        isOpen ? "border-primary/30" : "border-gray-200/60"
      )}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left gap-4 cursor-pointer group select-none"
      >
        <span className={cn(
          "text-sm sm:text-base font-medium tracking-wide transition-colors duration-300",
          isOpen ? "text-primary" : "text-medium-black group-hover:text-primary/80"
        )}>
          {question}
        </span>
        <div className={cn(
          "w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300",
          isOpen 
            ? "bg-primary text-white border-primary rotate-180 shadow-md shadow-primary/10" 
            : "bg-white border-gray-200 text-[#0B1B2B] group-hover:border-primary/40 group-hover:text-primary"
        )}>
          {isOpen ? <FiMinus className="text-xs sm:text-sm" /> : <FiPlus className="text-xs sm:text-sm" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ 
              height: "auto", 
              opacity: 1, 
              marginTop: 12,
              transition: { height: { type: "spring", stiffness: 120, damping: 20 }, opacity: { duration: 0.2 } }
            }}
            exit={{ 
              height: 0, 
              opacity: 0, 
              marginTop: 0,
              transition: { height: { duration: 0.25, ease: "easeInOut" }, opacity: { duration: 0.15 } }
            }}
            className="overflow-hidden"
          >
            <p className="text-xs sm:text-sm leading-relaxed text-gray-500 max-w-4xl pr-4">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Guidance = () => {
  const [openIndex, setOpenIndex] = useState(0);

const guidanceItems = [
    {
        question: "01. Handle Objections While They Still Matter",
        answer: "Most sales tools tell you what you should have said after the call ends. PitchProX helps while the conversation is still happening—surfacing responses, reframes, and questions while there is still time to change the outcome.",
    },
    {
        question: "02. Stay Confident Through Difficult Conversations",
        answer: "Pressure changes performance. Even experienced salespeople miss opportunities when conversations become emotional, unexpected, or uncomfortable. PitchProX helps you stay composed, deliberate, and in control of the conversation.",
    },
    {
        question: "03. Sound More Experienced From Day One",
        answer: "Experience is pattern recognition. PitchProX helps you recognize those patterns sooner by surfacing proven responses, objection strategies, and conversational frameworks exactly when you need them.",
    },
];

  return (
    <section id="guidance" className="relative w-full overflow-hidden px-5 select-none scroll-mt-[100px]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-[#6DDEBF]/5 to-transparent blur-3xl" />
      </div>

      <Wrapper variant="bottomSmall" className="py-12 sm:py-16 md:py-20 lg:py-24 relative z-10 flex flex-col items-center">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          style={{ opacity: 0, transform: "translateY(20px)" }}
          className="w-full text-center max-w-7xl mx-auto mb-12 md:mb-16"
        >
          <Title variant="large" className="">
            {"Great Conversations Aren't About Having Better Scripts. They're About Having Better Timing."}
          </Title>
          <Text variant="regular" className="max-w-4xl mx-auto mt-3 sm:mt-4">
            PitchProX Gives You Strategic Guidance During The Moments That Decide Whether A Conversation Moves Forward or Dies On The Spot.
          </Text>
        </motion.div>

        <div className="w-full max-w-7xl flex flex-col justify-start">
          {guidanceItems.map((item, index) => (
            <GuidanceItem
              key={index}
              index={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>
      </Wrapper>
    </section>
  );
};

export default Guidance;