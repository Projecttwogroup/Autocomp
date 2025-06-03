import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  // Template logic
  const [templateType, setTemplateType] = useState("statusUpdate");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  useEffect(() => {
    fetch(`https://localhost:7181/api/templates/${templateType}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setSubject(data.subject);
          setEmailBody(data.body);
        } else {
          setSubject(""); // clear the field if template doesn't exist
          setEmailBody("");
        }
      });
  }, [templateType]);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await fetch(
          `https://localhost:7181/api/templates/${templateType}`
        );
        if (!res.ok) {
          setSubject("");
          setEmailBody("");
          return;
        }
        const data = await res.json();
        setSubject(data.subject || "");
        setEmailBody(data.body || "");
      } catch (err) {
        console.error("Failed to fetch template", err);
      }
    };
    fetchTemplate();
  }, [templateType]);

  const handleSaveTemplate = async () => {
    try {
      const res = await fetch("https://localhost:7181/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: templateType,
          subject,
          body: emailBody,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      toast({
        title: "Template Saved",
        description: "Email template updated successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save template.",
      });
    }
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
                            checked={selectedTheme === "light"}
                            onChange={() => setSelectedTheme("light")}
                          />
                          <Label htmlFor="light">Light</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="dark"
                            name="theme"
                            checked={selectedTheme === "dark"}
                            onChange={() => setSelectedTheme("dark")}
                          />
                          <Label htmlFor="dark">Dark</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSavePreferences}>
                      Save Preferences
                    </Button>
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
                        value={templateType}
                        onChange={(e) => setTemplateType(e.target.value)}
                      >
                        <option value="newRequest">
                          New Request Confirmation
                        </option>
                        <option value="statusUpdate">Status Update</option>
                        <option value="requestCompleted">
                          Request Completed
                        </option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Email Subject</Label>
                      <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailBody">Email Body</Label>
                      <Textarea
                        id="emailBody"
                        rows={8}
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">
                        Available Variables:
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                          [User Name]
                        </span>
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                          [Request ID]
                        </span>
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                          [Department]
                        </span>
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                          [Description]
                        </span>
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                          [Preferred Time]
                        </span>
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                          [Status]
                        </span>
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                          [Technician]
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button onClick={handleSaveTemplate}>Save Template</Button>
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
