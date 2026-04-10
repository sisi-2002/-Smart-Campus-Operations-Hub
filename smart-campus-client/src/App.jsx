import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';

import UserDashboard from './pages/UserDashboard';
import OAuth2CallbackPage from './pages/OAuth2CallbackPage';
import TechnicianDashboard from './pages/TechnicianDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import BookingList from './components/Bookings/BookingList';
import CreateBooking from './components/Bookings/CreateBooking';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ChatBot from './components/ChatBot';
import AuthPage from './pages/AuthPage';
import BookingCalendar from './components/Bookings/BookingCalendar';
import BookingAnalytics from './components/Bookings/BookingAnalytics';

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
<<<<<<< Updated upstream
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
=======
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
    
        {/* Protected Routes - Any authenticated user */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Booking Routes */}
        <Route
          path="/create-booking"
          element={
            <ProtectedRoute>
>>>>>>> Stashed changes
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

        {/* Calendar View Route - Any authenticated user */}
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <BookingCalendar isAdmin={false} />
            </ProtectedRoute>
          }
        />

<<<<<<< Updated upstream


      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <ProtectedLayout>
=======
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
>>>>>>> Stashed changes
              <AdminDashboard />
            </ProtectedLayout>
          </ProtectedRoute>
        }
      />

<<<<<<< Updated upstream
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
=======
        {/* Manager Routes */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute requiredRole="MANAGER">
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
>>>>>>> Stashed changes

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

        {/* Admin Calendar View */}
        <Route
          path="/admin/calendar"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <BookingCalendar isAdmin={true} />
            </ProtectedRoute>
          }
        />

<<<<<<< Updated upstream
        {/* Admin Analytics Dashboard */}
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <BookingAnalytics />
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

    


=======
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
>>>>>>> Stashed changes

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