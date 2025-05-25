
import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Wrench, AlertCircle, Clock, Check, Calendar, Server, Database, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  status: "scheduled" | "in-progress" | "completed" | "canceled";
  scheduledDate: string;
  duration: string;
  impact: "none" | "low" | "moderate" | "high";
  progress: number;
  type: "system" | "database" | "security";
}

const AdminMaintenance = () => {
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([
    {
      id: "MAINT-1001",
      title: "System Update Deployment",
      description: "Deployment of quarterly system updates including security patches and performance improvements.",
      status: "scheduled",
      scheduledDate: "2025-06-01",
      duration: "2 hours",
      impact: "moderate",
      progress: 0,
      type: "system"
    },
    {
      id: "MAINT-1002",
      title: "Database Optimization",
      description: "Scheduled optimization of database indexes and query performance tuning.",
      status: "in-progress",
      scheduledDate: "2025-05-14",
      duration: "4 hours",
      impact: "low",
      progress: 65,
      type: "database"
    },
    {
      id: "MAINT-1003",
      title: "Security Audit",
      description: "Comprehensive security audit of all systems and access controls.",
      status: "completed",
      scheduledDate: "2025-05-10",
      duration: "8 hours",
      impact: "none",
      progress: 100,
      type: "security"
    },
    {
      id: "MAINT-1004",
      title: "Network Infrastructure Upgrade",
      description: "Upgrade of core network infrastructure to improve reliability and performance.",
      status: "scheduled",
      scheduledDate: "2025-06-15",
      duration: "12 hours",
      impact: "high",
      progress: 0,
      type: "system"
    },
    {
      id: "MAINT-1005",
      title: "Database Backup Verification",
      description: "Verification of database backup integrity and recovery procedures.",
      status: "canceled",
      scheduledDate: "2025-05-05",
      duration: "3 hours",
      impact: "low",
      progress: 0,
      type: "database"
    }
  ]);

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<string>("all");

  const toggleTaskDetails = (taskId: string) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
    } else {
      setExpandedTaskId(taskId);
    }
  };

  const handleStartTask = (taskId: string) => {
    setMaintenanceTasks(tasks =>
      tasks.map(task =>
        task.id === taskId
          ? { ...task, status: "in-progress" as const, progress: 10 }
          : task
      )
    );
    toast({
      title: "Maintenance Started",
      description: `Task ${taskId} has been started.`,
    });
  };

  const handleCompleteTask = (taskId: string) => {
    setMaintenanceTasks(tasks =>
      tasks.map(task =>
        task.id === taskId
          ? { ...task, status: "completed" as const, progress: 100 }
          : task
      )
    );
    toast({
      title: "Maintenance Completed",
      description: `Task ${taskId} has been completed successfully.`,
    });
  };

  const handleCancelTask = (taskId: string) => {
    setMaintenanceTasks(tasks =>
      tasks.map(task =>
        task.id === taskId
          ? { ...task, status: "canceled" as const }
          : task
      )
    );
    toast({
      title: "Maintenance Canceled",
      description: `Task ${taskId} has been canceled.`,
      variant: "destructive",
    });
  };

  const filteredTasks = maintenanceTasks.filter(task => {
    if (currentFilter === "all") return true;
    if (currentFilter === "active") return task.status === "in-progress" || task.status === "scheduled";
    return task.status === currentFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Scheduled</Badge>;
      case "in-progress":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case "canceled":
        return <Badge className="bg-red-500 hover:bg-red-600">Canceled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "none":
        return <Badge variant="outline" className="bg-gray-100">No Impact</Badge>;
      case "low":
        return <Badge variant="outline" className="bg-blue-100 border-blue-300 text-blue-800">Low Impact</Badge>;
      case "moderate":
        return <Badge variant="outline" className="bg-yellow-100 border-yellow-300 text-yellow-800">Moderate Impact</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-red-100 border-red-300 text-red-800">High Impact</Badge>;
      default:
        return <Badge variant="outline">{impact}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "system":
        return <Server className="h-4 w-4" />;
      case "database":
        return <Database className="h-4 w-4" />;
      case "security":
        return <Shield className="h-4 w-4" />;
      default:
        return <Wrench className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Maintenance</h1>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={currentFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentFilter("all")}
            >
              All
            </Button>
            <Button 
              variant={currentFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentFilter("active")}
            >
              Active
            </Button>
            <Button 
              variant={currentFilter === "scheduled" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentFilter("scheduled")}
            >
              Scheduled
            </Button>
            <Button 
              variant={currentFilter === "in-progress" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentFilter("in-progress")}
            >
              In Progress
            </Button>
            <Button 
              variant={currentFilter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentFilter("completed")}
            >
              Completed
            </Button>
            <Button 
              variant={currentFilter === "canceled" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentFilter("canceled")}
            >
              Canceled
            </Button>
          </div>
        </div>
        
        {filteredTasks.length > 0 ? (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(task.type)}
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                      </div>
                      <CardDescription>ID: {task.id}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(task.status)}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        onClick={() => toggleTaskDetails(task.id)}
                      >
                        {expandedTaskId === task.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-3 mb-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{task.scheduledDate}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{task.duration}</span>
                    </div>
                    <div>
                      {getImpactBadge(task.impact)}
                    </div>
                  </div>

                  {task.status === "in-progress" && (
                    <div className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs font-medium">{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>
                  )}
                  
                  {expandedTaskId === task.id && (
                    <div className="mt-3 border-t pt-3">
                      <p className="text-sm">{task.description}</p>
                    </div>
                  )}
                </CardContent>
                
                {expandedTaskId === task.id && (
                  <CardFooter className="flex justify-end gap-2 border-t pt-3">
                    {task.status === "scheduled" && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCancelTask(task.id)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleStartTask(task.id)}
                        >
                          Start Maintenance
                        </Button>
                      </>
                    )}
                    {task.status === "in-progress" && (
                      <Button 
                        size="sm" 
                        onClick={() => handleCompleteTask(task.id)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Complete
                      </Button>
                    )}
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-center">No maintenance tasks found</p>
              <p className="text-sm text-muted-foreground text-center mt-1">
                No maintenance tasks match your current filter.
              </p>
              {currentFilter !== "all" && (
                <Button 
                  variant="outline"
                  className="mt-4"
                  onClick={() => setCurrentFilter("all")}
                >
                  Show All Tasks
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMaintenance;
