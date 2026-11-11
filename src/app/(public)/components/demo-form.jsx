"use client";

import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa6";
import ActionButton from "@/components/buttons/action-button";
import { useEmail } from "./email-context";

const DemoForm = () => {
  const { email, setEmail } = useEmail();
  const [loading, setLoading] = useState(false);

  const scrollToHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    if (element) {
      const headerOffset = window.innerWidth >= 1024 ? 100 : 20;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - headerOffset,
        behavior: "smooth",
      });
    }
  };

  // The email carries over to the "See how it works" form below
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    scrollToHowItWorks();
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col xs:flex-row items-center justify-center gap-3 xs:gap-4 mt-6 sm:mt-8 md:mt-10 px-2 sm:px-0"
    >
      <input
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        disabled={loading}
        className="hero-input w-full xs:w-64 sm:w-72 md:w-96 bg-dark-black/30 backdrop-blur-sm border border-medium-black/40 rounded-full px-6 py-3 sm:py-3.5 md:py-4 text-sm text-white placeholder:text-light-black outline-none focus:border-primary/60 transition-all duration-300 font-primary disabled:opacity-50 disabled:cursor-not-allowed lg:text-left text-center"
      />
      
      <ActionButton
        type="submit"
        loading={loading}
        text="See How It Works"
        loadingText="Connecting"
        icon={FaArrowRight}
        iconPosition="right"
        variant="primary"
        size="default"
        className="w-full xs:w-auto px-6 sm:px-8"
      />
    </form>
  );
};

export default DemoForm;