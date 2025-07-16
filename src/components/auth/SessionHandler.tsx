"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuth } from "@/contexts/AuthContext";

export function SessionHandler() {
  const { data: session, status } = useSession();
  const { setUserEmail } = useAuth();

  useEffect(() => {
    // Update email from NextAuth session
    if (session?.user?.email) {
      setUserEmail(session.user.email);
    } else if (status === "unauthenticated") {
      setUserEmail(null);
    }
  }, [session, status, setUserEmail]);

  return null; // This component doesn't render anything
}
