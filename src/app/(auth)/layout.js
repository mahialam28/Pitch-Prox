"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logos/blue-logo.png";
import auth from "@/assets/images/auth/sign-in.png";
import signup from "@/assets/images/auth/sign-in.png";
import forgot from "@/assets/images/auth/sign-in.png";
import reset from "@/assets/images/auth/sign-in.png";
import image1 from "@/assets/images/home/image-1.jpg";
import image2 from "@/assets/images/home/image-2.jpg";
import image3 from "@/assets/images/home/image-3.jpg";
import Text from "@/components/texts/text";
import Title from "@/components/texts/title";
import Link from "next/link";

// Left content for each page (only tagline changes)
const LEFT_CONTENT = {
  "/sign-in": {
    tagline:
      "Access your PitchPro account to unlock personalized features and tools.",
  },
  "/sign-up": {
    tagline: "Join PitchPro and start your journey to success today.",
  },
  "/forgot-password": {
    tagline: "We'll help you get back into your account quickly.",
  },
  "/reset-password": {
    tagline: "Create a strong password to keep your account secure.",
  },
  "/accept-invite": {
    tagline: "Welcome to the PitchProX team. Let's get your account set up.",
  },
  "/activate": {
    tagline: "Your PitchProX account is ready. Set a password to get started.",
  },
};

// Right content for each page
const RIGHT_CONTENT = {
  "/sign-in": {
    title: "Welcome Back! Sign In to Continue",
    description:
      "Welcome back! We're excited to see you again. Please sign in to your account to pick up right where you left off, access all your tools and features, and continue your journey with us.",
    imageSrc: auth,
    imageAlt: "Sign In Dashboard Preview",
  },
  "/sign-up": {
    title: "Create Your Account & Get Started",
    description:
      "Join thousands of professionals who use PitchProX to accelerate their sales. Start your free trial today and transform your sales process with our powerful AI-driven tools.",
    imageSrc: signup,
    imageAlt: "Sign Up Dashboard Preview",
  },
  "/forgot-password": {
    title: "Forgot Your Password?",
    description:
      "Don't worry! Enter your email address and we'll send you a link to reset your password and get back to work in no time.",
    imageSrc: forgot,
    imageAlt: "Forgot Password Preview",
  },
  "/reset-password": {
    title: "Reset Your Password",
    description:
      "Please enter your new password below. Make sure it's strong and secure to keep your account safe.",
    imageSrc: reset,
    imageAlt: "Reset Password Preview",
  },
  "/activate": {
    title: "Activate Your Account",
    description: "Your PitchProX rep set up your account. Choose a password to sign in and start using live AI guidance.",
    imageSrc: auth,
    imageAlt: "PitchProX Preview",
  },
  "/accept-invite": {
    title: "Join PitchProX",
    description: "You've been invited to PitchProX. Activate your account to start your onboarding.",
    imageSrc: auth,
    imageAlt: "PitchProX Preview",
  },
};

// Default fallback
const DEFAULT_LEFT_CONTENT = {
  tagline:
    "Access your PitchPro account to unlock personalized features and tools.",
};
const DEFAULT_RIGHT_CONTENT = RIGHT_CONTENT["/sign-in"];

// Static branding (same for all pages)
const BRANDING = {
  logoText: "PitchProX",
  logoSrc: logo,
  logoWidth: 280,
  logoHeight: 60,
};

const AuthLayout = ({ children }) => {
  const pathname = usePathname();
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef(null);

  // Get content based on current path
  const leftContent = LEFT_CONTENT[pathname] || DEFAULT_LEFT_CONTENT;
  const rightPanel = RIGHT_CONTENT[pathname] || DEFAULT_RIGHT_CONTENT;

  // Create carousel slides with the 3 different images
  const slides = [
    {
      id: 0,
      imageSrc: image1,
      imageAlt: "Dashboard Preview 1",
    },
    {
      id: 1,
      imageSrc: image2,
      imageAlt: "Dashboard Preview 2",
    },
    {
      id: 2,
      imageSrc: image3,
      imageAlt: "Dashboard Preview 3",
    },
  ];

  // Auto-slide every 4 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [slides.length]);

  // Handle dot click - reset the interval
  const handleDotClick = (index) => {
    setCurrentSlide(index);
    
    // Reset the interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Start new interval
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
  };

  // Animation variants for right column
  const rightColumnVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1],
        delay: 0.2
      }
    }
  };

  // Text animation variants
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
        delay: 0.3
      }
    }
  };

  const descriptionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
        delay: 0.4
      }
    }
  };

  // Slide transition variants (right to left only)
  const slideVariants = {
    enter: {
      x: 300,
      opacity: 0,
      scale: 0.95
    },
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    exit: {
      x: -300,
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-white font-sans antialiased text-slate-800">
      {/* LEFT COLUMN - Dynamic based on route */}
      <div className="col-span-1 lg:col-span-5 flex flex-col items-center justify-center p-6 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            {BRANDING.logoSrc ? (
              <Link href="/" className="inline-block">
                <div className="flex justify-center mb-2">
                  <Image
                    src={BRANDING.logoSrc}
                    alt={BRANDING.logoText}
                    width={BRANDING.logoWidth}
                    height={BRANDING.logoHeight}
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
            ) : (
              <Link href="/" className="inline-block">
                <h1 className="text-2xl font-bold text-slate-900">
                  {BRANDING.logoText}
                </h1>
              </Link>
            )}
            <Text className="xl:w-[80%] mx-auto text-center text-medium-black font-medium">
              {leftContent.tagline}
            </Text>
          </div>

          {children}
        </div>
      </div>

      {/* RIGHT COLUMN - Dynamic based on route with initial animation */}
      <motion.div 
        variants={rightColumnVariants}
        initial="hidden"
        animate="visible"
        className="hidden lg:col-span-7 lg:flex p-6"
      >
        <div className="relative w-full h-full rounded-3xl bg-[#E0F4F4] overflow-hidden flex flex-col justify-between pt-20">
          <div className="max-w-xl mx-auto text-center space-y-4 px-12 z-10">
            {/* Title with animation */}
            <motion.div
              variants={textVariants}
              initial="hidden"
              animate="visible"
            >
              <Title className="text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                {rightPanel.title}
              </Title>
            </motion.div>

            {/* Description with animation */}
            <motion.div
              variants={descriptionVariants}
              initial="hidden"
              animate="visible"
            >
              <Text className="max-w-xl mx-auto text-base text-slate-600 leading-relaxed font-normal">
                {rightPanel.description}
              </Text>
            </motion.div>

            {/* Carousel Dots */}
            <div className="flex items-center justify-center gap-1.5 pt-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className="cursor-pointer transition-all duration-300 focus:outline-none"
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <span
                    className={`block h-2 rounded-full transition-all duration-300 ${
                      currentSlide === index
                        ? "w-8 bg-primary"
                        : "w-2 bg-primary/50"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full flex-1 mt-6 pl-24 min-h-80">
            <div className="relative w-full h-full overflow-hidden rounded-tl-3xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="relative w-full h-full"
                >
                  <Image
                    src={slides[currentSlide].imageSrc}
                    alt={slides[currentSlide].imageAlt}
                    fill
                    priority
                    className="object-cover object-top-left"
                    sizes="40vw"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;