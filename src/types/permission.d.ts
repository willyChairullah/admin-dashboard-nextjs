// Permission Types
export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  page: string;
  action: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  role_name: string;
  description: string;
  default: number;
  can_delete: number;
  login_destination: string;
  default_context: string;
  deleted: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  role_permissions?: RolePermission[];
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  granted_at: Date;
  role?: Role;
  permission?: Permission;
}

export interface UserWithRoles {
  id: string;
  name?: string;
  email: string;
  roles: Role[];
}

// Permission System Types
export type ModuleName =
  | "sales"
  | "inventory"
  | "purchasing"
  | "finance"
  | "hr";

export type PageName =
  | "SalesDashboard"
  | "SalesOrder"
  | "DeliveryOrder"
  | "Invoice"
  | "SalesReturn"
  | "StockDashboard"
  | "ItemList"
  | "StockManagement"
  | "StockTaking"
  | "PurchaseOrder"
  | "POPayments"
  | "Revenue"
  | "Expenses"
  | "Attendance";

export type ActionName = "View" | "Create" | "Edit" | "Delete";

export type PermissionString = `${ModuleName}.${PageName}.${ActionName}`;

// Menu Item Types
export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  requiredPermission?: PermissionString;
  children?: MenuItem[];
  module?: ModuleName;
}

// Access Control Types
export interface AccessControlContext {
  user: UserWithRoles | null;
  permissions: PermissionString[];
  hasPermission: (permission: PermissionString) => boolean;
  hasAnyPermission: (permissions: PermissionString[]) => boolean;
  hasModule: (module: ModuleName) => boolean;
}

// Menu Configuration Types
export interface ModuleConfig {
  id: ModuleName;
  label: string;
  icon: string;
  order: number;
  items: MenuItem[];
}

export interface SidebarConfig {
  modules: ModuleConfig[];
}

// Permission Check Result
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}
