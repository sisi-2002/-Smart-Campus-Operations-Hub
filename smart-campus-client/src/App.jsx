import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';

import UserDashboard from './pages/UserDashboard';
import OAuth2CallbackPage from './pages/OAuth2CallbackPage';
import TechnicianDashboard from './pages/TechnicianDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookingList from './components/Bookings/BookingList';
import CreateBooking from './components/Bookings/CreateBooking';
import ResourceManagement from './components/Admin/ResourceManagement';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ChatBot from './components/ChatBot';
import AuthPage from './pages/AuthPage';
import Navbar from './components/Navbar';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// ✅ Layout wrapper (Navbar + ChatBot)
function ProtectedLayout({ children }) {
  return (
    <div>
      <Navbar />
      <div style={{ minHeight: 'calc(100vh - 60px)' }}>
        {children}
      </div>
      <ChatBot />
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Routes - Any authenticated user */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <UserDashboard />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      {/* Booking Routes */}
      <Route
        path="/create-booking"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <CreateBooking />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <BookingList isAdmin={false} />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <ProtectedLayout>
              <AdminDashboard />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/resources"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <ProtectedLayout>
              <ResourceManagement />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <ProtectedLayout>
              <BookingList isAdmin={true} />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      {/* Manager Routes */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute requiredRole="MANAGER">
            <ProtectedLayout>
              <ManagerDashboard />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      {/* Technician Routes */}
      <Route
        path="/technician"
        element={
          <ProtectedRoute requiredRole="TECHNICIAN">
            <ProtectedLayout>
              <TechnicianDashboard />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

    



  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}