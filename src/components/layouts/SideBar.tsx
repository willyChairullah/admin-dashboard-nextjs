"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useCurrentUser, filterMenuByRole } from "@/hooks/useCurrentUser";

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  children: MenuItem[];
  roles?: string[]; // Added roles property
}

interface SideBarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

interface MenuItemComponentProps {
  item: MenuItem;
  level?: number;
  shouldShowExpanded: boolean;
  isActive: boolean;
  onItemClick: () => void;
}

const MenuItemComponent: React.FC<MenuItemComponentProps> = ({
  item,
  level = 0,
  shouldShowExpanded,
  isActive,
  onItemClick,
}) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const pathname = usePathname(); // Move hook to top level
  const hasChildren = item.children && item.children.length > 0;
  const paddingLeft = level > 0 ? `${8 + level * 16}px` : "12px";
  const submenuRef = useRef<HTMLUListElement>(null); // Tambahkan useRef
  const [submenuHeight, setSubmenuHeight] = useState<number | undefined>(0); // State untuk tinggi

  // Gunakan useEffect untuk membuka sub-menu jika ada sub-item yang aktif
  useEffect(() => {
    if (
      hasChildren &&
      item.children.some(child => pathname.startsWith(child.href))
    ) {
      setIsSubMenuOpen(true);
    }
  }, [pathname, hasChildren, item.children]);

  useEffect(() => {
    // Jika sub-menu terbuka, atur tinggi ke tinggi asli, jika tidak, atur ke 0
    if (isSubMenuOpen) {
      setSubmenuHeight(submenuRef.current?.scrollHeight || 0);
    } else {
      setSubmenuHeight(0);
    }
  }, [isSubMenuOpen]);

  // Juga pastikan sub-menu terbuka jika path-nya cocok
  useEffect(() => {
    if (
      hasChildren &&
      item.children.some(child => pathname.startsWith(child.href))
    ) {
      setIsSubMenuOpen(true);
    }
  }, [pathname, hasChildren, item.children]);

  const toggleSubMenu = () => {
    if (hasChildren) {
      setIsSubMenuOpen(!isSubMenuOpen);
    }
  };

  return (
    <>
      <li>
        {hasChildren ? (
          <button
            onClick={toggleSubMenu}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors ${
              isActive
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            style={{ paddingLeft }}
          >
            <div className="flex items-center">
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {shouldShowExpanded && (
                <span className="ml-3 font-medium whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              )}
            </div>
            {shouldShowExpanded && hasChildren && (
              <span
                className={`transform transition-transform ${
                  isSubMenuOpen ? "rotate-90" : ""
                }`}
              >
                ▶
              </span>
            )}
          </button>
        ) : (
          <Link
            href={item.href}
            className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
              isActive
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            title={!shouldShowExpanded ? item.label : undefined}
            onClick={onItemClick}
            style={{ paddingLeft }}
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            {shouldShowExpanded && (
              <span className="ml-3 font-medium whitespace-nowrap overflow-hidden">
                {item.label}
              </span>
            )}
          </Link>
        )}
      </li>

      {/* Render children if expanded */}
      {hasChildren && isSubMenuOpen && shouldShowExpanded && (
        <ul className="space-y-1">
          {item.children?.map(child => {
            const isChildActive =
              pathname === child.href || pathname.startsWith(child.href + "/");
            return (
              <MenuItemComponent
                key={child.id}
                item={child}
                level={level + 1}
                shouldShowExpanded={shouldShowExpanded}
                isActive={isChildActive}
                onItemClick={onItemClick}
              />
            );
          })}
        </ul>
      )}
    </>
  );
};

export default function SideBar({
  isCollapsed,
  onToggle,
  isMobile = false,
}: SideBarProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const { user, loading } = useCurrentUser();

  // Static menu data with roles added
  const allMenuItems = useMemo(() => {
    return [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: "🏠",
        href: "/",
        children: [],
        roles: ["OWNER"], // Added roles
      },
      {
        id: "sales",
        label: "Sales",
        icon: "🛒",
        href: "#",
        roles: ["SALES", "ADMIN", "OWNER"], // Added roles
        children: [
          {
            id: "sales-dashboard",
            label: "Sales Dashboard",
            icon: "📊",
            href: "/sales",
            children: [],
            roles: ["SALES", "OWNER"],
          },
          {
            id: "sales-field",
            label: "Sales Field (SF)",
            icon: "📝",
            href: "/sales/fields",
            children: [],
            roles: ["SALES", "OWNER"],
          },
          {
            id: "field-visits",
            label: "Field Visits",
            icon: "🚚",
            href: "/sales/field-visits",
            children: [],
            roles: ["SALES", "OWNER"],
          },
          {
            id: "orders",
            label: "Orders",
            icon: "📦",
            href: "/sales/orders",
            children: [],
            roles: ["SALES", "OWNER"],
          },
          {
            id: "order-history",
            label: "Order History",
            icon: "📜",
            href: "/sales/order-history",
            children: [],
            roles: ["SALES", "OWNER"],
          },
          {
            id: "Invoice",
            label: "Invoice",
            icon: "📜",
            href: "/sales/invoice",
            children: [],
            roles: ["OWNER", "ADMIN"],
          },
          {
            id: "daftar-po",
            label: "Daftar PO",
            icon: "📋",
            href: "/sales/daftar-po",
            children: [],
            roles: ["OWNER", "ADMIN"],
          },
        ],
      },
      {
        id: "inventory",
        label: "Inventory",
        icon: "📦",
        href: "#",
        roles: ["WAREHOUSE", "ADMIN", "OWNER"], // Added roles
        children: [
          {
            id: "stock-dashboard",
            label: "Stock Dashboard",
            icon: "📊",
            href: "/inventory/dashboard",
            children: [],
            roles: ["WAREHOUSE", "ADMIN", "OWNER"],
          },
          {
            id: "konfirmasi-stok",
            label: "Konfirmasi Stok",
            icon: "📋",
            href: "/inventory/konfirmasi-stok",
            children: [],
            roles: ["WAREHOUSE", "ADMIN", "OWNER"],
          },
          {
            id: "Produksi",
            label: "Produksi",
            icon: "🏭",
            href: "/inventory/produksi",
            children: [],
            roles: ["WAREHOUSE", "ADMIN", "OWNER"],
          },
          {
            id: "manajemen-stok",
            label: "Stok Manajemen",
            icon: "⚖️",
            href: "/inventory/manajemen-stok",
            children: [],
            roles: ["WAREHOUSE", "ADMIN", "OWNER"],
          },
          {
            id: "stok-opname",
            label: "Stok Opname",
            icon: "🔍",
            href: "/inventory/stok-opname",
            children: [],
            roles: ["WAREHOUSE", "ADMIN", "OWNER"],
          },
        ],
      },
      {
        id: "purchasing",
        label: "Purchasing",
        icon: "🛍️",
        href: "#",
        roles: ["ADMIN", "OWNER"], // Added roles
        children: [
          {
            id: "purchase-order",
            label: "Purchase Order (PO)",
            icon: "📜",
            href: "/purchasing/orders",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
          {
            id: "po-payments",
            label: "PO Payments",
            icon: "💰",
            href: "/purchasing/payments",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
        ],
      },
      {
        id: "finance",
        label: "Finance",
        icon: "💰",
        href: "#",
        roles: ["ADMIN", "OWNER"], // Added roles
        children: [
          {
            id: "revenue",
            label: "Revenue",
            icon: "📈",
            href: "/finance/revenue",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
          {
            id: "expenses",
            label: "Expenses",
            icon: "📉",
            href: "/finance/expenses",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
        ],
      },
      {
        id: "hr",
        label: "HR",
        icon: "👥",
        href: "#",
        roles: ["ADMIN", "OWNER"], // Added roles
        children: [
          {
            id: "attendance",
            label: "Attendance",
            icon: "📅",
            href: "/hr/attendance",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
        ],
      },
      {
        id: "settings",
        label: "Settings",
        icon: "⚙️",
        href: "#",
        roles: ["ADMIN", "OWNER"], // Added roles
        children: [
          {
            id: "user-management",
            label: "User Management",
            icon: "👤",
            href: "/settings/users",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
          {
            id: "roles",
            label: "Roles",
            icon: "🔑",
            href: "/settings/roles",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
          {
            id: "permissions",
            label: "Permissions",
            icon: "🔒",
            href: "/settings/permissions",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
        ],
      },
      {
        id: "management",
        label: "Management",
        icon: "📊",
        href: "/management",
        roles: ["ADMIN", "OWNER"],
        children: [
          {
            id: "kategori",
            label: "Kategori",
            icon: "🏷️",
            href: "/management/kategori",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
          {
            id: "produk",
            label: "Produk",
            icon: "📦",
            href: "/management/produk",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
          {
            id: "me",
            label: "Me (Demo)",
            icon: "👤",
            href: "/management/me",
            children: [],
            roles: ["ADMIN"],
          },
          {
            id: "users",
            label: "Users",
            icon: "👥",
            href: "/management/users",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
          {
            id: "sales-target",
            label: "Sales Target",
            icon: "🎯",
            href: "/management/sales-target",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
          {
            id: "field-visits",
            label: "Field Visit Logs",
            icon: "📍",
            href: "/management/field-visits",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
        ],
      },
    ];
  }, []);

  // Filter menu items based on user role
  const menuItems = useMemo(() => {
    if (loading || !user?.role) return [];
    return filterMenuByRole(allMenuItems, user.role);
  }, [allMenuItems, user?.role, loading]);

  // Determine if sidebar should show expanded content
  const shouldShowExpanded = isMobile
    ? !isCollapsed
    : !isCollapsed || isHovered;

  const handleMouseEnter = () => {
    if (!isMobile) {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        setHoverTimeout(null);
      }
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      const timeout = setTimeout(() => {
        setIsHovered(false);
      }, 200);
      setHoverTimeout(timeout);
    }
  };

  const handleItemClick = () => {
    // Close sidebar on mobile after navigation
    if (isMobile) {
      onToggle();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return (
    <div
      className={`
        sidebar-transition bg-white dark:bg-gray-900 shadow-md overflow-y-scroll overflow-x-clip no-scrollbar 
        ${
          isMobile
            ? `mobile-sidebar w-[30vw] min-w-[240px] ${
                !isCollapsed ? "open" : ""
              }`
            : `transition-all duration-300 ${
                shouldShowExpanded ? "w-64" : "w-20"
              } h-screen border-r border-gray-200 dark:border-gray-700 relative`
        }
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        // When collapsed and hovered on desktop, make it appear above content
        ...(!isMobile &&
          isCollapsed &&
          isHovered && {
            position: "fixed",
            left: "0",
            top: "0",
            bottom: "0",
            zIndex: 50,
            boxShadow: "4px 0 20px rgba(0, 0, 0, 0.15)",
          }),
      }}
    >
      {/* Navbar Area in Sidebar */}
      <div className="h-18 p-4 border-gray-200 dark:border-gray-700 flex items-center bg-white dark:bg-gray-900">
        {shouldShowExpanded ? (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-600 mr-3">
              <Image
                src="/logocv.svg"
                alt="Indana ERP Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>

            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Indana ERP
            </h1>
          </div>
        ) : (
          <div className="flex justify-center w-full">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-600">
              <Image
                src="/logocv.svg"
                alt="Indana ERP Logo"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating Toggle Button - Only on Desktop */}
      {!isMobile && (
        <button
          onClick={onToggle}
          className="
          cursor-pointer absolute -right-4 top-9 z-[60] w-9 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700"
          style={{
            transform: "translateY(-50%)",
          }}
        >
          <span className="text-xs text-gray-600 dark:text-gray-300 font-bold">
            {isCollapsed ? ">|" : "|<"}
          </span>
        </button>
      )}

      {/* Menu Items */}
      <nav className="mt-4 flex-1 overflow-y-auto">
        {menuItems.length > 0 ? (
          <ul className="space-y-2 px-3">
            {menuItems.map((item: MenuItem) => {
              // --- PERUBAHAN DIMULAI DI SINI ---
              // Logika baru untuk isActive:
              // 1. Cek jika pathname sama persis
              // 2. Cek jika pathname dimulai dengan href (untuk sub-path)
              const isActive =
                pathname === item.href ||
                (item.href !== "#" && pathname.startsWith(item.href + "/")) ||
                (item.children &&
                  item.children.some(
                    (child: MenuItem) =>
                      child.href === pathname ||
                      pathname.startsWith(child.href + "/")
                  )) ||
                false;
              // --- PERUBAHAN BERAKHIR DI SINI ---

              return (
                <MenuItemComponent
                  key={item.id}
                  item={item}
                  shouldShowExpanded={shouldShowExpanded}
                  isActive={isActive}
                  onItemClick={handleItemClick}
                />
              );
            })}
          </ul>
        ) : (
          <div className="flex justify-center items-center h-screen pb-44">
            <div className="px-3 py-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {shouldShowExpanded ? "No accessible modules" : "🚫"}
              </p>
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      {shouldShowExpanded && (
        <div className="mt-4 px-3 pb-3">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              © 2025 Indana ERP
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
