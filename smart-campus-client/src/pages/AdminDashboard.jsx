import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, getStats, updateRole, toggleStatus, deleteUser } from '../api/adminApi';

const ROLES = ['USER', 'TECHNICIAN', 'MANAGER', 'ADMIN'];

const ROLE_STYLE = {
  ADMIN:      { background:'#fef3c7', color:'#92400e' },
  TECHNICIAN: { background:'#dbeafe', color:'#1e40af' },
  MANAGER:    { background:'#f3e8ff', color:'#6b21a8' },
  USER:       { background:'#dcfce7', color:'#166534' },
};

export default function AdminDashboard() {
  const { user, logout }      = useAuth();
  const navigate               = useNavigate();
  const [users, setUsers]      = useState([]);
  const [stats, setStats]      = useState(null);
  const [loading, setLoading]  = useState(true);
  const [toast, setToast]      = useState(null);   // { msg, type }
  const [search, setSearch]    = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab]   = useState('users');
  const [updating, setUpdating]     = useState(null); // userId being updated
  const [userToDelete, setUserToDelete] = useState(null); // Added for custom delete modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        getAllUsers(),
        getStats(),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole, currentRole) => {
    if (newRole === currentRole) return;

    // Prevent admin from changing their own role
    if (userId === user.id) {
      showToast("You can't change your own role", 'error');
      return;
    }

    setUpdating(userId);
    try {
      const res = await updateRole(userId, newRole);
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, role: res.data.role, mfaEnabled: res.data.mfaEnabled } : u
      ));
      showToast(`Role updated to ${newRole}`, 'success');

      // Refresh stats
      const statsRes = await getStats();
      setStats(statsRes.data);

    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update role', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (userId === user.id) {
      showToast("You can't disable your own account", 'error');
      return;
    }
    setUpdating(userId);
    try {
      const res = await toggleStatus(userId);
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, enabled: res.data.enabled } : u
      ));
      showToast(
        res.data.enabled ? 'Account enabled' : 'Account disabled',
        'success'
      );
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteClick = (userObj) => {
    if (userObj.id === user.id) {
      showToast("You can't delete your own account", 'error');
      return;
    }
    setUserToDelete(userObj);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    const userId = userToDelete.id;
    setUpdating(userId);
    setUserToDelete(null); // close modal

    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast('User deleted successfully', 'success');

      // Refresh stats
      const statsRes = await getStats();
      setStats(statsRes.data);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete user', 'error');
    } finally {
      // If we happened to set updating...
      setUpdating(null);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Filter users by search + role + status
  const filtered = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? u.enabled : !u.enabled);
    return matchSearch && matchRole && matchStatus;
  });

  const handleLogoutClick = () => { setShowLogoutConfirm(true); };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/');
  };

  const renderUsersTab = () => (
    <>
      {/* Stats cards for Users */}
      {stats && (
        <div style={s.statsGrid}>
          {[
            { label:'Total Users',  value: stats.total,       color:'#6366f1' },
            { label:'Admins',       value: stats.admins,      color:'#f59e0b' },
            { label:'Technicians',  value: stats.technicians, color:'#3b82f6' },
            { label:'Regular Users',value: stats.users,       color:'#10b981' },
            { label:'2FA Enabled',  value: stats.mfaEnabled,  color:'#8b5cf6' },
            { label:'Disabled',     value: stats.disabled,    color:'#ef4444' },
          ].map((stat) => (
            <div key={stat.label} style={s.statCard}>
              <div style={{ ...s.statNum, color: stat.color }}>{stat.value}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={s.filterBar}>
        <input
          style={s.searchInput}
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select style={s.filterSelect} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="ALL">All Roles</option>
          {ROLES.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select style={s.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
        </select>
        <span style={s.resultCount}>
          {filtered.length} of {users.length} users
        </span>
      </div>

      {/* Users table */}
      <div style={s.tableWrap}>
        {loading ? (
          <div style={s.loadingBox}>
            <div style={s.spinner}/>
            <p style={{ color:'#64748b' }}>Loading users...</p>
            <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.emptyBox}>No users found for this filter</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={s.th}>User</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Provider</th>
                <th style={s.th}>2FA</th>
                <th style={s.th}>Role</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} style={{ ...s.tr, opacity: updating === u.id ? 0.5 : 1 }}>
                  <td style={s.td}>
                    <div style={s.nameCell}>
                      <div style={{
                        ...s.avatar,
                        background: u.id === user.id ? '#6366f1' : '#e2e8f0',
                        color:      u.id === user.id ? '#fff' : '#475569',
                      }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={s.userName}>
                          {u.name}
                          {u.id === user.id && <span style={s.youBadge}>You</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={s.td}><span style={{ fontSize:13, color:'#475569' }}>{u.email}</span></td>
                  <td style={s.td}>
                    <span style={{
                      ...s.pill,
                      background: u.provider === 'GOOGLE' ? '#fef3c7' : '#f1f5f9',
                      color:      u.provider === 'GOOGLE' ? '#92400e' : '#475569',
                    }}>
                      {u.provider === 'GOOGLE' ? '🔵 Google' : '🔑 Local'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{
                      ...s.pill,
                      background: (u.mfaEnabled || ['ADMIN', 'TECHNICIAN', 'MANAGER'].includes(u.role)) ? '#dcfce7' : '#f1f5f9',
                      color:      (u.mfaEnabled || ['ADMIN', 'TECHNICIAN', 'MANAGER'].includes(u.role)) ? '#166534' : '#94a3b8',
                    }}>
                      {(u.mfaEnabled || ['ADMIN', 'TECHNICIAN', 'MANAGER'].includes(u.role)) ? '✓ On' : '✕ Off'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <select
                      style={{
                        ...s.roleSelect,
                        ...ROLE_STYLE[u.role],
                        cursor: updating === u.id || u.id === user.id || u.role === 'ADMIN' ? 'not-allowed' : 'pointer',
                      }}
                      value={u.role}
                      disabled={updating === u.id || u.id === user.id || u.role === 'ADMIN'}
                      onChange={(e) => handleRoleChange(u.id, e.target.value, u.role)}
                    >
                      {u.role === 'ADMIN' ? (
                        <option value="ADMIN">ADMIN</option>
                      ) : (
                        ['USER', 'TECHNICIAN', 'MANAGER'].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))
                      )}
                    </select>
                  </td>
                  <td style={s.td}>
                    <span style={{
                      ...s.pill,
                      background: u.enabled ? '#dcfce7' : '#fee2e2',
                      color:      u.enabled ? '#166534' : '#991b1b',
                    }}>
                      {u.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={{ display:'flex', gap: 6 }}>
                      <button
                        style={{
                          ...s.actionBtn,
                          background: u.enabled ? '#fee2e2' : '#dcfce7',
                          color:      u.enabled ? '#991b1b' : '#166534',
                          opacity: u.id === user.id ? 0.4 : 1,
                          cursor:  u.id === user.id ? 'not-allowed' : 'pointer',
                        }}
                        disabled={updating === u.id || u.id === user.id}
                        onClick={() => handleToggleStatus(u.id, u.enabled)}
                      >
                        {u.enabled ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        style={{
                          ...s.actionBtn,
                          background: '#fef2f2',
                          color: '#dc2626',
                          opacity: u.id === user.id ? 0.4 : 1,
                          cursor:  u.id === user.id ? 'not-allowed' : 'pointer',
                        }}
                        disabled={updating === u.id || u.id === user.id}
                        onClick={() => handleDeleteClick(u)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );

  return (
    <div style={s.layout}>

      {/* Toast notification */}
      {toast && (
        <div style={{ ...s.toast,
          background: toast.type === 'success' ? '#10b981' : '#ef4444' }}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div style={s.modalOverlay}>
          <div style={s.modalCard}>
            <div style={s.modalIcon}>⚠️</div>
            <h3 style={s.modalTitle}>Delete User</h3>
            <p style={s.modalDest}>
              Are you sure you want to delete <strong>{userToDelete.name}</strong>?
              This action cannot be undone.
            </p>
            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={() => setUserToDelete(null)}>Cancel</button>
              <button style={s.confirmDeleteBtn} onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
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
              <button style={{ ...s.confirmDeleteBtn, background: '#4f46e5', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }} onClick={confirmLogout}>Yes</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <div style={s.sidebar}>
        <div style={s.brand}>
          <div style={s.brandLogo}>S</div>
          <div style={s.brandText}>Operations Hub</div>
        </div>
        <nav style={s.navGroup}>
          <button style={activeTab === 'users' ? s.navItemActive : s.navItem} onClick={() => setActiveTab('users')}>
            👥 User Management
          </button>
          <button style={activeTab === 'assets' ? s.navItemActive : s.navItem} onClick={() => setActiveTab('assets')}>
            📦 Asset Management
          </button>
          <button style={activeTab === 'bookings' ? s.navItemActive : s.navItem} onClick={() => setActiveTab('bookings')}>
            📅 Booking Management
          </button>
          <button style={activeTab === 'tickets' ? s.navItemActive : s.navItem} onClick={() => setActiveTab('tickets')}>
            🎫 Ticket Management
          </button>
        </nav>
      </div>

      <div style={s.mainContent}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.headerTitle}>
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'assets' && 'Asset Management'}
              {activeTab === 'bookings' && 'Booking Management'}
              {activeTab === 'tickets' && 'Ticket Management'}
            </h1>
            <p style={s.headerSub}>Manage campus resources and users</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={s.adminBadge}>ADMIN</span>
            <span style={{ fontSize:14, color:'#64748b' }}>{user?.name}</span>
            <button style={s.logoutBtn} onClick={handleLogoutClick}>Logout</button>
          </div>
        </div>

        {/* Tab Content Rendering */}
        <div style={s.contentArea}>
          {activeTab === 'users' && renderUsersTab()}
          
          {activeTab === 'assets' && (
            <div style={s.placeholderBox}>
              <span style={{fontSize: 40}}>📦</span>
              <h3 style={{margin: '10px 0 5px'}}>Assets coming soon</h3>
              <p style={{margin: 0, color:'#64748b'}}>Asset management features will be available here.</p>
            </div>
          )}
          
          {activeTab === 'bookings' && (
            <div style={s.placeholderBox}>
              <span style={{fontSize: 40}}>📅</span>
              <h3 style={{margin: '10px 0 5px'}}>Bookings coming soon</h3>
              <p style={{margin: 0, color:'#64748b'}}>Booking management features will be available here.</p>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div style={s.placeholderBox}>
              <span style={{fontSize: 40}}>🎫</span>
              <h3 style={{margin: '10px 0 5px'}}>Tickets coming soon</h3>
              <p style={{margin: 0, color:'#64748b'}}>Ticketing and support features will be available here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────
const s = {
  layout:      { display:'flex', minHeight:'100vh', background:'#f8fafc' },
  sidebar:     { width:260, background:'#0f172a', color:'#fff', display:'flex', flexDirection:'column', flexShrink:0 },
  brand:       { padding:'24px 20px', borderBottom:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', gap:12 },
  brandLogo:   { width:32, height:32, borderRadius:8, background:'linear-gradient(135deg, #6366f1, #06b6d4)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:18 },
  brandText:   { fontWeight:600, fontSize:16, letterSpacing:0.5 },
  navGroup:    { display:'flex', flexDirection:'column', gap:4, padding:'20px 12px' },
  navItem:     { background:'transparent', border:'none', color:'#94a3b8', padding:'12px 16px', textAlign:'left', borderRadius:8, fontSize:14, fontWeight:500, cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', gap:10 },
  navItemActive: { background:'rgba(99,102,241,0.15)', border:'none', color:'#818cf8', padding:'12px 16px', textAlign:'left', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:10 },
  mainContent: { flex:1, display:'flex', flexDirection:'column', minWidth:0 },
  contentArea: { paddingBottom:'3rem', overflowX:'auto' },
  placeholderBox:{ background:'#fff', margin:'2rem', padding:'4rem 2rem', borderRadius:16, textAlign:'center', border:'1px dashed #cbd5e1', color:'#475569'},
  header:      { background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'1.2rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:10 },
  headerTitle: { margin:0, fontSize:22, fontWeight:700, color:'#0f172a' },
  headerSub:   { margin:'4px 0 0', fontSize:13, color:'#64748b' },
  adminBadge:  { background:'#fef3c7', color:'#92400e', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 },
  logoutBtn:   { padding:'7px 16px', border:'1px solid #e2e8f0', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:13, fontWeight:500 },
  statsGrid:   { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:12, padding:'1.5rem 2rem 0' },
  statCard:    { background:'#fff', borderRadius:12, padding:'1.2rem', textAlign:'center', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', border:'1px solid #f1f5f9' },
  statNum:     { fontSize:28, fontWeight:700 },
  statLabel:   { fontSize:12, color:'#64748b', marginTop:4, fontWeight:500 },
  filterBar:   { display:'flex', alignItems:'center', gap:12, padding:'1.5rem 2rem 1rem', flexWrap:'wrap' },
  searchInput: { flex:1, minWidth:200, padding:'9px 14px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, outline:'none' },
  filterSelect:{ padding:'9px 14px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, outline:'none', background:'#fff', cursor:'pointer' },
  resultCount: { fontSize:13, color:'#94a3b8', whiteSpace:'nowrap', fontWeight:500 },
  tableWrap:   { margin:'0 2rem', background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden', border:'1px solid #f1f5f9' },
  table:       { width:'100%', borderCollapse:'collapse' },
  thead:       { background:'#f8fafc' },
  th:          { padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:600, color:'#64748b', textTransform:'uppercase', letterSpacing:.5, borderBottom:'1px solid #e2e8f0' },
  tr:          { borderBottom:'1px solid #f1f5f9', transition:'background .15s' },
  td:          { padding:'12px 16px', verticalAlign:'middle' },
  nameCell:    { display:'flex', alignItems:'center', gap:10 },
  avatar:      { width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:15, flexShrink:0 },
  userName:    { fontSize:14, fontWeight:600, color:'#1e293b', display:'flex', alignItems:'center', gap:6 },
  youBadge:    { background:'#ede9fe', color:'#6d28d9', fontSize:10, padding:'2px 8px', borderRadius:12, fontWeight:600 },
  pill:        { padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600 },
  roleSelect:  { padding:'5px 10px', borderRadius:20, fontSize:12, fontWeight:600, border:'none', outline:'none' },
  actionBtn:   { padding:'6px 14px', borderRadius:8, border:'none', fontSize:12, fontWeight:600, transition:'transform 0.1s' },
  loadingBox:  { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'4rem', gap:16 },
  spinner:     { width:36, height:36, border:'3px solid #e2e8f0', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin .8s linear infinite' },
  emptyBox:    { textAlign:'center', padding:'4rem', color:'#64748b', fontSize:15, background:'#f8fafc' },
  toast:       { position:'fixed', top:24, right:24, color:'#fff', padding:'14px 24px', borderRadius:12, fontSize:14, fontWeight:600, zIndex:9999, boxShadow:'0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' },
  modalOverlay:{ position:'fixed', inset:0, background:'rgba(15,23,42,0.6)', backdropFilter:'blur(4px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' },
  modalCard:   { background:'#fff', borderRadius:20, padding:'2.5rem 2.5rem', width:'100%', maxWidth:400, textAlign:'center', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.25)' },
  modalIcon:   { fontSize:48, marginBottom:16 },
  modalTitle:  { margin:'0 0 12px', fontSize:22, color:'#0f172a', fontWeight:700 },
  modalDest:   { margin:'0 0 32px', fontSize:14, color:'#64748b', lineHeight:1.6 },
  modalActions:{ display:'flex', gap:12, justifyContent:'center' },
  cancelBtn:   { padding:'12px 24px', borderRadius:10, border:'1px solid #e2e8f0', background:'#fff', color:'#475569', fontWeight:600, cursor:'pointer', fontSize:14, transition:'all 0.2s' },
  confirmDeleteBtn: { padding:'12px 24px', borderRadius:10, border:'none', background:'#dc2626', color:'#fff', fontWeight:600, cursor:'pointer', fontSize:14, boxShadow:'0 4px 12px rgba(220,38,38,0.2)', transition:'all 0.2s' },
};