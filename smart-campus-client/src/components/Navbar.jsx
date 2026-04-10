import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationPanel from './NotificationPanel';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleColor = {
    ADMIN:      { bg:'#fef3c7', text:'#92400e' },
    TECHNICIAN: { bg:'#dbeafe', text:'#1e40af' },
    MANAGER:    { bg:'#f3e8ff', text:'#6b21a8' },
    USER:       { bg:'#dcfce7', text:'#166534' },
  }[user?.role] || { bg:'#f1f5f9', text:'#475569' };

  return (
    <nav style={s.nav}>
      <div style={s.left}>
        <span style={s.logo} onClick={() => navigate('/dashboard')}>
          🎓 Smart Campus
        </span>

        {/* Navigation links */}
        <button style={s.navLink} onClick={() => navigate('/dashboard')}>
          Dashboard
        </button>

        {/* MODULE B: Uncomment when Booking page is implemented */}
        {/* <button style={s.navLink} onClick={() => navigate('/bookings')}>
          Bookings
        </button> */}

        {/* MODULE C: Uncomment when Tickets page is implemented */}
        {/* <button style={s.navLink} onClick={() => navigate('/tickets')}>
          Tickets
        </button> */}

        {isAdmin() && (
          <button style={s.navLink} onClick={() => navigate('/admin')}>
            Admin
          </button>
        )}
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
            <span style={{ ...s.roleBadge, background: roleColor.bg,
              color: roleColor.text }}>
              {user?.role}
            </span>
          </div>
        </div>

        <button style={s.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

const s = {
  nav:       { background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'0 2rem', display:'flex', justifyContent:'space-between', alignItems:'center', height:60, position:'sticky', top:0, zIndex:100 },
  left:      { display:'flex', alignItems:'center', gap:8 },
  right:     { display:'flex', alignItems:'center', gap:16 },
  logo:      { fontWeight:700, fontSize:18, color:'#6366f1', cursor:'pointer', marginRight:16 },
  navLink:   { background:'none', border:'none', cursor:'pointer', fontSize:14, color:'#475569', padding:'6px 10px', borderRadius:6 },
  userInfo:  { display:'flex', alignItems:'center', gap:8 },
  avatar:    { width:32, height:32, borderRadius:'50%', background:'#6366f1', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:14 },
  userName:  { fontSize:13, fontWeight:500, color:'#1e293b' },
  roleBadge: { fontSize:10, fontWeight:600, padding:'1px 7px', borderRadius:10 },
  logoutBtn: { padding:'6px 14px', border:'1px solid #e2e8f0', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:13 },
};