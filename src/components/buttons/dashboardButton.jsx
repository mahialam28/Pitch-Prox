"use client";

import React from "react";
import { cn } from "@/utils.js/cn";

const DashboardButton = ({
  type = "button",
  onClick,
  disabled = false,
  children,
  className = "",
  variant = "primary",
  ...props
}) => {
  const variants = {
    primary:
      "bg-primary hover:bg-medium-teal text-white shadow-sm hover:shadow-md",
    danger:
      "border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 shadow-sm",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default DashboardButton;
