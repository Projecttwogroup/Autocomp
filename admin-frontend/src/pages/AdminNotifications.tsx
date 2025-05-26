import React, { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, Send, User, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Predefined notification templates
const notificationTemplates = [
  {
    id: "template-1",
    title: "Request Completed",
    message:
      "Your support request has been successfully completed. Thank you for your patience.",
  },
  {
    id: "template-2",
    title: "Request Status Update",
    message:
      "Your support request status has been updated. Please check your request details for more information.",
  },
  {
    id: "template-3",
    title: "System Maintenance",
    message:
      "Scheduled system maintenance will occur tonight from 10 PM to 2 AM. Some services may be temporarily unavailable.",
  },
  {
    id: "template-4",
    title: "New Policy Update",
    message:
      "Important policy updates have been made. Please review the updated guidelines in your dashboard.",
  },
  {
    id: "template-5",
    title: "Security Alert",
    message:
      "We detected unusual activity on your account. Please review your recent activities and update your password if necessary.",
  },
];

const notificationSchema = z.object({
  userId: z.string().min(1, { message: "*Required" }),
  templateId: z.string().min(1, { message: "*Required" }),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

interface Notification {
  id: string;
  userId: string;
  userName: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 3;

  const pagedNotifications = notifications.slice(
    currentPage * pageSize,
    currentPage * pageSize + pageSize
  );

  const [userSearch, setUserSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  const [validationError, setValidationError] = useState("");
  const [searchResults, setSearchResults] = useState<
    { id: string; name: string; email: string }[]
  >([]);

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      userId: "",
      templateId: "",
    },
  });

  const filteredUsers = searchResults;
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `https://localhost:7181/api/notification/admin/all`
        );

        const data = Array.isArray(res.data) ? res.data : [];

        const transformed = data.map((n) => ({
          id: n.id,
          userId: n.userId,
          userName: n.userName,
          title: n.title,
          message: n.message,
          date: new Date(n.createdAt).toISOString().split("T")[0],
          read: n.isSeen,
        }));

        setNotifications(transformed);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();

    intervalId = setInterval(fetchNotifications, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const handleUserSelect = (user: {
    id: string;
    name: string;
    email: string;
  }) => {
    setSelectedUser(user);
    setUserSearch(user.name);
    setShowSuggestions(false);
    form.setValue("userId", user.id);
  };

  const handleUserSearchChange = async (value: string) => {
    setUserSearch(value);
    setShowSuggestions(true);
    setSelectedUser(null);
    form.setValue("userId", "");

    if (!value.trim()) return;

    try {
      console.log("Searching for:", value);
      const res = await axios.get(
        `https://localhost:7181/api/User/search?query=${value}`
      );
      console.log("Search result:", res.data);
      const users = Array.isArray(res.data) ? res.data : [];
      setSearchResults(users);
    } catch (error) {
      console.error("User search failed", error);
    }
  };

  const onSubmit = async (data: NotificationFormValues) => {
    // Clear any previous validation errors
    setValidationError("");

    // Check if both fields are filled
    if (!data.userId || !data.templateId) {
      setValidationError(
        "Please fill in both the user and notification template fields."
      );
      return;
    }

    const selectedTemplate = notificationTemplates.find(
      (t) => t.id === data.templateId
    );
    const user = selectedUser;

    if (!selectedTemplate || !user) {
      toast({
        title: "Error",
        description: "Invalid template or user selection",
        variant: "destructive",
      });
      return;
    }

    const newNotification = {
      id: `notif-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
      userId: data.userId,
      userName: user.name,
      title: selectedTemplate.title,
      message: selectedTemplate.message,
      date: new Date().toISOString().split("T")[0],
      read: false,
    };

    try {
      await axios.post(`https://localhost:7181/api/Notification/${user.id}`, {
        title: selectedTemplate.title,
        message: selectedTemplate.message,
      });

      setNotifications([newNotification, ...notifications]);
      toast({
        title: "Notification Sent",
        description: `Notification sent to ${user.name}`,
      });
    } catch (error: any) {
      console.error(
        "Notification send failed:",
        error?.response || error?.message || error
      );
      toast({
        title: "Failed to Send",
        description: "Something went wrong while sending the notification.",
        variant: "destructive",
      });
    }

    toast({
      title: "Notification Sent",
      description: `Notification sent to ${user.name}`,
    });

    form.reset();
    setUserSearch("");
    setSelectedUser(null);
    setValidationError("");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Notification
              </CardTitle>
              <CardDescription>
                Send a notification to a specific user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select User</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Search by name or email..."
                              value={userSearch}
                              onChange={(e) =>
                                handleUserSearchChange(e.target.value)
                              }
                              onFocus={() => setShowSuggestions(true)}
                              className="pr-10"
                            />
                            {selectedUser && (
                              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                            )}
                            {showSuggestions &&
                              userSearch &&
                              filteredUsers.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                  {filteredUsers.map((user) => (
                                    <div
                                      key={user.id}
                                      className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                                      onClick={() => handleUserSelect(user)}
                                    >
                                      <div className="font-medium">
                                        {user.name}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {user.email}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {user.id}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="templateId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notification Template</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a notification template" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {notificationTemplates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {validationError && (
                    <div className="text-red-600 text-sm font-medium">
                      {validationError}
                    </div>
                  )}

                  <Button type="submit" className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Send Notification
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Notifications
              </CardTitle>
              <CardDescription>
                List of recently sent notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length > 0 ? (
                  pagedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex flex-col gap-1 rounded-md border p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {notification.userName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {notification.date}
                          </span>
                        </div>
                      </div>
                      <div className="font-medium">{notification.title}</div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <div className="mt-1 text-right">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            notification.read
                              ? "bg-gray-100"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {notification.read ? "Read" : "Unread"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">
                    No notifications sent yet.
                  </p>
                )}
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    (currentPage + 1) * pageSize >= notifications.length
                  }
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
