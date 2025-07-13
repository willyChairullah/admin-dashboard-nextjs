import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  // label: string;
  name: string;
  errorMessage?: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  type,
  value,
  onChange,
  placeholder,
  // label,
  name,
  errorMessage,
  className = "",
  disabled,
  ...props
}) => {
  const hasError = errorMessage && errorMessage.length > 0;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* <label
        htmlFor={name}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label> */}
      <input
        id={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name={name}
        disabled={disabled}
        className={`
          w-full px-3 py-2 
          border rounded-lg 
          text-sm
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            hasError
              ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10"
              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
          }
          ${
            disabled
              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
              : "text-gray-900 dark:text-gray-100"
          }
          hover:border-gray-400 dark:hover:border-gray-500
          ${className}
        `}
        {...props}
      />
      {hasError && (
        <span className="text-xs text-red-500 dark:text-red-400 mt-1">
          {errorMessage}
        </span>
      )}
    </div>
  );
};

export default Input;
