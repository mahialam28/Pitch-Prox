import React from "react";
import { FaArrowRight } from "react-icons/fa6";
import { FaSpinner } from "react-icons/fa";
import { cn } from "@/utils.js/cn";

const ActionButton = ({
  type = "submit",
  loading = false,
  text = "Continue",
  loadingText = "Please wait...",
  icon: Icon = FaArrowRight,
  iconPosition = "right",
  className = "",
  onClick,
  disabled = false,
  variant = "primary",
  size = "default",
  ...props
}) => {
  const variants = {
    primary: "bg-primary hover:bg-medium-teal text-white",
    secondary: "bg-light-teal hover:bg-light-teal/80 text-dark-black",
    outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/10",
    ghost: "bg-transparent hover:bg-light-gray text-medium-black",
  };

  const sizes = {
    small: "py-2 px-4 text-sm rounded-full",
    default: "py-3 xl:py-4 px-6 lg:text-base text-sm rounded-full",
    large: "py-4 xl:py-5 px-8 text-lg rounded-full",
  };

  const baseClass = `
    relative overflow-hidden w-full font-semibold flex items-center justify-center 
    transition-all duration-300 ease-out shadow-sm hover:shadow-md 
    hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] cursor-pointer 
    disabled:opacity-90 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:translate-y-0
    ${variants[variant]} 
    ${sizes[size]}
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(baseClass, className)}
      {...props}
    >
      {/* Modern Shimmer Highlight Overlay */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite] pointer-events-none transition-transform duration-1000 group-hover:translate-x-full" 
            style={{ transform: 'skewX(-20deg)' }} 
      />

      {loading ? (
        <>
          {iconPosition === "left" && (
            <FaSpinner className="w-4 h-4 animate-spin mr-2" />
          )}
          <span className="relative z-10">{loadingText}</span>
          {iconPosition === "right" && (
            <FaSpinner className="w-4 h-4 animate-spin ml-2" />
          )}
        </>
      ) : (
        <>
          {iconPosition === "left" && Icon && (
            <Icon className="w-4 h-4 mr-2 transition-transform duration-300 relative z-10" />
          )}
          <span className="relative z-10 tracking-wide">{text}</span>
          {iconPosition === "right" && Icon && (
            <Icon className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1 relative z-10" />
          )}
        </>
      )}
    </button>
  );
};

export default ActionButton;