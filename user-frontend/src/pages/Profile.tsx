import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { User } from "lucide-react";

// Get user data from localStorage
const getUserData = () => {
  const userJson = localStorage.getItem("autocomp-user");
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch (e) {
      console.error("Error parsing user data from localStorage", e);
    }
  }
  // Fallback data if localStorage is empty or invalid
  return {
    id: "",
    name: "User",
    email: "user@example.com",
    department: "",
    role: "",
  };
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState("preferences");
  const [userData, setUserData] = useState(getUserData);
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Scroll to top when component mounts and get fresh user data
  useEffect(() => {
    window.scrollTo(0, 0);
    setUserData(getUserData());

    fetch(`https://localhost:7181/api/user/${userData.id}`)
      .then((res) => res.json())
      .then((data) => {
        setEmailNotifications(data.receiveStatusEmails);
      });
  }, []);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          View and manage your account settings.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl bg-autocomp-100 text-autocomp-600 dark:bg-autocomp-800 dark:text-autocomp-300">
                    {userData.name
                      ? userData.name.charAt(0).toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h2 className="text-xl font-bold">
                    {userData.name || "User"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {userData.email}
                  </p>
                </div>

                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                  </TabsList>

                  <TabsContent value="preferences" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>
                          Choose how and when you receive notifications.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">
                            Email Notifications
                          </h3>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="ticket-updates">
                                  Request Updates
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Receive notifications about your support
                                  requests
                                </p>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="ticket-updates"
                                  checked={emailNotifications}
                                  onChange={(e) =>
                                    setEmailNotifications(e.target.checked)
                                  }
                                  className="h-4 w-4 rounded border-gray-300 text-autocomp-600 focus:ring-autocomp-500"
                                />
                              </div>
                            </div>

                            <hr className="border-t border-border" />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            onClick={async () => {
                              await fetch(
                                `https://localhost:7181/api/user/update-preferences/${userData.id}`,
                                {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify(emailNotifications),
                                }
                              );

                              toast({
                                title: "Preferences Updated",
                                description:
                                  "Your notification preferences have been saved.",
                              });
                            }}
                            className="bg-autocomp-500 hover:bg-autocomp-600"
                          >
                            Save Preferences
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
