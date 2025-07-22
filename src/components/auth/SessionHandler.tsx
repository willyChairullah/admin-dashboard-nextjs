"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function SessionHandler() {
  const { data: session, status } = useSession();

  

  useEffect(() => {
    console.log("Session status:", status);
    if (session?.user) {
      console.log("Session user:", {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      });
    }
  }, [session, status]);

  return null;
}
