
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
import { User, Mail, Building, Briefcase, Calendar } from "lucide-react";

interface UserProfileDialogProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  userRequests: {
    id: string;
    status: "Received" | "In Progress" | "Completed";
    submissionDate: string;
    department: string;
    description: string;
  }[];
  onClose: () => void;
}


const UserProfileDialog: React.FC<UserProfileDialogProps> = ({
  user,
  userRequests,
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
        <DialogTitle>User Profile</DialogTitle>
        <DialogDescription>View user details and requests</DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-6 py-4">
        {/* User Information */}
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.id}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* User Requests */}
        <div>
          <h3 className="font-medium mb-3">User Requests</h3>
          {userRequests.length > 0 ? (
            <div className="space-y-3">
              {userRequests.map((request) => (
                <div 
                  key={request.id}
                  className="border rounded-md p-3"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">{request.id}</div>
                    <div>{getStatusBadge(request.status)}</div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2 text-sm">
                    <div className="text-muted-foreground">
                      Submitted: {request.submissionDate}
                    </div>
                    <div className="text-muted-foreground">
                      Department: {request.department}
                    </div>
                  </div>
                  <p className="text-sm line-clamp-2">{request.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground p-4 border rounded-md">
              No requests found for this user.
            </p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default UserProfileDialog;
