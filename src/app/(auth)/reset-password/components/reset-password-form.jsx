"use client";

import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import Link from "next/link";
import { FiLock } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa6";
import { FaArrowLeft } from "react-icons/fa";
import AuthPassword from "@/components/forms/auth-password";
import ActionButton from "@/components/buttons/action-button";
import Text from "@/components/texts/text";

const ResetPasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = useWatch({ control, name: "password" });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      console.log("Reset Password Data submitted:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      setPasswordReset(true);
    } catch (error) {
      console.error("Reset Password Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (passwordReset) {
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
            Password Reset Successfully
          </Text>
          <Text variant="small" className="max-w-sm mx-auto mb-6">
            Your password has been reset successfully. 
            You can now sign in with your new password.
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
          <Text variant="smaller" className="max-w-sm mx-auto lg:hidden block">            {"Please enter your new password below. Make sure it's strong and secure to keep your account safe."}
          </Text>
        </div>

        {/* Password Field */}
        <AuthPassword
          icon={FiLock}
          name="password"
          register_as="password"
          placeholder="New Password"
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
          placeholder="Confirm New Password"
          register={register}
          errors={errors}
          validationRules={{
            required: "Please confirm your password",
            validate: (value) => 
              value === password || "Passwords do not match",
          }}
        />

        {/* Action Button with Loading State */}
        <ActionButton
          type="submit"
          loading={loading}
          text="Reset Password"
          loadingText="Resetting"
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

export default ResetPasswordForm;