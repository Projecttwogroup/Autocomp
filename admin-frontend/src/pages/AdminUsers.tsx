
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import AdminLayout from "@/components/admin/AdminLayout";
import UserManagement from "@/components/admin/users/UserManagement";

const AdminUsers = () => {
  return (
    <>
      <AdminLayout>
        <UserManagement />
      </AdminLayout>
      <Toaster />
    </>
  );
};

export default AdminUsers;
