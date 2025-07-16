import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export function useCurrentUser() {
  const { userEmail, userRole } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userEmail) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/user/details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail }),
        });

        if (response.ok) {
          const userData = await response.json();
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
          });
        } else if (response.status === 404) {
          // User not found in database, create a fallback user
          console.warn("User not found in database, using fallback");
          setUser({
            id: `user_${Date.now()}`, // Generate a temporary ID
            email: userEmail,
            name: userEmail.split("@")[0],
            role: userRole || "SALES",
          });
        } else {
          // Other error, use fallback
          setUser({
            id: userEmail, // Use email as fallback ID
            email: userEmail,
            name: userEmail.split("@")[0],
            role: userRole || "SALES",
          });
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        // Fallback to basic user data
        setUser({
          id: userEmail, // Use email as fallback ID
          email: userEmail,
          name: userEmail.split("@")[0],
          role: userRole || "SALES",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userEmail, userRole]);

  return { user, loading };
}

// Role-based menu filtering
export function filterMenuByRole(menuItems: any[], userRole: string) {
  if (!userRole) return [];

  switch (userRole) {
    case "SALES":
      // Sales can access the entire Sales module and all its children components
      return menuItems.filter((item) => item.id === "sales");

    case "WAREHOUSE":
    case "ADMIN":
    case "OWNER":
    default:
      // All other roles (WAREHOUSE, ADMIN, OWNER) can access everything
      return menuItems;
  }
}
