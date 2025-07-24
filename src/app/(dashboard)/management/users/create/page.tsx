"use client";
import { ManagementHeader } from "@/components/ui";
import React, { useState } from "react";
import { Button, Input, Select, FormField, InputDate } from "@/components/ui";

interface FormData {
  name: string;
  email: string;
  role: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export default function page() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    role: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: "",
    email: "",
    role: "",
    password: "",
  });

  const roleOptions = [
    { value: "OWNER", label: "OWNER" },
    { value: "ADMIN", label: "ADMIN" },
    { value: "WAREHOUSE", label: "WAREHOUSE" },
    { value: "SALES", label: "SALES" },
  ];

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value });
    if (value) {
      setFormErrors({ ...formErrors, role: "" });
    } else {
      setFormErrors({ ...formErrors, role: "Please select a role." });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = {
      name: formData.name ? "" : "Name is required",
    };
  };

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ManagementHeader
        headerTittle="me"
        mainPageName="/me"
        allowedRoles={["ADMIN"]}
      />
      {/* <ManagementTableContent /> */}
      <div className="flex flex-col">
        <div className="p-3 md:px-28 md:py-6">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <FormField
              label="Full Name"
              htmlFor="name"
              required
              errorMessage={formErrors.name}
            >
              <Input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </FormField>

            <FormField
              label="Email Address"
              htmlFor="email"
              required
              errorMessage={formErrors.email}
            >
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </FormField>

            <FormField
              label="Password"
              htmlFor="password"
              required
              errorMessage={formErrors.password}
            >
              <Input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </FormField>

            <FormField
              label="Role"
              htmlFor="role"
              required
              errorMessage={formErrors.role}
            >
              <Select
                options={roleOptions}
                value={formData.role}
                onChange={handleRoleChange}
                placeholder="— Select a Role —"
              />
            </FormField>
            <Button type="submit" className="w-full">
              Submit Form
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
