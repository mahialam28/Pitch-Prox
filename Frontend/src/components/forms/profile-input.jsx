import { cn } from "@/utils.js/cn";
import React from "react";

const ProfileInput = ({
  icon: Icon,
  label = "",
  type = "text",
  placeholder = "",
  name = "",
  defaultValue = "",
  value,
  onChange,
  error = "",
  className = "",
  readOnly = false,
  autoComplete = "on",
  textarea = false,
  rows = 3,
  maxLength,
  ...props
}) => {
  const isControlled = value !== undefined && onChange !== undefined;

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const form = e.target.form;
      if (form) {
        const index = Array.prototype.indexOf.call(form, e.target);
        if (form.elements[index + 1]) {
          form.elements[index + 1].focus();
        }
      }
    }
  };

  return (
    <div className="flex flex-col space-y-1.5 w-full text-left">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-medium-black"
        >
          {label}
        </label>
      )}

      <div className="relative w-full">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-black pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}

        {textarea ? (
          <textarea
            id={name}
            name={name}
            placeholder={placeholder}
            value={isControlled ? value : undefined}
            defaultValue={!isControlled ? defaultValue : undefined}
            onChange={isControlled ? onChange : undefined}
            readOnly={readOnly}
            rows={rows}
            maxLength={maxLength}
            className={cn(
              "w-full px-4 py-2.5 rounded-xl border border-light-gray text-dark-black text-sm placeholder:text-light-black bg-white",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "transition-all duration-200 resize-none",
              Icon && "pl-10",
              error && "border-red-300 focus:ring-red/20 focus:border-red-400",
              className
            )}
            {...props}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            defaultValue={!isControlled ? defaultValue : undefined}
            value={isControlled ? value : undefined}
            onChange={isControlled ? onChange : undefined}
            readOnly={readOnly}
            autoComplete={autoComplete}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full px-4 py-2.5 rounded-xl border border-light-gray text-dark-black text-sm placeholder:text-light-black",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "transition-all duration-200",
              Icon && "pl-10",
              error && "border-red-300 focus:ring-red/20 focus:border-red-400",
              className
            )}
            {...props}
          />
        )}
      </div>

      {error && (
        <p className="text-red text-xs font-medium tracking-wide pt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

export default ProfileInput;
