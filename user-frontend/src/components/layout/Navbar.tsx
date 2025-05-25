import { Bell, Menu, Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  toggleSidebar: () => void;
}

type Notification = {
  id: number;
  title: string;
  message: string;
  createdAt: string;
};

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { toast } = useToast();
  const [hasNotifications, setHasNotifications] = useState<boolean | null>(null);
  const userIdRef = useRef(localStorage.getItem("autocomp-user-id"));

  useEffect(() => {
    if (!userIdRef.current) return;

    const fetchUnseen = () => {
      fetch(`https://localhost:7181/api/notification/${userIdRef.current}/has-unseen`)
        .then((res) => res.json())
        .then((data) => {
          setHasNotifications(data.hasUnseen);
        })
        .catch((err) => {
          console.error("Error checking unseen notifications:", err);
        });
    };

    fetchUnseen(); // run immediately on mount

    const intervalId = setInterval(fetchUnseen, 5000); // then every 5s
    return () => {
      clearInterval(intervalId);
    }
  }, []);

  const navigate = useNavigate();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.className = newTheme;
    localStorage.setItem("theme", newTheme);
  };

  const fetchNotifications = async () => {
    const userId = localStorage.getItem("autocomp-user-id");

    try {
      const response = await fetch(
        `https://localhost:7181/api/notification/${userId}`
      );
      const data: Notification[] = await response.json();
      await fetch(
        `https://localhost:7181/api/notification/${userId}/mark-seen`,
        {
          method: "POST",
        }
      );

      setHasNotifications(false);

      if (data.length === 0) {
        toast({
          title: "Notifications",
          description: "You have no new notifications",
        });
      } else {
        toast({
          title: "Notifications",
          description: (
            <div className="space-y-1">
              {data.map((n) => (
                <div key={n.id}>
                  <strong>{n.title}</strong>: {n.message}
                </div>
              ))}
            </div>
          ),
        });
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Unable to fetch notifications.",
      });
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.className = initialTheme;
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-lg bg-autocomp-500 p-1.5">
              <svg
                xmlns="https://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M20 7h-3a2 2 0 0 0-2 2v1H9V9a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-1h6v1a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
              </svg>
            </div>
            <span className="font-bold text-lg hidden sm:inline-flex">
              AutoComp
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={fetchNotifications}
          >
            <Bell className="h-5 w-5" />
            {hasNotifications === true && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-autocomp-500" />
            )}

            <span className="sr-only">Notifications</span>
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border border-border"
              >
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  localStorage.removeItem("autocomp-auth");
                  localStorage.removeItem("autocomp-user");
                  localStorage.removeItem("autocomp-user-id");

                  //  Force App.tsx to re-evaluate auth status
                  window.dispatchEvent(new Event("storage"));
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
