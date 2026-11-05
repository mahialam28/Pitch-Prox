"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import Wrapper from "@/components/wrappers/wrapper";
import { cn } from "@/utils.js/cn";

const Demo = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.6,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.5,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
        duration: 0.2,
      },
    },
    tap: {
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 600,
        damping: 30,
        duration: 0.1,
      },
    },
  };

  return (
    <section id="demo" className="mx-auto px-5 select-none">
      <Wrapper variant="" className="pt-6 sm:pt-8 md:pt-10 pb-12 sm:pb-16 md:pb-20">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 25,
            duration: 0.8,
          }}
          style={{
            opacity: 0,
            transform: "scale(0.95)",
            background:
              "linear-gradient(180deg, rgba(109, 222, 191, 0.12) 0%, rgba(14, 173, 171, 0.12) 100%)",
          }}
          className="w-full xl:rounded-[60px] md:rounded-3xl xs:rounded-2xl rounded-xl xl:py-20 lg:py-16 md:py-14 sm:py-12 xs:py-10 py-8 xl:px-20 lg:px-16 md:px-12 sm:px-8 px-6"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="w-full max-w-6xl mx-auto flex flex-col justify-start items-center"
          >
            {/* Title */}
            <motion.div variants={itemVariants} className="w-full text-center">
              <Title variant="large" className="text-dark-black">
                Every Dial Backed By A Pro. Because the difference between a
                lead and a client is often one sentence.
              </Title>
            </motion.div>

            {/* Subtext */}
            <motion.div variants={itemVariants} className="w-full">
              <Text
                variant="regular"
                className="text-medium-black text-center mt-3 sm:mt-4 max-w-5xl mx-auto"
              >
                PitchProx Delivers Live AI Teleporting, strategic Responses, And
                Objection Guidance While The Conversation is Still Happening.
              </Text>
            </motion.div>

            {/* Buttons */}
            <motion.div
              variants={itemVariants}
              className="w-full mt-6 sm:mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-5 max-w-lg mx-auto"
            >
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="w-full sm:w-auto"
              >
                <Link
                  href="/sign-up"
                  className={cn(
                    "w-full sm:w-auto px-6 md:px-8 lg:px-10 text-sm md:text-base font-medium capitalize",
                    "bg-transparent text-primary border border-primary",
                    "min-h-12 sm:min-h-14 md:min-h-16 py-2 md:py-2.5 rounded-full",
                    "flex items-center justify-center",
                    "hover:bg-primary hover:text-white transition-all duration-300",
                    "shadow-sm hover:shadow-md",
                  )}
                >
                  Sign Up For Free
                </Link>
              </motion.div>

              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="w-full sm:w-auto"
              >
                <Link
                  href="#how-it-works"
                  className={cn(
                    "w-full sm:w-auto px-6 md:px-8 lg:px-10 text-sm md:text-base font-medium capitalize",
                    "bg-primary text-white border border-primary",
                    "min-h-12 sm:min-h-14 md:min-h-16 py-2 md:py-2.5 rounded-full",
                    "flex items-center justify-center",
                    "hover:bg-primary/90 transition-all duration-300",
                    "shadow-sm hover:shadow-md hover:shadow-primary/20",
                  )}
                >
                  See How It Works
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </Wrapper>
    </section>
  );
};

export default Demo;
