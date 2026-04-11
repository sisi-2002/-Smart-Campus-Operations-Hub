import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { closeIncidentTicket, getIncidentTicket, getUserDashboardOverview, submitIncidentTicket, updateIncidentTicket } from '../api/userDashboardApi';
import IncidentModal from '../components/IncidentModal';
import TicketCommentsPanel from '../components/TicketCommentsPanel';
import BookingList from '../components/Bookings/BookingList';
import resourceApi from '../api/resourceApi';
import bookingApi from '../api/bookingApi';

const HIDDEN_TICKET_STORAGE_KEY = 'incidentTicketHiddenIds';

const formatSlaDuration = (minutes) => {
  if (!Number.isFinite(minutes) || minutes < 0) {
    return '-';
  }

  const totalMinutes = Math.floor(minutes);
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  if (totalHours < 24) {
    return remainingMinutes ? `${totalHours}h ${remainingMinutes}m` : `${totalHours}h`;
  }

  const days = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;
  return remainingHours ? `${days}d ${remainingHours}h` : `${days}d`;
};

const formatDateTime = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString();
};

const SLA_THRESHOLDS = {
  firstResponse: { targetMinutes: 60, warningMinutes: 180 },
  resolution: { targetMinutes: 1440, warningMinutes: 2880 },
};

const SLA_TONE_STYLE = {
  pending: { background: '#e2e8f0', color: '#475569' },
  onTarget: { background: '#dcfce7', color: '#166534' },
  watch: { background: '#fef3c7', color: '#92400e' },
  breached: { background: '#fee2e2', color: '#991b1b' },
};

const getSlaHealth = (minutes, metric) => {
  const numericMinutes = Number(minutes);
  if (!Number.isFinite(numericMinutes) || numericMinutes < 0) {
    return { label: 'Pending', style: SLA_TONE_STYLE.pending };
  }

  const thresholds = SLA_THRESHOLDS[metric] || SLA_THRESHOLDS.firstResponse;
  if (numericMinutes <= thresholds.targetMinutes) {
    return { label: 'On Target', style: SLA_TONE_STYLE.onTarget };
  }
  if (numericMinutes <= thresholds.warningMinutes) {
    return { label: 'Watch', style: SLA_TONE_STYLE.watch };
  }
  return { label: 'Breached', style: SLA_TONE_STYLE.breached };
};

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [detailTicket, setDetailTicket] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [ticketViewMode, setTicketViewMode] = useState('cards');
  const [ticketNotice, setTicketNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hiddenTicketIds, setHiddenTicketIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(HIDDEN_TICKET_STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });
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
    incidentTickets: [],
  });
  const [resources, setResources] = useState([]);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [resourceError, setResourceError] = useState('');
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('ALL');
  const [resourceStatusFilter, setResourceStatusFilter] = useState('ALL');
  const [resourceMinCapacity, setResourceMinCapacity] = useState('');
  const [myBookings, setMyBookings] = useState([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [deleteTicketTarget, setDeleteTicketTarget] = useState(null);
  const [deleteTicketNote, setDeleteTicketNote] = useState('');
  const [deleteTicketError, setDeleteTicketError] = useState('');
  const [isDeletingTicket, setIsDeletingTicket] = useState(false);

  const getCachedIncidentImages = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('incidentTicketImageCache') || '[]');
    } catch {
      return [];
    }
  }, []);

  const setCachedIncidentImages = (entries) => {
    localStorage.setItem('incidentTicketImageCache', JSON.stringify(entries));
  };

  const hideTicketFromView = (ticketId) => {
    if (!ticketId) {
      return;
    }

    setHiddenTicketIds((current) => {
      const next = Array.from(new Set([...current, ticketId]));
      localStorage.setItem(HIDDEN_TICKET_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const mergeCachedImages = useCallback((tickets) => {
    const cache = getCachedIncidentImages();
    if (!cache.length) {
      return tickets;
    }

    const cacheByTicketId = new Map(cache.map((entry) => [entry.ticketId, entry]));
    return tickets.map((ticket) => {
      const cached = cacheByTicketId.get(ticket.ticketId || ticket.id);
      if (!cached) {
        return ticket;
      }

      return {
        ...ticket,
        imageNames: (ticket.imageNames && ticket.imageNames.length > 0) ? ticket.imageNames : (cached.imageNames || []),
        imageDataUrls: (ticket.imageDataUrls && ticket.imageDataUrls.length > 0) ? ticket.imageDataUrls : (cached.imageDataUrls || []),
      };
    });
  }, [getCachedIncidentImages]);

  const fetchOverview = useCallback(async () => {
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
        activeTickets: mergeCachedImages(Array.isArray(res.data?.activeTickets) ? res.data.activeTickets : []),
        incidentTickets: mergeCachedImages(
          Array.isArray(res.data?.incidentTickets)
            ? res.data.incidentTickets
            : Array.isArray(res.data?.activeTickets)
              ? res.data.activeTickets
              : []
        ),
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [mergeCachedImages]);

  const fetchResources = useCallback(async () => {
    try {
      setResourceLoading(true);
      const res = await resourceApi.getAllResources();
      setResources(Array.isArray(res.data) ? res.data : []);
      setResourceError('');
    } catch (err) {
      setResourceError(err?.response?.data?.error || 'Failed to load resources.');
    } finally {
      setResourceLoading(false);
    }
  }, []);

  const fetchMyBookings = useCallback(async () => {
    try {
      const res = await bookingApi.getMyBookings();
      setMyBookings(Array.isArray(res.data) ? res.data : []);
    } catch {
      setMyBookings([]);
    }
  }, []);

  const handleIncidentSubmit = async (payload) => {
    const response = await submitIncidentTicket(payload);
    const ticketId = response?.data?.ticketId || response?.data?.id;
    if (ticketId) {
      const nextCache = getCachedIncidentImages().filter((entry) => entry.ticketId !== ticketId);
      nextCache.push({
        ticketId,
        imageNames: payload.imageNames || [],
        imageDataUrls: payload.imageDataUrls || [],
      });
      setCachedIncidentImages(nextCache);
    }
    await fetchOverview();
    return response;
  };

  const handleIncidentUpdate = async (payload) => {
    if (!editingTicket) {
      throw new Error('No ticket selected for editing.');
    }

    const ticketId = editingTicket.id || editingTicket.ticketId;
    const response = await updateIncidentTicket(ticketId, payload);
    await fetchOverview();
    return response;
  };

  const openDeleteTicketModal = (ticket) => {
    if (!ticket) {
      return;
    }

    const normalizedStatus = (ticket.status || '').trim().toUpperCase();
    if (normalizedStatus !== 'OPEN') {
      setTicketNotice({
        type: 'error',
        message: 'Only OPEN tickets can be deleted.',
      });
      return;
    }

    setDeleteTicketTarget(ticket);
    setDeleteTicketNote('');
    setDeleteTicketError('');
  };

  const closeDeleteTicketModal = () => {
    setDeleteTicketTarget(null);
    setDeleteTicketNote('');
    setDeleteTicketError('');
  };

  const confirmDeleteOpenTicket = async () => {
    if (!deleteTicketTarget) {
      return;
    }

    const note = deleteTicketNote.trim();
    if (!note) {
      setDeleteTicketError('A note is required to delete an OPEN ticket.');
      return;
    }

    const ticketId = deleteTicketTarget.id || deleteTicketTarget.ticketId;
    if (!ticketId) {
      setDeleteTicketError('Ticket identifier is missing.');
      return;
    }

    setIsDeletingTicket(true);
    setDeleteTicketError('');

    try {
      await closeIncidentTicket(ticketId, { note });
      hideTicketFromView(deleteTicketTarget.ticketId || deleteTicketTarget.id || ticketId);
      await fetchOverview();
      closeDeleteTicketModal();
      setTicketNotice({
        type: 'success',
        message: `Ticket ${deleteTicketTarget.ticketId || deleteTicketTarget.id} deleted successfully and marked as CLOSED for admins.`,
      });
    } catch (err) {
      setDeleteTicketError(err.response?.data?.error || 'Failed to delete ticket.');
    } finally {
      setIsDeletingTicket(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchResources();
    fetchMyBookings();
  }, [fetchOverview, fetchResources, fetchMyBookings]);

  useEffect(() => {
    if (activeTab !== 'tickets' && ticketNotice) {
      setTicketNotice(null);
    }
  }, [activeTab, ticketNotice]);

  const userDetails = useMemo(() => {
    return {
      name: overview.user?.name || user?.name || 'User',
      email: overview.user?.email || user?.email || '-',
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

  const normalizeStatus = (value) => String(value || '').trim().toUpperCase();

  const dashboardBookings = useMemo(() => {
    if (myBookings.length > 0) {
      return myBookings.map((booking) => {
        const start = booking.startTime ? new Date(booking.startTime) : null;
        const end = booking.endTime ? new Date(booking.endTime) : null;
        const isValidStart = start && !Number.isNaN(start.getTime());
        const isValidEnd = end && !Number.isNaN(end.getTime());

        return {
          id: booking.id,
          resource: booking.resourceName || '-',
          status: normalizeStatus(booking.status) || 'UNKNOWN',
          dateLabel: isValidStart ? start.toLocaleDateString() : '-',
          timeLabel: isValidStart && isValidEnd
            ? `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : '-',
          searchText: [booking.resourceName, booking.purpose, booking.status].filter(Boolean).join(' ').toLowerCase(),
        };
      });
    }

    return overview.recentBookings.map((booking, idx) => ({
      id: booking.id || `overview-${idx}`,
      resource: booking.resource || '-',
      status: normalizeStatus(booking.status) || 'UNKNOWN',
      dateLabel: booking.date || '-',
      timeLabel: booking.time || '-',
      searchText: [booking.resource, booking.status, booking.date, booking.time].filter(Boolean).join(' ').toLowerCase(),
    }));
  }, [myBookings, overview.recentBookings]);

  const filteredDashboardBookings = useMemo(() => {
    const q = bookingSearch.trim().toLowerCase();
    return dashboardBookings.filter((booking) => {
      const matchSearch = q === '' || booking.searchText.includes(q);
      const matchStatus = bookingStatusFilter === 'ALL' || booking.status === bookingStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [dashboardBookings, bookingSearch, bookingStatusFilter]);

  const resourceTypes = useMemo(() => {
    const values = new Set(resources.map((resource) => String(resource.type || '').toUpperCase()).filter(Boolean));
    return Array.from(values).sort();
  }, [resources]);

  const filteredResources = useMemo(() => {
    const q = resourceSearch.trim().toLowerCase();
    const minCapacity = resourceMinCapacity.trim() === '' ? null : Number.parseInt(resourceMinCapacity, 10);

    return resources.filter((resource) => {
      const type = String(resource.type || '').toUpperCase();
      const status = String(resource.status || '').toUpperCase();
      const capacity = Number(resource.capacity) || 0;
      const searchSpace = [resource.name, resource.type, resource.location, resource.building, ...(resource.features || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchSearch = q === '' || searchSpace.includes(q);
      const matchType = resourceTypeFilter === 'ALL' || type === resourceTypeFilter;
      const matchStatus = resourceStatusFilter === 'ALL' || status === resourceStatusFilter;
      const matchCapacity = minCapacity === null || (!Number.isNaN(minCapacity) && capacity >= minCapacity);

      return matchSearch && matchType && matchStatus && matchCapacity;
    });
  }, [resources, resourceSearch, resourceTypeFilter, resourceStatusFilter, resourceMinCapacity]);

  const formatEnumLabel = (value) => String(value || '-')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const getStatusPillStyle = (status) => {
    const normalized = (status || '').trim().toUpperCase();
    if (normalized === 'CONFIRMED' || normalized === 'RESOLVED') {
      return { background: '#dcfce7', color: '#166534' };
    }
    if (normalized === 'REJECTED') {
      return { background: '#f3e8ff', color: '#6b21a8' };
    }
    if (normalized === 'PENDING' || normalized === 'OPEN') {
      return { background: '#fef3c7', color: '#92400e' };
    }
    return { background: '#dbeafe', color: '#1e40af' };
  };

  const ticketsForMyTickets = overview.incidentTickets.length > 0
    ? overview.incidentTickets
    : overview.activeTickets;

  const visibleTicketsForMyTickets = ticketsForMyTickets.filter((ticket) => {
    const ticketKey = ticket.ticketId || ticket.id;
    return ticketKey && !hiddenTicketIds.includes(ticketKey);
  });

  const detailTicketImages = detailTicket ? (detailTicket.imageDataUrls || []).slice(0, 6) : [];
  const detailHasImageNamesOnly = detailTicket
    ? detailTicketImages.length === 0 && (detailTicket.imageNames || []).length > 0
    : false;
  const detailFirstResponseSla = detailTicket
    ? getSlaHealth(detailTicket.timeToFirstResponseMinutes, 'firstResponse')
    : null;
  const detailResolutionSla = detailTicket
    ? getSlaHealth(detailTicket.timeToResolutionMinutes, 'resolution')
    : null;

  const openCreateIncidentModal = () => {
    setEditingTicket(null);
    setIsIncidentModalOpen(true);
  };

  const openEditIncidentModal = async (ticket) => {
    if (!ticket) {
      return;
    }

    try {
      const ticketId = ticket.id || ticket.ticketId;
      const response = await getIncidentTicket(ticketId);
      setEditingTicket(response.data || ticket);
      setIsIncidentModalOpen(true);
    } catch (err) {
      setTicketNotice({
        type: 'error',
        message: err.response?.data?.error || 'Failed to load ticket details for editing',
      });
    }
  };

  const editingTicketFormValues = editingTicket ? {
    resourceLocation: editingTicket.resourceLocation || editingTicket.location || '',
    category: editingTicket.category || '',
    priority: editingTicket.priority || '',
    description: editingTicket.description || '',
    preferredContact: editingTicket.preferredContact || '',
  } : undefined;

  const closeIncidentModal = () => {
    setIsIncidentModalOpen(false);
    setEditingTicket(null);
  };

  const openTicketDetailsModal = (ticket) => {
    if (!ticket) {
      return;
    }
    setDetailTicket(ticket);
  };

  const closeTicketDetailsModal = () => {
    setDetailTicket(null);
  };

  const handleDetailCommentsChange = (nextComments) => {
    if (!detailTicket) {
      return;
    }

    const detailKey = detailTicket.ticketId || detailTicket.id;

    setDetailTicket((current) => (current ? { ...current, comments: nextComments } : current));
    setOverview((prev) => ({
      ...prev,
      activeTickets: prev.activeTickets.map((item) => (
        (item.ticketId || item.id) === detailKey
          ? { ...item, comments: nextComments }
          : item
      )),
      incidentTickets: prev.incidentTickets.map((item) => (
        (item.ticketId || item.id) === detailKey
          ? { ...item, comments: nextComments }
          : item
      )),
    }));
    setTicketNotice(null);
  };

  const renderDashboardTab = () => (
    <>
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
          <div style={s.sectionHeader}>My Bookings</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12, padding: '0 12px' }}>
            <input
              type="text"
              value={bookingSearch}
              onChange={(event) => setBookingSearch(event.target.value)}
              placeholder="Search by resource, purpose, date..."
              style={{
                minWidth: 260,
                flex: 1,
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
              }}
            />
            <select
              value={bookingStatusFilter}
              onChange={(event) => setBookingStatusFilter(event.target.value)}
              style={{
                minWidth: 180,
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                background: '#fff',
              }}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
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
              {filteredDashboardBookings.length === 0 && (
                <tr style={s.tr}>
                  <td style={s.emptyTd} colSpan={4}>No bookings match your filter.</td>
                </tr>
              )}
              {filteredDashboardBookings.map((booking) => (
                <tr key={booking.id} style={s.tr}>
                  <td style={s.td}>{booking.resource}</td>
                  <td style={s.td}>{booking.dateLabel}</td>
                  <td style={s.td}>{booking.timeLabel}</td>
                  <td style={s.td}>
                    <span style={{ ...s.pill, ...getStatusPillStyle(booking.status) }}>
                      {formatEnumLabel(booking.status)}
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
                <tr key={ticket.ticketId || ticket.id} style={s.tr}>
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
  );

  const renderTicketsTab = () => (
    <div style={s.ticketsWrap}>
      <div style={s.ticketsHeader}>
        <div style={s.ticketsTitleWrap}>
          <span style={s.ticketsTitleEyebrow}>Ticket Center</span>
          <div style={s.ticketsTitle}>My Incident Reports</div>
        </div>
        <div style={s.ticketsHeaderRight}>
          <div style={s.ticketViewToggle}>
            <button
              type="button"
              style={ticketViewMode === 'cards' ? s.ticketViewBtnActive : s.ticketViewBtn}
              onClick={() => setTicketViewMode('cards')}
            >
              Card View
            </button>
            <button
              type="button"
              style={ticketViewMode === 'compact' ? s.ticketViewBtnActive : s.ticketViewBtn}
              onClick={() => setTicketViewMode('compact')}
            >
              Compact View
            </button>
          </div>
          <div style={s.ticketsCount}>{visibleTicketsForMyTickets.length}</div>
        </div>
      </div>

      {ticketNotice && (
        <div style={ticketNotice.type === 'error' ? s.ticketErrorBanner : s.ticketSuccessBanner}>
          {ticketNotice.message}
        </div>
      )}

      {visibleTicketsForMyTickets.length === 0 ? (
        <div style={s.ticketsEmpty}>No incident reports found in database.</div>
      ) : ticketViewMode === 'cards' ? (
        <div style={s.ticketsGrid}>
          {visibleTicketsForMyTickets.map((ticket) => {
            const ticketImages = (ticket.imageDataUrls || []).slice(0, 3);
            const hasImageNamesOnly = ticketImages.length === 0 && (ticket.imageNames || []).length > 0;
            const normalizedStatus = (ticket.status || '').trim().toUpperCase();
            const canHide = ['RESOLVED', 'CLOSED', 'REJECTED'].includes(normalizedStatus);
            const ticketKey = ticket.ticketId || ticket.id;
            const firstResponseSla = getSlaHealth(ticket.timeToFirstResponseMinutes, 'firstResponse');
            const resolutionSla = getSlaHealth(ticket.timeToResolutionMinutes, 'resolution');

            return (
              <article key={ticketKey} style={s.ticketCard}>
                <div style={s.ticketCardHeader}>
                  <div>
                    <div style={s.ticketCardId}>{ticket.ticketId || ticket.id}</div>
                    <div style={s.ticketCardMeta}>{ticket.location || '-'}</div>
                  </div>
                  <span style={{ ...s.pill, ...getStatusPillStyle(ticket.status) }}>
                    {ticket.status || 'Open'}
                  </span>
                </div>

                <div style={s.ticketCardBody}>
                  <div style={s.ticketInfoRow}>
                    <span style={s.ticketInfoKey}>Category</span>
                    <span style={s.ticketInfoValue}>{ticket.category || '-'}</span>
                  </div>

                  <div style={s.ticketInfoRow}>
                    <span style={s.ticketInfoKey}>Submitted</span>
                    <span style={s.ticketInfoValue}>{formatDateTime(ticket.createdAt)}</span>
                  </div>

                  <div style={s.ticketInfoRow}>
                    <span style={s.ticketInfoKey}>1st Response</span>
                    <span style={s.ticketInfoValue}>
                      <span style={s.ticketInfoMetricWrap}>
                        <span>{formatSlaDuration(ticket.timeToFirstResponseMinutes)}</span>
                        <span style={{ ...s.ticketSlaBadge, ...firstResponseSla.style }}>{firstResponseSla.label}</span>
                      </span>
                      <span style={s.ticketInfoSubValue}>{formatDateTime(ticket.firstResponseAt)}</span>
                    </span>
                  </div>

                  <div style={s.ticketInfoRow}>
                    <span style={s.ticketInfoKey}>Resolution</span>
                    <span style={s.ticketInfoValue}>
                      <span style={s.ticketInfoMetricWrap}>
                        <span>{formatSlaDuration(ticket.timeToResolutionMinutes)}</span>
                        <span style={{ ...s.ticketSlaBadge, ...resolutionSla.style }}>{resolutionSla.label}</span>
                      </span>
                      <span style={s.ticketInfoSubValue}>{formatDateTime(ticket.resolvedAt)}</span>
                    </span>
                  </div>

                  <div style={s.ticketInfoRow}>
                    <span style={s.ticketInfoKey}>Attachments</span>
                    <div style={s.ticketImages}>
                      {ticketImages.length > 0 ? (
                        ticketImages.map((imageUrl, index) => (
                          <img
                            key={`${ticketKey}-${index}`}
                            src={imageUrl}
                            alt={`${ticket.ticketId || ticket.id} attachment ${index + 1}`}
                            style={s.ticketThumbnail}
                            onClick={() => setPreviewImageUrl(imageUrl)}
                          />
                        ))
                      ) : hasImageNamesOnly ? (
                        (ticket.imageNames || []).slice(0, 3).map((imageName) => (
                          <span key={imageName} style={s.imageNameChip}>{imageName}</span>
                        ))
                      ) : (
                        <span style={s.mutedText}>No images</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={s.ticketCardActions}>
                  {normalizedStatus === 'OPEN' && (
                    <button
                      type="button"
                      style={s.actionBtnSecondary}
                      onClick={() => openEditIncidentModal(ticket)}
                    >
                      Edit Ticket
                    </button>
                  )}

                  {normalizedStatus === 'OPEN' && (
                    <button
                      type="button"
                      style={s.actionBtnDanger}
                      onClick={() => openDeleteTicketModal(ticket)}
                    >
                      Delete Ticket
                    </button>
                  )}

                  <button
                    type="button"
                    style={s.actionBtn}
                    onClick={() => openTicketDetailsModal(ticket)}
                  >
                    View Details
                  </button>

                  {canHide ? (
                    <button
                      type="button"
                      style={s.actionBtnSecondary}
                      onClick={() => hideTicketFromView(ticket.ticketId || ticket.id)}
                    >
                      Remove From View
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div style={s.ticketCompactWrap}>
          <table style={s.table}>
            <thead>
              <tr style={s.ticketCompactHead}>
                <th style={s.ticketCompactTh}>Ticket ID</th>
                <th style={s.ticketCompactTh}>Location</th>
                <th style={s.ticketCompactTh}>Category</th>
                <th style={s.ticketCompactTh}>Pictures</th>
                <th style={s.ticketCompactTh}>Status</th>
                <th style={s.ticketCompactTh}>1st Response SLA</th>
                <th style={s.ticketCompactTh}>Resolution SLA</th>
                <th style={s.ticketCompactTh}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleTicketsForMyTickets.map((ticket) => {
                const ticketImages = (ticket.imageDataUrls || []).slice(0, 3);
                const hasImageNamesOnly = ticketImages.length === 0 && (ticket.imageNames || []).length > 0;
                const normalizedStatus = (ticket.status || '').trim().toUpperCase();
                const canHide = ['RESOLVED', 'CLOSED', 'REJECTED'].includes(normalizedStatus);
                const ticketKey = ticket.ticketId || ticket.id;
                const firstResponseSla = getSlaHealth(ticket.timeToFirstResponseMinutes, 'firstResponse');
                const resolutionSla = getSlaHealth(ticket.timeToResolutionMinutes, 'resolution');

                return (
                  <tr key={ticketKey} style={s.tr}>
                      <td style={s.ticketCompactTd}><div style={{ fontWeight: 600 }}>{ticket.ticketId || ticket.id}</div></td>
                      <td style={s.ticketCompactTd}>{ticket.location || '-'}</td>
                      <td style={s.ticketCompactTd}>{ticket.category || '-'}</td>
                      <td style={s.ticketCompactTd}>
                        <div style={s.ticketImages}>
                          {ticketImages.length > 0 ? (
                            ticketImages.map((imageUrl, index) => (
                              <img
                                key={`${ticketKey}-${index}`}
                                src={imageUrl}
                                alt={`${ticket.ticketId || ticket.id} attachment ${index + 1}`}
                                style={s.ticketThumbnail}
                                onClick={() => setPreviewImageUrl(imageUrl)}
                              />
                            ))
                          ) : hasImageNamesOnly ? (
                            (ticket.imageNames || []).slice(0, 3).map((imageName) => (
                              <span key={imageName} style={s.imageNameChip}>{imageName}</span>
                            ))
                          ) : (
                            <span style={s.mutedText}>No images</span>
                          )}
                        </div>
                      </td>
                      <td style={s.ticketCompactTd}>
                        <span style={{ ...s.pill, ...getStatusPillStyle(ticket.status) }}>
                          {ticket.status || 'Open'}
                        </span>
                      </td>
                      <td style={s.ticketCompactTd}>
                        <div style={s.ticketCompactSlaTopRow}>
                          <div style={{ ...s.ticketCompactSlaValue, color: firstResponseSla.style.color }}>{formatSlaDuration(ticket.timeToFirstResponseMinutes)}</div>
                          <span style={{ ...s.ticketCompactSlaBadge, ...firstResponseSla.style }}>{firstResponseSla.label}</span>
                        </div>
                        <div style={s.ticketCompactSlaMeta}>{formatDateTime(ticket.firstResponseAt)}</div>
                      </td>
                      <td style={s.ticketCompactTd}>
                        <div style={s.ticketCompactSlaTopRow}>
                          <div style={{ ...s.ticketCompactSlaValue, color: resolutionSla.style.color }}>{formatSlaDuration(ticket.timeToResolutionMinutes)}</div>
                          <span style={{ ...s.ticketCompactSlaBadge, ...resolutionSla.style }}>{resolutionSla.label}</span>
                        </div>
                        <div style={s.ticketCompactSlaMeta}>{formatDateTime(ticket.resolvedAt)}</div>
                      </td>
                      <td style={s.ticketCompactTd}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          {normalizedStatus === 'OPEN' && (
                            <button
                              type="button"
                              style={s.actionBtnSecondary}
                              onClick={() => openEditIncidentModal(ticket)}
                            >
                              Edit Ticket
                            </button>
                          )}
                          {normalizedStatus === 'OPEN' && (
                            <button
                              type="button"
                              style={s.actionBtnDanger}
                              onClick={() => openDeleteTicketModal(ticket)}
                            >
                              Delete Ticket
                            </button>
                          )}
                          <button
                            type="button"
                            style={s.actionBtn}
                            onClick={() => openTicketDetailsModal(ticket)}
                          >
                            View Details
                          </button>
                          {canHide ? (
                            <button
                              type="button"
                              style={s.actionBtnSecondary}
                              onClick={() => hideTicketFromView(ticket.ticketId || ticket.id)}
                            >
                              Remove From View
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div style={s.layout}>

      <IncidentModal
        open={isIncidentModalOpen}
        onClose={closeIncidentModal}
        onSubmitTicket={editingTicket ? handleIncidentUpdate : handleIncidentSubmit}
        mode={editingTicket ? 'edit' : 'create'}
        initialValues={editingTicketFormValues}
        initialAttachments={editingTicket ? (editingTicket.imageDataUrls || []).map((dataUrl, index) => ({
          name: editingTicket.imageNames?.[index] || `Attachment ${index + 1}`,
          dataUrl,
        })) : []}
        submitLabel={editingTicket ? 'Save Changes' : 'Submit Ticket'}
        currentTicketId={editingTicket?.ticketId || editingTicket?.id || ''}
        onSubmitted={() => {
          if (editingTicket) {
            setTicketNotice({ type: 'success', message: 'Ticket updated successfully' });
            closeIncidentModal();
          }
        }}
      />

      {detailTicket && (
        <div style={s.detailOverlay} onClick={closeTicketDetailsModal}>
          <div style={s.detailModal} onClick={(event) => event.stopPropagation()}>
            <div style={s.detailHeader}>
              <div>
                <h3 style={s.detailTitle}>View Ticket Details - {detailTicket.ticketId || detailTicket.id}</h3>
                <p style={s.detailSub}>Track progress, review evidence, and continue the conversation.</p>
                <div style={s.detailMetaRow}>
                  <span style={{ ...s.pill, ...getStatusPillStyle(detailTicket.status) }}>
                    {detailTicket.status || 'OPEN'}
                  </span>
                  <span style={s.detailMetaChip}>Priority: {detailTicket.priority || '-'}</span>
                  <span style={s.detailMetaChip}>Category: {detailTicket.category || '-'}</span>
                </div>
              </div>
              <button type="button" style={s.detailCloseBtn} onClick={closeTicketDetailsModal}>×</button>
            </div>

            <div style={s.detailBody}>
              <div style={s.detailInfoGrid}>
                <div style={s.detailInfoItem}>
                  <span style={s.detailInfoLabel}>Location</span>
                  <span style={s.detailInfoValue}>{detailTicket.location || '-'}</span>
                </div>
                <div style={s.detailInfoItem}>
                  <span style={s.detailInfoLabel}>Preferred Contact</span>
                  <span style={s.detailInfoValue}>{detailTicket.preferredContact || '-'}</span>
                </div>
                <div style={s.detailInfoItem}>
                  <span style={s.detailInfoLabel}>Submitted At</span>
                  <span style={s.detailInfoValue}>{formatDateTime(detailTicket.createdAt)}</span>
                </div>
                <div style={s.detailInfoItem}>
                  <span style={s.detailInfoLabel}>First Response SLA</span>
                  <span style={s.detailInfoValue}>
                    {formatSlaDuration(detailTicket.timeToFirstResponseMinutes)} ({detailFirstResponseSla?.label || 'Pending'})
                  </span>
                </div>
                <div style={s.detailInfoItem}>
                  <span style={s.detailInfoLabel}>Resolution SLA</span>
                  <span style={s.detailInfoValue}>
                    {formatSlaDuration(detailTicket.timeToResolutionMinutes)} ({detailResolutionSla?.label || 'Pending'})
                  </span>
                </div>
              </div>

              <div style={s.detailSection}>
                <div style={s.detailSectionTitle}>Description</div>
                <p style={s.detailDescription}>{detailTicket.description || 'No description provided.'}</p>
              </div>

              <div style={s.detailSection}>
                <div style={s.detailSectionTitle}>Evidence</div>
                {detailTicketImages.length > 0 ? (
                  <div style={s.detailEvidenceGrid}>
                    {detailTicketImages.map((imageUrl, index) => (
                      <img
                        key={`${detailTicket.id}-detail-${index}`}
                        src={imageUrl}
                        alt={`${detailTicket.ticketId || detailTicket.id} attachment ${index + 1}`}
                        style={s.detailEvidenceImage}
                        onClick={() => setPreviewImageUrl(imageUrl)}
                      />
                    ))}
                  </div>
                ) : detailHasImageNamesOnly ? (
                  <div style={s.attachmentNamesWrap}>
                    {(detailTicket.imageNames || []).slice(0, 6).map((imageName) => (
                      <span key={imageName} style={s.imageNameChip}>{imageName}</span>
                    ))}
                  </div>
                ) : (
                  <div style={s.noEvidenceBox}>No image attachments were provided.</div>
                )}
              </div>

              <div style={s.detailSection}>
                <div style={s.detailSectionTitle}>Resolution Notes</div>
                <p style={s.detailDescription}>{detailTicket.resolutionNotes || 'No resolution notes yet.'}</p>
              </div>

              <div style={s.detailSection}>
                <div style={s.detailSectionTitle}>Comments</div>
                <TicketCommentsPanel
                  ticket={detailTicket}
                  currentUser={userDetails}
                  onCommentsChange={handleDetailCommentsChange}
                  onError={(message) => setTicketNotice({ type: 'error', message: message || 'Failed to update comments' })}
                  onSuccess={(message) => setTicketNotice({ type: 'success', message: message || 'Comment updated' })}
                />
              </div>
            </div>

            <div style={s.detailFooter}>
              <button type="button" style={s.detailDoneBtn} onClick={closeTicketDetailsModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {deleteTicketTarget && (
        <div
          style={s.deleteOverlay}
          onClick={() => {
            if (!isDeletingTicket) {
              closeDeleteTicketModal();
            }
          }}
        >
          <div style={s.deleteModal} onClick={(event) => event.stopPropagation()}>
            <div style={s.deleteModalTitle}>Delete Open Ticket</div>
            <div style={s.deleteTicketRef}>Ticket: {deleteTicketTarget.ticketId || deleteTicketTarget.id}</div>

            {deleteTicketError && (
              <div style={s.deleteErrorBanner}>{deleteTicketError}</div>
            )}

            <label style={s.deleteLabel}>Required Note</label>
            <textarea
              style={s.deleteTextarea}
              value={deleteTicketNote}
              onChange={(event) => {
                setDeleteTicketNote(event.target.value);
                if (deleteTicketError) {
                  setDeleteTicketError('');
                }
              }}
              placeholder="Explain why you are deleting this open ticket"
            />

            <div style={s.deleteActions}>
              <button
                type="button"
                style={s.deleteCancelBtn}
                onClick={closeDeleteTicketModal}
                disabled={isDeletingTicket}
              >
                Cancel
              </button>
              <button
                type="button"
                style={s.deleteConfirmBtn}
                onClick={confirmDeleteOpenTicket}
                disabled={isDeletingTicket}
              >
                {isDeletingTicket ? 'Deleting...' : 'Delete Ticket'}
              </button>
            </div>
          </div>
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
              <button 
                style={s.primaryBtn} 
                onClick={() => navigate('/create-booking')}
              >
                Book Resource
              </button>
              <button style={s.dangerBtn} onClick={openCreateIncidentModal}>
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
              {activeTab === 'dashboard' && renderDashboardTab()}
              {activeTab === 'bookings' && (
                <BookingList isAdmin={false} />
              )}
              {activeTab === 'catalogue' && (
                <div style={s.tableWrap}>
                  <div style={s.sectionHeader}>Resource Catalogue</div>
                  <div style={{ display: 'grid', gap: 12, padding: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10 }}>
                      <input
                        type="text"
                        value={resourceSearch}
                        onChange={(event) => setResourceSearch(event.target.value)}
                        placeholder="Search name, type, location, building..."
                        style={{ padding: '9px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                      />
                      <select
                        value={resourceTypeFilter}
                        onChange={(event) => setResourceTypeFilter(event.target.value)}
                        style={{ padding: '9px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
                      >
                        <option value="ALL">All Types</option>
                        {resourceTypes.map((type) => (
                          <option key={type} value={type}>{formatEnumLabel(type)}</option>
                        ))}
                      </select>
                      <select
                        value={resourceStatusFilter}
                        onChange={(event) => setResourceStatusFilter(event.target.value)}
                        style={{ padding: '9px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
                      >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="OUT_OF_SERVICE">Out of Service</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        value={resourceMinCapacity}
                        onChange={(event) => setResourceMinCapacity(event.target.value)}
                        placeholder="Min capacity"
                        style={{ padding: '9px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                      />
                    </div>

                    {resourceLoading && <div style={s.infoBanner}>Loading resources...</div>}
                    {!resourceLoading && resourceError && <div style={s.errorBanner}>{resourceError}</div>}

                    {!resourceLoading && !resourceError && filteredResources.length === 0 && (
                      <div style={s.emptyState}>No resources match your search/filter.</div>
                    )}

                    {!resourceLoading && !resourceError && filteredResources.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                        {filteredResources.map((resource) => (
                          <article
                            key={resource.id}
                            style={{
                              border: '1px solid #e2e8f0',
                              borderRadius: 10,
                              background: '#f8fafc',
                              padding: 12,
                              display: 'grid',
                              gap: 6,
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                              <strong style={{ color: '#0f172a' }}>{resource.name || 'Unnamed Resource'}</strong>
                              <span style={{ ...s.pill, ...getStatusPillStyle(resource.status) }}>{formatEnumLabel(resource.status)}</span>
                            </div>
                            <div style={{ color: '#334155', fontSize: 13 }}><strong>Type:</strong> {formatEnumLabel(resource.type)}</div>
                            <div style={{ color: '#334155', fontSize: 13 }}><strong>Location:</strong> {resource.location || '-'}</div>
                            <div style={{ color: '#334155', fontSize: 13 }}><strong>Building:</strong> {resource.building || '-'}</div>
                            <div style={{ color: '#334155', fontSize: 13 }}><strong>Capacity:</strong> {resource.capacity ?? '-'} people</div>
                            <div style={{ color: '#334155', fontSize: 13 }}><strong>Hours:</strong> {resource.availableFrom || '-'} - {resource.availableTo || '-'}</div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'tickets' && renderTicketsTab()}
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
  secondaryBtn: {
    padding: '7px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    background: '#fff',
    color: '#334155',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  profileInput: {
    padding: '6px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    fontSize: 13,
    width: '180px',
    color: '#0f172a'
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
  ticketErrorBanner: {
    margin: '12px 16px 0',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    padding: '9px 12px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
  },
  ticketSuccessBanner: {
    margin: '12px 16px 0',
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#065f46',
    padding: '9px 12px',
    borderRadius: 8,
    fontSize: 12,
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
  ticketsWrap: {
    margin: '1.25rem 2rem 0',
    background: '#f4f1eb',
    borderRadius: 12,
    boxShadow: '0 4px 16px rgba(28,25,23,0.08)',
    border: '1px solid #e4dfd4',
    overflow: 'hidden',
  },
  ticketsHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid #e4dfd4',
    background: '#faf9f7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  ticketsTitleWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  ticketsTitleEyebrow: {
    display: 'inline-flex',
    width: 'fit-content',
    padding: '3px 8px',
    borderRadius: 999,
    border: '1px solid #7c2d1233',
    background: '#7c2d1214',
    color: '#7c2d12',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  ticketsHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  ticketsTitle: {
    fontSize: 24,
    fontWeight: 700,
    fontFamily: 'Playfair Display, serif',
    color: '#1c1917',
    letterSpacing: '-0.01em',
  },
  ticketViewToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  ticketViewBtn: {
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid #e4dfd4',
    background: '#fff',
    color: '#78716c',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  ticketViewBtnActive: {
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid #7c2d12',
    background: '#7c2d12',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  ticketsCount: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 30,
    padding: '3px 10px',
    borderRadius: 999,
    border: '1px solid #7c2d1233',
    background: '#7c2d1214',
    color: '#7c2d12',
    fontSize: 12,
    fontWeight: 700,
  },
  ticketsGrid: {
    padding: 16,
    background: '#f4f1eb',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 12,
  },
  ticketCompactWrap: {
    background: '#fff',
    borderTop: '1px solid #e4dfd4',
    overflowX: 'auto',
  },
  ticketCompactHead: { background: '#faf9f7' },
  ticketCompactTh: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 600,
    color: '#78716c',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: '1px solid #e4dfd4',
  },
  ticketCompactTd: {
    padding: '12px 16px',
    verticalAlign: 'middle',
    color: '#44403c',
    fontSize: 13,
    borderBottom: '1px solid #f1f0ec',
  },
  ticketCompactSlaValue: {
    fontSize: 12,
    fontWeight: 700,
    color: '#1c1917',
  },
  ticketCompactSlaTopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  ticketCompactSlaBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.2,
  },
  ticketCompactSlaMeta: {
    marginTop: 2,
    fontSize: 11,
    color: '#78716c',
  },
  ticketsEmpty: {
    padding: '24px 16px',
    textAlign: 'center',
    color: '#78716c',
    fontSize: 13,
    background: '#fff',
  },
  ticketCard: {
    border: '1px solid #e4dfd4',
    borderRadius: 12,
    background: '#fff',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(28,25,23,0.05)',
  },
  ticketCardHeader: {
    padding: '12px 14px',
    borderBottom: '1px solid #e4dfd4',
    background: '#faf9f7',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  ticketCardId: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1c1917',
  },
  ticketCardMeta: {
    marginTop: 3,
    fontSize: 12,
    color: '#78716c',
  },
  ticketCardBody: {
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  ticketInfoRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  ticketInfoKey: {
    minWidth: 84,
    fontSize: 12,
    fontWeight: 600,
    color: '#78716c',
  },
  ticketInfoValue: {
    fontSize: 13,
    color: '#1c1917',
    textAlign: 'right',
    flex: 1,
  },
  ticketInfoMetricWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  ticketSlaBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.2,
  },
  ticketInfoSubValue: {
    display: 'block',
    marginTop: 2,
    fontSize: 11,
    color: '#78716c',
  },
  ticketCardActions: {
    padding: '12px 14px',
    borderTop: '1px solid #e4dfd4',
    background: '#faf9f7',
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
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
  ticketImages: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  ticketThumbnail: {
    width: 52,
    height: 52,
    borderRadius: 12,
    objectFit: 'cover',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    boxShadow: '0 4px 14px rgba(15,23,42,0.08)',
    cursor: 'zoom-in',
  },
  actionBtn: {
    padding: '7px 12px',
    borderRadius: 8,
    border: '1px solid #7c2d1230',
    background: '#7c2d1214',
    color: '#7c2d12',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  actionBtnSecondary: {
    padding: '7px 12px',
    borderRadius: 8,
    border: '1px solid #d6d3d1',
    background: '#fff',
    color: '#57534e',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  actionBtnDanger: {
    padding: '7px 12px',
    borderRadius: 8,
    border: '1px solid #dc2626',
    background: '#fee2e2',
    color: '#991b1b',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  imageNameChip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: 999,
    background: '#f1f5f9',
    color: '#334155',
    fontSize: 12,
    fontWeight: 500,
  },
  mutedText: { color: '#94a3b8', fontSize: 13 },
  emptyState: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '18px 16px',
    color: '#64748b',
    fontSize: 14,
  },
  detailOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1325,
    background: 'rgba(15, 23, 42, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backdropFilter: 'blur(5px)',
  },
  detailModal: {
    width: '100%',
    maxWidth: 920,
    maxHeight: '90vh',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 14,
    boxShadow: '0 30px 50px rgba(15, 23, 42, 0.28)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  detailHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    background: '#f8fafc',
  },
  detailTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: '#0f172a',
  },
  detailSub: {
    margin: '4px 0 0',
    fontSize: 13,
    color: '#64748b',
  },
  detailMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 8,
  },
  detailMetaChip: {
    padding: '4px 10px',
    borderRadius: 999,
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#475569',
    fontSize: 11,
    fontWeight: 600,
  },
  detailCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#334155',
    fontSize: 20,
    lineHeight: 1,
    cursor: 'pointer',
  },
  detailBody: {
    padding: 16,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    background: '#f8fafc',
  },
  detailInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: 8,
  },
  detailInfoItem: {
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    background: '#fff',
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  detailInfoLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#64748b',
  },
  detailInfoValue: {
    fontSize: 13,
    color: '#0f172a',
    lineHeight: 1.45,
  },
  detailSection: {
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    background: '#fff',
    padding: '10px 12px',
  },
  detailSectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#334155',
    marginBottom: 8,
  },
  detailDescription: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.6,
    color: '#334155',
  },
  detailEvidenceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: 8,
  },
  detailEvidenceImage: {
    width: '100%',
    height: 96,
    objectFit: 'cover',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    cursor: 'zoom-in',
  },
  detailFooter: {
    padding: '10px 14px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    background: '#fff',
  },
  detailDoneBtn: {
    padding: '8px 14px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#334155',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  deleteOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1350,
    background: 'rgba(15, 23, 42, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backdropFilter: 'blur(4px)',
  },
  deleteModal: {
    width: '100%',
    maxWidth: 560,
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #e2e8f0',
    boxShadow: '0 22px 40px rgba(15, 23, 42, 0.25)',
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
  },
  deleteTicketRef: {
    fontSize: 12,
    fontWeight: 700,
    color: '#7c2d12',
    background: '#fff7ed',
    border: '1px solid #fed7aa',
    borderRadius: 8,
    padding: '6px 10px',
    width: 'fit-content',
  },
  deleteErrorBanner: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: 12,
    fontWeight: 600,
  },
  deleteLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  deleteTextarea: {
    width: '100%',
    minHeight: 110,
    border: '1px solid #cbd5e1',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 14,
    color: '#0f172a',
    background: '#f8fafc',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
  },
  deleteActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  deleteCancelBtn: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    background: '#fff',
    color: '#334155',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  deleteConfirmBtn: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #dc2626',
    background: '#dc2626',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  previewOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1300,
    background: 'rgba(15, 23, 42, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backdropFilter: 'blur(6px)',
  },
  previewModal: {
    position: 'relative',
    maxWidth: '90vw',
    maxHeight: '90vh',
  },
  previewImage: {
    maxWidth: '90vw',
    maxHeight: '90vh',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.35)',
    boxShadow: '0 24px 48px rgba(0,0,0,0.35)',
    objectFit: 'contain',
    background: '#0f172a',
  },
  previewCloseButton: {
    position: 'absolute',
    top: -14,
    right: -14,
    width: 34,
    height: 34,
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.5)',
    background: 'rgba(15, 23, 42, 0.85)',
    color: '#fff',
    fontSize: 24,
    lineHeight: 1,
    cursor: 'pointer',
  },
  pill: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
};
