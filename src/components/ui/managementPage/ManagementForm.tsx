"use client";
import React from "react";
import { useRouter } from "next/navigation"; // Ensure to import your router if you are using Next.js
import { Button } from "@/components/ui"; // Ensure you import your Button component

interface ManagementFormProps {
  children: React.ReactNode;
  subModuleName: string; // Prop for module name
  moduleName: string; // Prop for module name
  isSubmitting?: boolean; // Prop for handling form submission state
  handleFormSubmit: (event: React.FormEvent) => void; // Prop for the submit handler
  handleDelete?: () => Promise<void>; // Prop for the delete handler
  hideDeleteButton?: boolean; // New prop to control the visibility of the delete button
}

export default function ManagementForm({
  children,
  subModuleName,
  moduleName, // Prop for module name
  isSubmitting = false,
  handleFormSubmit,
  handleDelete,
  hideDeleteButton = false, // Default to false
}: ManagementFormProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      <div className="p-3 md:px-28 md:py-6">
        {/* Dynamic title */}
        <h2 className="text-lg font-semibold">Manage {subModuleName}</h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {children}

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting
                ? `Creating ${subModuleName}...`
                : `Create ${subModuleName}`}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push(`/${moduleName}/${subModuleName.toLowerCase()}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            {!hideDeleteButton && ( // Conditionally render the delete button
              <Button
                type="button"
                variant="danger"
                className="flex-1"
                onClick={handleDelete} // Call the delete handler
                disabled={isSubmitting}
              >
                Delete {subModuleName}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
