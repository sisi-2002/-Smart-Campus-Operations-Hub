import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getAllUsers,
  getStats,
  getIncidentTickets,
  updateIncidentTicket,
  updateRole,
  toggleStatus,
  deleteUser,
} from '../api/adminApi';
import TicketCommentsPanel from '../components/TicketCommentsPanel';
import BookingList from '../components/Bookings/BookingList';
import ResourceManagement from '../components/Admin/ResourceManagement';

const ROLES = ['USER', 'TECHNICIAN', 'MANAGER', 'ADMIN'];

const ROLE_STYLE = {
  ADMIN: { background: '#fef3c7', color: '#92400e' },
  TECHNICIAN: { background: '#dbeafe', color: '#1e40af' },
  MANAGER: { background: '#f3e8ff', color: '#6b21a8' },
  USER: { background: '#dcfce7', color: '#166534' },
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
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: #a7f3d0;
  margin-bottom: 6px;
}
.bm-hero-title {
  font-family: 'Playfair Display', serif;
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -.01em;
  line-height: 1.1;
}
.bm-hero-sub {
  font-size: 13px;
  color: #6ee7b7;
  margin-top: 5px;
  font-weight: 400;
}
.bm-hero-badge {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 30px;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.2);
  color: #d1fae5;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.bm-hero-badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 0 2px #34d39944;
  animation: bm-pulse 2s infinite;
}
@keyframes bm-pulse {
  0%,100% { box-shadow: 0 0 0 2px #34d39944; }
  50% { box-shadow: 0 0 0 5px #34d39900; }
}

.bm-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-bottom: 1px solid #e4dfd4;
}
.bm-stat {
  padding: 18px 24px;
  border-right: 1px solid #e4dfd4;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #fff;
  transition: background .18s;
}
.bm-stat:last-child { border-right: none; }
.bm-stat:hover { background: #faf9f7; }
.bm-stat-val {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  font-weight: 700;
  color: #1c1917;
  line-height: 1;
}
.bm-stat-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: #78716c;
  display: flex;
  align-items: center;
  gap: 5px;
}
.bm-stat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.bm-toolbar {
  background: #faf9f7;
  border-bottom: 1px solid #e4dfd4;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.bm-toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.bm-toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.bm-toolbar-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: #78716c;
}

.bm-ftabs {
  display: flex;
  gap: 4px;
}
.bm-ftab {
  padding: 6px 14px;
  border-radius: 7px;
  border: 1px solid #e4dfd4;
  font-family: 'Epilogue', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #78716c;
  cursor: pointer;
  background: #fff;
  transition: all .15s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.bm-ftab:hover {
  background: #e4dfd4;
  color: #1c1917;
  border-color: #d0ccc5;
}
.bm-ftab.on {
  background: #0d7a6b;
  color: #fff;
  border-color: #0d7a6b;
  font-weight: 600;
}
.bm-ftab.on .bm-ftab-count {
  background: rgba(255,255,255,.25);
  color: #fff;
}
.bm-ftab-count {
  background: #e4dfd4;
  color: #78716c;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
  transition: background .15s, color .15s;
}

.bm-active-filter-bar {
  background: #fff;
  border-bottom: 1px solid #e4dfd4;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #78716c;
}
.bm-active-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 6px;
  background: #0d7a6b18;
  border: 1px solid #0d7a6b30;
  color: #0d7a6b;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: .05em;
}
.bm-active-filter-chip.all {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #64748b;
}

.bm-admin-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 7px;
  background: #fef3c7;
  border: 1px solid #fde68a;
  font-size: 11px;
  font-weight: 600;
  color: #92400e;
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
  font-size: 11px;
  color: #a8a29e;
  display: flex;
  align-items: center;
  gap: 6px;
}

@media(max-width:700px){
  .bm-hero { padding: 22px 20px 20px; }
  .bm-stats { grid-template-columns: 1fr 1fr; }
  .bm-stat:nth-child(2){ border-right: none; }
  .bm-toolbar {
    padding: 12px 16px;
    flex-direction: column;
    align-items: flex-start;
  }
  .bm-list-body { padding: 16px; }
}
`;

const FILTER_LABELS = {
  ALL: 'All Bookings',
  PENDING: 'Pending Approval',
  APPROVED: 'Approved',
  CANCELLED: 'Cancelled',
};

const TICKET_STATUS_ORDER = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];

const TICKET_STATUS_STYLE = {
  OPEN: { background: '#fee2e2', color: '#991b1b' },
  PENDING: { background: '#fef3c7', color: '#92400e' },
  IN_PROGRESS: { background: '#fef3c7', color: '#92400e' },
  RESOLVED: { background: '#dcfce7', color: '#166534' },
  CLOSED: { background: '#e2e8f0', color: '#334155' },
  REJECTED: { background: '#f3e8ff', color: '#6b21a8' },
};

export default function AdminDashboard({ dashboardBadge = 'ADMIN' } = {}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updating, setUpdating] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [bmFilter, setBmFilter] = useState('ALL');
  const [tickets, setTickets] = useState([]);
  const [ticketsLoaded, setTicketsLoaded] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDraft, setTicketDraft] = useState({
    status: 'OPEN',
    assignedTechnician: '',
    resolutionNotes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'tickets' && !ticketsLoaded) {
      fetchTickets();
    }
  }, [activeTab, ticketsLoaded, users]);

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

  const fetchTickets = async () => {
    try {
      const ticketsRes = await getIncidentTickets();
      const ticketList = Array.isArray(ticketsRes.data)
        ? ticketsRes.data
        : Array.isArray(ticketsRes.data?.data)
          ? ticketsRes.data.data
          : [];

      const isRenderableImageSrc = (value) => (
        typeof value === 'string'
        && (
          value.startsWith('data:image/')
          || value.startsWith('http://')
          || value.startsWith('https://')
          || value.startsWith('blob:')
        )
      );

      let cachedImageEntries = [];
      try {
        cachedImageEntries = JSON.parse(localStorage.getItem('incidentTicketImageCache') || '[]');
      } catch {
        cachedImageEntries = [];
      }
      const cacheByTicketId = new Map(cachedImageEntries.map((entry) => [entry.ticketId, entry]));
      const usersById = new Map((users || []).map((u) => [u.id, u]));

      const mappedTickets = ticketList.map((ticket) => {
        const reporter = usersById.get(ticket.userId);
        const ticketKey = ticket.ticketId || ticket.id;
        const cached = cacheByTicketId.get(ticketKey) || {};
        const apiImageDataUrls = Array.isArray(ticket.imageDataUrls) ? ticket.imageDataUrls : [];
        const cacheImageDataUrls = Array.isArray(cached.imageDataUrls) ? cached.imageDataUrls : [];
        const imageNames = Array.isArray(ticket.imageNames) ? ticket.imageNames : [];
        const cacheImageNames = Array.isArray(cached.imageNames) ? cached.imageNames : [];

        const mergedImageNames = imageNames.length ? imageNames : cacheImageNames;
        const mergedImageDataUrls = apiImageDataUrls.length ? apiImageDataUrls : cacheImageDataUrls;

        const imageAttachments = [
          ...mergedImageDataUrls,
          ...mergedImageNames.filter(isRenderableImageSrc),
        ].filter(isRenderableImageSrc);

        return {
          id: ticket.id,
          ticketId: ticketKey,
          resourceLocation: ticket.location || '-',
          category: ticket.category || '-',
          priority: ticket.priority || '-',
          status: (ticket.status || 'OPEN').toUpperCase(),
          description: ticket.description || 'No description provided',
          preferredContact: ticket.preferredContact || '-',
          reporterName: reporter?.name || 'Unknown User',
          reporterEmail: reporter?.email || '-',
          assignedTechnicianId: ticket.assignedTechnicianId || '',
          assignedTechnician: ticket.assignedTechnicianName || '',
          resolutionNotes: ticket.resolutionNotes || '',
          comments: Array.isArray(ticket.comments) ? ticket.comments : [],
          imageAttachments,
          attachmentNames: mergedImageNames.filter((name) => !isRenderableImageSrc(name)),
        };
      });

      setTickets(mappedTickets);
      setTicketsLoaded(true);
    } catch (err) {
      setTickets([]);
      setTicketsLoaded(true);
      const status = err?.response?.status;
      const apiMessage = typeof err?.response?.data === 'string'
        ? err.response.data
        : err?.response?.data?.error;
      showToast(apiMessage || (status ? `Failed to load tickets (${status})` : 'Failed to load tickets'), 'error');
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
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, role: res.data.role, mfaEnabled: res.data.mfaEnabled }
            : u
        )
      );
      showToast(`Role updated to ${newRole}`, 'success');

      const statsRes = await getStats();
      setStats(statsRes.data);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update role', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleStatus = async (userId) => {
    if (userId === user.id) {
      showToast("You can't disable your own account", 'error');
      return;
    }

    setUpdating(userId);
    try {
      const res = await toggleStatus(userId);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, enabled: res.data.enabled } : u
        )
      );
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
      setUsers((prev) => prev.filter((u) => u.id !== userId));
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

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' ? u.enabled : !u.enabled);

    return matchSearch && matchRole && matchStatus;
  });

  const availableTechnicians = users
    .filter((u) => u.role === 'TECHNICIAN' && u.enabled)
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/');
  };

  const getAllowedStatusOptions = (currentStatus) => {
    if (currentStatus === 'OPEN' || currentStatus === 'PENDING') {
      return ['OPEN', 'IN_PROGRESS', 'REJECTED'];
    }
    if (currentStatus === 'IN_PROGRESS') {
      return ['IN_PROGRESS', 'RESOLVED', 'REJECTED'];
    }
    if (currentStatus === 'RESOLVED') {
      return ['RESOLVED', 'CLOSED'];
    }
    if (currentStatus === 'CLOSED') {
      return ['CLOSED'];
    }
    return ['REJECTED'];
  };

  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setTicketDraft({
      status: ticket.status,
      assignedTechnician: ticket.assignedTechnicianId || '',
      resolutionNotes: ticket.resolutionNotes || '',
    });
  };

  const closeTicketModal = () => {
    setSelectedTicket(null);
  };

  const handleTicketCommentsChange = (nextComments) => {
    if (!selectedTicket) return;

    setSelectedTicket((current) => (
      current ? { ...current, comments: nextComments } : current
    ));

    setTickets((prev) => prev.map((ticket) => (
      ticket.id === selectedTicket.id
        ? { ...ticket, comments: nextComments }
        : ticket
    )));
  };

  const saveTicketUpdates = async () => {
    if (!selectedTicket) return;

    const autoProgressStatus =
      Boolean(ticketDraft.assignedTechnician) &&
      (ticketDraft.status === 'OPEN' || ticketDraft.status === 'PENDING');
    const nextStatus = autoProgressStatus ? 'IN_PROGRESS' : ticketDraft.status;
    const nextNotes = ticketDraft.resolutionNotes.trim();
    const existingNotes = (selectedTicket.resolutionNotes || '').trim();
    const effectiveNotes = nextNotes || existingNotes;

    if (nextStatus === 'REJECTED' && !nextNotes) {
      showToast('A rejection reason is required', 'error');
      return;
    }

    if (nextStatus === 'RESOLVED' && !nextNotes) {
      showToast('Resolution notes are required before marking a ticket as resolved', 'error');
      return;
    }

    if (nextStatus === 'CLOSED' && selectedTicket.status !== 'CLOSED' && !effectiveNotes) {
      showToast('Resolution notes are required before closing a ticket', 'error');
      return;
    }

    try {
      const updateKey = selectedTicket.id || selectedTicket.ticketId;
      if (!updateKey) {
        showToast('Ticket identifier is missing', 'error');
        return;
      }

      const res = await updateIncidentTicket(updateKey, {
        status: nextStatus,
        assignedTechnicianId: ticketDraft.assignedTechnician,
        resolutionNotes: ticketDraft.resolutionNotes,
      });

      const updatedTicket = res.data;
      setTickets((prev) => prev.map((ticket) => {
        if (ticket.id !== selectedTicket.id) return ticket;

        const selectedTech = users.find((u) => u.id === updatedTicket.assignedTechnicianId);
        return {
          ...ticket,
          status: (updatedTicket.status || nextStatus || ticket.status || 'OPEN').toUpperCase(),
          assignedTechnicianId: updatedTicket.assignedTechnicianId || '',
          assignedTechnician: updatedTicket.assignedTechnicianName || selectedTech?.name || '',
          resolutionNotes: updatedTicket.resolutionNotes || '',
          comments: Array.isArray(updatedTicket.comments) ? updatedTicket.comments : ticket.comments,
        };
      }));

      setSelectedTicket((current) => (
        current
          ? {
              ...current,
              status: (updatedTicket.status || nextStatus || current.status || 'OPEN').toUpperCase(),
              assignedTechnicianId: updatedTicket.assignedTechnicianId || '',
              assignedTechnician: updatedTicket.assignedTechnicianName || current.assignedTechnician,
              resolutionNotes: updatedTicket.resolutionNotes || '',
              comments: Array.isArray(updatedTicket.comments) ? updatedTicket.comments : current.comments,
            }
          : current
      ));

      showToast(`Ticket ${selectedTicket.ticketId} updated`, 'success');
      closeTicketModal();
    } catch (err) {
      const apiMessage = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.error;
      showToast(apiMessage || `Failed to update ticket (${err.response?.status || 'network'})`, 'error');
    }
  };

  const ticketSummary = {
    total: tickets.length,
    openPending: tickets.filter((t) => t.status === 'OPEN' || t.status === 'PENDING').length,
    inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    resolvedClosed: tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
  };

  const renderTicketsTab = () => (
    <>
      <div style={s.statsGrid}>
        {[
          { label: 'Total Tickets', value: ticketSummary.total, color: '#6366f1' },
          { label: 'Open / Pending', value: ticketSummary.openPending, color: '#ef4444' },
          { label: 'In Progress', value: ticketSummary.inProgress, color: '#f59e0b' },
          { label: 'Resolved / Closed', value: ticketSummary.resolvedClosed, color: '#10b981' },
        ].map((stat) => (
          <div key={stat.label} style={s.statCard}>
            <div style={{ ...s.statNum, color: stat.color }}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr style={s.thead}>
              <th style={s.th}>Ticket ID</th>
              <th style={s.th}>Resource / Location</th>
              <th style={s.th}>Category</th>
              <th style={s.th}>Priority</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} style={s.tr}>
                <td style={s.td}><strong>{ticket.ticketId}</strong></td>
                <td style={s.td}>{ticket.resourceLocation}</td>
                <td style={s.td}>{ticket.category}</td>
                <td style={s.td}>{ticket.priority}</td>
                <td style={s.td}>
                  <span
                    style={{
                      ...s.pill,
                      ...(TICKET_STATUS_STYLE[ticket.status] || { background: '#e2e8f0', color: '#334155' }),
                    }}
                  >
                    {ticket.status}
                  </span>
                </td>
                <td style={s.td}>
                  <button
                    style={s.viewDetailsBtn}
                    onClick={() => openTicketModal(ticket)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderUsersTab = () => (
    <>
      {stats && (
        <div style={s.statsGrid}>
          {[
            { label: 'Total Users', value: stats.total, color: '#6366f1' },
            { label: 'Admins', value: stats.admins, color: '#f59e0b' },
            { label: 'Technicians', value: stats.technicians, color: '#3b82f6' },
            { label: 'Regular Users', value: stats.users, color: '#10b981' },
            { label: '2FA Enabled', value: stats.mfaEnabled, color: '#8b5cf6' },
            { label: 'Disabled', value: stats.disabled, color: '#ef4444' },
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
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          style={s.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
        </select>
        <span style={s.resultCount}>
          {filtered.length} of {users.length} users
        </span>
      </div>

      <div style={s.tableWrap}>
        {loading ? (
          <div style={s.loadingBox}>
            <div style={s.spinner} />
            <p style={{ color: '#64748b' }}>Loading users...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
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
                      <div
                        style={{
                          ...s.avatar,
                          background: u.id === user.id ? '#6366f1' : '#e2e8f0',
                          color: u.id === user.id ? '#fff' : '#475569',
                        }}
                      >
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
                  <td style={s.td}>
                    <span style={{ fontSize: 13, color: '#475569' }}>{u.email}</span>
                  </td>
                  <td style={s.td}>
                    <span
                      style={{
                        ...s.pill,
                        background: u.provider === 'GOOGLE' ? '#fef3c7' : '#f1f5f9',
                        color: u.provider === 'GOOGLE' ? '#92400e' : '#475569',
                      }}
                    >
                      {u.provider === 'GOOGLE' ? '🔵 Google' : '🔑 Local'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span
                      style={{
                        ...s.pill,
                        background:
                          (u.mfaEnabled || ['ADMIN', 'TECHNICIAN', 'MANAGER'].includes(u.role))
                            ? '#dcfce7'
                            : '#f1f5f9',
                        color:
                          (u.mfaEnabled || ['ADMIN', 'TECHNICIAN', 'MANAGER'].includes(u.role))
                            ? '#166534'
                            : '#94a3b8',
                      }}
                    >
                      {(u.mfaEnabled || ['ADMIN', 'TECHNICIAN', 'MANAGER'].includes(u.role))
                        ? '✓ On'
                        : '✕ Off'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <select
                      style={{
                        ...s.roleSelect,
                        ...ROLE_STYLE[u.role],
                        cursor:
                          updating === u.id || u.id === user.id || u.role === 'ADMIN'
                            ? 'not-allowed'
                            : 'pointer',
                      }}
                      value={u.role}
                      disabled={updating === u.id || u.id === user.id || u.role === 'ADMIN'}
                      onChange={(e) => handleRoleChange(u.id, e.target.value, u.role)}
                    >
                      {u.role === 'ADMIN' ? (
                        <option value="ADMIN">ADMIN</option>
                      ) : (
                        ['USER', 'TECHNICIAN', 'MANAGER'].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))
                      )}
                    </select>
                  </td>
                  <td style={s.td}>
                    <span
                      style={{
                        ...s.pill,
                        background: u.enabled ? '#dcfce7' : '#fee2e2',
                        color: u.enabled ? '#166534' : '#991b1b',
                      }}
                    >
                      {u.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        style={{
                          ...s.actionBtn,
                          background: u.enabled ? '#fee2e2' : '#dcfce7',
                          color: u.enabled ? '#991b1b' : '#166534',
                          opacity: u.id === user.id ? 0.4 : 1,
                          cursor: u.id === user.id ? 'not-allowed' : 'pointer',
                        }}
                        disabled={updating === u.id || u.id === user.id}
                        onClick={() => handleToggleStatus(u.id)}
                      >
                        {u.enabled ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        style={{
                          ...s.actionBtn,
                          background: '#fef2f2',
                          color: '#dc2626',
                          opacity: u.id === user.id ? 0.4 : 1,
                          cursor: u.id === user.id ? 'not-allowed' : 'pointer',
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
      <style>{bookingCSS}</style>

      {toast && (
        <div
          style={{
            ...s.toast,
            background: toast.type === 'success' ? '#10b981' : '#ef4444',
          }}
        >
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      {previewImageUrl && (
        <div style={s.previewOverlay} onClick={() => setPreviewImageUrl('')}>
          <div style={s.previewModal} onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              style={s.previewCloseButton}
              onClick={() => setPreviewImageUrl('')}
              aria-label="Close image preview"
            >
              ×
            </button>
            <img src={previewImageUrl} alt="Incident attachment preview" style={s.previewImage} />
          </div>
        </div>
      )}

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
              <button style={s.cancelBtn} onClick={() => setUserToDelete(null)}>
                Cancel
              </button>
              <button style={s.confirmDeleteBtn} onClick={confirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div style={s.modalOverlay}>
          <div style={s.modalCard}>
            <div style={s.modalIcon}>👋</div>
            <h3 style={s.modalTitle}>Log Out</h3>
            <p style={s.modalDest}>Are you sure you want to log out of your account?</p>
            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={() => setShowLogoutConfirm(false)}>
                No
              </button>
              <button
                style={{
                  ...s.confirmDeleteBtn,
                  background: '#4f46e5',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
                }}
                onClick={confirmLogout}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTicket && (
        <div style={s.modalOverlay}>
          <div style={s.ticketModalCard}>
            <div style={s.ticketModalHeader}>
              <div>
                <h3 style={s.ticketModalTitle}>Ticket Details - {selectedTicket.ticketId}</h3>
                <p style={s.ticketModalSub}>Review incident details and update workflow.</p>
              </div>
              <button style={s.ticketModalCloseBtn} onClick={closeTicketModal}>x</button>
            </div>

            <div style={s.ticketModalBody}>
              <div style={s.ticketInfoGrid}>
                <div style={s.ticketInfoItem}><span style={s.ticketInfoLabel}>Location</span><span>{selectedTicket.resourceLocation}</span></div>
                <div style={s.ticketInfoItem}><span style={s.ticketInfoLabel}>Category</span><span>{selectedTicket.category}</span></div>
                <div style={s.ticketInfoItem}><span style={s.ticketInfoLabel}>Priority</span><span>{selectedTicket.priority}</span></div>
                <div style={s.ticketInfoItem}><span style={s.ticketInfoLabel}>Reporter</span><span>{selectedTicket.reporterName}</span></div>
                <div style={s.ticketInfoItem}><span style={s.ticketInfoLabel}>Reporter Email</span><span>{selectedTicket.reporterEmail}</span></div>
                <div style={s.ticketInfoItem}><span style={s.ticketInfoLabel}>Contact</span><span>{selectedTicket.preferredContact}</span></div>
              </div>

              <div style={s.ticketSection}>
                <div style={s.ticketSectionTitle}>Description</div>
                <p style={s.ticketDescription}>{selectedTicket.description}</p>
              </div>

              <div style={s.ticketSection}>
                <div style={s.ticketSectionTitle}>Evidence</div>
                {selectedTicket.imageAttachments?.length ? (
                  <div style={s.evidenceGrid}>
                    {selectedTicket.imageAttachments.slice(0, 3).map((src, idx) => (
                      <img
                        key={`${selectedTicket.id}-img-${idx}`}
                        src={src}
                        alt={`Evidence ${idx + 1}`}
                        style={s.evidenceImage}
                        onClick={() => setPreviewImageUrl(src)}
                      />
                    ))}
                  </div>
                ) : selectedTicket.attachmentNames?.length ? (
                  <div style={s.attachmentNamesWrap}>
                    {selectedTicket.attachmentNames.slice(0, 5).map((name) => (
                      <span key={`${selectedTicket.id}-${name}`} style={s.imageNameChip}>{name}</span>
                    ))}
                  </div>
                ) : (
                  <div style={s.noEvidenceBox}>No image attachments were provided.</div>
                )}
              </div>

              <div style={s.ticketFormGrid}>
                <label style={s.ticketField}>
                  <span style={s.ticketFieldLabel}>Update Status</span>
                  <select
                    style={s.filterSelect}
                    value={ticketDraft.status}
                    onChange={(e) => setTicketDraft((prev) => ({ ...prev, status: e.target.value }))}
                  >
                    {TICKET_STATUS_ORDER
                      .filter((status) => getAllowedStatusOptions(selectedTicket.status).includes(status))
                      .map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                  </select>
                </label>

                <label style={s.ticketField}>
                  <span style={s.ticketFieldLabel}>Assign Technician</span>
                  <select
                    style={s.filterSelect}
                    value={ticketDraft.assignedTechnician}
                    onChange={(e) => {
                      const technicianId = e.target.value;
                      setTicketDraft((prev) => {
                        const shouldMoveToInProgress =
                          Boolean(technicianId) &&
                          (prev.status === 'OPEN' || prev.status === 'PENDING');
                        return {
                          ...prev,
                          assignedTechnician: technicianId,
                          status: shouldMoveToInProgress ? 'IN_PROGRESS' : prev.status,
                        };
                      });
                    }}
                    disabled={!availableTechnicians.length}
                  >
                    <option value="">
                      {availableTechnicians.length ? 'Select technician' : 'No technicians available'}
                    </option>
                    {availableTechnicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name} ({tech.email})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label style={s.ticketField}>
                <span style={s.ticketFieldLabel}>
                  {ticketDraft.status === 'REJECTED' ? 'Rejection Reason' : 'Resolution Notes / Comments'}
                </span>
                <textarea
                  style={s.ticketTextarea}
                  value={ticketDraft.resolutionNotes}
                  placeholder={ticketDraft.status === 'REJECTED'
                    ? 'Explain why the ticket is being rejected'
                    : 'Add resolution notes, updates, or technician comments'}
                  onChange={(e) => setTicketDraft((prev) => ({ ...prev, resolutionNotes: e.target.value }))}
                />
              </label>

              <TicketCommentsPanel
                ticket={selectedTicket}
                currentUser={user}
                onCommentsChange={handleTicketCommentsChange}
                onError={(message) => showToast(message, 'error')}
                onSuccess={(message) => showToast(message, 'success')}
              />
            </div>

            <div style={s.ticketModalFooter}>
              <button style={s.cancelBtn} onClick={closeTicketModal}>Cancel</button>
              <button style={s.saveTicketBtn} onClick={saveTicketUpdates}>Save Changes</button>
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
            style={activeTab === 'users' ? s.navItemActive : s.navItem}
            onClick={() => setActiveTab('users')}
          >
            👥 User Management
          </button>
          <button
            style={activeTab === 'resources' ? s.navItemActive : s.navItem}
            onClick={() => setActiveTab('resources')}
          >
            📦 Resource Management
          </button>
          <button
            style={activeTab === 'bookings' ? s.navItemActive : s.navItem}
            onClick={() => setActiveTab('bookings')}
          >
            📅 Booking Management
          </button>
          <button
            style={activeTab === 'tickets' ? s.navItemActive : s.navItem}
            onClick={() => setActiveTab('tickets')}
          >
            🎫 Ticket Management
          </button>
        </nav>
      </div>

      <div style={s.mainContent}>
        <div style={s.header}>
          <div>
            <h1 style={s.headerTitle}>
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'resources' && 'Resource Management'}
              {activeTab === 'bookings' && 'Booking Management'}
              {activeTab === 'tickets' && 'Ticket Management'}
            </h1>
            <p style={s.headerSub}>Manage campus resources and users</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={s.adminBadge}>{dashboardBadge}</span>
            <span style={{ fontSize: 14, color: '#64748b' }}>{user?.name}</span>
            <button style={s.logoutBtn} onClick={handleLogoutClick}>
              Logout
            </button>
          </div>
        </div>

        <div style={s.contentArea}>
          {activeTab === 'users' && renderUsersTab()}

          {activeTab === 'resources' && (
            <div style={s.tabContent}>
              <ResourceManagement />
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bm-wrap">
              <div className="bm-hero">
                <div className="bm-hero-left">
                  <div className="bm-hero-eyebrow">Admin Console</div>
                  <div className="bm-hero-title">Booking Management</div>
                  <div className="bm-hero-sub">View, filter and manage all campus bookings</div>
                </div>
                <div className="bm-hero-badge">
                  <span className="bm-hero-badge-dot" />
                  Admin View — Full Access
                </div>
              </div>

              <div className="bm-stats">
                {[
                  { label: 'Total Bookings', val: stats?.totalBookings ?? '—', dot: '#6366f1' },
                  { label: 'Pending Approval', val: stats?.pendingBookings ?? '—', dot: '#f59e0b' },
                  { label: 'Active Today', val: stats?.activeToday ?? '—', dot: '#10b981' },
                  { label: 'Cancelled', val: stats?.cancelled ?? '—', dot: '#ef4444' },
                ].map((st) => (
                  <div key={st.label} className="bm-stat">
                    <div className="bm-stat-val">{st.val}</div>
                    <div className="bm-stat-label">
                      <span className="bm-stat-dot" style={{ background: st.dot }} />
                      {st.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bm-toolbar">
                <div className="bm-toolbar-left">
                  <span className="bm-toolbar-label">Filter by status</span>
                  <div className="bm-ftabs">
                    {[
                      { key: 'ALL', label: 'All', count: stats?.totalBookings },
                      { key: 'PENDING', label: 'Pending', count: stats?.pendingBookings },
                      { key: 'APPROVED', label: 'Approved', count: stats?.approvedBookings },
                      { key: 'CANCELLED', label: 'Cancelled', count: stats?.cancelled },
                    ].map((f) => (
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

              <div className="bm-active-filter-bar">
                Showing:&nbsp;
                <span className={`bm-active-filter-chip ${bmFilter === 'ALL' ? 'all' : ''}`}>
                  {FILTER_LABELS[bmFilter]}
                </span>
                {bmFilter !== 'ALL' && (
                  <button
                    onClick={() => setBmFilter('ALL')}
                    style={{
                      marginLeft: 6,
                      fontSize: 11,
                      color: '#94a3b8',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="bm-list-body">
                <BookingList
                  isAdmin={true}
                  statusFilter={bmFilter === 'ALL' ? null : bmFilter}
                />
              </div>

              <div className="bm-footer-note">
                ℹ As an admin you can view, approve and cancel bookings across all users and resources.
              </div>
            </div>
          )}

          {activeTab === 'tickets' && renderTicketsTab()}
        </div>
      </div>
    </div>
  );
}

const s = {
  layout: { display: 'flex', minHeight: '100vh', background: '#f8fafc' },
  sidebar: {
    width: 260,
    background: '#0f172a',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  brand: {
    padding: '24px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
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
  placeholderBox: {
    background: '#fff',
    margin: '2rem',
    padding: '4rem 2rem',
    borderRadius: 16,
    textAlign: 'center',
    border: '1px dashed #cbd5e1',
    color: '#475569',
  },
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
  },
  headerTitle: { margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' },
  headerSub: { margin: '4px 0 0', fontSize: 13, color: '#64748b' },
  adminBadge: {
    background: '#fef3c7',
    color: '#92400e',
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  logoutBtn: {
    padding: '7px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    background: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
  },
  tabContent: { padding: '1.5rem 2rem' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
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
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '1.5rem 2rem 1rem',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    minWidth: 200,
    padding: '9px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
  },
  filterSelect: {
    padding: '9px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    background: '#fff',
    cursor: 'pointer',
  },
  resultCount: { fontSize: 13, color: '#94a3b8', whiteSpace: 'nowrap', fontWeight: 500 },
  tableWrap: {
    margin: '0 2rem',
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
  td: { padding: '12px 16px', verticalAlign: 'middle' },
  nameCell: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: 15,
    flexShrink: 0,
  },
  userName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  youBadge: {
    background: '#ede9fe',
    color: '#6d28d9',
    fontSize: 10,
    padding: '2px 8px',
    borderRadius: 12,
    fontWeight: 600,
  },
  pill: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  roleSelect: {
    padding: '5px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    border: 'none',
    outline: 'none',
  },
  actionBtn: {
    padding: '6px 14px',
    borderRadius: 8,
    border: 'none',
    fontSize: 12,
    fontWeight: 600,
    transition: 'transform 0.1s',
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
    gap: 16,
  },
  spinner: {
    width: 36,
    height: 36,
    border: '3px solid #e2e8f0',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin .8s linear infinite',
  },
  emptyBox: {
    textAlign: 'center',
    padding: '4rem',
    color: '#64748b',
    fontSize: 15,
    background: '#f8fafc',
  },
  toast: {
    position: 'fixed',
    top: 24,
    right: 24,
    color: '#fff',
    padding: '14px 24px',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    zIndex: 9999,
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
  },
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
    padding: '2.5rem 2.5rem',
    width: '100%',
    maxWidth: 400,
    textAlign: 'center',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
  },
  modalIcon: { fontSize: 48, marginBottom: 16 },
  modalTitle: { margin: '0 0 12px', fontSize: 22, color: '#0f172a', fontWeight: 700 },
  modalDest: { margin: '0 0 32px', fontSize: 14, color: '#64748b', lineHeight: 1.6 },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'center' },
  cancelBtn: {
    padding: '12px 24px',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#475569',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
    transition: 'all 0.2s',
  },
  confirmDeleteBtn: {
    padding: '12px 24px',
    borderRadius: 10,
    border: 'none',
    background: '#dc2626',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
    boxShadow: '0 4px 12px rgba(220,38,38,0.2)',
    transition: 'all 0.2s',
  },
  viewDetailsBtn: {
    padding: '7px 14px',
    borderRadius: 8,
    border: '1px solid #c7d2fe',
    background: '#eef2ff',
    color: '#3730a3',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  ticketModalCard: {
    background: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 980,
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
  },
  ticketModalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
  },
  ticketModalTitle: { margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' },
  ticketModalSub: { margin: '4px 0 0', fontSize: 13, color: '#64748b' },
  ticketModalCloseBtn: {
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    color: '#334155',
    width: 34,
    height: 34,
    borderRadius: 999,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 700,
  },
  ticketModalBody: {
    padding: '16px 20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  ticketInfoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 },
  ticketInfoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 13,
    color: '#334155',
  },
  ticketInfoLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: '#64748b', fontWeight: 600 },
  ticketSection: { border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px' },
  ticketSectionTitle: { fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 },
  ticketDescription: { margin: 0, fontSize: 14, lineHeight: 1.55, color: '#334155' },
  evidenceGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 },
  evidenceImage: {
    width: '100%',
    height: 150,
    objectFit: 'cover',
    borderRadius: 10,
    border: '1px solid #cbd5e1',
    background: '#f8fafc',
    cursor: 'zoom-in',
  },
  attachmentNamesWrap: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  imageNameChip: {
    padding: '6px 10px',
    borderRadius: 999,
    border: '1px solid #cbd5e1',
    background: '#f8fafc',
    fontSize: 12,
    color: '#475569',
  },
  noEvidenceBox: {
    background: '#f8fafc',
    border: '1px dashed #cbd5e1',
    borderRadius: 8,
    padding: '12px',
    fontSize: 13,
    color: '#64748b',
  },
  previewOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.8)',
    zIndex: 1100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  previewModal: {
    position: 'relative',
    maxWidth: '90vw',
    maxHeight: '90vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCloseButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    width: 34,
    height: 34,
    borderRadius: '50%',
    border: 'none',
    background: '#fff',
    color: '#0f172a',
    fontSize: 24,
    lineHeight: 1,
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
  },
  previewImage: {
    maxWidth: '90vw',
    maxHeight: '90vh',
    borderRadius: 12,
    objectFit: 'contain',
    boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
  },
  ticketFormGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 },
  ticketField: { display: 'flex', flexDirection: 'column', gap: 8 },
  ticketFieldLabel: { fontSize: 12, color: '#475569', fontWeight: 600 },
  ticketTextarea: {
    minHeight: 100,
    resize: 'vertical',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 14,
    color: '#1e293b',
    outline: 'none',
  },
  ticketModalFooter: {
    padding: '14px 20px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
  },
  saveTicketBtn: {
    padding: '12px 24px',
    borderRadius: 10,
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
    boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
  },
};