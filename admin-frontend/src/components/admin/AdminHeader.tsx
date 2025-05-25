import React from "react";
import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const AdminHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    // Clear all admin-related items from localStorage
    localStorage.removeItem("autocomp-admin-id");
    localStorage.removeItem("autocomp-admin");
    localStorage.removeItem("autocomp-admin-auth");

    // Notify other components about the change
    window.dispatchEvent(new Event("storage"));

    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the admin portal",
    });

    // Redirect to login page
    navigate("/");
  };

  return (
    <header className="bg-card shadow-sm dark:shadow-md dark:shadow-black/10 h-16 flex items-center px-4 md:px-6">
      <div className="flex-1 flex items-center">
        {/* Removed search bar */}
      </div>
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-1 text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-auto">
              {[1, 2, 3].map((i) => (
                <DropdownMenuItem key={i} className="py-2 cursor-pointer">
                  <div>
                    <p className="font-medium">New Request Received</p>
                    <p className="text-sm text-muted-foreground">
                      John Doe submitted a new support request #REQ-{1000 + i}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      5 mins ago
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            {/* Removed "View all" button and separator */}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/20 text-primary">
                  A
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm hidden md:block text-foreground">
                Admin
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminHeader;
