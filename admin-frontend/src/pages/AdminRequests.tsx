
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import AdminLayout from "@/components/admin/AdminLayout";
import RequestManagement from "@/components/admin/requests/RequestManagement";

const AdminRequests = () => {
  return (
    <>
      <AdminLayout>
        <RequestManagement />
      </AdminLayout>
      <Toaster />
    </>
  );
};

export default AdminRequests;
