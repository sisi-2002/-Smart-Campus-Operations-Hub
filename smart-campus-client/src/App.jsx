import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import OAuth2CallbackPage from './pages/OAuth2CallbackPage';
import AdminDashboard from './pages/AdminDashboard';
// Import Booking Components
import BookingList from './components/Bookings/BookingList';
import CreateBooking from './components/Bookings/CreateBooking';
import ResourceManagement from './components/Admin/ResourceManagement';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />

          {/* Protected Routes - Any authenticated user */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* Booking Routes - Any authenticated user */}
          <Route 
            path="/create-booking" 
            element={
              <ProtectedRoute>
                <CreateBooking />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/my-bookings" 
            element={
              <ProtectedRoute>
                <BookingList isAdmin={false} />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes - ADMIN only */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/resources" 
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <ResourceManagement />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/bookings" 
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <BookingList isAdmin={true} />
              </ProtectedRoute>
            } 
          />

          {/* Redirect all unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}