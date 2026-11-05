"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { FaArrowRight } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logos/blue-logo.png";
import light_logo from "@/assets/logos/white-logo.png";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position for professional fixed-header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Pricing", href: "#pricing" },
    { name: "How It Works", href: "#how-it-works" },
  ];  // Smooth scroll handler for hash links with header offset
  const handleNavClick = useCallback((e, href) => {
    // Only intercept hash links (#)
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        // Account for fixed header height (~100px on lg screens)
        // On mobile (< lg) the header is not fixed, so no offset needed
        const headerOffset = window.innerWidth >= 1024 ? 100 : 20;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - headerOffset,
          behavior: "smooth",
        });
      }
    }
  }, []);

  // Mobile Menu Circle Reveal Variants
  const menuVariants = {
    closed: {
      clipPath: "circle(0px at calc(100% - 32px) 32px)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.05,
        staggerDirection: -1,
        when: "afterChildren",
      },
    },
    open: {
      clipPath: "circle(150% at calc(100% - 32px) 32px)",
      transition: {
        type: "spring",
        stiffness: 80,
        restDelta: 2,
        delayChildren: 0.1,
        staggerChildren: 0.1,
      },
    },
  };

  // Staggered item entry for mobile menu links
  const itemVariants = {
    closed: { opacity: 0, y: 15, transition: { duration: 0.2 } },
    open: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <header
      className={`w-full py-4 md:py-6 lg:py-4 max-w-380 mx-auto px-5
        fixed top-0 left-0 right-0 z-100
        transition-all duration-500 ease-in-out
        ${scrolled ? "py-3 lg:py-3" : "py-4 lg:py-5"}`}
    >
      {/* Main Outer Pill Wrapper */}
      <div
        className={`relative w-full rounded-full px-5 py-0.5 md:px-5 md:py-2 flex items-center justify-between border shadow-sm
          transition-all duration-500 ease-in-out
          ${isOpen
            ? "bg-light-gray"
            : scrolled
              ? "bg-white/90 backdrop-blur-xl border-white/20 shadow-lg lg:shadow-xl"
              : "bg-light-gray/80 backdrop-blur-md border-light-gray shadow-sm"
          }`}
      >
        
        {/* Brand Logo Container */}
        <Link href="/" className="flex items-center space-x-2 group z-50 pl-2">
          <div className="relative transition-all duration-300">
            <Image
              src={isOpen ? light_logo : logo}
              alt="PitchProX"
              width={180}
              height={100}
              className={`object-contain transition-all duration-500 group-hover:scale-105 w-auto ${
                isOpen 
                  ? "h-14 md:h-16 lg:h-18 scale-110 origin-left" // Bigger sizing when mobile menu is open
                  : "h-10 md:h-12 lg:h-14" // Default original size
              }`}
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center bg-white rounded-full p-1 border border-slate-100 shadow-sm z-40">
          {navLinks.map((link) => {
            const isActive = activeTab === link.name;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  setActiveTab(link.name);
                  handleNavClick(e, link.href);
                }}
                className={`relative px-6 py-2.5 rounded-full text-sm font-semibold transition-colors duration-300 ${
                  isActive ? "text-white" : "text-slate-700 hover:text-primary"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-primary rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA Button */}
        <div className="hidden md:block pr-1 z-40">
          <Link
            href="/sign-in"
            className="group inline-flex items-center justify-center space-x-2 bg-primary hover:bg-medium-teal text-white py-3 px-6 rounded-full font-semibold text-sm shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer"
          >
            <span>Log In</span>
            <FaArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Mobile / Tablet Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`md:hidden p-2 transition-all duration-300 focus:outline-none z-50 relative ${
            isOpen ? "text-white scale-110" : "text-slate-800 hover:text-primary"
          }`}
          aria-label="Toggle Menu"
        >
          {isOpen ? <HiX className="w-7 h-7" /> : <HiMenuAlt3 className="w-7 h-7" />}
        </button>

        {/* Mobile Navigation Dropdown Menu Container */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="absolute top-0 right-0 left-0 w-full h-[60vh] bg-dark-teal text-white rounded-3xl p-8 pt-20 shadow-2xl flex flex-col justify-between md:hidden z-30"
            >
              {/* Mobile Links */}
              <div className="flex flex-col space-y-2 mt-2">
                {navLinks.map((link) => {
                  const isActive = activeTab === link.name;
                  return (
                    <motion.div key={link.name} variants={itemVariants}>
                      <Link
                        href={link.href}
                        onClick={(e) => {
                          setActiveTab(link.name);
                          setIsOpen(false);
                          handleNavClick(e, link.href);
                        }}
                        className={`block w-full py-3 px-6 rounded-2xl text-lg font-semibold text-center transition-all ${
                          isActive
                            ? "bg-white text-dark-teal shadow-lg"
                            : "text-white/80 hover:bg-white/10"
                        }`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom Mobile Action Part */}
              <motion.div variants={itemVariants} className="w-full pb-1">
                <hr className="border-white/20 my-4" />
                <Link
                  href="/sign-in"
                  onClick={() => setIsOpen(false)}
                  className="w-full inline-flex items-center justify-center space-x-2 bg-white text-dark-teal hover:bg-slate-100 py-3.5 px-6 rounded-2xl font-semibold text-base shadow-md transition-all duration-200 cursor-pointer"
                >
                  <span>Log In</span>
                  <FaArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;