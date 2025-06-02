import React from "react";
import { Navigate } from "react-router-dom";

const RequireAdminAuth = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("autocomp-admin-auth");

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RequireAdminAuth;
