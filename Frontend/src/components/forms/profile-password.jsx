import { cn } from "@/utils.js/cn";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ProfilePassword = ({
  icon: Icon,
  label = "",
  placeholder = "",
  name = "",
  defaultValue = "",
  value,
  onChange,
  error = "",
  className = "",
  readOnly = false,
  autoComplete = "on",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isControlled = value !== undefined && onChange !== undefined;

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
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
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-black pointer-events-none z-10">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          defaultValue={!isControlled ? defaultValue : undefined}
          value={isControlled ? value : undefined}
          onChange={isControlled ? onChange : undefined}
          readOnly={readOnly}
          autoComplete={autoComplete}
          className={cn(
            "w-full py-2.5 rounded-xl border border-light-gray text-dark-black text-sm",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "transition-all duration-200",
            Icon ? "pl-10 pr-12" : "px-4 pr-12",
            error && "border-red-300 focus:ring-red/20 focus:border-red-400",
            className
          )}
          {...props}
        />

        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-light-black hover:text-primary transition-colors duration-200 focus:outline-none cursor-pointer"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {showPassword ? (
            <FaEyeSlash className="w-4 h-4" />
          ) : (
            <FaEye className="w-4 h-4" />
          )}
        </button>
      </div>

      {error && (
        <p className="text-red text-xs font-medium tracking-wide pt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

export default ProfilePassword;
