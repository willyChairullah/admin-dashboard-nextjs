import { useAuth } from "@/contexts/AuthContext";

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export function useCurrentUser() {
  const { userEmail, userRole } = useAuth();

  const user: User | null = userEmail
    ? {
        id: "1",
        email: userEmail,
        name: userEmail.split("@")[0],
        role: userRole || "SALES",
      }
    : null;

  return { user, loading: false };
}

// Role-based menu filtering
export function filterMenuByRole(menuItems: any[], userRole: string) {
  if (!userRole) return [];

  switch (userRole) {
    case "SALES":
      // Sales can only see Sales Dashboard (not the entire Sales module)
      return menuItems
        .filter((item) => item.id === "sales")
        .map((item) => ({
          ...item,
          children: item.children.filter(
            (child: any) => child.id === "sales-dashboard"
          ),
        }));

    case "WAREHOUSE":
    case "ADMIN":
    case "OWNER":
    default:
      // All other roles (WAREHOUSE, ADMIN, OWNER) can access everything
      return menuItems;
  }
}
