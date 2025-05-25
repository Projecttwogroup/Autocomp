
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const RecentRequests = () => {
  // Mock data for the requests
  const requests = [
    {
      id: "REQ-1001",
      user: "John Smith",
      status: "Completed",
      date: "2025-04-28",
      department: "Hardware Support",
      time: "Morning",
    },
    {
      id: "REQ-1002",
      user: "Emily Johnson",
      status: "In Progress",
      date: "2025-05-02",
      department: "Software Support",
      time: "Afternoon",
    },
    {
      id: "REQ-1003",
      user: "Michael Brown",
      status: "Received",
      date: "2025-05-05",
      department: "Network Issues",
      time: "Evening",
    },
    {
      id: "REQ-1004",
      user: "Sarah Williams",
      status: "In Progress",
      date: "2025-05-06",
      department: "Hardware Support",
      time: "Morning",
    },
    {
      id: "REQ-1005",
      user: "David Lee",
      status: "Received",
      date: "2025-05-07",
      department: "Software Support",
      time: "Afternoon",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case "In Progress":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>;
      case "Received":
        return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.id}</TableCell>
              <TableCell>{request.user}</TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell>{request.date}</TableCell>
              <TableCell>{request.department}</TableCell>
              <TableCell>{request.time}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecentRequests;
