import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={{ margin:0 }}>Smart Campus</h2>
        <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      <div style={s.card}>
        <h3 style={{ marginTop:0 }}>Welcome, {user?.name}</h3>
        <div style={s.row}><span style={s.label}>Email</span><span>{user?.email}</span></div>
        <div style={s.row}><span style={s.label}>Role</span>
          <span style={{ ...s.badge,
            background: user?.role === 'ADMIN' ? '#fef3c7' : '#ede9fe',
            color: user?.role === 'ADMIN' ? '#92400e' : '#5b21b6' }}>
            {user?.role}
          </span>
        </div>
        <div style={s.row}><span style={s.label}>ID</span>
          <span style={{ fontSize:12, color:'#94a3b8' }}>{user?.id}</span>
        </div>
      </div>

      {isAdmin() && (
        <div style={s.adminCard}>
          <strong>Admin access enabled</strong>
          <p style={{ margin:'4px 0 0', fontSize:13 }}>
            You can manage users and review bookings.
          </p>
        </div>
      )}
    </div>
  );
}

const s = {
  page:      { maxWidth:700, margin:'0 auto', padding:'2rem' },
  header:    { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' },
  logoutBtn: { padding:'8px 16px', border:'1px solid #e2e8f0', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:14 },
  card:      { background:'#fff', borderRadius:12, padding:'1.5rem', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', marginBottom:'1rem' },
  row:       { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #f1f5f9' },
  label:     { fontSize:13, color:'#64748b' },
  badge:     { padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:500 },
  adminCard: { background:'#fffbeb', border:'1px solid #fde68a', borderRadius:12, padding:'1rem 1.5rem' },
};