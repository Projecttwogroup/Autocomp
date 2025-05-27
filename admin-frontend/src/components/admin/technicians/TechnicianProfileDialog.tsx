
import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import RequestsChart from "../dashboard/RequestsChart";

interface Technician {
  name: string;
  department: string;
  performance: number;
  completedRequests: number;
  averageTime: string;
}

interface TechnicianProfileDialogProps {
  technician: Technician;
  onClose: () => void;
}

const TechnicianProfileDialog: React.FC<TechnicianProfileDialogProps> = ({
  technician,
  onClose,
}) => {
  return (
    <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Technician Profile</DialogTitle>
        <DialogDescription>
          View technician details and performance
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-6 py-4">
        {/* Technician Information */}
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium">{technician.name}</h3>
              <p className="text-sm text-muted-foreground">
                Department: {technician.department}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>Performance: {technician.performance}%</span>
            </div>
            <div>
              <Badge className="bg-green-500 hover:bg-green-600">
                {technician.completedRequests} requests completed
              </Badge>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-muted-foreground">
                Performance Rating
              </span>
              <span className="text-sm font-medium">
                {technician.performance}%
              </span>
            </div>
            <Progress value={technician.performance} className="h-2" />
          </div>
        </div>

        <Separator />

        {/* Performance Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="overview">Performance Overview</TabsTrigger>
            <TabsTrigger value="requests">Request History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="pt-4">
            <div className="space-y-4">
              <div className="bg-white rounded-md">
                <h3 className="font-medium mb-3">Request Handling Stats</h3>
                <div className="h-[300px]">
                  <RequestsChart />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-4">
                  <div className="text-sm text-muted-foreground">
                    Average Resolution Time
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {technician.averageTime}
                  </div>
                </div>
                <div className="border rounded-md p-4">
                  <div className="text-sm text-muted-foreground">
                    Satisfaction Rate
                  </div>
                  <div className="text-2xl font-bold mt-1">94%</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="pt-4">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">REQ-{1000 + item}</div>
                    <Badge className="bg-green-500 hover:bg-green-600">
                      Completed
                    </Badge>
                  </div>
                  <p className="text-sm line-clamp-2">
                    {item % 2 === 0
                      ? "Hardware issue resolved. Required replacement of faulty component."
                      : "Software configuration issue fixed. Updated system settings."}
                  </p>
                  <div className="flex justify-between mt-2">
                    <div className="text-xs text-gray-500">
                      Completed: May {item + 10}, 2025
                    </div>
                    <div className="text-xs text-gray-500">
                      Resolution time: {item + 1}h 20m
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default TechnicianProfileDialog;
