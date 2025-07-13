"use client";

import React, { useState } from "react";
import { Button, Input, Select, Badge } from "@/components/ui";

const ComponentDemo = () => {
  const [inputValue, setInputValue] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState("");

  const selectOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  const handleButtonClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Button clicked!");
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Demo validation
    if (value.length > 0 && value.length < 3) {
      setInputError("Input must be at least 3 characters long");
    } else {
      setInputError("");
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectValue(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Component Demo - Category 1 (Atoms)
        </h1>

        {/* Button Demo */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Button Component
          </h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Variants
                </h3>
                <div className="space-y-2">
                  <Button variant="primary" onClick={handleButtonClick}>
                    Primary Button
                  </Button>
                  <Button variant="secondary" onClick={handleButtonClick}>
                    Secondary Button
                  </Button>
                  <Button variant="danger" onClick={handleButtonClick}>
                    Danger Button
                  </Button>
                  <Button variant="outline" onClick={handleButtonClick}>
                    Outline Button
                  </Button>
                  <Button variant="ghost" onClick={handleButtonClick}>
                    Ghost Button
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Sizes
                </h3>
                <div className="space-y-2">
                  <Button size="small" onClick={handleButtonClick}>
                    Small Button
                  </Button>
                  <Button size="medium" onClick={handleButtonClick}>
                    Medium Button
                  </Button>
                  <Button size="large" onClick={handleButtonClick}>
                    Large Button
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  States
                </h3>
                <div className="space-y-2">
                  <Button disabled onClick={handleButtonClick}>
                    Disabled Button
                  </Button>
                  <Button isLoading={isLoading} onClick={handleButtonClick}>
                    {isLoading ? "Loading..." : "Click to Load"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Demo */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Input Component
          </h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={inputValue}
                  onChange={handleInputChange}
                  errorMessage={inputError}
                />
              </div>
              <div>
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <Input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                />
              </div>
              <div>
                <Input
                  type="text"
                  name="disabled"
                  placeholder="This input is disabled"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>

        {/* Select Demo */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Select Component
          </h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Select
                  options={selectOptions}
                  label="Choose an Option"
                  name="option"
                  placeholder="— Select an Option —"
                  value={selectValue}
                  onChange={handleSelectChange}
                />
              </div>
              <div>
                <Select
                  options={selectOptions}
                  label="Disabled Select"
                  name="disabledOption"
                  placeholder="— This is disabled —"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>

        {/* Badge Demo */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Badge Component
          </h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Color Schemes
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge colorScheme="green">Success</Badge>
                  <Badge colorScheme="red">Error</Badge>
                  <Badge colorScheme="yellow">Warning</Badge>
                  <Badge colorScheme="blue">Info</Badge>
                  <Badge colorScheme="gray">Default</Badge>
                  <Badge colorScheme="purple">Purple</Badge>
                  <Badge colorScheme="indigo">Indigo</Badge>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Sizes
                </h3>
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge colorScheme="blue" size="sm">
                    Small
                  </Badge>
                  <Badge colorScheme="blue" size="md">
                    Medium
                  </Badge>
                  <Badge colorScheme="blue" size="lg">
                    Large
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Usage Examples
          </h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Order Status:
                </span>
                <Badge colorScheme="green">Delivered</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Payment Status:
                </span>
                <Badge colorScheme="yellow">Pending</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Priority:
                </span>
                <Badge colorScheme="red">High</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Category:
                </span>
                <Badge colorScheme="blue">Electronics</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentDemo;
