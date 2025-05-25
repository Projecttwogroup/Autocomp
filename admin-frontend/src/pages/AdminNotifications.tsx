
import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Send, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const notificationSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required" }),
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "notif-001",
      userId: "USR-1001",
      title: "Request Completed",
      message: "Your hardware support request REQ-1001 has been completed.",
      date: "2025-05-12",
      read: true,
    },
    {
      id: "notif-002",
      userId: "USR-1002",
      title: "Request Status Update",
      message: "Your software support request REQ-1002 is now in progress.",
      date: "2025-05-13",
      read: false,
    },
  ]);

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      userId: "",
      title: "",
      message: "",
    },
  });

  const onSubmit = (data: NotificationFormValues) => {
    const newNotification = {
      id: `notif-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      userId: data.userId,
      title: data.title,
      message: data.message,
      date: new Date().toISOString().split("T")[0],
      read: false,
    };

    setNotifications([newNotification, ...notifications]);
    
    toast({
      title: "Notification Sent",
      description: `Notification sent to user ${data.userId}`,
    });
    
    form.reset();
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter user ID (e.g., USR-1001)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notification Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter notification title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter notification message" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex flex-col gap-1 rounded-md border p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">User: {notification.userId}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{notification.date}</span>
                        </div>
                      </div>
                      <div className="font-medium">{notification.title}</div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <div className="mt-1 text-right">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${notification.read ? "bg-gray-100" : "bg-blue-100 text-blue-800"}`}>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
