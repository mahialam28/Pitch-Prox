"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { FiMail } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa6";
import { FaArrowLeft } from "react-icons/fa";
import AuthInput from "@/components/forms/auth-input";
import ActionButton from "@/components/buttons/action-button";
import Text from "@/components/texts/text";

const ForgotPasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const [error, setError] = useState("");

  // Same answer whether or not the address has an account
  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/v1/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.email }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't send the link. Please try again.");
      setEmailSent(true);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (emailSent) {
    return (
      <div className="w-full mx-auto bg-white rounded-3xl">
        <div className="text-center py-4">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-light-teal/50 flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-primary" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          
          <Text className="text-xl font-bold text-dark-teal mb-2">
            Check Your Email
          </Text>
          <Text variant="small" className="max-w-sm mx-auto mb-6">
            If an account uses this email, we&apos;ve sent it a password reset link.
            It expires in 1 hour. Check your inbox (and spam folder).
          </Text>
          
          <Link
            href="/sign-in"
            className="inline-flex items-center space-x-2 text-primary font-medium hover:underline transition-all"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto bg-white rounded-3xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        {/* Info Text */}
        <div className="text-center">
          <Text variant="smaller" className="max-w-sm mx-auto lg:hidden block">
            Enter the email address associated with your account and we&apos;ll 
            send you a link to reset your password.
          </Text>
        </div>

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

        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Action Button with Loading State */}
        <ActionButton
          type="submit"
          loading={loading}
          text="Send Reset Link"
          loadingText="Sending"
          icon={FaArrowRight}
          iconPosition="right"
          variant="primary"
          size="default"
        />
      </form>

      {/* Back to Sign In Link */}
      <div className="text-center mt-3 text-sm font-medium text-slate-700">
        <Link 
          href="/sign-in" 
          className="inline-flex items-center space-x-2 text-primary hover:underline transition-all"
        >
          <FaArrowLeft className="w-3 h-3" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;