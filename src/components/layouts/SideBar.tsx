"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  href: string;
}

const menuItems: MenuItem[] = [
  {
    id: "beranda",
    name: "Beranda",
    icon: "🏠",
    href: "/",
  },
  {
    id: "pengguna",
    name: "Pengguna",
    icon: "👥",
    href: "/users",
  },
  {
    id: "produk",
    name: "Produk",
    icon: "📦",
    href: "/products",
  },
  {
    id: "penjualan",
    name: "Penjualan",
    icon: "💰",
    href: "/sales",
  },
  {
    id: "laporan",
    name: "Laporan",
    icon: "📊",
    href: "/reports",
  },
  {
    id: "pengaturan",
    name: "Pengaturan",
    icon: "⚙️",
    href: "/settings",
  },
];

interface SideBarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export default function SideBar({
  isCollapsed,
  onToggle,
  isMobile = false,
}: SideBarProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // Determine if sidebar should show expanded content
  // On mobile, always show expanded when open, don't use hover
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
      // Add a small delay before hiding to prevent flickering
      const timeout = setTimeout(() => {
        setIsHovered(false);
      }, 100);
      setHoverTimeout(timeout);
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
        sidebar-transition bg-white dark:bg-gray-900 shadow-md 
        ${
          isMobile
            ? `mobile-sidebar ${!isCollapsed ? "open" : ""}`
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
            <Image
              src="/favicon.ico"
              alt="Indana ERP Logo"
              width={32}
              height={32}
              className="mr-3"
            />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Indana
            </h1>
          </div>
        ) : (
          <div className="flex justify-center w-full">
            <Image
              src="/favicon.ico"
              alt="Indana ERP Logo"
              width={30}
              height={30}
            />
          </div>
        )}
      </div>

      {/* Floating Toggle Button - Only on Desktop */}
      {!isMobile && (
        <button
          onClick={onToggle}
          className="absolute -right-4 top-9 z-[60] w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700"
          style={{
            transform: "translateY(-50%)",
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span className="text-xs text-gray-600 dark:text-gray-300 font-bold">
            {isCollapsed ? ">|" : "|<"}
          </span>
        </button>
      )}

      {/* Menu Items */}
      <nav className="mt-4 flex-1 overflow-y-auto">
        <ul className="space-y-2 px-3">
          {menuItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title={!shouldShowExpanded ? item.name : undefined}
                  onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (isMobile) {
                      onToggle();
                    }
                  }}
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  {shouldShowExpanded && (
                    <span className="ml-3 font-medium whitespace-nowrap overflow-hidden">
                      {item.name}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {shouldShowExpanded && (
        <div className="absolute bottom-4 left-4 right-4">
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
