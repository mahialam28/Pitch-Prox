"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiMinus } from "react-icons/fi";
import { cn } from "@/utils.js/cn";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import Wrapper from "@/components/wrappers/wrapper";

const FAQItem = ({ question, answer, isOpen, onToggle, index }) => {
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

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "01 Can PitchProX really help me book more appointments?",
      answer: "PitchProX isn't built to close deals for you. It's built to improve the moments that determine whether the conversation continues. When objections are handled more effectively, trust builds faster, and conversations stay on track, more prospects agree to the next step. More conversations become appointments. More appointments create more opportunities. The AI can't guarantee a sale. But it can help you miss fewer opportunities that would have otherwise slipped away.",
    },
    {
      question: "02 What makes PitchProX different from every other AI sales tool?",
      answer: "Most AI sales platforms analyze conversations after they're over. PitchProX works while they're still happening. Instead of giving you a report explaining what you should have said, PitchProX listens in real time, detects trust shifts, emotional cues, objections, and conversational momentum, then delivers the next strategic response before the opportunity is lost. It doesn't coach yesterday's call. It helps you win the one you're having.",
    },
    {
      question: "03 Will prospects know I'm using PitchProX?",
      answer: "No. Prospects don't hear PitchProX or interact with it in any way. Only you see the live teleprompter. The guidance is designed to sound natural, conversational, and consistent with the way experienced professionals communicate—not scripted, robotic, or AI-generated. The goal isn't to change your personality. It's to make you more effective under pressure.",
    },
    {
      question: "04 How does PitchProX know what to tell me next?",
      answer: "PitchProX continuously evaluates what is happening beneath the conversation—not just the words being spoken. It analyzes objection patterns, conversational context, emotional signals, trust development, pacing, and the likely direction of the interaction. Instead of waiting for you to ask a question, it anticipates where the conversation is heading and surfaces the next strategic response while there's still time to influence the outcome. The guidance changes because the conversation changes.",
    },
    {
      question: "05 Does PitchProX replace experience?",
      answer: "No. Experience comes from recognizing patterns, knowing when to pivot, and choosing the right response under pressure. PitchProX accelerates that process. Newer reps gain confidence faster, while experienced professionals stay sharper during difficult conversations by receiving strategic guidance exactly when they need it. The AI doesn't replace great salespeople. It helps more salespeople perform like them.",
    },
    {
      question: "06 Can I teach PitchProX how I sell?",
      answer: "Yes. Your playbooks, winning responses, objection handling, and proven sales strategies become part of the intelligence behind your guidance. As conversations generate successful outcomes, PitchProX continuously strengthens future recommendations so your best language becomes easier to execute. Over time, your knowledge becomes one of its greatest competitive advantages.",
    },
  ];

  return (
    <section id="faq" className="relative w-full overflow-hidden px-5 select-none">
      {/* Background Soft Gradients consistent with Landing Theme */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[600px] bg-gradient-radial from-[#6DDEBF]/5 to-transparent blur-3xl" />
      </div>

      <Wrapper variant="" className="pt-6 sm:pt-8 md:pt-10 pb-12 sm:pb-16 md:pb-20 relative z-10 flex flex-col items-center">
        {/* Badge Indicator */}
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ opacity: 0, transform: "translateY(10px)" }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 mb-5 text-[11px] sm:text-xs font-semibold tracking-wide text-primary uppercase rounded-full bg-primary/10 border border-primary/20"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Got Questions?
        </motion.div>

        {/* Section Typography Headers */}
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          style={{ opacity: 0, transform: "translateY(20px)" }}
          className="w-full text-center max-w-7xl mx-auto mb-12 md:mb-16"
        >
          <Title variant="large" className="">
            Frequently Asked Questions
          </Title>
        </motion.div>

        {/* Accordion Component Grid */}
        <div className="w-full max-w-7xl flex flex-col justify-start">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              index={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>
      </Wrapper>
    </section>
  );
};

export default FAQ;