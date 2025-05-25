import React, { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  technician?: string;
}

interface AssignTechnicianDialogProps {
  request: Request;
  onAssign: (technician: string) => void;
  onCancel: () => void;
}

const AssignTechnicianDialog: React.FC<AssignTechnicianDialogProps> = ({
  request,
  onAssign,
  onCancel,
}) => {
  const [technician, setTechnician] = useState(request.technician || "");

  // Mock technicians data
  const technicians = [
    { id: "1", name: "Jane Smith" },
    { id: "2", name: "Robert Johnson" },
    { id: "3", name: "Lisa Chen" },
    { id: "4", name: "Michael Brown" },
  ];

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {request.technician ? "Change Technician" : "Assign Technician"} –{" "}
          {request.id}
        </DialogTitle>
      </DialogHeader>

      <div className="py-4">
        <p className="mb-4 text-sm">
          Select a technician to assign to this request:
        </p>
        <select
          className="w-full border rounded-md p-2"
          value={technician}
          onChange={(e) => setTechnician(e.target.value)}
        >
          <option value="">Select a Technician</option>
          {technicians.map((tech) => (
            <option key={tech.id} value={tech.name}>
              {tech.name}
            </option>
          ))}
        </select>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() => onAssign(technician)}
          disabled={!technician || technician === request.technician}
        >
          {request.technician ? "Change" : "Assign"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AssignTechnicianDialog;
