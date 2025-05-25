
import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
}

interface DeleteUserDialogProps {
  user: User;
  onDelete: () => void;
  onCancel: () => void;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  user,
  onDelete,
  onCancel,
}) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete User</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete {user.name}? This action cannot be undone.
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

export default DeleteUserDialog;
