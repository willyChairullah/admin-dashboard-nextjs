import type {
  ModuleName,
  ContextName,
  ActionName,
  PermissionString,
  Permission,
  UserWithRoles,
} from "@/types/permission";

/**
 * Creates a permission string in the format: Module.Context.Action
 * @param module - The module name (e.g., 'sales', 'inventory')
 * @param context - The context name (e.g., 'Master', 'Content')
 * @param action - The action name (e.g., 'View', 'Create', 'Edit', 'Delete')
 * @returns Permission string
 */
export function createPermission(
  module: ModuleName,
  context: ContextName,
  action: ActionName
): PermissionString {
  return `${module}.${context}.${action}` as PermissionString;
}

/**
 * Parses a permission string into its components
 * @param permission - Permission string to parse
 * @returns Object with module, context, and action
 */
export function parsePermission(permission: PermissionString) {
  const [module, context, action] = permission.split(".") as [
    ModuleName,
    ContextName,
    ActionName
  ];

  if (!module || !context || !action) {
    throw new Error(
      `Invalid permission format: ${permission}. Expected format: Module.Context.Action`
    );
  }

  return { module, context, action };
}

/**
 * Validates if a permission string is properly formatted
 * @param permission - Permission string to validate
 * @returns Boolean indicating if permission is valid
 */
export function isValidPermission(
  permission: string
): permission is PermissionString {
  try {
    const parts = permission.split(".");
    return parts.length === 3 && parts.every(part => part.length > 0);
  } catch {
    return false;
  }
}

/**
 * Gets all permissions for a specific module
 * @param permissions - Array of permission strings
 * @param module - Module to filter by
 * @returns Array of permissions for the module
 */
export function getModulePermissions(
  permissions: PermissionString[],
  module: ModuleName
): PermissionString[] {
  return permissions.filter(permission => {
    try {
      const { module: permModule } = parsePermission(permission);
      return permModule === module;
    } catch {
      return false;
    }
  });
}

/**
 * Checks if user has specific permission
 * @param userPermissions - Array of user's permission strings
 * @param requiredPermission - Permission to check
 * @returns Boolean indicating if user has permission
 */
export function hasPermission(
  userPermissions: PermissionString[],
  requiredPermission: PermissionString
): boolean {
  return userPermissions.includes(requiredPermission);
}

/**
 * Checks if user has any of the specified permissions
 * @param userPermissions - Array of user's permission strings
 * @param requiredPermissions - Array of permissions to check
 * @returns Boolean indicating if user has at least one permission
 */
export function hasAnyPermission(
  userPermissions: PermissionString[],
  requiredPermissions: PermissionString[]
): boolean {
  return requiredPermissions.some(permission =>
    hasPermission(userPermissions, permission)
  );
}

/**
 * Checks if user has all specified permissions
 * @param userPermissions - Array of user's permission strings
 * @param requiredPermissions - Array of permissions to check
 * @returns Boolean indicating if user has all permissions
 */
export function hasAllPermissions(
  userPermissions: PermissionString[],
  requiredPermissions: PermissionString[]
): boolean {
  return requiredPermissions.every(permission =>
    hasPermission(userPermissions, permission)
  );
}

/**
 * Gets all unique modules that user has access to
 * @param userPermissions - Array of user's permission strings
 * @returns Array of module names user has access to
 */
export function getUserModules(
  userPermissions: PermissionString[]
): ModuleName[] {
  const modules = new Set<ModuleName>();

  userPermissions.forEach(permission => {
    try {
      const { module } = parsePermission(permission);
      modules.add(module);
    } catch {
      // Ignore invalid permissions
    }
  });

  return Array.from(modules);
}

/**
 * Checks if user has access to a specific module
 * @param userPermissions - Array of user's permission strings
 * @param module - Module to check access for
 * @returns Boolean indicating if user has access to module
 */
export function hasModuleAccess(
  userPermissions: PermissionString[],
  module: ModuleName
): boolean {
  return getUserModules(userPermissions).includes(module);
}

/**
 * Extracts permission strings from user's roles
 * @param user - User object with roles
 * @returns Array of permission strings
 */
export function getUserPermissions(
  user: UserWithRoles | null
): PermissionString[] {
  console.log(
    "👤 getUserPermissions called with user:",
    user
      ? {
          id: user.id,
          email: user.email,
          roles: user.roles?.length || 0,
        }
      : "null"
  );

  if (!user || !user.roles) {
    console.log("❌ No user or no roles found");
    return [];
  }

  const permissions = new Set<PermissionString>();

  user.roles.forEach(role => {
    console.log(
      "🔍 Processing role:",
      role.role_name,
      "with permissions:",
      role.role_permissions?.length || 0
    );

    if (role.role_permissions) {
      role.role_permissions.forEach(rolePermission => {
        if (rolePermission.permission) {
          const permissionString = createPermission(
            rolePermission.permission.module as ModuleName,
            rolePermission.permission.context as ContextName,
            rolePermission.permission.action as ActionName
          );
          console.log("✅ Added permission:", permissionString);
          permissions.add(permissionString);
        }
      });
    }
  });

  const permissionArray = Array.from(permissions);
  console.log("📋 Final permissions array:", permissionArray);
  return permissionArray;
}

/**
 * Common permission patterns for quick access
 */
export const COMMON_PERMISSIONS = {
  // Sales Module
  SALES_VIEW: createPermission("sales", "Content", "View"),
  SALES_CREATE: createPermission("sales", "Content", "Create"),
  SALES_EDIT: createPermission("sales", "Content", "Edit"),
  SALES_DELETE: createPermission("sales", "Content", "Delete"),
  SALES_DASHBOARD: createPermission("sales", "Dashboard", "View"),

  // Inventory Module
  INVENTORY_VIEW: createPermission("inventory", "Content", "View"),
  INVENTORY_CREATE: createPermission("inventory", "Content", "Create"),
  INVENTORY_EDIT: createPermission("inventory", "Content", "Edit"),
  INVENTORY_DELETE: createPermission("inventory", "Content", "Delete"),
  INVENTORY_DASHBOARD: createPermission("inventory", "Dashboard", "View"),

  // Purchasing Module
  PURCHASING_VIEW: createPermission("purchasing", "Content", "View"),
  PURCHASING_CREATE: createPermission("purchasing", "Content", "Create"),
  PURCHASING_EDIT: createPermission("purchasing", "Content", "Edit"),
  PURCHASING_DELETE: createPermission("purchasing", "Content", "Delete"),
  PURCHASING_DASHBOARD: createPermission("purchasing", "Dashboard", "View"),

  // Finance Module
  FINANCE_VIEW: createPermission("finance", "Content", "View"),
  FINANCE_CREATE: createPermission("finance", "Content", "Create"),
  FINANCE_EDIT: createPermission("finance", "Content", "Edit"),
  FINANCE_DELETE: createPermission("finance", "Content", "Delete"),
  FINANCE_DASHBOARD: createPermission("finance", "Dashboard", "View"),

  // HR Module
  HR_VIEW: createPermission("hr", "Content", "View"),
  HR_CREATE: createPermission("hr", "Content", "Create"),
  HR_EDIT: createPermission("hr", "Content", "Edit"),
  HR_DELETE: createPermission("hr", "Content", "Delete"),
  HR_DASHBOARD: createPermission("hr", "Dashboard", "View"),
} as const;
