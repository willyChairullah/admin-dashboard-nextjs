import type {
  MenuItem,
  ModuleConfig,
  SidebarConfig,
  PermissionString,
  ModuleName,
} from "@/types/permission";
import { AccessControl } from "@/lib/auth/access-control";

/**
 * Module configuration - only basic module info, items will be generated dynamically
 */
export const MODULE_CONFIG = {
  sales: {
    label: "Sales",
    icon: "🛒",
    order: 2,
  },
  inventory: {
    label: "Inventory",
    icon: "📦",
    order: 3,
  },
  purchasing: {
    label: "Purchasing",
    icon: "🚚",
    order: 4,
  },
  finance: {
    label: "Finance",
    icon: "💰",
    order: 5,
  },
  hr: {
    label: "HR",
    icon: "👥",
    order: 6,
  },
} as const;

/**
 * Page configuration for generating menu items from permissions
 */
export const PAGE_CONFIG: Record<
  string,
  {
    label: string;
    href: string;
    isDashboard?: boolean;
  }
> = {
  // Sales module pages
  SalesDashboard: {
    label: "Sales Dashboard",
    href: "/sales",
    isDashboard: true,
  },
  SalesOrder: {
    label: "Sales Order (SO)",
    href: "/sales/orders",
  },
  DeliveryOrder: {
    label: "Delivery Order",
    href: "/sales/delivery",
  },
  Invoice: {
    label: "Invoice",
    href: "/sales/invoices",
  },
  SalesReturn: {
    label: "Sales Return",
    href: "/sales/returns",
  },

  // Inventory module pages
  StockDashboard: {
    label: "Stock Dashboard",
    href: "/inventory",
    isDashboard: true,
  },
  ItemList: {
    label: "Item List (Master Data)",
    href: "/inventory/items",
  },
  StockManagement: {
    label: "Stock Management",
    href: "/inventory/stock",
  },
  StockTaking: {
    label: "Stock Taking",
    href: "/inventory/stock-taking",
  },

  // Purchasing module pages
  PurchaseOrder: {
    label: "Purchase Order (PO)",
    href: "/purchasing/orders",
  },
  POPayments: {
    label: "PO Payments",
    href: "/purchasing/payments",
  },

  // Finance module pages
  Revenue: {
    label: "Revenue",
    href: "/finance/revenue",
  },
  Expenses: {
    label: "Expenses",
    href: "/finance/expenses",
  },

  // HR module pages
  Attendance: {
    label: "Attendance",
    href: "/hr/attendance",
  },
};

/**
 * Additional menu items that don't require permissions or have special logic
 */
export const STATIC_MENU_ITEMS: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/",
    icon: "🏠",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
    icon: "⚙️",
  },
];

/**
 * Generates a filtered menu based on user permissions
 */
export class MenuGenerator {
  private accessControl: AccessControl;

  constructor(accessControl: AccessControl) {
    this.accessControl = accessControl;
  }

  /**
   * Generates dynamic menu items from user permissions
   */
  private generateMenuFromPermissions(): MenuItem[] {
    const userPermissions = this.accessControl.getUserPermissions();
    const moduleItems: { [key: string]: MenuItem[] } = {};

    // Parse permissions to generate menu items
    userPermissions.forEach((permissionString: PermissionString) => {
      try {
        const [module, page, action] = permissionString.split(".");

        // Only create menu items for "View" permissions
        if (action !== "View") return;

        // Skip if module config doesn't exist
        if (!MODULE_CONFIG[module as keyof typeof MODULE_CONFIG]) return;

        const moduleConfig =
          MODULE_CONFIG[module as keyof typeof MODULE_CONFIG];

        // Get page config or auto-generate if not exists
        let pageConfig = PAGE_CONFIG[page as keyof typeof PAGE_CONFIG];
        if (!pageConfig) {
          // Auto-generate page config for new pages
          pageConfig = {
            label: generateLabel(page),
            href: generateHref(module, page),
            isDashboard: page.toLowerCase().includes("dashboard"),
          };

          console.info(`Auto-generated page config for ${page}:`, pageConfig);
        }

        // Initialize module array if not exists
        if (!moduleItems[module]) {
          moduleItems[module] = [];
        }

        // Create menu item
        const menuItem: MenuItem = {
          id: `${module}-${page.toLowerCase()}`,
          label: pageConfig.label,
          href: pageConfig.href,
          requiredPermission: permissionString as PermissionString,
          module: module as ModuleName,
        };

        // Check if item already exists (avoid duplicates)
        const exists = moduleItems[module].some(
          item => item.href === menuItem.href
        );
        if (!exists) {
          moduleItems[module].push(menuItem);
        }
      } catch (error) {
        console.warn("Invalid permission format:", permissionString);
      }
    });

    // Convert to menu structure
    const menuItems: MenuItem[] = [];

    // Add dashboard first
    if (this.accessControl.getUser()) {
      menuItems.push(STATIC_MENU_ITEMS[0]); // Dashboard
    }

    // Add modules sorted by order
    Object.entries(moduleItems)
      .sort(([a], [b]) => {
        const orderA =
          MODULE_CONFIG[a as keyof typeof MODULE_CONFIG]?.order || 999;
        const orderB =
          MODULE_CONFIG[b as keyof typeof MODULE_CONFIG]?.order || 999;
        return orderA - orderB;
      })
      .forEach(([moduleName, items]) => {
        const moduleConfig =
          MODULE_CONFIG[moduleName as keyof typeof MODULE_CONFIG];

        if (items.length > 0) {
          // Sort items: dashboard first, then alphabetically
          const sortedItems = items.sort((a, b) => {
            // Dashboard items first (based on URL pattern)
            const aIsDashboard = a.href.split("/").length === 2;
            const bIsDashboard = b.href.split("/").length === 2;

            if (aIsDashboard && !bIsDashboard) return -1;
            if (!aIsDashboard && bIsDashboard) return 1;

            return a.label.localeCompare(b.label);
          });

          menuItems.push({
            id: moduleName,
            label: moduleConfig.label,
            href: `/${moduleName}`,
            icon: moduleConfig.icon,
            children: sortedItems,
            module: moduleName as ModuleName,
          });
        }
      });

    // Add settings last
    if (this.accessControl.getUser()) {
      menuItems.push(STATIC_MENU_ITEMS[1]); // Settings
    }

    return menuItems;
  }

  /**
   * Filters a menu item based on user permissions
   */
  private filterMenuItem(item: MenuItem): MenuItem | null {
    // If no permission required, always show
    if (!item.requiredPermission) {
      return item;
    }

    // Check if user has required permission
    if (!this.accessControl.hasPermission(item.requiredPermission)) {
      return null;
    }

    // Filter children recursively
    if (item.children) {
      const filteredChildren = item.children
        .map(child => this.filterMenuItem(child))
        .filter((child): child is MenuItem => child !== null);

      return {
        ...item,
        children: filteredChildren.length > 0 ? filteredChildren : undefined,
      };
    }

    return item;
  }

  /**
   * Generates the complete sidebar menu for the user
   */
  generateSidebar(): MenuItem[] {
    return this.generateMenuFromPermissions();
  }

  /**
   * Generates menu items for a specific module
   */
  generateModuleMenu(moduleName: ModuleName): MenuItem[] {
    const allMenuItems = this.generateMenuFromPermissions();
    const moduleMenu = allMenuItems.find(item => item.id === moduleName);

    return moduleMenu?.children || [];
  }

  /**
   * Gets available modules for the user
   */
  getAvailableModules(): {
    id: ModuleName;
    label: string;
    icon: string;
    order: number;
  }[] {
    const userModules = this.accessControl.getUserModules();

    return Object.entries(MODULE_CONFIG)
      .filter(([moduleId]) => userModules.includes(moduleId as ModuleName))
      .map(([moduleId, config]) => ({
        id: moduleId as ModuleName,
        label: config.label,
        icon: config.icon,
        order: config.order,
      }))
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Checks if a menu item should be active based on current path
   */
  static isActiveMenuItem(item: MenuItem, currentPath: string): boolean {
    if (item.href === currentPath) return true;

    if (item.children) {
      return item.children.some(child =>
        MenuGenerator.isActiveMenuItem(child, currentPath)
      );
    }

    return false;
  }

  /**
   * Gets breadcrumb data for current path
   */
  getBreadcrumbs(currentPath: string): MenuItem[] {
    const breadcrumbs: MenuItem[] = [];
    const allItems = this.generateSidebar();

    function findPath(items: MenuItem[], path: string): MenuItem[] {
      for (const item of items) {
        if (item.href === path) {
          return [item];
        }

        if (item.children) {
          const childPath = findPath(item.children, path);
          if (childPath.length > 0) {
            return [item, ...childPath];
          }
        }
      }
      return [];
    }

    return findPath(allItems, currentPath);
  }
}

/**
 * Helper function to create a menu generator instance
 */
export function createMenuGenerator(
  accessControl: AccessControl
): MenuGenerator {
  return new MenuGenerator(accessControl);
}

/**
 * Role-based preset configurations for quick setup
 */
export const ROLE_PRESETS = {
  ADMIN: {
    modules: [
      "sales",
      "inventory",
      "purchasing",
      "finance",
      "hr",
    ] as ModuleName[],
    permissions: [
      // Sales
      "sales.SalesDashboard.View",
      "sales.SalesOrder.View",
      "sales.SalesOrder.Create",
      "sales.SalesOrder.Edit",
      "sales.SalesOrder.Delete",
      "sales.DeliveryOrder.View",
      "sales.DeliveryOrder.Create",
      "sales.DeliveryOrder.Edit",
      "sales.DeliveryOrder.Delete",
      "sales.Invoice.View",
      "sales.Invoice.Create",
      "sales.Invoice.Edit",
      "sales.Invoice.Delete",
      "sales.SalesReturn.View",
      "sales.SalesReturn.Create",
      "sales.SalesReturn.Edit",
      "sales.SalesReturn.Delete",
      // Inventory
      "inventory.StockDashboard.View",
      "inventory.ItemList.View",
      "inventory.ItemList.Create",
      "inventory.ItemList.Edit",
      "inventory.ItemList.Delete",
      "inventory.StockManagement.View",
      "inventory.StockManagement.Edit",
      "inventory.StockTaking.View",
      "inventory.StockTaking.Create",
      "inventory.StockTaking.Edit",
      // Purchasing
      "purchasing.PurchaseOrder.View",
      "purchasing.PurchaseOrder.Create",
      "purchasing.PurchaseOrder.Edit",
      "purchasing.PurchaseOrder.Delete",
      "purchasing.POPayments.View",
      "purchasing.POPayments.Create",
      "purchasing.POPayments.Edit",
      "purchasing.POPayments.Delete",
      // Finance
      "finance.Revenue.View",
      "finance.Revenue.Create",
      "finance.Revenue.Edit",
      "finance.Revenue.Delete",
      "finance.Expenses.View",
      "finance.Expenses.Create",
      "finance.Expenses.Edit",
      "finance.Expenses.Delete",
      // HR
      "hr.Attendance.View",
      "hr.Attendance.Create",
      "hr.Attendance.Edit",
      "hr.Attendance.Delete",
    ] as PermissionString[],
  },
  SALES: {
    modules: ["sales"] as ModuleName[],
    permissions: [
      "sales.SalesDashboard.View",
      "sales.SalesOrder.View",
      "sales.SalesOrder.Create",
      "sales.SalesOrder.Edit",
      "sales.DeliveryOrder.View",
      "sales.DeliveryOrder.Create",
      "sales.Invoice.View",
      "sales.Invoice.Create",
    ] as PermissionString[],
  },
  WAREHOUSE: {
    modules: ["inventory"] as ModuleName[],
    permissions: [
      "inventory.StockDashboard.View",
      "inventory.ItemList.View",
      "inventory.StockManagement.View",
      "inventory.StockManagement.Edit",
      "inventory.StockTaking.View",
      "inventory.StockTaking.Create",
    ] as PermissionString[],
  },
};

/**
 * Helper function to register new page configuration dynamically
 */
export function registerPageConfig(
  pageName: string,
  config: {
    label: string;
    href: string;
    isDashboard?: boolean;
  }
) {
  // Note: This would need to be implemented with a dynamic registry
  // For now, pages need to be added to PAGE_CONFIG manually
  console.warn(
    `To add new page "${pageName}", please add it to PAGE_CONFIG in menu-generator.ts:`,
    config
  );
}

/**
 * Helper function to automatically generate href from module and page name
 */
export function generateHref(module: string, page: string): string {
  // Convert PascalCase to kebab-case
  const pageSlug = page
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "");

  // Handle dashboard pages
  if (page.toLowerCase().includes("dashboard")) {
    return `/${module}`;
  }

  return `/${module}/${pageSlug}`;
}

/**
 * Helper function to auto-generate label from page name
 */
export function generateLabel(page: string): string {
  // Convert PascalCase to readable format
  return page
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, str => str.toUpperCase())
    .trim();
}
