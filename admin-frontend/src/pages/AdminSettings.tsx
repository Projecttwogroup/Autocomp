import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme/ThemeProvider";

const AdminSettings = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme);

  const handleSavePreferences = () => {
    setTheme(selectedTheme);
    toast({
      title: "Preferences Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          </div>

          <Tabs defaultValue="preferences">
            <TabsList className="grid w-full md:w-[400px] grid-cols-2">
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Customize your dashboard experience and notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Dashboard Theme</Label>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            id="light" 
                            name="theme" 
                            checked={selectedTheme === 'light'}
                            onChange={() => setSelectedTheme('light')}
                          />
                          <Label htmlFor="light">Light</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            id="dark" 
                            name="theme" 
                            checked={selectedTheme === 'dark'}
                            onChange={() => setSelectedTheme('dark')}
                          />
                          <Label htmlFor="dark">Dark</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Notifications</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="emailNotifications" defaultChecked />
                          <Label htmlFor="emailNotifications">Email notifications for new requests</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSavePreferences}>Save Preferences</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="templates">
              <Card>
                <CardHeader>
                  <CardTitle>Email Templates</CardTitle>
                  <CardDescription>
                    Customize the email templates sent to users.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="templateType">Template Type</Label>
                      <select
                        id="templateType"
                        className="w-full border rounded-md p-2"
                      >
                        <option value="newRequest">New Request Confirmation</option>
                        <option value="statusUpdate">Status Update</option>
                        <option value="requestCompleted">Request Completed</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Email Subject</Label>
                      <Input
                        id="subject"
                        defaultValue="Your request has been received - [Request ID]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="emailBody">Email Body</Label>
                      <Textarea
                        id="emailBody"
                        rows={8}
                        defaultValue={`Dear [User Name],

Thank you for submitting your request (ID: [Request ID]). We have received it and our team will be addressing it shortly.

Request Details:
Department: [Department]
Description: [Description]
Preferred Time: [Preferred Time]

You will receive updates as we process your request.

Best regards,
The AutoComp Support Team`}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Available Variables:</p>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">[User Name]</span>
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">[Request ID]</span>
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">[Department]</span>
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">[Description]</span>
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">[Preferred Time]</span>
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">[Status]</span>
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">[Technician]</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-4">
                    <Button variant="outline">Preview</Button>
                    <Button>Save Template</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
      <Toaster />
    </>
  );
};

export default AdminSettings;
