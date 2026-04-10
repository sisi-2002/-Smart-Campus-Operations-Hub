import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
//import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationToasts from './components/NotificationToasts';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OAuth2CallbackPage from './pages/OAuth2CallbackPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';

import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import BookingList from './components/Bookings/BookingList';
import CreateBooking from './components/Bookings/CreateBooking';
import BookingCalendar from './components/Bookings/BookingCalendar';
import BookingAnalytics from './components/Bookings/BookingAnalytics';

function ProtectedLayout({ children }) {
  return (
    <div>
      <Navbar />
      <div style={{ minHeight: 'calc(100vh - 60px)' }}>{children}</div>
      <ChatBot />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

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

      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <ProtectedLayout>
              <BookingCalendar isAdmin={false} />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

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
        path="/admin/bookings"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <ProtectedLayout>
              <BookingList isAdmin={true} />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/calendar"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <ProtectedLayout>
              <BookingCalendar isAdmin={true} />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <ProtectedLayout>
              <BookingAnalytics />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AppRoutes />
          <NotificationToasts />
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
