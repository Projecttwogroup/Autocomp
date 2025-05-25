
import React, { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Request {
  id: string;
  userName: string;
  status: "Received" | "In Progress" | "Completed";
  submissionDate: string;
  department: string;
  preferredTime: string;
  description: string;
}

interface ChangeStatusDialogProps {
  request: Request;
  onChangeStatus: (status: "Received" | "In Progress" | "Completed") => void;
  onCancel: () => void;
}

const ChangeStatusDialog: React.FC<ChangeStatusDialogProps> = ({
  request,
  onChangeStatus,
  onCancel,
}) => {
  const [status, setStatus] = useState<"Received" | "In Progress" | "Completed">(request.status);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Change Request Status - {request.id}</DialogTitle>
      </DialogHeader>
      
      <div className="py-4">
        <RadioGroup value={status} onValueChange={(value) => setStatus(value as any)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Received" id="received" />
            <Label htmlFor="received">Received</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="In Progress" id="in-progress" />
            <Label htmlFor="in-progress">In Progress</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Completed" id="completed" />
            <Label htmlFor="completed">Completed</Label>
          </div>
        </RadioGroup>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onChangeStatus(status)}>
          Update Status
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ChangeStatusDialog;
