"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/utils.js/cn";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import callScreen from "@/assets/images/home/image-1.png";
import leadScreen from "@/assets/images/home/image-2.png";
import aiTraining from "@/assets/images/home/image-3.png";
import Wrapper from "@/components/wrappers/wrapper";

const AdaptConversation = () => {
  const cards = [
    {
      id: 1,
      title: "Know What They're Saying. And What They Aren't.",
      description:
        "Great sales conversations happen beneath the surface. Confidence, hesitation, urgency, uncertainty, and trust all influence whether a prospect moves forward or disappears forever. PitchProX continuously analyzes the emotional direction of the conversation and adjusts your guidance in real time. Instead of reacting after the opportunity is lost, your next move is already waiting for you.",
      image: callScreen,
      alt: "Call screen illustration",
      imageSide: "right",
    },
    {
      id: 2,
      title: "Trust Isn't Luck. It's A Strategy.",
      description:
        "Top performers rarely have better scripts. They have better timing, pacing, and judgment. They know how to build trust, create momentum, and guide conversations naturally toward commitment. PitchProX tracks conversational signals throughout every interaction and helps reps adjust pacing, wording, and strategy based on how the prospect is responding. The result isn't more pressure. It's better timing, stronger relationships, and conversations that continue moving forward.",
      image: leadScreen,
      alt: "Leads screen illustration",
      imageSide: "left",
    },
    {
      id: 3,
      title: "Your Playbook Gets Smarter Every Call.",
      description:
        "Every objection handled, every successful response, and every winning conversation makes your system stronger. PitchProX learns from outcomes, adapts prompts, and improves recommendations over time using your language, your playbooks, and your winning strategies. The AI doesn't replace your instincts. It helps sharpen them.",
      image: aiTraining,
      alt: "AI Training illustration",
      imageSide: "right",
    },
  ];

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -80 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 80 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <section className="container mx-auto md:px-5 select-none bg-white">
      <Wrapper variant="bottomSmall" className="py-12 sm:py-16 md:py-20 lg:py-24">
        {/* Section Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="w-full flex flex-col items-center text-center mb-10 sm:mb-12 md:mb-16 lg:mb-20"
        >
          <motion.div variants={fadeUp}>
            <Title
              variant="large"
              className="text-dark-black max-w-4xl font-extrabold tracking-tight text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight"
            >
              Sales Conversations Change Fast. <br />
              <span className="text-primary">PitchProX</span> Changes With Them.
            </Title>
          </motion.div>
          <motion.div variants={fadeUp}>
            <Text
              className="text-medium-black/80 mt-3 sm:mt-4 max-w-2xl"
            >
              Real-Time Conversational Intelligence That Adapts To Trust, Emotion,
              Objections, And Momentum While The Call Is Still Happening.
            </Text>
          </motion.div>
        </motion.div>

        {/* Cards Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="flex flex-col gap-6 sm:gap-8 md:gap-10 lg:gap-12"
        >
          {cards.map((card) => {
            const isImageLeft = card.imageSide === "left";

            return (
              <motion.div
                key={card.id}
                variants={fadeUp}
                className={cn(
                  "w-full overflow-hidden md:rounded-3xl rounded-2xl xl:rounded-40 p-5 flex lg:flex-row flex-col justify-between xl:px-8 px-6 xl:py-12 py-10 xl:gap-16 lg:gap-8 gap-6",
                  isImageLeft 
                    ? "bg-gradient-to-r from-light-teal to-light-teal/20" 
                    : "bg-gradient-to-l from-light-teal to-light-teal/20"
                )}
              >
                {/* Image on Left */}
                {isImageLeft && (
                  <motion.div
                    variants={slideInLeft}
                    className="w-full lg:w-1/2 relative order-1 lg:order-1"
                  >
                    <div className="relative w-full h-64 xs:h-72 sm:h-80 md:h-96 lg:h-100 xl:h-112 lg:shadow-2xl shadow-lg xl:rounded-40 md:rounded-3xl xs:rounded-2xl rounded-xl overflow-hidden">
                      <Image
                        src={card.image}
                        alt={card.alt}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Text Content */}
                <div
                  className={cn(
                    " w-full lg:w-1/2 flex flex-col xl:gap-6 lg:gap-4 gap-3 justify-center items-start",
                    isImageLeft ? "order-2 lg:order-2" : "order-2 lg:order-1"
                  )}
                >
                  <motion.div variants={fadeUp}>
                    <Title
                      variant="medium"
                      className="text-dark-black font-semibold text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-4xl text-start leading-tight"
                    >
                      {card.title}
                    </Title>
                  </motion.div>
                  <motion.div variants={fadeUp}>
                    <Text
                      variant="regular"
                      className="text-medium-black/80 text-start leading-relaxed text-sm xs:text-base"
                    >
                      {card.description}
                    </Text>
                  </motion.div>
                </div>

                {/* Image on Right */}
                {!isImageLeft && (
                  <motion.div
                    variants={slideInRight}
                    className="w-full lg:w-1/2 relative order-1 lg:order-2"
                  >
                    <div className="relative w-full h-64 xs:h-72 sm:h-80 md:h-96 lg:h-100 xl:h-112 lg:shadow-2xl shadow-lg xl:rounded-40 md:rounded-3xl xs:rounded-2xl rounded-xl overflow-hidden">
                      <Image
                        src={card.image}
                        alt={card.alt}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                        priority={card.id === 1}
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </Wrapper>
    </section>
  );
};

export default AdaptConversation;