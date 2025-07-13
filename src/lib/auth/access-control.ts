import {
  hasPermission,
  hasAnyPermission,
  hasModuleAccess,
  getUserPermissions,
  getUserModules,
} from "./permissions";
import type {
  PermissionString,
  ModuleName,
  UserWithRoles,
  PermissionCheckResult,
  AccessControlContext,
} from "@/types/permission";

/**
 * Access Control Service
 * Provides methods for checking user permissions and module access
 */
export class AccessControl {
  private user: UserWithRoles | null;
  private permissions: PermissionString[];

  constructor(user: UserWithRoles | null) {
    this.user = user;
    this.permissions = getUserPermissions(user);
  }

  /**
   * Checks if user has a specific permission
   */
  hasPermission(permission: PermissionString): boolean {
    return hasPermission(this.permissions, permission);
  }

  /**
   * Checks if user has any of the specified permissions
   */
  hasAnyPermission(permissions: PermissionString[]): boolean {
    return hasAnyPermission(this.permissions, permissions);
  }

  /**
   * Checks if user has access to a specific module
   */
  hasModule(module: ModuleName): boolean {
    return hasModuleAccess(this.permissions, module);
  }

  /**
   * Gets all modules the user has access to
   */
  getUserModules(): ModuleName[] {
    return getUserModules(this.permissions);
  }

  /**
   * Gets all user permissions
   */
  getUserPermissions(): PermissionString[] {
    return this.permissions;
  }

  /**
   * Gets user information
   */
  getUser(): UserWithRoles | null {
    return this.user;
  }

  /**
   * Checks permission with detailed result
   */
  checkPermission(permission: PermissionString): PermissionCheckResult {
    if (!this.user) {
      return {
        allowed: false,
        reason: "User not authenticated",
      };
    }

    if (!this.hasPermission(permission)) {
      return {
        allowed: false,
        reason: `Missing required permission: ${permission}`,
      };
    }

    return {
      allowed: true,
    };
  }

  /**
   * Checks multiple permissions with detailed result
   */
  checkAnyPermission(permissions: PermissionString[]): PermissionCheckResult {
    if (!this.user) {
      return {
        allowed: false,
        reason: "User not authenticated",
      };
    }

    if (!this.hasAnyPermission(permissions)) {
      return {
        allowed: false,
        reason: `Missing required permissions: ${permissions.join(", ")}`,
      };
    }

    return {
      allowed: true,
    };
  }

  /**
   * Checks module access with detailed result
   */
  checkModuleAccess(module: ModuleName): PermissionCheckResult {
    if (!this.user) {
      return {
        allowed: false,
        reason: "User not authenticated",
      };
    }

    if (!this.hasModule(module)) {
      return {
        allowed: false,
        reason: `No access to module: ${module}`,
      };
    }

    return {
      allowed: true,
    };
  }

  /**
   * Creates an access control context for React components
   */
  createContext(): AccessControlContext {
    return {
      user: this.user,
      permissions: this.permissions,
      hasPermission: this.hasPermission.bind(this),
      hasAnyPermission: this.hasAnyPermission.bind(this),
      hasModule: this.hasModule.bind(this),
    };
  }
}

/**
 * Server-side permission validation
 * Should be used in API routes and server components
 */
export async function validatePermissionServer(
  user: UserWithRoles | null,
  requiredPermission: PermissionString
): Promise<PermissionCheckResult> {
  if (!user) {
    return {
      allowed: false,
      reason: "Authentication required",
    };
  }

  const accessControl = new AccessControl(user);
  return accessControl.checkPermission(requiredPermission);
}

/**
 * Server-side module access validation
 */
export async function validateModuleAccessServer(
  user: UserWithRoles | null,
  module: ModuleName
): Promise<PermissionCheckResult> {
  if (!user) {
    return {
      allowed: false,
      reason: "Authentication required",
    };
  }

  const accessControl = new AccessControl(user);
  return accessControl.checkModuleAccess(module);
}

/**
 * Middleware helper for API route protection
 */
export function requirePermission(permission: PermissionString) {
  return async (user: UserWithRoles | null) => {
    const result = await validatePermissionServer(user, permission);
    if (!result.allowed) {
      throw new Error(result.reason || "Access denied");
    }
    return true;
  };
}

/**
 * Middleware helper for module access protection
 */
export function requireModuleAccess(module: ModuleName) {
  return async (user: UserWithRoles | null) => {
    const result = await validateModuleAccessServer(user, module);
    if (!result.allowed) {
      throw new Error(result.reason || "Access denied");
    }
    return true;
  };
}

/**
 * Higher-order function for protecting API routes
 */
export function withPermission<T extends any[]>(
  permission: PermissionString,
  handler: (user: UserWithRoles, ...args: T) => Promise<any>
) {
  return async (user: UserWithRoles | null, ...args: T) => {
    await requirePermission(permission)(user);
    return handler(user as UserWithRoles, ...args);
  };
}

/**
 * Higher-order function for protecting API routes by module
 */
export function withModuleAccess<T extends any[]>(
  module: ModuleName,
  handler: (user: UserWithRoles, ...args: T) => Promise<any>
) {
  return async (user: UserWithRoles | null, ...args: T) => {
    await requireModuleAccess(module)(user);
    return handler(user as UserWithRoles, ...args);
  };
}
