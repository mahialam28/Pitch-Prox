"use client";

import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import Link from "next/link";
import { FiMail, FiLock, FiUser } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { FaRegCircle, FaCheckCircle } from "react-icons/fa";
import AuthInput from "@/components/forms/auth-input";
import AuthPassword from "@/components/forms/auth-password";
import ActionButton from "@/components/buttons/action-button";
import { useRouter } from "next/navigation";
import { showError, showSuccess } from "@/lib/alerts";
import { dashboardPathFor } from "@/utils.js/roles";

const SignUpForm = () => {
  const router = useRouter();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = useWatch({ control, name: "password" });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (!agreeTerms) throw new Error("Please accept the Terms & Conditions.");
      const response = await fetch("/api/v1/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to create account.");
      await showSuccess("Account created", "Your customer workspace is ready.");
      router.push(dashboardPathFor(result.user?.role) || "/user/dashboard");
      router.refresh();
    } catch (error) {
      setError("root", { message: error.message });
      showError("Account not created", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto bg-white rounded-3xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}
        
        {/* Name Field */}
        <AuthInput
          icon={FiUser}
          name="name"
          register_as="name"
          placeholder="Full Name"
          type="text"
          register={register}
          errors={errors}
          validationRules={{
            required: "Full name is required",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters",
            },
          }}
        />

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
        <AuthPassword
          icon={FiLock}
          name="password"
          register_as="password"
          placeholder="Password"
          register={register}
          errors={errors}
          validationRules={{
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          }}
        />

        {/* Confirm Password Field */}
        <AuthPassword
          icon={FiLock}
          name="confirmPassword"
          register_as="confirmPassword"
          placeholder="Confirm Password"
          register={register}
          errors={errors}
          validationRules={{
            required: "Please confirm your password",
            validate: (value) => 
              value === password || "Passwords do not match",
          }}
        />

        {/* Terms & Conditions */}
        <div className="flex items-center px-2 text-sm select-none">
          <label className="flex items-center space-x-2 cursor-pointer text-slate-700 group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="sr-only peer"
              />
              <FaRegCircle className={`w-5 h-5 transition-all duration-200 ${
                agreeTerms 
                  ? "text-primary opacity-0" 
                  : "text-light-black group-hover:text-primary"
              }`} />
              <FaCheckCircle className={`absolute w-5 h-5 transition-all duration-200 ${
                agreeTerms 
                  ? "text-primary scale-100" 
                  : "text-primary scale-0"
              }`} />
            </div>
            <span className={`font-medium transition-colors duration-200 ${
              agreeTerms ? "text-primary" : "text-light-black group-hover:text-primary"
            }`}>
              I agree to the Terms & Conditions
            </span>
          </label>
        </div>

        {/* Action Button with Loading State */}
        <ActionButton
          type="submit"
          loading={loading}
          text="Create Account"
          loadingText="Creating account"
          icon={FaArrowRight}
          iconPosition="right"
          variant="primary"
          size="default"
        />
      </form>

      {/* Redirect Link */}
      <div className="text-center mt-3 text-sm font-medium text-slate-700">
        Already Have An Account?{" "}
        <Link href="/sign-in" className="text-primary hover:underline transition-all">
          Sign In
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

export default SignUpForm;
