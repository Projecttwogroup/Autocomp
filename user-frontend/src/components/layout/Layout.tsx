import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { usePerformance } from "@/hooks/use-performance";
import { useMobile } from "@/hooks/use-mobile";
import { useRoutePrefetch } from "@/hooks/use-route-prefetch";
import { usePreferences } from "@/hooks/use-preferences";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function Layout() {
  const { preferences } = usePreferences();
  const { isMobile, useSwipe } = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile && !preferences.sidebarCollapsed);
  
  // Track component performance
  usePerformance('Layout', {
    trackMounts: true,
    trackRenders: true,
    metadata: { isMobile }
  });

  // Enable route prefetching
  useRoutePrefetch();

  // Handle mobile swipe gestures
  useSwipe({
    onSwipeRight: () => !sidebarOpen && setSidebarOpen(true),
    onSwipeLeft: () => sidebarOpen && setSidebarOpen(false),
    threshold: 50
  });

  // Update sidebar state based on preferences and mobile status
  useEffect(() => {
    setSidebarOpen(!isMobile && !preferences.sidebarCollapsed);
  }, [isMobile, preferences.sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 pt-14">
        <div className={cn("w-64", !sidebarOpen && "hidden md:block")}>
          <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />
        </div>
        <main className="flex-1">
          <div className="container p-6">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
