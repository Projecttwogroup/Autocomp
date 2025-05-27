import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Eye,
  Clock,
  Trash2,
  UserPen,
  User,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import RequestDetailsDialog from "./RequestDetailsDialog";
import ChangeStatusDialog from "./ChangeStatusDialog";
import DeleteRequestDialog from "./DeleteRequestDialog";
import UserProfileDialog from "./UserProfileDialog";
import TechnicianProfileDialog from "../technicians/TechnicianProfileDialog";
import { toast } from "@/hooks/use-toast";
import AssignTechnicianDialog from "@/components/AssignTechnicianDialog";

// User interface
interface User {
  id: string;
  name: string;
  email: string;
}

// Technician interface
interface Technician {
  name: string;
  performance: number;
  completedRequests: number;
  averageTime: string;
  department: string;
}

interface AssignTechnicianDialogProps {
  request: Request;
  technicians: Technician[];
  onAssign: (technicianName: string) => void;
  onCancel: () => void;
}

interface Request {
  id: string;
  userId: string;
  userName: string;
  status: "Received" | "In Progress" | "Completed";
  submissionDate: string;
  department: string;
  preferredTime: string;
  description: string;
  files?: {
    name: string;
    type: string;
    url: string;
  }[];
  technician?: string;
  history?: {
    date: string;
    action: string;
    user: string;
  }[];
}

const RequestManagement = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const res = await fetch("https://localhost:7181/api/technician");
        const data = await res.json();
        setTechnicians(data);
      } catch (err) {
        console.error("Failed to fetch technicians", err);
      }
    };

    fetchTechnicians();

    const fetchRequests = async () => {
      try {
        const response = await fetch(
          "https://localhost:7181/api/ticket/admin/all"
        );
        const data = await response.json();

        const formatted = data.map((t: any) => ({
          id: t.id,
          userId: t.userId,
          userName: t.userName,
          technician: t.technician,
          status: t.status,
          submissionDate: new Date(t.createdAt).toISOString().split("T")[0],
          department: t.department,
          preferredTime: `${t.availableFrom} - ${t.availableUntil}`,
          description: t.description,
          files: (t.attachments || []).map((a: any) => ({
            name: a.originalFileName,
            url: `https://localhost:7181/${a.filePath}`,
            type: a.originalFileName?.split(".").pop() || "file",
          })),
        }));

        setRequests(formatted);
      } catch (err) {
        console.error("Failed to load requests", err);
      }
    };

    fetchRequests();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isChangeStatusOpen, setIsChangeStatusOpen] = useState(false);
  const [isAssignTechnicianOpen, setIsAssignTechnicianOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isTechnicianProfileOpen, setIsTechnicianProfileOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<Request | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTechnician, setCurrentTechnician] = useState<Technician | null>(
    null
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, departmentFilter]);

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? request.status === statusFilter : true;
    const matchesDepartment = departmentFilter
      ? request.department === departmentFilter
      : true;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleChangeStatus = async (
    requestId: string,
    newStatus: "Received" | "In Progress" | "Completed"
  ) => {
    try {
      await fetch(
        `https://localhost:7181/api/ticket/admin/update-status/${requestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newStatus),
        }
      );

      setRequests(
        requests.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: newStatus,
                technician: newStatus === "Received" ? null : req.technician,
              }
            : req
        )
      );

      toast({
        title: "Status Updated",
        description: `Request ${requestId} status has been updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Failed to update status", error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
    setIsChangeStatusOpen(false);
  };
  const [status, setStatus] = useState<
    "Received" | "In Progress" | "Completed"
  >("Received");
  const handleAssignTechnician = async (
    requestId: string,
    technician: string
  ) => {
    try {
      await fetch(
        `https://localhost:7181/api/ticket/admin/assign-technician/${requestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(technician),
        }
      );

      setRequests(
        requests.map((req) =>
          req.id === requestId
            ? { ...req, technician, status: "In Progress" }
            : req
        )
      );

      if (currentRequest?.id === requestId) {
        setStatus("In Progress");
      }

      toast({
        title: "Technician Assigned",
        description: `${technician} has been assigned to request ${requestId}.`,
      });
    } catch (error) {
      console.error("Failed to assign technician", error);
      toast({
        title: "Error",
        description: "Failed to assign technician.",
        variant: "destructive",
      });
    }
    setIsAssignTechnicianOpen(false);
  };

  const handleViewUserProfile = async (userId: string) => {
    try {
      const response = await fetch(`https://localhost:7181/api/user/${userId}`);
      const userData = await response.json();

      const userRequests = requests.filter((req) => req.userId === userId);

      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
      };

      setCurrentUser(user);
      setIsUserProfileOpen(true);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    }
  };

  const handleViewTechnicianProfile = async (technicianName: string) => {
    try {
      const response = await fetch(
        `https://localhost:7181/api/technician/${technicianName}`
      );
      if (!response.ok) throw new Error("Technician not found");
      const data = await response.json();

      const technician: Technician = {
        name: data.name,
        department: data.department,
        performance: data.performance,
        completedRequests: data.completedRequests,
        averageTime: data.averageResolutionTime,
      };

      setCurrentTechnician(technician);
      setIsTechnicianProfileOpen(true);
    } catch (error) {
      console.error("Failed to fetch technician profile", error);
      toast({
        title: "Error",
        description: "Technician profile could not be loaded.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
        );
      case "In Progress":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>
        );
      case "Received":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Request Management
        </h2>
      </div>

      <div className="bg-card rounded-md shadow dark:shadow-md dark:shadow-black/10">
        <div className="border-b dark:border-gray-700 p-4 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Input
              placeholder="Search by ID or user name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dark:bg-background dark:border-gray-700"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="border rounded-md p-2 text-sm outline-none dark:bg-background dark:border-gray-700 dark:text-foreground"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Received">Received</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <select
              className="border rounded-md p-2 text-sm outline-none dark:bg-background dark:border-gray-700 dark:text-foreground"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="Hardware Support">Hardware Support</option>
              <option value="Software Support">Software Support</option>
              <option value="Network Issues">Network Support</option>
              <option value="Printer Support">Printer Support</option>
              <option value="Account Management">Account Management</option>
              <option value="Other">Other</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-gray-700">
                <TableHead>Request ID</TableHead>
                <TableHead>User Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length > 0 ? (
                filteredRequests
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  )
                  .map((request) => (
                    <TableRow key={request.id} className="dark:border-gray-700">
                      <TableCell className="font-medium">
                        {request.id}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={() => handleViewUserProfile(request.userId)}
                        >
                          {request.userName}
                        </Button>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{request.submissionDate}</TableCell>
                      <TableCell>{request.department}</TableCell>
                      <TableCell>
                        {request.technician ? (
                          <Button
                            variant="link"
                            className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            onClick={() =>
                              handleViewTechnicianProfile(
                                request.technician as string
                              )
                            }
                          >
                            {request.technician}
                          </Button>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">
                            Not assigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentRequest(request);
                                setIsViewDetailsOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {request.status !== "Received" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setCurrentRequest(request);
                                  setIsChangeStatusOpen(true);
                                }}
                              >
                                <Clock className="mr-2 h-4 w-4" />
                                Change Status
                              </DropdownMenuItem>
                            )}

                            {(!request.technician ||
                              request.status === "Received") && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setCurrentRequest(request);
                                  setIsAssignTechnicianOpen(true);
                                }}
                              >
                                <UserPen className="mr-2 h-4 w-4" />
                                Assign Technician
                              </DropdownMenuItem>
                            )}
                            {request.status === "In Progress" &&
                              request.technician && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setCurrentRequest(request);
                                    setIsAssignTechnicianOpen(true);
                                  }}
                                >
                                  <UserPen className="mr-2 h-4 w-4" />
                                  Change Technician
                                </DropdownMenuItem>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow className="dark:border-gray-700">
                  <TableCell colSpan={7} className="h-24 text-center">
                    No requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-center items-center gap-4 py-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of{" "}
            {Math.ceil(filteredRequests.length / itemsPerPage)}
          </span>
          <Button
            variant="outline"
            disabled={
              currentPage === Math.ceil(filteredRequests.length / itemsPerPage)
            }
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* View Request Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        {currentRequest && (
          <RequestDetailsDialog
            request={currentRequest}
            onClose={() => setIsViewDetailsOpen(false)}
          />
        )}
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={isChangeStatusOpen} onOpenChange={setIsChangeStatusOpen}>
        {currentRequest && (
          <ChangeStatusDialog
            request={currentRequest}
            onChangeStatus={(status) =>
              handleChangeStatus(currentRequest.id, status)
            }
            onCancel={() => setIsChangeStatusOpen(false)}
          />
        )}
      </Dialog>

      {/* Assign Technician Dialog */}
      <Dialog
        open={isAssignTechnicianOpen}
        onOpenChange={setIsAssignTechnicianOpen}
      >
        {currentRequest && (
          <AssignTechnicianDialog
            request={currentRequest}
            technicians={technicians}
            onAssign={(technician) =>
              handleAssignTechnician(currentRequest.id, technician)
            }
            onCancel={() => setIsAssignTechnicianOpen(false)}
          />
        )}
      </Dialog>

      {/* User Profile Dialog */}
      {currentUser && (
        <Dialog open={isUserProfileOpen} onOpenChange={setIsUserProfileOpen}>
          <UserProfileDialog
            user={currentUser}
            userRequests={requests.filter(
              (req) => req.userId === currentUser.id
            )}
            onClose={() => setIsUserProfileOpen(false)}
          />
        </Dialog>
      )}

      {/* Technician Profile Dialog */}
      <Dialog
        open={isTechnicianProfileOpen}
        onOpenChange={setIsTechnicianProfileOpen}
      >
        {currentTechnician && (
          <TechnicianProfileDialog
            technician={currentTechnician}
            onClose={() => setIsTechnicianProfileOpen(false)}
          />
        )}
      </Dialog>
    </div>
  );
};

export default RequestManagement;
