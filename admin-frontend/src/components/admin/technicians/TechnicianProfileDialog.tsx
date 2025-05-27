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
  completedRequests: number;
}

interface TechnicianProfileDialogProps {
  technician: Technician;
  onClose: () => void;
}

const TechnicianProfileDialog: React.FC<TechnicianProfileDialogProps> = ({
  technician,
  onClose,
}) => {
  const [stats, setStats] = React.useState({
    satisfactionRate: 0,
    averageResolutionTime: "Loading...",
    performance: 0,
  });
  const [requests, setRequests] = React.useState<any[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `https://localhost:7181/api/technician/${technician.name}/stats`
        );
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to load technician stats", error);
      }
    };

    fetchStats();
  }, [technician.name]);

  const fetchRequests = async () => {
    try {
      const res = await fetch(
        `https://localhost:7181/api/technician/${technician.name}/requests`
      );
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error("Failed to load technician requests", error);
    }
  };

  React.useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(
          `https://localhost:7181/api/technician/${technician.name}/requests`
        );
        const data = await res.json();
        setRequests(data);
        setCurrentPage(1);
      } catch (error) {
        console.error("Failed to load technician requests", error);
      }
    };

    fetchRequests();
  }, [technician.name]);

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
              <span>Performance: {stats.performance}%</span>
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
              <span className="text-sm font-medium">{stats.performance}%</span>
            </div>
            <Progress value={stats.performance} className="h-2" />
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
                  <RequestsChart technicianName={technician.name} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-4">
                  <div className="text-sm text-muted-foreground">
                    Average Resolution Time
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {stats.averageResolutionTime}
                  </div>
                </div>
                <div className="border rounded-md p-4">
                  <div className="text-sm text-muted-foreground">
                    Satisfaction Rate
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {stats.satisfactionRate}%
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="pt-4">
            <div className="space-y-3">
              {requests.length > 0 ? (
                requests
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  )
                  .map((req) => {
                    const completed = new Date(req.completedAt);
                    const preferred = req.preferredDate
                      ? new Date(req.preferredDate)
                      : null;
                    const durationMs =
                      completed.getTime() -
                      (preferred?.getTime() || completed.getTime());
                    const hours = Math.floor(durationMs / 1000 / 60 / 60);
                    const days = Math.floor(hours / 24);
                    const remHours = hours % 24;

                    return (
                      <div key={req.id} className="border rounded-md p-3">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium">{req.id}</div>
                          <Badge className="bg-green-500 hover:bg-green-600">
                            Completed
                          </Badge>
                        </div>
                        <p className="text-sm line-clamp-2">
                          {req.description}
                        </p>
                        <div className="flex justify-between mt-2">
                          <div className="text-xs text-gray-500">
                            Completed: {completed.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            Resolution time: {days}d {remHours}h
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <p className="text-sm text-muted-foreground">
                  No completed requests found.
                </p>
              )}
            </div>
            <div className="flex justify-center items-center gap-4 pt-4">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of{" "}
                {Math.ceil(requests.length / itemsPerPage)}
              </span>
              <Button
                variant="outline"
                disabled={
                  currentPage === Math.ceil(requests.length / itemsPerPage)
                }
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </Button>
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
