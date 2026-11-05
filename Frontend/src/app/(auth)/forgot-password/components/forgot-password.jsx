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

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      console.log("Forgot Password Data submitted:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      setEmailSent(true);
    } catch (error) {
      console.error("Forgot Password Error:", error);
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
            We&apos;ve sent a password reset link to your email address. 
            Please check your inbox and follow the instructions.
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