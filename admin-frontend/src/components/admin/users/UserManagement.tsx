
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
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
  Search,
  UserPlus,
  Pen,
  Trash2,
  MoreHorizontal 
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import UserDialog from "./UserDialog";
import DeleteUserDialog from "./DeleteUserDialog";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
}

const UserManagement = () => {
  // Mock users data
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Administrator",
      status: "active",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Technician",
      status: "active",
    },
    {
      id: "3",
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      role: "Technician",
      status: "active",
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      role: "Administrator",
      status: "inactive",
    },
    {
      id: "5",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      role: "Technician",
      status: "inactive",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter ? user.role === roleFilter : true;
    const matchesStatus = statusFilter ? user.status === statusFilter : true;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = (user: Omit<User, "id">) => {
    const newUser = {
      ...user,
      id: (users.length + 1).toString(),
    };
    setUsers([...users, newUser]);
    setIsAddUserOpen(false);
    toast({
      title: "User Added",
      description: `${user.name} has been added successfully.`,
    });
  };

  const handleEditUser = (updatedUser: User) => {
    setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
    setIsEditUserOpen(false);
    toast({
      title: "User Updated",
      description: `${updatedUser.name}'s information has been updated.`,
    });
  };

  const handleDeleteUser = () => {
    if (currentUser) {
      setUsers(users.filter((user) => user.id !== currentUser.id));
      setIsDeleteUserOpen(false);
      toast({
        title: "User Deleted",
        description: `${currentUser.name} has been removed.`,
        variant: "destructive",
      });
      setCurrentUser(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
        <Button onClick={() => setIsAddUserOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="bg-white rounded-md shadow">
        <div className="border-b p-4 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or role..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="border rounded-md p-2 text-sm outline-none"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="Administrator">Administrator</option>
              <option value="Technician">Technician</option>
            </select>
            <select
              className="border rounded-md p-2 text-sm outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Badge
                        className={user.status === "active" ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"}
                      >
                        {user.status.toUpperCase()}
                      </Badge>
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
                              setCurrentUser(user);
                              setIsEditUserOpen(true);
                            }}
                          >
                            <Pen className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setCurrentUser(user);
                              setIsDeleteUserOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <UserDialog
          onSubmit={handleAddUser}
          onCancel={() => setIsAddUserOpen(false)}
          title="Add New User"
        />
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        {currentUser && (
          <UserDialog
            user={currentUser}
            onSubmit={handleEditUser}
            onCancel={() => setIsEditUserOpen(false)}
            title="Edit User"
          />
        )}
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
        {currentUser && (
          <DeleteUserDialog
            user={currentUser}
            onDelete={handleDeleteUser}
            onCancel={() => setIsDeleteUserOpen(false)}
          />
        )}
      </Dialog>
    </div>
  );
};

export default UserManagement;
