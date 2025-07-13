import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label: string;
  placeholder?: string;
  errorMessage?: string;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  //   label,
  placeholder = "— Select an Option —",
  errorMessage,
  className = "",
  disabled,
  name,
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
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full px-3 py-2 pr-10
            border rounded-lg 
            text-sm
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            appearance-none
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
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {hasError && (
        <span className="text-xs text-red-500 dark:text-red-400 mt-1">
          {errorMessage}
        </span>
      )}
    </div>
  );
};

export default Select;
