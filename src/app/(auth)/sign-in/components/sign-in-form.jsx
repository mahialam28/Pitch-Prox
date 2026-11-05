"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMail, FiLock } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { FaRegCircle, FaCheckCircle } from "react-icons/fa";
import AuthInput from "@/components/forms/auth-input";
import AuthPassword from "@/components/forms/auth-password";
import ActionButton from "@/components/buttons/action-button";
import { showError, showSuccess } from "@/lib/alerts";
import { dashboardPathFor } from "@/utils.js/roles";

const SignInForm = () => {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to sign in.");
      await showSuccess("Welcome back", "You have signed in successfully.");
      // Employees still onboarding go to the onboarding flow first
      const onboarding = ["invited", "onboarding"].includes(result.user?.staffStatus);
      router.push(onboarding ? "/onboarding" : dashboardPathFor(result.user?.role) || "/user/dashboard");
      router.refresh();
    } catch (error) {
      setError("root", { message: error.message });
      showError("Sign in failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto bg-white rounded-3xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}
        {/* Email Field */}
        <AuthInput
          icon={FiMail}
          name="email"
          register_as="email"
          placeholder="Email"
          type="email"
          register={register}
          errors={errors}
          validationRules={{
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          }}
        />

        {/* Password Field */}
        <div className="relative w-full">
          <AuthPassword
            name="password"
            icon={FiLock}
            register_as="password"
            placeholder="Password"
            register={register}
            errors={errors}
            className="pl-12"
            validationRules={{
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            }}
          />
        </div>

        {/* Options Row: Remember Me & Forgot Password */}
        <div className="flex items-center justify-between px-2 text-sm select-none">
          <label className="flex items-center space-x-2 cursor-pointer text-slate-700 group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only peer"
              />
              <FaRegCircle
                className={`w-5 h-5 transition-all duration-200 ${
                  rememberMe
                    ? "text-primary opacity-0"
                    : "text-light-black group-hover:text-primary"
                }`}
              />
              <FaCheckCircle
                className={`absolute w-5 h-5 transition-all duration-200 ${
                  rememberMe ? "text-primary scale-100" : "text-primary scale-0"
                }`}
              />
            </div>
            <span
              className={`font-medium transition-colors duration-200 ${
                rememberMe
                  ? "text-primary"
                  : "text-light-black group-hover:text-primary"
              }`}
            >
              Remember Me
            </span>
          </label>

          <Link
            href="/forgot-password"
            className="text-primary font-medium hover:underline transition-all"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Action Button with Loading State */}
        <ActionButton
          type="submit"
          loading={loading}
          text="Sign In"
          loadingText="Signing in"
          icon={FaArrowRight}
          iconPosition="right"
          variant="primary"
          size="default"
        />
      </form>

      {/* Redirect Link */}
      <div className="text-center mt-3 text-sm font-medium text-slate-700">
        Don&apos;t Have An Account?{" "}
        <Link
          href="/sign-up"
          className="text-primary hover:underline transition-all"
        >
          Sign Up
        </Link>
      </div>

      {/* Social Dividers / Providers */}
      <div className="grid 2xl:grid-cols-2 grid-cols-1 gap-4 mt-8">
        <button
          type="button"
          onClick={() => console.log("Google Auth")}
          className="flex items-center justify-center space-x-2 py-3.5 px-4 rounded-full bg-light-teal/50 hover:bg-light-teal transition-colors duration-200 text-sm font-semibold text-dark-black cursor-pointer"
        >
          <FcGoogle className="w-5 h-5" />
          <span>Sign up with Google</span>
        </button>

        <button
          type="button"
          onClick={() => console.log("Facebook Auth")}
          className="flex items-center justify-center space-x-2 py-3.5 px-4 rounded-full bg-light-teal/50 hover:bg-light-teal transition-colors duration-200 text-sm font-semibold text-dark-black cursor-pointer"
        >
          <FaFacebook className="w-5 h-5 text-[#1877F2]" />
          <span>Sign up with Facebook</span>
        </button>
      </div>
    </div>
  );
};

export default SignInForm;
