import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import NotificationPanel from './NotificationPanel';

export default function Navbar() {
  const { user, logout, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => { logout(); setShowLogoutConfirm(false); navigate('/login'); };

  const roleColor = {
    ADMIN: { bg: '#fef3c7', text: '#92400e' },
    TECHNICIAN: { bg: '#dbeafe', text: '#1e40af' },
    MANAGER: { bg: '#f3e8ff', text: '#6b21a8' },
    USER: { bg: '#dcfce7', text: '#166534' },
  }[user?.role] || { bg: '#f1f5f9', text: '#475569' };

  return (
    <>
      <nav style={s.nav}>
        <div style={s.left}>
          <span style={s.logo} onClick={() => navigate('/dashboard')}>
            🎓 Smart Campus
          </span>



          {/* MODULE B: Uncomment when Booking page is implemented */}
          {/* <button style={s.navLink} onClick={() => navigate('/bookings')}>
          Bookings
        </button> */}

          {(isAdmin() || isManager()) && (
            <button style={s.navLink} onClick={() => navigate('/check-in')}>
              Check-in
            </button>
          )}

          {/* MODULE C: Uncomment when Tickets page is implemented */}
          {/* <button style={s.navLink} onClick={() => navigate('/tickets')}>
          Tickets
        </button> */}
        </div>

        <div style={s.right}>
          {/* ✅ Notification bell */}
          <NotificationPanel />

          {/* User info */}
          <div style={s.userInfo}>
            <div style={s.avatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={s.userName}>{user?.name}</div>
              <span style={{
                ...s.roleBadge, background: roleColor.bg,
                color: roleColor.text
              }}>
                {user?.role}
              </span>
            </div>
          </div>

          <button style={s.logoutBtn} onClick={() => setShowLogoutConfirm(true)}>
            Logout
          </button>
        </div>
      </nav>

      {showLogoutConfirm && (
        <div style={s.modalOverlay}>
          <div style={s.modalCard}>
            <div style={s.modalIcon}>👋</div>
            <h3 style={s.modalTitle}>Log Out</h3>
            <p style={s.modalDest}>
              Are you sure you want to log out of your account?
            </p>
            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={() => setShowLogoutConfirm(false)}>No</button>
              <button style={s.confirmBtn} onClick={handleLogout}>Yes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const s = {
  nav: { background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 60, position: 'sticky', top: 0, zIndex: 100 },
  left: { display: 'flex', alignItems: 'center', gap: 8 },
  right: { display: 'flex', alignItems: 'center', gap: 16 },
  logo: { fontWeight: 700, fontSize: 18, color: '#6366f1', cursor: 'pointer', marginRight: 16 },
  navLink: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#475569', padding: '6px 10px', borderRadius: 6 },
  userInfo: { display: 'flex', alignItems: 'center', gap: 8 },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14 },
  userName: { fontSize: 13, fontWeight: 500, color: '#1e293b' },
  roleBadge: { fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 10 },
  logoutBtn: { padding: '6px 14px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalCard: { background: '#fff', borderRadius: 20, padding: '2.5rem 2.5rem', width: '100%', maxWidth: 400, textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
  modalIcon: { fontSize: 48, marginBottom: 16 },
  modalTitle: { margin: '0 0 12px', fontSize: 22, color: '#0f172a', fontWeight: 700 },
  modalDest: { margin: '0 0 32px', fontSize: 14, color: '#64748b', lineHeight: 1.6 },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'center' },
  cancelBtn: { padding: '12px 24px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: 14, transition: 'all 0.2s' },
  confirmBtn: { padding: '12px 24px', borderRadius: 10, border: 'none', background: '#4f46e5', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14, boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)', transition: 'all 0.2s' },
};