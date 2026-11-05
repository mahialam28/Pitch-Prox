"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import Wrapper from "@/components/wrappers/wrapper";
import banner from "@/assets/images/home/conversation.png";

const Conversation = () => {
  return (
    <section className="w-screen ml-[calc(-50vw+50%)] px-5 select-none">
      {/* Main Card Container */}
      <Wrapper variant="bottomSmall" className="py-12 sm:py-16 md:py-20 lg:py-24 w-full flex flex-col items-center overflow-hidden">
        
        {/* 1. Header Text Container */}
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center px-2 sm:px-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Title
              variant="large"
              className="text-dark-black max-w-5xl font-extrabold tracking-tight text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-[56px] xl:text-[56px]"
            >
              The Intelligence Behind Every Conversation.
            </Title>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-4 sm:mt-6 max-w-3xl"
          >
            <Text
              variant="large"
              className="text-medium-black leading-relaxed font-light text-sm xs:text-base sm:text-lg md:text-xl xl:text-xl"
            >
              Live guidance, call analytics, and actionable insights—all working together in real time.
            </Text>
          </motion.div>
        </div>

        {/* 2. Dashboard Image with Edge Fade Effect */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative mt-10 sm:mt-12 w-full px-3 sm:px-6 md:px-10"
        >
          {/* Left Edge Opacity Fade */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 md:w-32 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent" />
          {/* Right Edge Opacity Fade */}
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 md:w-32 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent" />
          
          <Image
            src={banner}
            alt="Dashboard Preview"
            className="w-full h-auto"
            priority
          />
        </motion.div>

      </Wrapper>
    </section>
  );
};

export default Conversation;