import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, getStats, updateRole, toggleStatus, deleteUser } from '../api/adminApi';
import BookingList from '../components/Bookings/BookingList';
import ResourceManagement from '../components/Admin/ResourceManagement';

const ROLES = ['USER', 'TECHNICIAN', 'MANAGER', 'ADMIN'];

const ROLE_STYLE = {
  ADMIN:      { background:'#fef3c7', color:'#92400e' },
  TECHNICIAN: { background:'#dbeafe', color:'#1e40af' },
  MANAGER:    { background:'#f3e8ff', color:'#6b21a8' },
  USER:       { background:'#dcfce7', color:'#166534' },
};

const bookingCSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Epilogue:wght@400;500;600&display=swap');

.bm-wrap {
  padding: 0;
  font-family: 'Epilogue', sans-serif;
}

.bm-hero {
  background: linear-gradient(135deg, #0d7a6b 0%, #0a5c50 100%);
  padding: 28px 32px 24px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.bm-hero-eyebrow {
  font-size: 10px; font-weight: 700; letter-spacing: .18em;
  text-transform: uppercase; color: #a7f3d0; margin-bottom: 6px;
}
.bm-hero-title {
  font-family: 'Playfair Display', serif;
  font-size: 26px; font-weight: 700; color: #fff;
  letter-spacing: -.01em; line-height: 1.1;
}
.bm-hero-sub {
  font-size: 13px; color: #6ee7b7; margin-top: 5px; font-weight: 400;
}
.bm-hero-badge {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 16px; border-radius: 30px;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.2);
  color: #d1fae5; font-size: 12px; font-weight: 600;
  white-space: nowrap;
}
.bm-hero-badge-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 0 2px #34d39944;
  animation: bm-pulse 2s infinite;
}
@keyframes bm-pulse {
  0%,100% { box-shadow: 0 0 0 2px #34d39944; }
  50%      { box-shadow: 0 0 0 5px #34d39900; }
}

.bm-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-bottom: 1px solid #e4dfd4;
}
.bm-stat {
  padding: 18px 24px;
  border-right: 1px solid #e4dfd4;
  display: flex; flex-direction: column; gap: 4px;
  background: #fff;
  transition: background .18s;
}
.bm-stat:last-child { border-right: none; }
.bm-stat:hover { background: #faf9f7; }
.bm-stat-val {
  font-family: 'Playfair Display', serif;
  font-size: 24px; font-weight: 700; color: #1c1917;
  line-height: 1;
}
.bm-stat-label {
  font-size: 11px; font-weight: 600; letter-spacing: .08em;
  text-transform: uppercase; color: #78716c;
  display: flex; align-items: center; gap: 5px;
}
.bm-stat-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

/* ── Toolbar ── */
.bm-toolbar {
  background: #faf9f7;
  border-bottom: 1px solid #e4dfd4;
  padding: 14px 24px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap;
}
.bm-toolbar-left  { display: flex; align-items: center; gap: 8px; }
.bm-toolbar-right { display: flex; align-items: center; gap: 8px; }
.bm-toolbar-label {
  font-size: 11px; font-weight: 600; letter-spacing: .08em;
  text-transform: uppercase; color: #78716c;
}

/* ── Filter tabs — active state now has visual feedback + count badge ── */
.bm-ftabs { display: flex; gap: 4px; }
.bm-ftab {
  padding: 6px 14px; border-radius: 7px;
  border: 1px solid #e4dfd4;
  font-family: 'Epilogue', sans-serif; font-size: 12px; font-weight: 500;
  color: #78716c; cursor: pointer; background: #fff;
  transition: all .15s;
  display: flex; align-items: center; gap: 6px;
}
.bm-ftab:hover { background: #e4dfd4; color: #1c1917; border-color: #d0ccc5; }
.bm-ftab.on    { background: #0d7a6b; color: #fff; border-color: #0d7a6b; font-weight: 600; }
.bm-ftab.on .bm-ftab-count { background: rgba(255,255,255,.25); color: #fff; }

/* count badge on each tab */
.bm-ftab-count {
  background: #e4dfd4; color: #78716c;
  font-size: 10px; font-weight: 700;
  padding: 1px 6px; border-radius: 10px;
  min-width: 20px; text-align: center;
  transition: background .15s, color .15s;
}

/* active filter label shown above the list */
.bm-active-filter-bar {
  background: #fff;
  border-bottom: 1px solid #e4dfd4;
  padding: 10px 24px;
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: #78716c;
}
.bm-active-filter-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 6px;
  background: #0d7a6b18; border: 1px solid #0d7a6b30;
  color: #0d7a6b; font-weight: 600; font-size: 11px;
  letter-spacing: .05em;
}
.bm-active-filter-chip.all {
  background: #f1f5f9; border-color: #e2e8f0; color: #64748b;
}

.bm-admin-chip {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 12px; border-radius: 7px;
  background: #fef3c7; border: 1px solid #fde68a;
  font-size: 11px; font-weight: 600; color: #92400e;
}

.bm-list-body {
  background: #f4f1eb;
  min-height: 400px;
  padding: 24px;
}

.bm-footer-note {
  background: #fff;
  border-top: 1px solid #e4dfd4;
  padding: 11px 24px;
  font-size: 11px; color: #a8a29e;
  display: flex; align-items: center; gap: 6px;
}

@media(max-width:700px){
  .bm-hero { padding: 22px 20px 20px; }
  .bm-stats { grid-template-columns: 1fr 1fr; }
  .bm-stat:nth-child(2){ border-right: none; }
  .bm-toolbar { padding: 12px 16px; flex-direction: column; align-items: flex-start; }
  .bm-list-body { padding: 16px; }
}
`;

/* ── filter label helper ── */
const FILTER_LABELS = {
  ALL:       'All Bookings',
  PENDING:   'Pending Approval',
  APPROVED:  'Approved',
  CANCELLED: 'Cancelled',
};

export default function AdminDashboard() {
  const { user, logout }      = useAuth();
  const navigate               = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers]      = useState([]);
  const [stats, setStats]      = useState(null);
  const [loading, setLoading]  = useState(true);
  const [toast, setToast]      = useState(null);
  const [search, setSearch]    = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [updating, setUpdating]     = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  // ── Booking tab filter — now wired to BookingList via statusFilter prop ──
  const [bmFilter, setBmFilter] = useState('ALL');

  useEffect(() => {
    if (activeTab === 'users') {
      fetchData();
    }
  }, [activeTab]);

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
      showToast(res.data.enabled ? 'Account enabled' : 'Account disabled', 'success');
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
    setUserToDelete(null);
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast('User deleted successfully', 'success');
      const statsRes = await getStats();
      setStats(statsRes.data);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete user', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={s.page}>
      <style>{bookingCSS}</style>

      {/* Toast */}
      {toast && (
        <div style={{ ...s.toast, background: toast.type === 'success' ? '#10b981' : '#ef4444' }}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      {/* Delete Modal */}
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

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.headerTitle}>Admin Dashboard</h1>
          <p style={s.headerSub}>Smart Campus — Complete Management</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={s.adminBadge}>ADMIN</span>
          <span style={{ fontSize:14, color:'#64748b' }}>{user?.name}</span>
          <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={s.tabContainer}>
        <button
          style={{...s.tab, ...(activeTab === 'users' ? s.activeTab : {})}}
          onClick={() => setActiveTab('users')}
        >
          👥 User Management
        </button>
        <button
          style={{...s.tab, ...(activeTab === 'bookings' ? s.activeTab : {})}}
          onClick={() => setActiveTab('bookings')}
        >
          📅 Booking Management
        </button>
        <button
          style={{...s.tab, ...(activeTab === 'resources' ? s.activeTab : {})}}
          onClick={() => setActiveTab('resources')}
        >
          📦 Resource Management
        </button>
      </div>

      {/* ── Users Tab (unchanged) ── */}
      {activeTab === 'users' && (
        <>
          {stats && (
            <div style={s.statsGrid}>
              {[
                { label:'Total Users',   value: stats.total,       color:'#6366f1' },
                { label:'Admins',        value: stats.admins,      color:'#f59e0b' },
                { label:'Technicians',   value: stats.technicians, color:'#3b82f6' },
                { label:'Regular Users', value: stats.users,       color:'#10b981' },
                { label:'2FA Enabled',   value: stats.mfaEnabled,  color:'#8b5cf6' },
                { label:'Disabled',      value: stats.disabled,    color:'#ef4444' },
              ].map((stat) => (
                <div key={stat.label} style={s.statCard}>
                  <div style={{ ...s.statNum, color: stat.color }}>{stat.value}</div>
                  <div style={s.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          <div style={s.filterBar}>
            <input
              style={s.searchInput}
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              style={s.filterSelect}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <span style={s.resultCount}>{filtered.length} of {users.length} users</span>
          </div>

          <div style={s.tableWrap}>
            {loading ? (
              <div style={s.loadingBox}>
                <div style={s.spinner}/>
                <p style={{ color:'#64748b' }}>Loading users...</p>
                <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
              </div>
            ) : filtered.length === 0 ? (
              <div style={s.emptyBox}>No users found</div>
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
                          <div style={{ ...s.avatar, background: u.id === user.id ? '#6366f1' : '#e2e8f0', color: u.id === user.id ? '#fff' : '#475569' }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={s.userName}>
                              {u.name}
                              {u.id === user.id && <span style={s.youBadge}>You</span>}
                            </div>
                            <div style={s.userId}>ID: {u.id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td style={s.td}>{u.email}</td>
                      <td style={s.td}>
                        <span style={{ ...s.pill, background: u.provider === 'GOOGLE' ? '#fef3c7' : '#f1f5f9', color: u.provider === 'GOOGLE' ? '#92400e' : '#475569' }}>
                          {u.provider === 'GOOGLE' ? '🔵 Google' : '🔑 Local'}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{ ...s.pill, background: (u.mfaEnabled || ['ADMIN','TECHNICIAN','MANAGER'].includes(u.role)) ? '#dcfce7' : '#f1f5f9', color: (u.mfaEnabled || ['ADMIN','TECHNICIAN','MANAGER'].includes(u.role)) ? '#166534' : '#94a3b8' }}>
                          {(u.mfaEnabled || ['ADMIN','TECHNICIAN','MANAGER'].includes(u.role)) ? '✓ On' : '✕ Off'}
                        </span>
                      </td>
                      <td style={s.td}>
                        <select
                          style={{ ...s.roleSelect, ...ROLE_STYLE[u.role], cursor: updating === u.id || u.id === user.id || u.role === 'ADMIN' ? 'not-allowed' : 'pointer' }}
                          value={u.role}
                          disabled={updating === u.id || u.id === user.id || u.role === 'ADMIN'}
                          onChange={(e) => handleRoleChange(u.id, e.target.value, u.role)}
                        >
                          {u.role === 'ADMIN' ? (
                            <option value="ADMIN">ADMIN</option>
                          ) : (
                            ['USER','TECHNICIAN','MANAGER'].map(r => <option key={r} value={r}>{r}</option>)
                          )}
                        </select>
                      </td>
                      <td style={s.td}>
                        <span style={{ ...s.pill, background: u.enabled ? '#dcfce7' : '#fee2e2', color: u.enabled ? '#166534' : '#991b1b' }}>
                          {u.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={{ display:'flex', gap:6 }}>
                          <button
                            style={{ ...s.actionBtn, background: u.enabled ? '#fee2e2' : '#dcfce7', color: u.enabled ? '#991b1b' : '#166534', opacity: u.id === user.id ? 0.4 : 1, cursor: u.id === user.id ? 'not-allowed' : 'pointer' }}
                            disabled={updating === u.id || u.id === user.id}
                            onClick={() => handleToggleStatus(u.id, u.enabled)}
                          >
                            {u.enabled ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            style={{ ...s.actionBtn, background:'#fef2f2', color:'#dc2626', opacity: u.id === user.id ? 0.4 : 1, cursor: u.id === user.id ? 'not-allowed' : 'pointer' }}
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
      )}

      {/* ════════════════════════════════════════════════════
          BOOKING MANAGEMENT TAB
          ════════════════════════════════════════════════════ */}
      {activeTab === 'bookings' && (
        <div className="bm-wrap">

          {/* Hero strip */}
          <div className="bm-hero">
            <div className="bm-hero-left">
              <div className="bm-hero-eyebrow">Admin Console</div>
              <div className="bm-hero-title">Booking Management</div>
              <div className="bm-hero-sub">View, filter and manage all campus bookings</div>
            </div>
            <div className="bm-hero-badge">
              <span className="bm-hero-badge-dot"/>
              Admin View — Full Access
            </div>
          </div>

          {/* Quick-stat strip */}
          <div className="bm-stats">
            {[
              { label:'Total Bookings',   val: stats?.totalBookings   ?? '—', dot:'#6366f1' },
              { label:'Pending Approval', val: stats?.pendingBookings ?? '—', dot:'#f59e0b' },
              { label:'Active Today',     val: stats?.activeToday     ?? '—', dot:'#10b981' },
              { label:'Cancelled',        val: stats?.cancelled       ?? '—', dot:'#ef4444' },
            ].map(st => (
              <div key={st.label} className="bm-stat">
                <div className="bm-stat-val">{st.val}</div>
                <div className="bm-stat-label">
                  <span className="bm-stat-dot" style={{background:st.dot}}/>
                  {st.label}
                </div>
              </div>
            ))}
          </div>

          {/* Toolbar with filter tabs */}
          <div className="bm-toolbar">
            <div className="bm-toolbar-left">
              <span className="bm-toolbar-label">Filter by status</span>
              <div className="bm-ftabs">
                {[
                  { key:'ALL',       label:'All',       count: stats?.totalBookings   },
                  { key:'PENDING',   label:'Pending',   count: stats?.pendingBookings },
                  { key:'APPROVED',  label:'Approved',  count: stats?.approvedBookings},
                  { key:'CANCELLED', label:'Cancelled', count: stats?.cancelled       },
                ].map(f => (
                  <button
                    key={f.key}
                    className={`bm-ftab ${bmFilter === f.key ? 'on' : ''}`}
                    onClick={() => setBmFilter(f.key)}
                  >
                    {f.label}
                    {f.count !== undefined && f.count !== null && (
                      <span className="bm-ftab-count">{f.count}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="bm-toolbar-right">
              <div className="bm-admin-chip">🔒 Admin — All Users Visible</div>
            </div>
          </div>

          {/* Active filter indicator bar */}
          <div className="bm-active-filter-bar">
            Showing:&nbsp;
            <span className={`bm-active-filter-chip ${bmFilter === 'ALL' ? 'all' : ''}`}>
              {FILTER_LABELS[bmFilter]}
            </span>
            {bmFilter !== 'ALL' && (
              <button
                onClick={() => setBmFilter('ALL')}
                style={{marginLeft:6, fontSize:11, color:'#94a3b8', background:'none', border:'none', cursor:'pointer', textDecoration:'underline'}}
              >
                Clear
              </button>
            )}
          </div>

          {/*
            ╔══════════════════════════════════════════════════╗
            ║  THE FIX: statusFilter prop now passes bmFilter  ║
            ║  to BookingList so it actually filters results.  ║
            ║  isAdmin prop is unchanged.                      ║
            ╚══════════════════════════════════════════════════╝
          */}
          <div className="bm-list-body">
            <BookingList
              isAdmin={true}
              statusFilter={bmFilter === 'ALL' ? null : bmFilter}
            />
          </div>

          {/* Footer note */}
          <div className="bm-footer-note">
            ℹ As an admin you can view, approve and cancel bookings across all users and resources.
          </div>

        </div>
      )}

      {/* Resources Tab (unchanged) */}
      {activeTab === 'resources' && (
        <div style={s.tabContent}>
          <ResourceManagement />
        </div>
      )}

    </div>
  );
}

const s = {
  page:        { minHeight:'100vh', background:'#f8fafc', paddingBottom:'3rem' },
  header:      { background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'1.2rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:10 },
  headerTitle: { margin:0, fontSize:20, fontWeight:600 },
  headerSub:   { margin:0, fontSize:13, color:'#64748b' },
  adminBadge:  { background:'#fef3c7', color:'#92400e', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 },
  logoutBtn:   { padding:'7px 16px', border:'1px solid #e2e8f0', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:13 },
  tabContainer:{ display:'flex', gap:8, padding:'1.5rem 2rem 0', borderBottom:'1px solid #e2e8f0', background:'#fff' },
  tab:         { padding:'10px 24px', background:'#f1f5f9', border:'none', borderRadius:'8px 8px 0 0', color:'#64748b', cursor:'pointer', fontSize:14, fontWeight:500, transition:'all 0.2s' },
  activeTab:   { background:'#6366f1', color:'#fff' },
  tabContent:  { padding:'1.5rem 2rem' },
  statsGrid:   { display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:12, padding:'1.5rem 2rem 0' },
  statCard:    { background:'#fff', borderRadius:12, padding:'1.2rem', textAlign:'center', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  statNum:     { fontSize:28, fontWeight:700 },
  statLabel:   { fontSize:12, color:'#64748b', marginTop:4 },
  filterBar:   { display:'flex', alignItems:'center', gap:12, padding:'1.5rem 2rem 1rem' },
  searchInput: { flex:1, padding:'9px 14px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, outline:'none' },
  filterSelect:{ padding:'9px 14px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, outline:'none', background:'#fff' },
  resultCount: { fontSize:13, color:'#94a3b8', whiteSpace:'nowrap' },
  tableWrap:   { margin:'0 2rem', background:'#fff', borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'auto' },
  table:       { width:'100%', borderCollapse:'collapse', minWidth:800 },
  thead:       { background:'#f8fafc' },
  th:          { padding:'12px 16px', textAlign:'left', fontSize:12, fontWeight:600, color:'#64748b', textTransform:'uppercase', letterSpacing:.5, borderBottom:'1px solid #e2e8f0' },
  tr:          { borderBottom:'1px solid #f1f5f9', transition:'background .15s' },
  td:          { padding:'12px 16px', verticalAlign:'middle' },
  nameCell:    { display:'flex', alignItems:'center', gap:10 },
  avatar:      { width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:15, flexShrink:0 },
  userName:    { fontSize:14, fontWeight:500, color:'#1e293b', display:'flex', alignItems:'center', gap:6 },
  userId:      { fontSize:11, color:'#94a3b8', marginTop:2 },
  youBadge:    { background:'#ede9fe', color:'#6d28d9', fontSize:10, padding:'1px 6px', borderRadius:10, fontWeight:600 },
  pill:        { padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:500 },
  roleSelect:  { padding:'5px 10px', borderRadius:20, fontSize:12, fontWeight:600, border:'none', outline:'none' },
  actionBtn:   { padding:'5px 12px', borderRadius:8, border:'none', fontSize:12, fontWeight:500 },
  loadingBox:  { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'3rem', gap:12 },
  spinner:     { width:32, height:32, border:'3px solid #e2e8f0', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin .8s linear infinite' },
  emptyBox:    { textAlign:'center', padding:'3rem', color:'#94a3b8', fontSize:15 },
  toast:       { position:'fixed', top:20, right:20, color:'#fff', padding:'12px 20px', borderRadius:10, fontSize:14, fontWeight:500, zIndex:999, boxShadow:'0 4px 12px rgba(0,0,0,0.15)' },
  modalOverlay:{ position:'fixed', inset:0, background:'rgba(15,23,42,0.4)', backdropFilter:'blur(4px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' },
  modalCard:   { background:'#fff', borderRadius:16, padding:'2.5rem 2rem', width:'100%', maxWidth:380, textAlign:'center', boxShadow:'0 20px 40px rgba(0,0,0,0.1)' },
  modalIcon:   { fontSize:44, marginBottom:16 },
  modalTitle:  { margin:'0 0 8px', fontSize:22, color:'#0f172a', fontWeight:700 },
  modalDest:   { margin:'0 0 24px', fontSize:14, color:'#475569', lineHeight:1.6 },
  modalActions:{ display:'flex', gap:12, justifyContent:'center' },
  cancelBtn:   { padding:'10px 20px', borderRadius:8, border:'1px solid #e2e8f0', background:'#fff', color:'#475569', fontWeight:600, cursor:'pointer', fontSize:14 },
  confirmDeleteBtn: { padding:'10px 20px', borderRadius:8, border:'none', background:'#dc2626', color:'#fff', fontWeight:600, cursor:'pointer', fontSize:14, boxShadow:'0 4px 12px rgba(220,38,38,0.25)' },
};