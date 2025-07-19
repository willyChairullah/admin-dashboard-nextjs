// ManagementHeader.tsx
import React from "react";
import { Button } from "@/components/ui";
import { useCurrentUser } from "@/hooks/useCurrentUser"; 
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePathname, useRouter } from "next/navigation";

interface ManagementHeaderProps {
  allowedRoles: string[]; // List of roles allowed to see the "Add New" button
}

const ManagementHeader: React.FC<ManagementHeaderProps> = ({ allowedRoles }) => {
  const { user, loading } = useCurrentUser(); // Get user details
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();

  // Current route check
  const isOnCreatePage = pathname.endsWith("/create");
  const isOnMainPage = pathname.split("/").length === 3 && !isOnCreatePage;

  const handleListClick = () => {
    if (isOnCreatePage) {
      router.back(); // Go back if on the '/me/create' route
    }
    // If on the main page, do nothing
  };

  const handleAddNewClick = () => {
    if (isOnMainPage) {
      router.push(`${pathname}/create`); // Navigate to '/me/create'
    }
    // If already on the '/me/create' page, do nothing
  };

  // Check if the user's role is allowed to see the "Add New" button
  const canAddNewUser = user && allowedRoles.includes(user.role || "");

  return (
    <div className="flex items-center justify-between px-4 py-2 md:px-6 md:py-3 border-b border-gray-200 dark:border-gray-700">
      <h3 className="text-base md:text-2xl font-semibold text-gray-900 dark:text-white">
        User Management
      </h3>
      <div className="flex space-x-2">
        <Button
          size={isMobile ? "small" : "medium"}
          variant={isOnCreatePage ? "primary" : "secondary"}
          className={`text-xs md:text-sm ${isOnCreatePage ? "bg-blue-500" : ""}`}
          onClick={handleListClick}
        >
          List
        </Button>
        {canAddNewUser && ( // Render "Add New" button only if user role is allowed
          <Button
            size={isMobile ? "small" : "medium"}
            variant={isOnCreatePage ? "secondary" : "primary"}
            className="text-xs md:text-sm"
            onClick={handleAddNewClick}
          >
            Add New
          </Button>
        )}
      </div>
    </div>
  );
};

export default ManagementHeader;