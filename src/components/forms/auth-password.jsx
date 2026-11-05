import { cn } from "@/utils.js/cn";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const AuthPassword = ({
  label = "",
  name = "",
  placeholder = "",
  errors = {},
  register_as = "",
  register,
  className = "",
  readOnly = false,
  autoComplete = "on",
  validationRules = {},
  icon: Icon, // Add icon prop
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const inputProps = register ? register(name, validationRules) : {};
  const errorMessage = errors[register_as]?.message;

  // Adjust padding if icon is present
  const iconPadding = Icon ? "pl-12" : "pl-5";
  const baseClass = 
    `w-full lg:py-4 py-3 ${iconPadding} pr-12 rounded-full text-base transition-all duration-200 outline-none focus:shadow-sm bg-light-gray text-medium-black placeholder:text-light-black border border-transparent focus:bg-white focus:border-primary`;

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
        {/* External Icon */}
        {Icon && (
          <div className="absolute lg:left-5 left-6 top-1/2 -translate-y-1/2 text-medium-black pointer-events-none z-10">
            <Icon className="lg:w-5 lg:h-5 w-4 h-4" />
          </div>
        )}

        <input
          id={register_as}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          readOnly={readOnly}
          autoComplete={autoComplete}
          className={cn(
            baseClass,
            errorMessage && "border-red/20 focus:border-red/40 bg-light-gray",
            className
          )}
          {...inputProps}
          {...props}
        />

        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-light-black hover:text-primary transition-colors duration-200 focus:outline-none cursor-pointer"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {showPassword ? (
            <FaEyeSlash className="lg:w-5 lg:h-5 w-4 h-4" />
          ) : (
            <FaEye className="lg:w-5 lg:h-5 w-4 h-4" />
          )}
        </button>
      </div>

      {errorMessage && (
        <p className="text-red text-xs font-medium tracking-wide pl-5 pt-0.5">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default AuthPassword;