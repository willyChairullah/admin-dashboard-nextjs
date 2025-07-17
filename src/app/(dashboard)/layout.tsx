
"use client";

import { useState, useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/layouts/Navbar";
import SideBar from "@/components/layouts/SideBar";
import { SessionHandler } from "@/components/auth/SessionHandler";

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
      
      // Automatically handle sidebar state
      if (mobile) {
        setIsSidebarCollapsed(true);
      } else {
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
    
    // Save state only for desktop
    if (!isMobile) {
      localStorage.setItem("sidebarCollapsed", newState.toString());
    }
  };

  // Calculate main content margin based on sidebar state
  const getMainContentMargin = () => {
    if (isMobile) return "ml-0";
    return isSidebarCollapsed ? "ml-20" : "ml-64";
  };

  return (
    <SessionProvider>
      <SessionHandler />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          {/* Mobile Overlay */}
          {isMobile && !isSidebarCollapsed && (
            <div 
              className="fixed inset-0 bg-black/50 z-40" 
              onClick={toggleSidebar} 
            />
          )}

          {/* Sidebar for Desktop */}
          {!isMobile && (
            <div 
              className={`
                fixed left-0 top-0 bottom-0 z-30 
                transition-all duration-300 
                ${isSidebarCollapsed ? 'w-20' : 'w-64'}
              `}
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

          {/* Main Content Area - Fully Responsive */}
          <div 
            className={`
              flex-1 transition-all duration-300 
              ${getMainContentMargin()} 
              w-[calc(100% - theme(spacing.64))] 
              max-w-full overflow-x-hidden
            `}
          >
            {/* Sticky Navbar */}
            <div className="sticky top-0 z-20 navbar-transition">
              <Navbar onSidebarToggle={toggleSidebar} />
            </div>

            {/* Main Content with Full Width */}
            <main className="w-full max-w-full px-4 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SessionProvider>
  );
}
