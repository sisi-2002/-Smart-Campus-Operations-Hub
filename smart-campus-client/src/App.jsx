import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import OAuth2CallbackPage from './pages/OAuth2CallbackPage';
import AdminDashboard from './pages/AdminDashboard';      // ✅ Imported your new dashboard

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"                element={<HomePage />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />

          {/* Protected - any logged in user */}
          <Route path="/dashboard" element={
            <ProtectedRoute><UserDashboard /></ProtectedRoute>
          } />

          {/* ✅ Admin only - Updated to use the actual component */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}