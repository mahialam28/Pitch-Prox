"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import CommonWrapper from "@/components/wrappers/wrapper";
import banner from "@/assets/images/home/hero.png";
import tick from "@/assets/images/home/tick.png";
import DemoForm from "./demo-form";

const Hero = () => {
  const cards = [
    {
      title: "Know What To Say Next",
      desc: "Live teleprompting delivers the right words before the opportunity disappears. PitchProX analyzes the conversation in real time and surfaces questions, responses, and strategic pivots while there is still time to change the outcome.",
    },
    {
      title: "Handle Objections In The Moment",
      desc: "Get strategic responses while the prospect is still talking. Instead of replaying missed opportunities after the call ends, PitchProX helps you navigate hesitation, resistance, and uncertainty as they happen.",
    },
    {
      title: "Build Momentum That Closes Deals",
      desc: "Momentum is one of the most fragile things in sales conversations. PitchProX helps you maintain trust, navigate uncertainty, and move naturally toward the next step.",
    },
  ];

  const bulletPoints = [
    "Live AI Teleprompting",
    "Objection Handling In Real Time",
    "Trust & Emotion Detection",
  ];

  return (
    <section id="home" className="w-full max-w-380 mx-auto px-5 select-none lg:mt-10">
      {/* Main Outer Rounded Hero Card container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full rounded-2xl xs:rounded-3xl sm:rounded-[2.5rem] overflow-hidden px-4 sm:px-6 flex flex-col items-center justify-center text-center shadow-2xl"
      >
        {/* Background Banner Image Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src={banner}
            alt="Hero Background Banner"
            fill
            sizes="100vw"
            priority
            className="object-cover object-center"
          />
        </div>

        <CommonWrapper variant="bottomSmall" className="py-12 sm:py-16 md:py-20 lg:py-24 w-full">
          {/* Content Container Stack */}
          <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center px-2 sm:px-0">
            {/* Primary Main Typography Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Title
                variant="large"
                className="text-white max-w-5xl font-extrabold tracking-tight text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
              >
                Your Next Line. Before You Need It.
                <span className="block mt-1 sm:mt-2 font-bold text-white text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                  Every dial backed by a Pro.
                </span>
              </Title>
            </motion.div>

            {/* Subheading/Paragraph */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 sm:mt-6 max-w-3xl px-2 sm:px-0"
            >
              <Text
                variant="large"
                className="text-white/90 leading-relaxed font-light inline text-sm xs:text-base sm:text-lg md:text-xl"
              >
                PitchProX Delivers Live AI Teleprompting, Objection Guidance, And Strategic Responses While The Conversation Is Still Happening.
              </Text>
            </motion.div>

            {/* Horizontal Bullet Points List */}
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-2 mt-6 sm:mt-8 text-white/90 text-sm sm:text-base md:text-lg font-medium"
            >
              {bulletPoints.map((item, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="text-white">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </motion.ul>

            {/* Demo Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <DemoForm />
            </motion.div>
          </div>

          {/* Triple Feature Bottom Cards Grid */}
          <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mt-12 sm:mt-16 md:mt-20 lg:mt-24 text-left max-w-6xl mx-auto px-2 sm:px-0">
            {cards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + (i * 0.1) }}
                whileHover={{ y: -6 }}
                className="group rounded-2xl sm:rounded-3xl bg-medium-black/10 backdrop-blur-md border border-medium-black/30 p-4 sm:p-5 md:p-6 shadow-xl transition-colors duration-300 hover:border-primary/50 hover:bg-medium-black/20"
              >
                {/* Card Title Header with Tick Image */}
                <div className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    className="w-6 h-6 sm:w-7 md:w-8 shrink-0 mt-0.5 relative"
                  >
                    <Image
                      src={tick}
                      alt="Check"
                      fill
                      sizes="(max-width: 640px) 24px, (max-width: 768px) 28px, 32px"
                      className="object-contain"
                    />
                  </motion.div>
                  <Text className="text-white font-semibold text-sm sm:text-base md:text-lg">
                    {card.title}
                  </Text>
                </div>

                {/* Card Descriptive Content */}
                <Text
                  variant="small"
                  className="text-white/60 tracking-wider font-light text-xs sm:text-sm"
                >
                  {card.desc}
                </Text>
              </motion.div>
            ))}
          </div>
        </CommonWrapper>
      </motion.div>
    </section>
  );
};

export default Hero;