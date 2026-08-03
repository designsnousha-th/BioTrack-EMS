import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Installations from './pages/Installations';
import ServiceCalls from './pages/ServiceCalls';
import PMCalendar from './pages/PMCalendar';
import Inventory from './pages/Inventory';
import Accounts from './pages/Accounts';
import Settings from './pages/Settings';
import { Equipment } from './pages/Equipment';
import { DailyReports } from './pages/DailyReports';

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'SERVICE_MANAGER', 'VIEWER']}>
                  <Customers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/equipment"
              element={
                <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SERVICE_MANAGER', 'VIEWER']}>
                  <Equipment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/installations"
              element={
                <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_EXECUTIVE', 'SERVICE_MANAGER', 'SERVICE_ENGINEER', 'VIEWER']}>
                  <Installations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/service-calls"
              element={
                <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'SERVICE_MANAGER', 'SERVICE_ENGINEER', 'VIEWER']}>
                  <ServiceCalls />
                </ProtectedRoute>
              }
            />
            <Route
              path="/preventive-maintenance"
              element={
                <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'SERVICE_MANAGER', 'SERVICE_ENGINEER', 'VIEWER']}>
                  <PMCalendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'SERVICE_MANAGER', 'VIEWER']}>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts"
              element={
                <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS', 'SALES_MANAGER', 'VIEWER']}>
                  <Accounts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN']}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/daily-reports"
              element={
                <ProtectedRoute>
                  <DailyReports />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
