import type {
  ModuleName,
  PageName,
  ActionName,
  PermissionString,
  Permission,
  UserWithRoles,
} from "@/types/permission";

/**
 * Creates a permission string in the format: Module.Page.Action
 * @param module - The module name (e.g., 'sales', 'inventory')
 * @param page - The page name (e.g., 'SalesDashboard', 'SalesOrder')
 * @param action - The action name (e.g., 'View', 'Create', 'Edit', 'Delete')
 * @returns Permission string
 */
export function createPermission(
  module: ModuleName,
  page: PageName,
  action: ActionName
): PermissionString {
  return `${module}.${page}.${action}` as PermissionString;
}

/**
 * Parses a permission string into its components
 * @param permission - Permission string to parse
 * @returns Object with module, page, and action
 */
export function parsePermission(permission: PermissionString) {
  const [module, page, action] = permission.split(".") as [
    ModuleName,
    PageName,
    ActionName
  ];

  if (!module || !page || !action) {
    throw new Error(
      `Invalid permission format: ${permission}. Expected format: Module.Page.Action`
    );
  }

  return { module, page, action };
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
            rolePermission.permission.page as PageName,
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
  SALES_ORDER_VIEW: createPermission("sales", "SalesOrder", "View"),
  SALES_ORDER_CREATE: createPermission("sales", "SalesOrder", "Create"),
  SALES_ORDER_EDIT: createPermission("sales", "SalesOrder", "Edit"),
  SALES_ORDER_DELETE: createPermission("sales", "SalesOrder", "Delete"),
  SALES_DASHBOARD_VIEW: createPermission("sales", "SalesDashboard", "View"),
  DELIVERY_ORDER_VIEW: createPermission("sales", "DeliveryOrder", "View"),
  DELIVERY_ORDER_CREATE: createPermission("sales", "DeliveryOrder", "Create"),
  INVOICE_VIEW: createPermission("sales", "Invoice", "View"),
  INVOICE_CREATE: createPermission("sales", "Invoice", "Create"),
  SALES_RETURN_VIEW: createPermission("sales", "SalesReturn", "View"),

  // Inventory Module
  STOCK_DASHBOARD_VIEW: createPermission("inventory", "StockDashboard", "View"),
  ITEM_LIST_VIEW: createPermission("inventory", "ItemList", "View"),
  ITEM_LIST_CREATE: createPermission("inventory", "ItemList", "Create"),
  ITEM_LIST_EDIT: createPermission("inventory", "ItemList", "Edit"),
  ITEM_LIST_DELETE: createPermission("inventory", "ItemList", "Delete"),
  STOCK_MANAGEMENT_VIEW: createPermission(
    "inventory",
    "StockManagement",
    "View"
  ),
  STOCK_MANAGEMENT_EDIT: createPermission(
    "inventory",
    "StockManagement",
    "Edit"
  ),
  STOCK_TAKING_VIEW: createPermission("inventory", "StockTaking", "View"),
  STOCK_TAKING_CREATE: createPermission("inventory", "StockTaking", "Create"),

  // Purchasing Module
  PURCHASE_ORDER_VIEW: createPermission("purchasing", "PurchaseOrder", "View"),
  PURCHASE_ORDER_CREATE: createPermission(
    "purchasing",
    "PurchaseOrder",
    "Create"
  ),
  PURCHASE_ORDER_EDIT: createPermission("purchasing", "PurchaseOrder", "Edit"),
  PURCHASE_ORDER_DELETE: createPermission(
    "purchasing",
    "PurchaseOrder",
    "Delete"
  ),
  PO_PAYMENTS_VIEW: createPermission("purchasing", "POPayments", "View"),
  PO_PAYMENTS_CREATE: createPermission("purchasing", "POPayments", "Create"),

  // Finance Module
  REVENUE_VIEW: createPermission("finance", "Revenue", "View"),
  REVENUE_CREATE: createPermission("finance", "Revenue", "Create"),
  REVENUE_EDIT: createPermission("finance", "Revenue", "Edit"),
  REVENUE_DELETE: createPermission("finance", "Revenue", "Delete"),
  EXPENSES_VIEW: createPermission("finance", "Expenses", "View"),
  EXPENSES_CREATE: createPermission("finance", "Expenses", "Create"),
  EXPENSES_EDIT: createPermission("finance", "Expenses", "Edit"),
  EXPENSES_DELETE: createPermission("finance", "Expenses", "Delete"),

  // HR Module
  ATTENDANCE_VIEW: createPermission("hr", "Attendance", "View"),
  ATTENDANCE_CREATE: createPermission("hr", "Attendance", "Create"),
  ATTENDANCE_EDIT: createPermission("hr", "Attendance", "Edit"),
  ATTENDANCE_DELETE: createPermission("hr", "Attendance", "Delete"),
};
