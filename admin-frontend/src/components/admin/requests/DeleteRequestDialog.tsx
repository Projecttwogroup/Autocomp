
import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Request {
  id: string;
  userName: string;
  status: "Received" | "In Progress" | "Completed";
  submissionDate: string;
  department: string;
  preferredTime: string;
  description: string;
}

interface DeleteRequestDialogProps {
  request: Request;
  onDelete: () => void;
  onCancel: () => void;
}

const DeleteRequestDialog: React.FC<DeleteRequestDialogProps> = ({
  request,
  onDelete,
  onCancel,
}) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete Request</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete request {request.id}? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default DeleteRequestDialog;
