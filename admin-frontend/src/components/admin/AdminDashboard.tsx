import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, CheckCircle, Clock, Clock as Pending } from "lucide-react";
import RequestsChart from "./dashboard/RequestsChart";
import RecentRequests from "./dashboard/RecentRequests";
import { useEffect, useState } from "react";
import axios from "axios";
import RequestsStatusChart from "./dashboard/RequestsStatusChart";
import { Button } from "../ui/button";

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    {
      title: "Total Requests",
      value: 0,
      icon: FileText,
      color: "bg-blue-500",
      change: "",
    },
    {
      title: "Completed",
      value: 0,
      icon: CheckCircle,
      color: "bg-green-500",
      change: "",
    },
    {
      title: "In Progress",
      value: 0,
      icon: Clock,
      color: "bg-yellow-500",
      change: "",
    },
    {
      title: "Pending",
      value: 0,
      icon: Pending,
      color: "bg-red-500",
      change: "",
    },
  ]);

  useEffect(() => {
    axios
      .get("https://localhost:7181/api/dashboard/admin/stats")
      .then((res) => {
        const {
          totalTickets,
          completedTickets,
          inProgressTickets,
          pendingTickets,
        } = res.data;
        setStats([
          {
            title: "Total Requests",
            value: totalTickets,
            icon: FileText,
            color: "bg-blue-500",
            change: "",
          },
          {
            title: "Completed",
            value: completedTickets,
            icon: CheckCircle,
            color: "bg-green-500",
            change: "",
          },
          {
            title: "In Progress",
            value: inProgressTickets,
            icon: Clock,
            color: "bg-yellow-500",
            change: "",
          },
          {
            title: "Pending",
            value: pendingTickets,
            icon: Pending,
            color: "bg-red-500",
            change: "",
          },
        ]);
      })
      .catch((err) => console.error(err));
  }, []);

  const [overview, setOverview] = useState({
    technicians: [],
    recentTickets: [],
    departmentStats: [],
    requestsChartData: [],
  });

  useEffect(() => {
    axios
      .get("https://localhost:7181/api/dashboard/admin/overview")
      .then((res) => setOverview(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
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
            <RequestsStatusChart data={overview.requestsChartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technician Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {overview.technicians.map((t, i) => {
              const rate = t.performance;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{rate}%</div>
                  </div>
                  <Progress value={rate} className="h-2" />
                </div>
              );
            })}

            <div className="mt-10 pt-4">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                onClick={() =>
                  window.open(
                    "https://localhost:7181/api/dashboard/admin/technicians-report",
                    "_blank"
                  )
                }
              >
                View Full PDF Report
              </Button>
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
              {overview.departmentStats.map((d, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{d.department}</div>
                    <div className="text-sm text-muted-foreground">
                      {d.count} requests
                    </div>
                  </div>
                  <Progress
                    value={Math.min((d.count / 100) * 100, 100)}
                    max={100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
