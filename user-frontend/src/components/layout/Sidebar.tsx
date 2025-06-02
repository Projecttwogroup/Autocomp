import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  TicketCheck,
  MessageSquare,
  PlusCircle,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation();

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && !isOpen) {
        toggleSidebar();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, toggleSidebar]);

  const navItems = [
    {
      label: "Home",
      icon: Home,
      href: "/",
    },
    {
      label: "My Requests",
      icon: TicketCheck,
      href: "/tickets",
    },
    {
      label: "Submit Request",
      icon: PlusCircle,
      href: "/submit",
    },
    {
      label: "Common Issues",
      icon: BookOpen,
      href: "/issues",
    },
    {
      label: "Contact Us",
      icon: MessageSquare,
      href: "/contact",
    },
  ];

  return (
    <aside
      className={cn(
        "sticky top-0 flex w-64 flex-col border-r bg-background transition-transform duration-300 md:translate-x-0 min-h-screen",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <nav className="flex-1 overflow-auto py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
