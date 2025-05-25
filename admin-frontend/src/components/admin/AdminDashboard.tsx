
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, CheckCircle, Clock, Clock as Pending } from "lucide-react";
import RequestsChart from "./dashboard/RequestsChart";
import RecentRequests from "./dashboard/RecentRequests";

const AdminDashboard = () => {
  // Mock data for demonstration purposes
  const stats = [
    {
      title: "Total Requests",
      value: 248,
      icon: FileText,
      color: "bg-blue-500",
      change: "+12% from last month",
    },
    {
      title: "Completed",
      value: 187,
      icon: CheckCircle,
      color: "bg-green-500",
      change: "+8% from last month",
    },
    {
      title: "In Progress",
      value: 42,
      icon: Clock,
      color: "bg-yellow-500",
      change: "-3% from last month",
    },
    {
      title: "Pending",
      value: 19,
      icon: Pending,
      color: "bg-red-500",
      change: "+5% from last month",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.color} p-2 rounded-md`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Request Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <RequestsChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Technician Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Jane Smith</div>
                <div className="text-sm text-muted-foreground">92%</div>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Robert Johnson</div>
                <div className="text-sm text-muted-foreground">88%</div>
              </div>
              <Progress value={88} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Lisa Chen</div>
                <div className="text-sm text-muted-foreground">76%</div>
              </div>
              <Progress value={76} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Michael Brown</div>
                <div className="text-sm text-muted-foreground">70%</div>
              </div>
              <Progress value={70} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentRequests />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Hardware Support</div>
                  <div className="text-sm text-muted-foreground">48 requests</div>
                </div>
                <Progress value={48} max={100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Software Support</div>
                  <div className="text-sm text-muted-foreground">36 requests</div>
                </div>
                <Progress value={36} max={100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Network Support</div>
                  <div className="text-sm text-muted-foreground">16 requests</div>
                </div>
                <Progress value={16} max={100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Printer Support</div>
                  <div className="text-sm text-muted-foreground">12 requests</div>
                </div>
                <Progress value={12} max={100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Account Management</div>
                  <div className="text-sm text-muted-foreground">8 requests</div>
                </div>
                <Progress value={8} max={100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Other</div>
                  <div className="text-sm text-muted-foreground">5 requests</div>
                </div>
                <Progress value={5} max={100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
