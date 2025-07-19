"use client";
import React, { useState, useRef, useEffect } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  errorMessage?: string;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "— Select an Option —",
  errorMessage,
  className = "",
}) => {
  const hasError = errorMessage && errorMessage.length > 0;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(
    options.find(option => option.value === value) || null
  );

  const selectRef = useRef<HTMLDivElement>(null);

  const handleOptionClick = (option: SelectOption) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) {
      onChange(option.value);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      selectRef.current &&
      !selectRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`} ref={selectRef}>
      <div
        className={`relative rounded-lg border ${
          hasError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
        }`}
      >
        <button
          onClick={toggleDropdown}
          className={`w-full p-2 text-left flex justify-between items-center rounded-lg focus:outline-none dark:text-gray-300 ${
            hasError ? "bg-red-50 dark:bg-red-900" : "bg-white dark:bg-gray-900"
          }`}
          type="button"
        >
          {selectedOption ? selectedOption.label : placeholder}
          <svg
            className={`w-4 h-4 ${
              hasError ? "text-red-500" : "text-gray-400"
            } dark:text-gray-300`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div
            className={`absolute z-10 mt-1 w-full rounded-md shadow-lg ${
              hasError ? "border-red-500" : ""
            } ${
              hasError
                ? "bg-red-50 dark:bg-red-900"
                : "bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-600"
            }`}
          >
            <ul className="max-h-60 overflow-y-auto focus:outline-none">
              {options.map(option => (
                <li
                  key={option.value}
                  onClick={() => handleOptionClick(option)}
                  className={`dark:text-gray-300 p-2 cursor-pointer transition duration-200 ease-in-out rounded-md 
                  ${
                    selectedOption && selectedOption.value === option.value
                      ? "bg-blue-500 text-white font-semibold"
                      : "hover:bg-blue-100 hover:text-black dark:hover:bg-blue-700 dark:hover:text-white"
                  }`}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          </div>
        )}
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
