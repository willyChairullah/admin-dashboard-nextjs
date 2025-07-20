"use client";
import React from "react";
import { useRouter } from "next/navigation"; // Make sure to import your router, if you are using Next.js
import { Button } from "@/components/ui"; // Ensure you import your Button component

interface ManagementFormProps {
  children: React.ReactNode;
  moduleName: string; // Add a new prop for module name
  isSubmitting?: boolean; // Add a prop for handling form submission state
  handleFormSubmit: (event: React.FormEvent) => void; // Add a prop for the submit handler
}

export default function ManagementForm({
  children,
  moduleName,
  isSubmitting = false,
  handleFormSubmit,
}: ManagementFormProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      <div className="p-3 md:px-28 md:py-6">
        {/* Dynamic title */}
        <h2 className="text-lg font-semibold">Manage {moduleName}</h2>{" "}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {children}

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting
                ? `Creating ${moduleName}...`
                : `Create ${moduleName}`}{" "}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push(`/${moduleName.toLowerCase()}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
