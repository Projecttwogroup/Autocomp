import { Toaster } from "@/components/ui/toaster";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/components/admin/AdminDashboard";

const Admin = () => {
  return (
    <>
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
      <Toaster />
    </>
  );
};

export default Admin;
