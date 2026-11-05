import { cn } from "@/utils.js/cn";
import React from "react";

const AuthInput = ({
  icon: Icon,
  label = "",
  type = "text",
  placeholder = "",
  name = "",
  errors = {},
  register_as = "",
  register,
  className = "",
  readOnly = false,
  autoComplete = "on",
  validationRules = {},
  ...props
}) => {
  const inputProps = register ? register(name, validationRules) : {};
  const errorMessage = errors[register_as]?.message;

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const form = e.target.form;
      const index = Array.prototype.indexOf.call(form, e.target);
      if (form && form.elements[index + 1]) {
        form.elements[index + 1].focus();
      }
    }
  };

  const baseClass = 
    "w-full lg:py-4 py-3 pl-12 pr-5 rounded-full text-base transition-all duration-200 outline-none focus:shadow-sm bg-light-gray text-medium-black placeholder:text-light-black border border-transparent focus:bg-white focus:border-primary";

  return (
    <div className="flex flex-col space-y-1.5 w-full text-left">
      {label && (
        <label 
          htmlFor={register_as} 
          className="text-sm font-medium text-medium-black pl-4"
        >
          {label}
        </label>
      )}

      <div className="relative w-full flex items-center">
        {Icon && (
          <div className="absolute lg:left-5 left-6 text-medium-black pointer-events-none transition-colors">
            <Icon className="lg:w-5 lg:h-5 w-4 h-4" strokeWidth={2} />
          </div>
        )}

        <input
          id={register_as}
          name={name}
          type={type}
          placeholder={placeholder}
          readOnly={readOnly}
          onKeyDown={handleKeyDown}
          className={cn(
            baseClass,
            errorMessage && "border-red/20 focus:border-red/40 bg-light-gray",
            className
          )}
          autoComplete={autoComplete}
          {...inputProps}
          {...props}
        />
      </div>

      {errorMessage && (
        <p className="text-red text-xs font-medium tracking-wide pl-5 pt-0.5">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default AuthInput;