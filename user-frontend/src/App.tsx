import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createQueryClient } from '@/lib/query-client';
import { ConfigProvider } from '@/contexts/config-context';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { ChatProvider } from "@/contexts/chat-context";
import { usePreferences } from "@/hooks/use-preferences";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Layout from "./components/layout/Layout";
import ScrollToTop from "./components/ui/scroll-to-top";
import { QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';

// Simplified lazy imports without redundant performance tracking
const HomePage = React.lazy(() => import("./pages/HomePage"));
const Tickets = React.lazy(() => import("./pages/Tickets"));
const SubmitRequest = React.lazy(() => import("./pages/SubmitRequest"));
const CommonIssues = React.lazy(() => import("./pages/CommonIssues"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Login = React.lazy(() => import("./pages/Login"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Simple loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = createQueryClient();

const appConfig = {
  features: {
    ai: import.meta.env.VITE_ENABLE_AI !== 'false',
    attachments: true,
    notifications: true,
  },
};

// Chat service configuration
const chatConfig = {
  baseUrl: import.meta.env.VITE_API_URL || 'https://localhost:7181',
};

function App() {
  const { preferences } = usePreferences();
  const { isAuthenticated, loading } = useAuth();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider config={appConfig}>
          <AuthProvider>
            <ChatProvider config={chatConfig}>
              <TooltipProvider delayDuration={0}>
                <BrowserRouter>
                  <ScrollToTop />
                  <Toaster />
                  <Sonner 
                    theme={preferences.theme} 
                    richColors 
                    closeButton
                  />
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route
                        element={
                          <RequireAuth>
                            <Layout />
                          </RequireAuth>
                        }
                      >
                        <Route path="/" element={<HomePage />} />
                        <Route path="/tickets" element={<Tickets />} />
                        <Route path="/submit" element={<SubmitRequest />} />
                        <Route path="/issues" element={<CommonIssues />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Profile />} />
                      </Route>

                      <Route
                        element={
                          <RequireUnauth>
                            <Outlet />
                          </RequireUnauth>
                        }
                      >
                        <Route path="/login" element={<Login />} />
                      </Route>

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </TooltipProvider>
            </ChatProvider>
          </AuthProvider>
        </ConfigProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// Auth route guards
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function RequireUnauth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default App;
