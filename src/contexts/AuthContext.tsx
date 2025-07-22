"use client";

import { createContext, useContext, useState } from "react";

interface AuthContextType {
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  userRole: string | null;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  userEmail: null,
  setUserEmail: () => {},
  userRole: null,
  refreshUserRole: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmailState] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchUserRole = async (email: string) => {
    try {
      const response = await fetch("/api/user/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);
      } else {
        // Fallback to email-based detection if API fails
        setUserRole(getEmailBasedRole(email));
      }
    } catch (error) {
      console.error("Failed to fetch user role:", error);
      // Fallback to email-based detection
      setUserRole(getEmailBasedRole(email));
    }
  };

  const getEmailBasedRole = (email: string | null) => {
    if (!email) return null;
    if (email.includes("owner@")) return "OWNER";
    if (email.includes("admin@")) return "ADMIN";
    if (email.includes("warehouse@")) return "WAREHOUSE";
    if (email.includes("sales@")) return "SALES";
    return "SALES"; // Default role
  };

  const setUserEmail = (email: string | null) => {
    setUserEmailState(email);
    if (email) {
      fetchUserRole(email);
    } else {
      setUserRole(null);
    }
  };

  const refreshUserRole = async () => {
    if (userEmail) {
      await fetchUserRole(userEmail);
    }
  };

  return (
    <AuthContext.Provider
      value={{ userEmail, setUserEmail, userRole, refreshUserRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}