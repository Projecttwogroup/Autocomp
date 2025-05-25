
import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface Request {
  id: string;
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

interface RequestDetailsDialogProps {
  request: Request;
  onClose: () => void;
}

const RequestDetailsDialog: React.FC<RequestDetailsDialogProps> = ({
  request,
  onClose,
}) => {
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
    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Request Details - {request.id}</DialogTitle>
      </DialogHeader>
      
      <div className="grid gap-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">User Name</p>
            <p>{request.userName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <div>{getStatusBadge(request.status)}</div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Submission Date</p>
            <p>{request.submissionDate}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Department</p>
            <p>{request.department}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Preferred Time</p>
            <p>{request.preferredTime}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Assigned Technician</p>
            <p>{request.technician || "Not Assigned"}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
          <div className="bg-gray-50 p-3 rounded-md text-sm">
            {request.description}
          </div>
        </div>

        {request.files && request.files.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Attached Files</p>
            <div className="flex flex-wrap gap-2">
              {request.files.map((file, index) => (
                <div
                  key={index}
                  className="border rounded-md p-2 flex items-center gap-2 text-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>{file.name}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Request History</p>
          <div className="space-y-2">
            {request.history && request.history.length > 0 ? (
              request.history.map((item, index) => (
                <div key={index} className="flex justify-between text-sm border-b pb-2">
                  <div>
                    <span className="font-medium">{item.user}</span>: {item.action}
                  </div>
                  <div className="text-gray-500">{item.date}</div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No history available.</p>
            )}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default RequestDetailsDialog;
