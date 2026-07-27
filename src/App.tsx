import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Splash } from './pages/Splash';
import { Auth } from './pages/Auth';
import { RoleSelection } from './pages/RoleSelection';
import { AppLayout } from './components/AppLayout';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { VolunteerDashboard } from './pages/VolunteerDashboard';
import { NGODashboard } from './pages/NGODashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ReportPage } from './pages/ReportPage';
import { TrackingPage } from './pages/TrackingPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { useAuth } from './hooks/useAuth';
const queryClient = new QueryClient();
function ProtectedRoute({ children }: {children: React.ReactNode;}) {
  const { user, isLoading } = useAuth();
  if (isLoading)
  return (
    <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>);

  if (!user) return <Navigate to="/splash" replace />;
  if (!user.app_role) return <Navigate to="/onboarding/role" replace />;
  return <AppLayout>{children}</AppLayout>;
}
function DashboardRouter() {
  const { user } = useAuth();
  switch (user?.app_role) {
    case 'citizen':
      return <CitizenDashboard />;
    case 'volunteer':
      return <VolunteerDashboard />;
    case 'ngo':
      return <NGODashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/onboarding/role" replace />;
  }
}
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/splash" element={<Splash />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding/role" element={<RoleSelection />} />

          <Route
            path="/"
            element={
            <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } />
          
          <Route
            path="/report"
            element={
            <ProtectedRoute>
                <ReportPage />
              </ProtectedRoute>
            } />
          
          <Route
            path="/tracking/:id"
            element={
            <ProtectedRoute>
                <TrackingPage />
              </ProtectedRoute>
            } />
          
          <Route
            path="/notifications"
            element={
            <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } />
          
          <Route
            path="/profile"
            element={
            <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
          

          <Route path="*" element={<Navigate to="/splash" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </QueryClientProvider>);

}