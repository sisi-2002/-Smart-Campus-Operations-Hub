import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // ✅ Added useAuth
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
import UnauthorizedPage from './pages/UnauthorizedPage';

// ✅ Import ChatBot
import ChatBot from './components/ChatBot';

// ✅ Create an inner component so it can safely access AuthContext
function AppRoutes() {
  const { user } = useAuth();

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
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole = "USER" >
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Admin only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* ✅ Show chatbot only when the user is logged in */}
      {user && <ChatBot />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Render the inner routes component here */}
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}