"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaXTwitter, FaLinkedinIn, FaFacebookF, FaArrowRight, FaApple, FaGooglePlay } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import Wrapper from "@/components/wrappers/wrapper";
import whiteLogo from "@/assets/logos/white-logo.png";

const Footer = () => {
  const socials = [
    { id: 1, link: "#", name: "instagram", icon: <FaInstagram /> },
    { id: 2, link: "#", name: "facebook", icon: <FaFacebookF /> },
    { id: 3, link: "#", name: "linkedin", icon: <FaLinkedinIn /> },
  ];

  const commonText = "xs:text-2xl text-xl font-bold";

  return (
    <footer className="w-full text-white bg-dark-black">
      <Wrapper variant="bottomSmall" className="py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="container grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 sm:gap-20 gap-12">
          {/* First Column - Logo, Description, Socials */}
          <div className="w-full flex flex-col gap-4 justify-start items-start">
            <div className="w-[160px] h-14 -mt-3 overflow-hidden">
              <Image
                className="w-full h-full object-contain"
                src={whiteLogo}
                alt="PitchProX"
                width={160}
                height={56}
              />
            </div>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed">
              Helping sales professionals make better decisions, one conversation at a time.
            </p>
            <div className="w-full flex gap-3 justify-start items-center mt-2">
              {socials.map((social) => (
                <a
                  key={social.id}
                  href={social.link}
                  className="w-9 xs:w-11 h-9 xs:h-11 rounded-full flex justify-center items-center border border-white/20 text-white/60 hover:border-primary hover:text-primary hover:bg-white/5 transition-all duration-300"
                  aria-label={social.name}
                >
                  <span className="text-sm xs:text-base">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Second Column - Features + App Badges */}
          <div className="w-full flex flex-col gap-4 justify-start items-start">
            <h3 className={commonText}>Features</h3>
            <Link href="/" className="text-white/60 hover:text-primary transition-colors duration-300 text-sm sm:text-base">
              Home
            </Link>
            <Link href="#pricing" className="text-white/60 hover:text-primary transition-colors duration-300 text-sm sm:text-base">
              Pricing
            </Link>

            {/* App Store Buttons */}
            <div className="flex flex-wrap gap-2.5 mt-2">
              <a
                href="#"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/20 hover:border-primary transition-colors duration-300 bg-black/40"
              >
                <FaApple className="text-xl text-white" />
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[9px] uppercase tracking-wider text-white/70">Available on the</span>
                  <span className="text-xs font-semibold text-white">App Store</span>
                </div>
              </a>

              <a
                href="#"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/20 hover:border-primary transition-colors duration-300 bg-black/40"
              >
                <FaGooglePlay className="text-lg text-white" />
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[9px] uppercase tracking-wider text-white/70">GET IT ON</span>
                  <span className="text-xs font-semibold text-white">Google Play</span>
                </div>
              </a>
            </div>
          </div>

          {/* Third Column - Resources */}
          <div className="w-full flex flex-col gap-4 justify-start items-start">
            <h3 className={commonText}>Resources</h3>
            <Link href="/" className="text-white/60 hover:text-primary transition-colors duration-300 text-sm sm:text-base">
              Customer Support
            </Link>
            <Link href="/" className="text-white/60 hover:text-primary transition-colors duration-300 text-sm sm:text-base">
              Talk to Sales
            </Link>
            <Link href="#how-it-works" className="text-white/60 hover:text-primary transition-colors duration-300 text-sm sm:text-base">
              See How It Works
            </Link>
            <Link href="/sign-up" className="text-white/60 hover:text-primary transition-colors duration-300 text-sm sm:text-base">
              Sign Up for Free
            </Link>
          </div>

          {/* Fourth Column - Resources (Company) + Email Input */}
          <div className="w-full flex flex-col gap-4 justify-start items-start">
            <h3 className={commonText}>Resources</h3>
            <Link href="/" className="text-white/60 hover:text-primary transition-colors duration-300 text-sm sm:text-base">
              Contact
            </Link>
            <Link href="/" className="text-white/60 hover:text-primary transition-colors duration-300 text-sm sm:text-base">
              Terms of Service
            </Link>
            <Link href="/" className="text-white/60 hover:text-primary transition-colors duration-300 text-sm sm:text-base">
              Privacy Policy
            </Link>
            <form className="relative w-full mt-5 p-1.5 rounded-[40px] bg-white flex gap-3 justify-between items-center">
              <input
                required
                className="border-none w-full text-dark-black pl-3 text-sm outline-none bg-transparent placeholder:text-gray-400"
                type="email"
                name="email"
                id="email"
                placeholder="Enter Your Email"
              />
              <button
                type="submit"
                className="w-[34px] shrink-0 text-sm flex justify-center items-center h-[34px] rounded-full bg-[#18b5b5] text-white hover:opacity-90 transition-opacity duration-300"
                aria-label="Subscribe"
              >
                <FaArrowRight />
              </button>
            </form>
          </div>
        </div>
      </Wrapper>
    </footer>
  );
};

export default Footer;