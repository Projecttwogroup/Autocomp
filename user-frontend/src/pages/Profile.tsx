
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { useEffect } from "react";

// Mock user data
const userData = {
  id: "USR-1001",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@company.example",
  department: "Marketing",
  position: "Senior Marketing Specialist",
  employeeId: "EMP-5678",
  joinDate: "2023-04-15",
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState("preferences");
  const { toast } = useToast();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
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
                  <AvatarImage src="https://i.pravatar.cc/192" alt={`${userData.firstName} ${userData.lastName}`} />
                  <AvatarFallback className="text-2xl">
                    {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h2 className="text-xl font-bold">{userData.firstName} {userData.lastName}</h2>
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Change Photo</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Profile Photo</DialogTitle>
                      <DialogDescription>
                        Upload a new profile photo. The image will be visible to other users.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="flex items-center justify-center">
                        <Avatar className="h-32 w-32">
                          <AvatarImage src="https://i.pravatar.cc/192" alt={`${userData.firstName} ${userData.lastName}`} />
                          <AvatarFallback className="text-4xl">
                            {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="picture">Upload Picture</Label>
                        <Input id="picture" type="file" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button 
                        onClick={() => {
                          toast({
                            title: "Success",
                            description: "Profile picture updated successfully.",
                          });
                        }}
                        className="bg-autocomp-500 hover:bg-autocomp-600"
                      >
                        Upload & Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                          <h3 className="text-lg font-medium">Email Notifications</h3>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="ticket-updates">Request Updates</Label>
                                <p className="text-sm text-muted-foreground">
                                  Receive notifications about your support requests
                                </p>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="ticket-updates"
                                  defaultChecked
                                  className="h-4 w-4 rounded border-gray-300 text-autocomp-600 focus:ring-autocomp-500"
                                />
                              </div>
                            </div>
                            
                            <hr className="border-t border-border" />
                            
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="system-announcements">System Announcements</Label>
                                <p className="text-sm text-muted-foreground">
                                  Important updates about the system and services
                                </p>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="system-announcements"
                                  defaultChecked
                                  className="h-4 w-4 rounded border-gray-300 text-autocomp-600 focus:ring-autocomp-500"
                                />
                              </div>
                            </div>
                            
                            <hr className="border-t border-border" />
                            
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="maintenance-notifications">Maintenance Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                  Scheduled maintenance and downtime alerts
                                </p>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="maintenance-notifications"
                                  defaultChecked
                                  className="h-4 w-4 rounded border-gray-300 text-autocomp-600 focus:ring-autocomp-500"
                                />
                              </div>
                            </div>
                            
                            <hr className="border-t border-border" />
                            
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label htmlFor="feedback-requests">Feedback Requests</Label>
                                <p className="text-sm text-muted-foreground">
                                  Requests to rate our service after request completion
                                </p>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="feedback-requests"
                                  defaultChecked
                                  className="h-4 w-4 rounded border-gray-300 text-autocomp-600 focus:ring-autocomp-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            onClick={() => {
                              toast({
                                title: "Preferences Updated",
                                description: "Your notification preferences have been saved.",
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
