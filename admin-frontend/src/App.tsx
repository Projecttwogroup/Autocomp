import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminRequests from "./pages/AdminRequests";
import AdminSettings from "./pages/AdminSettings";
import AdminNotifications from "./pages/AdminNotifications";
import AdminCommunication from "./pages/AdminCommunication";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import RequireAdminAuth from "@/components/auth/RequireAdminAuth";
import { Navigate } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <RequireAdminAuth>
                  <Admin />
                </RequireAdminAuth>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <RequireAdminAuth>
                  <AdminRequests />
                </RequireAdminAuth>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <RequireAdminAuth>
                  <AdminNotifications />
                </RequireAdminAuth>
              }
            />
            <Route
              path="/admin/communication"
              element={
                <RequireAdminAuth>
                  <AdminCommunication />
                </RequireAdminAuth>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <RequireAdminAuth>
                  <AdminSettings />
                </RequireAdminAuth>
              }
            />

            <Route
              path="/login"
              element={
                <RedirectIfAuthenticated>
                  <Index />
                </RedirectIfAuthenticated>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

const RedirectIfAuthenticated = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isAuthenticated = localStorage.getItem("autocomp-admin-auth");

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default App;
