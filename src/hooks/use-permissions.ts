import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { AccessControl } from "@/lib/auth/access-control";
import type {
  PermissionString,
  ModuleName,
  UserWithRoles,
  AccessControlContext,
} from "@/types/permission";

/**
 * Hook for checking user permissions in React components
 * Provides a convenient API for permission-based UI rendering
 */
export function usePermissions() {
  const { data: session } = useSession();

  const accessControl = useMemo(() => {
    const user = session?.user as UserWithRoles | null;
    return new AccessControl(user);
  }, [session]);

  const context = useMemo(() => {
    return accessControl.createContext();
  }, [accessControl]);

  return {
    // Core permission checking
    hasPermission: (permission: PermissionString) =>
      accessControl.hasPermission(permission),
    hasAnyPermission: (permissions: PermissionString[]) =>
      accessControl.hasAnyPermission(permissions),
    hasModule: (module: ModuleName) => accessControl.hasModule(module),

    // User data
    user: context.user,
    permissions: context.permissions,
    userModules: accessControl.getUserModules(),

    // Access control instance for advanced usage
    accessControl,

    // Full context for providers
    context,

    // Authentication status
    isAuthenticated: !!session?.user,
    isLoading: !session, // You might want to add a loading state from useSession
  };
}

/**
 * Hook for module-specific permissions
 * Useful when working within a specific module context
 */
export function useModulePermissions(module: ModuleName) {
  const { hasModule, hasPermission, permissions } = usePermissions();

  const modulePermissions = useMemo(() => {
    return permissions.filter(permission =>
      permission.startsWith(`${module}.`)
    );
  }, [permissions, module]);

  return {
    hasAccess: hasModule(module),
    permissions: modulePermissions,
    hasPermission: (context: string, action: string) => {
      const permission = `${module}.${context}.${action}` as PermissionString;
      return hasPermission(permission);
    },
    canView: (context: string = "Content") => {
      const permission = `${module}.${context}.View` as PermissionString;
      return hasPermission(permission);
    },
    canCreate: (context: string = "Content") => {
      const permission = `${module}.${context}.Create` as PermissionString;
      return hasPermission(permission);
    },
    canEdit: (context: string = "Content") => {
      const permission = `${module}.${context}.Edit` as PermissionString;
      return hasPermission(permission);
    },
    canDelete: (context: string = "Content") => {
      const permission = `${module}.${context}.Delete` as PermissionString;
      return hasPermission(permission);
    },
  };
}

/**
 * Hook for checking specific action permissions across modules
 * Useful for common actions like Create, Edit, Delete
 */
export function useActionPermissions() {
  const { hasPermission } = usePermissions();

  return {
    canView: (module: ModuleName, context: string = "Content") => {
      const permission = `${module}.${context}.View` as PermissionString;
      return hasPermission(permission);
    },
    canCreate: (module: ModuleName, context: string = "Content") => {
      const permission = `${module}.${context}.Create` as PermissionString;
      return hasPermission(permission);
    },
    canEdit: (module: ModuleName, context: string = "Content") => {
      const permission = `${module}.${context}.Edit` as PermissionString;
      return hasPermission(permission);
    },
    canDelete: (module: ModuleName, context: string = "Content") => {
      const permission = `${module}.${context}.Delete` as PermissionString;
      return hasPermission(permission);
    },
    canManage: (module: ModuleName, context: string = "Master") => {
      const permissions: PermissionString[] = [
        `${module}.${context}.View`,
        `${module}.${context}.Create`,
        `${module}.${context}.Edit`,
        `${module}.${context}.Delete`,
      ] as PermissionString[];
      return permissions.every(permission => hasPermission(permission));
    },
  };
}

/**
 * Hook for role-based checks
 * Useful when you need to check specific roles rather than permissions
 */
export function useRoles() {
  const { user } = usePermissions();

  const userRoles = useMemo(() => {
    return user?.roles?.map(role => role.role_name) || [];
  }, [user]);

  return {
    roles: userRoles,
    hasRole: (roleName: string) => userRoles.includes(roleName),
    hasAnyRole: (roleNames: string[]) =>
      roleNames.some(role => userRoles.includes(role)),
    hasAllRoles: (roleNames: string[]) =>
      roleNames.every(role => userRoles.includes(role)),
    isAdmin: userRoles.includes("admin") || userRoles.includes("Admin"),
    isSales: userRoles.includes("sales") || userRoles.includes("Sales"),
    isWarehouse:
      userRoles.includes("warehouse") || userRoles.includes("Warehouse"),
  };
}
