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
  activeSubMenu: string | null; // Kembali ke single active submenu
  setActiveSubMenu: (id: string | null) => void;
  parentId?: string; // Tambahan untuk mengetahui parent dari sub-menu
}

const MenuItemComponent: React.FC<MenuItemComponentProps> = ({
  item,
  level = 0,
  shouldShowExpanded,
  isActive,
  onItemClick,
  activeSubMenu,
  setActiveSubMenu,
  parentId,
}) => {
  const pathname = usePathname(); // Move hook to top level
  const hasChildren = item.children && item.children.length > 0;
  const paddingLeft = level > 0 ? `${8 + level * 16}px` : "12px";
  const submenuRef = useRef<HTMLDivElement>(null); // Ref untuk container sub-menu
  const [submenuHeight, setSubmenuHeight] = useState<number>(0); // State untuk tinggi animasi

  // Gunakan activeSubMenu dari parent untuk menentukan apakah sub-menu ini terbuka
  const isSubMenuOpen = activeSubMenu === item.id;

  useEffect(() => {
    // Update tinggi submenu dengan smooth transition
    if (submenuRef.current) {
      if (isSubMenuOpen) {
        // Saat membuka: set height ke auto dulu untuk mendapatkan scrollHeight
        const scrollHeight = submenuRef.current.scrollHeight;
        setSubmenuHeight(scrollHeight);
      } else {
        // Saat menutup: set height ke 0
        setSubmenuHeight(0);
      }
    }
  }, [isSubMenuOpen]);

  // Buka sub-menu jika ada sub-item yang aktif
  useEffect(() => {
    if (
      hasChildren &&
      item.children.some(
        (child) =>
          pathname === child.href || pathname.startsWith(child.href + "/")
      )
    ) {
      // Set active submenu ke item yang berisi halaman aktif
      setActiveSubMenu(item.id);
    }
  }, [pathname, hasChildren, item.children, item.id, setActiveSubMenu]);

  const toggleSubMenu = () => {
    if (hasChildren) {
      // Jika sudah terbuka, tutup. Jika belum, buka dan tutup yang lain
      setActiveSubMenu(isSubMenuOpen ? null : item.id);
    }
  };

  return (
    <>
      <li>
        {hasChildren ? (
          <button
            onClick={toggleSubMenu}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-lg ${
              isActive
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            style={{ paddingLeft }}
          >
            <div className="flex items-center">
              {level === 0 && (
                <span className={`text-lg ${shouldShowExpanded ? "mr-3" : ""}`}>
                  {item.id === "dashboard" && "📊"}
                  {item.id === "sales" && "💼"}
                  {item.id === "inventory" && "📦"}
                  {item.id === "purchasing" && "🛒"}
                  {item.id === "finance" && "💰"}
                  {item.id === "hr" && "👥"}
                  {item.id === "settings" && "⚙️"}
                  {item.id === "management" && "🔧"}
                </span>
              )}
              {shouldShowExpanded && (
                <>
                  {level > 0 && (
                    <span className="mr-3 text-gray-500 dark:text-gray-400">
                      •
                    </span>
                  )}
                  <span className="font-medium whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                </>
              )}
            </div>
            {shouldShowExpanded && hasChildren && (
              <svg
                className={`w-4 h-4 transform transition-transform duration-300 ease-in-out ${
                  isSubMenuOpen ? "rotate-[270deg]" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </button>
        ) : (
          <Link
            href={item.href}
            className={`flex items-center px-3 py-3 rounded-lg ${
              isActive
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            title={!shouldShowExpanded ? item.label : undefined}
            onClick={() => {
              // Ketika mengklik sub-menu item, tutup semua dropdown
              // tapi tetap buka dropdown yang berisi item yang dipilih
              if (level > 0 && parentId) {
                setActiveSubMenu(parentId);
              } else {
                setActiveSubMenu(null);
              }
              onItemClick();
            }}
            style={{ paddingLeft }}
          >
            {level === 0 && (
              <span className={`text-lg ${shouldShowExpanded ? "mr-3" : ""}`}>
                {item.id === "dashboard" && "📊"}
                {item.id === "sales" && "💼"}
                {item.id === "inventory" && "📦"}
                {item.id === "purchasing" && "🛒"}
                {item.id === "finance" && "💰"}
                {item.id === "hr" && "👥"}
                {item.id === "settings" && "⚙️"}
                {item.id === "management" && "🔧"}
              </span>
            )}
            {shouldShowExpanded && (
              <>
                {level > 0 && (
                  <span className="mr-3 text-gray-500 dark:text-gray-400">
                    •
                  </span>
                )}
                <span className="font-medium whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
              </>
            )}
          </Link>
        )}
      </li>

      {/* Animated submenu container */}
      {hasChildren && shouldShowExpanded && (
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            height: `${submenuHeight}px`,
          }}
        >
          <div ref={submenuRef} className="space-y-1 pt-1">
            {item.children?.map((child) => {
              const isChildActive =
                pathname === child.href ||
                pathname.startsWith(child.href + "/");
              return (
                <MenuItemComponent
                  key={child.id}
                  item={child}
                  level={level + 1}
                  shouldShowExpanded={shouldShowExpanded}
                  isActive={isChildActive}
                  onItemClick={onItemClick}
                  activeSubMenu={activeSubMenu}
                  setActiveSubMenu={setActiveSubMenu}
                  parentId={item.id}
                />
              );
            })}
          </div>
        </div>
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
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null); // State untuk accordion behavior
  const { user, loading } = useCurrentUser();

  // Static menu data with roles added
  const allMenuItems = useMemo(() => {
    return [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: "",
        href: "/",
        children: [],
        roles: ["OWNER"], // Added roles
      },
      {
        id: "sales",
        label: "Sales",
        icon: "",
        href: "#",
        roles: ["SALES", "ADMIN", "OWNER"], // Added roles
        children: [
          {
            id: "sales-dashboard",
            label: "Sales Dashboard",
            icon: "",
            href: "/sales",
            children: [],
            roles: ["SALES", "OWNER"],
          },
          {
            id: "sales-field",
            label: "Sales Field (SF)",
            icon: "",
            href: "/sales/fields",
            children: [],
            roles: ["SALES", "OWNER"],
          },
          {
            id: "field-visits",
            label: "Field Visits",
            icon: "",
            href: "/sales/field-visits",
            children: [],
            roles: ["SALES", "OWNER"],
          },
          {
            id: "orders",
            label: "Orders",
            icon: "",
            href: "/sales/orders",
            children: [],
            roles: ["SALES", "OWNER"],
          },
          {
            id: "order-history",
            label: "Order History",
            icon: "",
            href: "/sales/order-history",
            children: [],
            roles: ["SALES", "OWNER"],
          },
          {
            id: "invoice",
            label: "Invoice",
            icon: "",
            href: "/sales/invoice",
            children: [],
            roles: ["OWNER", "ADMIN"],
          },
          {
            id: "daftar-po",
            label: "Daftar PO",
            icon: "",
            href: "/sales/daftar-po",
            children: [],
            roles: ["OWNER", "ADMIN"],
          },
        ],
      },
      {
        id: "inventory",
        label: "Inventory",
        icon: "",
        href: "#",
        roles: ["WAREHOUSE", "ADMIN", "OWNER"], // Added roles
        children: [
          {
            id: "stock-dashboard",
            label: "Stock Dashboard",
            icon: "",
            href: "/inventory/dashboard",
            children: [],
            roles: ["WAREHOUSE", "ADMIN", "OWNER"],
          },
          {
            id: "item-list",
            label: "Item List",
            icon: "",
            href: "/inventory/items",
            children: [],
            roles: ["WAREHOUSE", "ADMIN", "OWNER"],
          },
          {
            id: "Produksi",
            label: "Produksi",
            icon: "",
            href: "/inventory/produksi",
            children: [],
            roles: ["WAREHOUSE", "ADMIN", "OWNER"],
          },
          {
            id: "manajemen-stok",
            label: "Stok Manajemen",
            icon: "",
            href: "/inventory/manajemen-stok",
            children: [],
            roles: ["WAREHOUSE", "ADMIN", "OWNER"],
          },
          {
            id: "stok-opname",
            label: "Stok Opname",
            icon: "",
            href: "/inventory/stok-opname",
            children: [],
            roles: ["WAREHOUSE", "ADMIN", "OWNER"],
          },
          {
            id: "konfirmasi-stok",
            label: "Konfirmasi Stok Barang",
            icon: "",
            href: "/inventory/konfirmasi-stok",
            children: [],
            roles: ["WAREHOUSE", "ADMIN", "OWNER"],
          },
        ],
      },
      {
        id: "purchasing",
        label: "Purchasing",
        icon: "",
        href: "#",
        roles: ["ADMIN", "OWNER"], // Added roles
        children: [
          {
            id: "purchase-order",
            label: "Purchase Order (PO)",
            icon: "",
            href: "/purchasing/orders",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
          {
            id: "po-payments",
            label: "PO Payments",
            icon: "",
            href: "/purchasing/payments",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
        ],
      },
      {
        id: "finance",
        label: "Finance",
        icon: "",
        href: "#",
        roles: ["ADMIN", "OWNER"], // Added roles
        children: [
          {
            id: "financial-dashboard",
            label: "Financial Dashboard",
            icon: "📊",
            href: "/management/finance",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
          {
            id: "cash-flow",
            label: "Cash Flow",
            icon: "💵",
            href: "/management/finance/cash-flow",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
          {
            id: "profitability",
            label: "Profitability",
            icon: "📈",
            href: "/management/finance/profitability",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
          {
            id: "revenue-analytics",
            label: "Revenue Analytics",
            icon: "📊",
            href: "/management/finance/revenue-analytics",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
          {
            id: "kpi-metrics",
            label: "KPI Metrics",
            icon: "📊",
            href: "/management/finance/kpi-metrics",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
        ],
      },
      {
        id: "hr",
        label: "HR",
        icon: "",
        href: "#",
        roles: ["ADMIN", "OWNER"], // Added roles
        children: [
          {
            id: "attendance",
            label: "Attendance",
            icon: "",
            href: "/hr/attendance",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
        ],
      },
      {
        id: "settings",
        label: "Settings",
        icon: "",
        href: "#",
        roles: ["ADMIN", "OWNER"], // Added roles
        children: [
          {
            id: "user-management",
            label: "User Management",
            icon: "",
            href: "/settings/users",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
          {
            id: "roles",
            label: "Roles",
            icon: "",
            href: "/settings/roles",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
          {
            id: "permissions",
            label: "Permissions",
            icon: "",
            href: "/settings/permissions",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
        ],
      },
      {
        id: "management",
        label: "Management",
        icon: "",
        href: "/management",
        roles: ["ADMIN", "OWNER"],
        children: [
          {
            id: "kategori",
            label: "Kategori",
            icon: "",
            href: "/management/kategori",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
          {
            id: "produk",
            label: "Produk",
            icon: "",
            href: "/management/produk",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
          {
            id: "me",
            label: "Me (Demo)",
            icon: "",
            href: "/management/me",
            children: [],
            roles: ["ADMIN"],
          },
          {
            id: "users",
            label: "Users",
            icon: "",
            href: "/management/users",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
          {
            id: "sales-target",
            label: "Sales Target",
            icon: "",
            href: "/management/sales-target",
            children: [],
            roles: ["ADMIN", "OWNER"],
          },
          {
            id: "field-visits",
            label: "Field Visit Logs",
            icon: "",
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
    <>
      <div
        className={`
        sidebar-transition bg-white dark:bg-gray-900 shadow-md overflow-y-scroll overflow-x-clip no-scrollbar 
        ${
          isMobile
            ? `mobile-sidebar w-[30vw] min-w-[240px] ${
                !isCollapsed ? "open" : ""
              }`
            : `${
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
          cursor-pointer absolute -right-4 top-9 z-[60] w-9 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700"
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
        <nav className="flex-1 overflow-y-auto">
          {menuItems.length > 0 ? (
            <ul className="space-y-2 px-3 mt-4 pb-24">
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
                    activeSubMenu={activeSubMenu}
                    setActiveSubMenu={setActiveSubMenu}
                    parentId={undefined}
                  />
                );
              })}
            </ul>
          ) : (
            <div className="flex justify-center items-center h-screen pb-44">
              <div className="px-3 py-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {shouldShowExpanded ? "No accessible modules" : "N/A"}
                </p>
              </div>
            </div>
          )}
        </nav>

        {/* Sticky Footer */}
      </div>
      <div className="sticky bottom-0 left-0 right-0 px-3 pb-3 pt-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            © 2025 Indana ERP
          </p>
        </div>
      </div>
    </>
  );
}
