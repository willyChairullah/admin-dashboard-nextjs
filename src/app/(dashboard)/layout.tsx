"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layouts/Navbar";
import SideBar from "@/components/layouts/SideBar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Automatically collapse sidebar on mobile
      if (mobile) {
        setIsSidebarCollapsed(true);
      } else {
        // On desktop, restore the previous state or default to false
        const savedState = localStorage.getItem("sidebarCollapsed");
        setIsSidebarCollapsed(savedState === "true");
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    // Save state for desktop
    if (!isMobile) {
      localStorage.setItem("sidebarCollapsed", newState.toString());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Overlay for mobile */}
        {isMobile && !isSidebarCollapsed && (
          <div className="mobile-overlay" onClick={toggleSidebar} />
        )}

        {/* Sidebar */}
        {!isMobile && (
          <div
            className={`fixed left-0 top-0 bottom-0 z-30 transition-transform duration-300`}
          >
            <SideBar
              isCollapsed={isSidebarCollapsed}
              onToggle={toggleSidebar}
              isMobile={false}
            />
          </div>
        )}

        {/* Mobile Sidebar */}
        {isMobile && (
          <SideBar
            isCollapsed={isSidebarCollapsed}
            onToggle={toggleSidebar}
            isMobile={true}
          />
        )}

        {/* Main Content Area */}
        <div
          className={`flex-1 main-content-transition ${
            !isMobile && !isSidebarCollapsed
              ? "ml-64"
              : !isMobile && isSidebarCollapsed
              ? "ml-20"
              : "ml-0"
          }`}
        >
          {/* Navbar */}
          <div className="sticky top-0 z-20 navbar-transition">
            <Navbar onSidebarToggle={toggleSidebar} />
          </div>

          {/* Main Content */}
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
