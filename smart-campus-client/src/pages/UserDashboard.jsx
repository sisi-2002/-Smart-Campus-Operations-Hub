import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserDashboardOverview } from '../api/userDashboardApi';

export default function UserDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState({
    user: null,
    stats: {
      upcomingBookings: 0,
      pendingRequests: 0,
      openTickets: 0,
      resolvedTickets: 0,
    },
    recentBookings: [],
    activeTickets: [],
  });

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getUserDashboardOverview();
        setOverview({
          user: res.data?.user || null,
          stats: {
            upcomingBookings: res.data?.stats?.upcomingBookings || 0,
            pendingRequests: res.data?.stats?.pendingRequests || 0,
            openTickets: res.data?.stats?.openTickets || 0,
            resolvedTickets: res.data?.stats?.resolvedTickets || 0,
          },
          recentBookings: Array.isArray(res.data?.recentBookings) ? res.data.recentBookings : [],
          activeTickets: Array.isArray(res.data?.activeTickets) ? res.data.activeTickets : [],
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const userDetails = useMemo(() => {
    return {
      name: overview.user?.name || user?.name || 'User',
      email: overview.user?.email || user?.email || '-',
      role: overview.user?.role || user?.role || '-',
      id: overview.user?.id || user?.id || '-',
      provider: overview.user?.provider || 'LOCAL',
    };
  }, [overview.user, user]);

  const userStats = [
    { label: 'Upcoming Bookings', value: overview.stats.upcomingBookings, color: '#6366f1' },
    { label: 'Pending Requests', value: overview.stats.pendingRequests, color: '#f59e0b' },
    { label: 'Open Tickets', value: overview.stats.openTickets, color: '#ef4444' },
    { label: 'Resolved Tickets', value: overview.stats.resolvedTickets, color: '#10b981' },
  ];

  const getStatusPillStyle = (status) => {
    const normalized = (status || '').trim().toUpperCase();
    if (normalized === 'CONFIRMED' || normalized === 'RESOLVED') {
      return { background: '#dcfce7', color: '#166534' };
    }
    if (normalized === 'PENDING' || normalized === 'OPEN') {
      return { background: '#fef3c7', color: '#92400e' };
    }
    return { background: '#dbeafe', color: '#1e40af' };
  };

  return (
    <div style={s.layout}>
      {isTicketModalOpen && (
        <div style={s.modalOverlay}>
          <div style={s.modalCard}>
            <div style={s.modalIcon}>⚠️</div>
            <h3 style={s.modalTitle}>Report Incident</h3>
            <p style={s.modalDesc}>Ticket submission form will be implemented here.</p>
            {/*
              Module C Ticket Form fields required:
              - Resource/Location
              - Category
              - Description
              - Priority
              - Image attachments input (up to 3 files)
            */}
            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={() => setIsTicketModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={s.sidebar}>
        <div style={s.brand}>
          <div style={s.brandLogo}>S</div>
          <div style={s.brandText}>Operations Hub</div>
        </div>
        <nav style={s.navGroup}>
          <button
            style={activeTab === 'dashboard' ? s.navItemActive : s.navItem}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            style={activeTab === 'catalogue' ? s.navItemActive : s.navItem}
            onClick={() => setActiveTab('catalogue')}
          >
            Resource Catalogue
          </button>
          <button
            style={activeTab === 'bookings' ? s.navItemActive : s.navItem}
            onClick={() => setActiveTab('bookings')}
          >
            My Bookings
          </button>
          <button
            style={activeTab === 'tickets' ? s.navItemActive : s.navItem}
            onClick={() => setActiveTab('tickets')}
          >
            My Tickets
          </button>
        </nav>
      </div>

      <div style={s.mainContent}>
        <div style={s.header}>
          <div>
            <h1 style={s.headerTitle}>Welcome, {userDetails.name}</h1>
            <p style={s.headerSub}>Track your bookings and incidents in one place</p>
          </div>
          <div style={s.quickActionsWrap}>
            <span style={s.quickActionsLabel}>Quick Actions</span>
            <div style={s.quickActionsBtns}>
              <button style={s.primaryBtn}>+ Book Resource</button>
              <button style={s.dangerBtn} onClick={() => setIsTicketModalOpen((prev) => !prev)}>
                Report Incident
              </button>
            </div>
          </div>
        </div>

        <div style={s.contentArea}>
          {loading && <div style={s.infoBanner}>Loading dashboard data...</div>}
          {!loading && error && <div style={s.errorBanner}>{error}</div>}

          {!loading && !error && (
            <>
              <div style={s.userCard}>
                <div style={s.userCardHeader}>User Details</div>
                <div style={s.userDetailsGrid}>
                  <div style={s.userDetailItem}><span style={s.detailLabel}>Name</span><span style={s.detailValue}>{userDetails.name}</span></div>
                  <div style={s.userDetailItem}><span style={s.detailLabel}>Email</span><span style={s.detailValue}>{userDetails.email}</span></div>
                  <div style={s.userDetailItem}><span style={s.detailLabel}>Role</span><span style={s.detailValue}>{userDetails.role}</span></div>
                  <div style={s.userDetailItem}><span style={s.detailLabel}>Provider</span><span style={s.detailValue}>{userDetails.provider}</span></div>
                  <div style={s.userDetailItem}><span style={s.detailLabel}>User ID</span><span style={s.detailMono}>{userDetails.id}</span></div>
                </div>
              </div>

              <div style={s.statsGrid}>
                {userStats.map((stat) => (
                  <div key={stat.label} style={s.statCard}>
                    <div style={{ ...s.statNum, color: stat.color }}>{stat.value}</div>
                    <div style={s.statLabel}>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div style={s.bottomGrid}>
                <div style={s.tableWrap}>
                  <div style={s.sectionHeader}>My Recent Bookings</div>
                  <table style={s.table}>
                    <thead>
                      <tr style={s.thead}>
                        <th style={s.th}>Resource</th>
                        <th style={s.th}>Date</th>
                        <th style={s.th}>Time</th>
                        <th style={s.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.recentBookings.length === 0 && (
                        <tr style={s.tr}>
                          <td style={s.emptyTd} colSpan={4}>No bookings found in database.</td>
                        </tr>
                      )}
                      {overview.recentBookings.map((booking) => (
                        <tr key={booking.id} style={s.tr}>
                          <td style={s.td}>{booking.resource || '-'}</td>
                          <td style={s.td}>{booking.date || '-'}</td>
                          <td style={s.td}>{booking.time || '-'}</td>
                          <td style={s.td}>
                            <span style={{ ...s.pill, ...getStatusPillStyle(booking.status) }}>
                              {booking.status || 'Unknown'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={s.tableWrap}>
                  <div style={s.sectionHeader}>Active Incident Tickets</div>
                  <table style={s.table}>
                    <thead>
                      <tr style={s.thead}>
                        <th style={s.th}>Ticket ID</th>
                        <th style={s.th}>Location</th>
                        <th style={s.th}>Category</th>
                        <th style={s.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.activeTickets.length === 0 && (
                        <tr style={s.tr}>
                          <td style={s.emptyTd} colSpan={4}>No active tickets found in database.</td>
                        </tr>
                      )}
                      {overview.activeTickets.map((ticket) => (
                        <tr key={ticket.id} style={s.tr}>
                          <td style={s.td}>{ticket.ticketId || ticket.id}</td>
                          <td style={s.td}>{ticket.location || '-'}</td>
                          <td style={s.td}>{ticket.category || '-'}</td>
                          <td style={s.td}>
                            <span style={{ ...s.pill, ...getStatusPillStyle(ticket.status) }}>
                              {ticket.status || 'Open'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  layout: { display: 'flex', minHeight: '100vh', background: '#f8fafc' },
  sidebar: { width: 260, background: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  brand: { padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 12 },
  brandLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 18,
  },
  brandText: { fontWeight: 600, fontSize: 16, letterSpacing: 0.5 },
  navGroup: { display: 'flex', flexDirection: 'column', gap: 4, padding: '20px 12px' },
  navItem: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    padding: '12px 16px',
    textAlign: 'left',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  navItemActive: {
    background: 'rgba(99,102,241,0.15)',
    border: 'none',
    color: '#818cf8',
    padding: '12px 16px',
    textAlign: 'left',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  contentArea: { paddingBottom: '3rem', overflowX: 'auto' },
  header: {
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    padding: '1.2rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    gap: 16,
    flexWrap: 'wrap',
  },
  headerTitle: { margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' },
  headerSub: { margin: '4px 0 0', fontSize: 13, color: '#64748b' },
  quickActionsWrap: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  quickActionsLabel: { fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#64748b' },
  quickActionsBtns: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  primaryBtn: {
    padding: '9px 16px',
    border: 'none',
    borderRadius: 8,
    background: '#4f46e5',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  dangerBtn: {
    padding: '9px 16px',
    border: 'none',
    borderRadius: 8,
    background: '#dc2626',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(220,38,38,0.2)',
  },
  infoBanner: {
    margin: '1.25rem 2rem 0',
    background: '#eef2ff',
    border: '1px solid #c7d2fe',
    color: '#3730a3',
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
  },
  errorBanner: {
    margin: '1.25rem 2rem 0',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
  },
  userCard: {
    background: '#fff',
    borderRadius: 12,
    margin: '1.25rem 2rem 0',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  userCardHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid #e2e8f0',
    fontSize: 14,
    fontWeight: 700,
    color: '#0f172a',
    background: '#f8fafc',
  },
  userDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 10,
    padding: '14px 16px',
  },
  userDetailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    border: '1px solid #f1f5f9',
    borderRadius: 8,
    padding: '10px 12px',
  },
  detailLabel: { fontSize: 12, color: '#64748b', fontWeight: 600 },
  detailValue: { fontSize: 13, color: '#1e293b', fontWeight: 600 },
  detailMono: { fontSize: 12, color: '#334155', fontFamily: 'monospace' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    padding: '1.5rem 2rem 0',
  },
  statCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '1.2rem',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #f1f5f9',
  },
  statNum: { fontSize: 28, fontWeight: 700 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 500 },
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: 16,
    margin: '1.25rem 2rem 0',
  },
  sectionHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid #e2e8f0',
    fontSize: 14,
    fontWeight: 700,
    color: '#0f172a',
    background: '#f8fafc',
  },
  tableWrap: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    overflow: 'hidden',
    border: '1px solid #f1f5f9',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8fafc' },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: '1px solid #e2e8f0',
  },
  tr: { borderBottom: '1px solid #f1f5f9', transition: 'background .15s' },
  td: { padding: '12px 16px', verticalAlign: 'middle', color: '#334155', fontSize: 13 },
  emptyTd: {
    padding: '18px 16px',
    verticalAlign: 'middle',
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
  },
  pill: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    background: '#fff',
    borderRadius: 20,
    padding: '2.25rem',
    width: '100%',
    maxWidth: 460,
    textAlign: 'center',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
  },
  modalIcon: { fontSize: 48, marginBottom: 16 },
  modalTitle: { margin: '0 0 10px', fontSize: 22, color: '#0f172a', fontWeight: 700 },
  modalDesc: { margin: '0 0 24px', fontSize: 14, color: '#64748b', lineHeight: 1.6 },
  modalActions: { display: 'flex', justifyContent: 'center' },
  cancelBtn: {
    padding: '10px 20px',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#475569',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
  },
};
