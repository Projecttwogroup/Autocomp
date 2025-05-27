import React, { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Technician {
  name: string;
  department: string;
}

interface Request {
  id: string;
  technician?: string;
}

interface AssignTechnicianDialogProps {
  request: Request;
  technicians: Technician[];
  onAssign: (technicianName: string) => void;
  onCancel: () => void;
}

const AssignTechnicianDialog: React.FC<AssignTechnicianDialogProps> = ({
  request,
  technicians,
  onAssign,
  onCancel,
}) => {
  const [selectedTech, setSelectedTech] = useState("");

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Assign Technician</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 pt-2">
        <Select onValueChange={setSelectedTech}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose technician..." />
          </SelectTrigger>
          <SelectContent>
            {technicians.map((tech) => (
              <SelectItem key={tech.name} value={tech.name}>
                {tech.name} ({tech.department})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DialogFooter className="pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onAssign(selectedTech)} disabled={!selectedTech}>
          Assign
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AssignTechnicianDialog;
