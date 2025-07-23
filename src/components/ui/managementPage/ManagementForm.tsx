"use client";
import React from "react";
import { useRouter } from "next/navigation"; 
import { Button } from "@/components/ui"; 

interface ManagementFormProps {
  children: React.ReactNode;
  subModuleName: string; 
  moduleName: string; 
  isSubmitting?: boolean; 
  handleFormSubmit: (event: React.FormEvent) => void; 
  handleDelete?: () => Promise<void>; 
  hideDeleteButton?: boolean; 
}

export default function ManagementForm({
  children,
  subModuleName,
  moduleName, 
  isSubmitting = false,
  handleFormSubmit,
  handleDelete,
  hideDeleteButton = false, 
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
              onClick={() =>
                router.push(`/${subModuleName.toLowerCase()}/${moduleName}`)
              }
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            {!hideDeleteButton && ( 
              <Button
                type="button"
                variant="danger"
                className="flex-1"
                onClick={handleDelete} 
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
