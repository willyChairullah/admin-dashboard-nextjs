import type {
  MenuItem,
  ModuleConfig,
  SidebarConfig,
  PermissionString,
  ModuleName,
} from "@/types/permission";
import { AccessControl } from "@/lib/auth/access-control";

/**
 * Menu configuration based on the copilot instructions
 * Following the recommended sidebar module order: Dashboard, Sales, Inventory, Purchasing, Finance, HR, Settings
 */
export const MENU_CONFIG: SidebarConfig = {
  modules: [
    {
      id: "sales",
      label: "Sales",
      icon: "🛒",
      order: 2,
      items: [
        {
          id: "sales-dashboard",
          label: "Sales Dashboard",
          href: "/sales",
          requiredPermission: "sales.Dashboard.View",
          module: "sales",
        },
        {
          id: "sales-orders",
          label: "Sales Order (SO)",
          href: "/sales/orders",
          requiredPermission: "sales.Content.View",
          module: "sales",
        },
        {
          id: "delivery-orders",
          label: "Delivery Order",
          href: "/sales/delivery",
          requiredPermission: "sales.Content.View",
          module: "sales",
        },
        {
          id: "invoices",
          label: "Invoice",
          href: "/sales/invoices",
          requiredPermission: "sales.Content.View",
          module: "sales",
        },
        {
          id: "sales-returns",
          label: "Sales Return",
          href: "/sales/returns",
          requiredPermission: "sales.Content.View",
          module: "sales",
        },
      ],
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: "📦",
      order: 3,
      items: [
        {
          id: "stock-dashboard",
          label: "Stock Dashboard",
          href: "/inventory",
          requiredPermission: "inventory.Dashboard.View",
          module: "inventory",
        },
        {
          id: "item-list",
          label: "Item List (Master Data)",
          href: "/inventory/items",
          requiredPermission: "inventory.Master.View",
          module: "inventory",
        },
        {
          id: "stock-management",
          label: "Stock Management",
          href: "/inventory/stock",
          requiredPermission: "inventory.Content.View",
          module: "inventory",
        },
        {
          id: "stock-taking",
          label: "Stock Taking",
          href: "/inventory/stock-taking",
          requiredPermission: "inventory.Content.View",
          module: "inventory",
        },
      ],
    },
    {
      id: "purchasing",
      label: "Purchasing",
      icon: "🚚",
      order: 4,
      items: [
        {
          id: "purchase-orders",
          label: "Purchase Order (PO)",
          href: "/purchasing/orders",
          requiredPermission: "purchasing.Content.View",
          module: "purchasing",
        },
        {
          id: "po-payments",
          label: "PO Payments",
          href: "/purchasing/payments",
          requiredPermission: "purchasing.Content.View",
          module: "purchasing",
        },
      ],
    },
    {
      id: "finance",
      label: "Finance",
      icon: "💰",
      order: 5,
      items: [
        {
          id: "revenue",
          label: "Revenue",
          href: "/finance/revenue",
          requiredPermission: "finance.Content.View",
          module: "finance",
        },
        {
          id: "expenses",
          label: "Expenses",
          href: "/finance/expenses",
          requiredPermission: "finance.Content.View",
          module: "finance",
        },
      ],
    },
    {
      id: "hr",
      label: "HR",
      icon: "👥",
      order: 6,
      items: [
        {
          id: "attendance",
          label: "Attendance",
          href: "/hr/attendance",
          requiredPermission: "hr.Content.View",
          module: "hr",
        },
      ],
    },
  ],
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
   * Filters module items based on user permissions
   */
  private filterModuleItems(module: ModuleConfig): MenuItem[] {
    return module.items
      .map(item => this.filterMenuItem(item))
      .filter((item): item is MenuItem => item !== null);
  }

  /**
   * Generates the complete sidebar menu for the user
   */
  generateSidebar(): MenuItem[] {
    const menuItems: MenuItem[] = [];

    // Add dashboard (always visible if authenticated)
    if (this.accessControl.getUser()) {
      menuItems.push(STATIC_MENU_ITEMS[0]); // Dashboard
    }

    // Add module-based menu items
    const userModules = this.accessControl.getUserModules();
    const sortedModules = MENU_CONFIG.modules
      .filter(module => userModules.includes(module.id))
      .sort((a, b) => a.order - b.order);

    for (const module of sortedModules) {
      const filteredItems = this.filterModuleItems(module);

      if (filteredItems.length > 0) {
        // Add module as a parent item with children
        menuItems.push({
          id: module.id,
          label: module.label,
          href: `/${module.id}`,
          icon: module.icon,
          children: filteredItems,
          module: module.id,
        });
      }
    }

    // Add settings (always visible if authenticated)
    if (this.accessControl.getUser()) {
      menuItems.push(STATIC_MENU_ITEMS[1]); // Settings
    }

    return menuItems;
  }

  /**
   * Generates menu items for a specific module
   */
  generateModuleMenu(moduleName: ModuleName): MenuItem[] {
    const module = MENU_CONFIG.modules.find(m => m.id === moduleName);
    if (!module) return [];

    if (!this.accessControl.hasModule(moduleName)) return [];

    return this.filterModuleItems(module);
  }

  /**
   * Gets available modules for the user
   */
  getAvailableModules(): ModuleConfig[] {
    const userModules = this.accessControl.getUserModules();
    return MENU_CONFIG.modules
      .filter(module => userModules.includes(module.id))
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
      "sales.Dashboard.View",
      "sales.Content.View",
      "sales.Content.Create",
      "sales.Content.Edit",
      "sales.Content.Delete",
      // Inventory
      "inventory.Dashboard.View",
      "inventory.Master.View",
      "inventory.Content.View",
      "inventory.Content.Edit",
      // Purchasing
      "purchasing.Content.View",
      "purchasing.Content.Create",
      "purchasing.Content.Edit",
      "purchasing.Content.Delete",
      // Finance
      "finance.Content.View",
      "finance.Content.Create",
      "finance.Content.Edit",
      "finance.Content.Delete",
      // HR
      "hr.Content.View",
      "hr.Content.Create",
      "hr.Content.Edit",
      "hr.Content.Delete",
    ] as PermissionString[],
  },
  SALES: {
    modules: ["sales"] as ModuleName[],
    permissions: [
      "sales.Dashboard.View",
      "sales.Content.View",
      "sales.Content.Create",
      "sales.Content.Edit",
    ] as PermissionString[],
  },
  WAREHOUSE: {
    modules: ["inventory"] as ModuleName[],
    permissions: [
      "inventory.Dashboard.View",
      "inventory.Content.View",
      "inventory.Content.Edit",
    ] as PermissionString[],
  },
};
