import { Fragment, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getIncidentTicket, getUserDashboardOverview, submitIncidentTicket, updateIncidentTicket } from '../api/userDashboardApi';
import IncidentModal from '../components/IncidentModal';
import TicketCommentsPanel from '../components/TicketCommentsPanel';
import BookingList from '../components/Bookings/BookingList';

const HIDDEN_TICKET_STORAGE_KEY = 'incidentTicketHiddenIds';

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [expandedTicketId, setExpandedTicketId] = useState('');
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

  const getCachedIncidentImages = () => {
    try {
      return JSON.parse(localStorage.getItem('incidentTicketImageCache') || '[]');
    } catch {
      return [];
    }
  };

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

  const mergeCachedImages = (tickets) => {
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
  };

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
  };

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

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab !== 'tickets' && ticketNotice) {
      setTicketNotice(null);
    }
  }, [activeTab, ticketNotice]);

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

  const renderDashboardTab = () => (
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
  );

  const renderTicketsTab = () => (
    <div style={s.tableWrap}>
      <div style={s.sectionHeader}>My Incident Reports</div>
      {ticketNotice && (
        <div style={ticketNotice.type === 'error' ? s.ticketErrorBanner : s.ticketSuccessBanner}>
          {ticketNotice.message}
        </div>
      )}
      <table style={s.table}>
        <thead>
          <tr style={s.thead}>
            <th style={s.th}>Ticket ID</th>
            <th style={s.th}>Location</th>
            <th style={s.th}>Category</th>
            <th style={s.th}>Pictures</th>
            <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {visibleTicketsForMyTickets.length === 0 && (
            <tr style={s.tr}>
              <td style={s.emptyTd} colSpan={6}>No incident reports found in database.</td>
            </tr>
          )}
          {visibleTicketsForMyTickets.map((ticket) => {
            const ticketImages = (ticket.imageDataUrls || []).slice(0, 3);
            const hasImageNamesOnly = ticketImages.length === 0 && (ticket.imageNames || []).length > 0;
            const normalizedStatus = (ticket.status || '').trim().toUpperCase();
            const canHide = ['RESOLVED', 'CLOSED', 'REJECTED'].includes(normalizedStatus);
            const ticketKey = ticket.ticketId || ticket.id;
            const isExpanded = expandedTicketId === ticketKey;

            return (
              <Fragment key={ticket.id}>
                <tr style={s.tr}>
                  <td style={s.td}>
                    <div style={{ fontWeight: 600 }}>{ticket.ticketId || ticket.id}</div>
                  </td>
                  <td style={s.td}>{ticket.location || '-'}</td>
                  <td style={s.td}>{ticket.category || '-'}</td>
                  <td style={s.td}>
                    <div style={s.ticketImages}>
                      {ticketImages.length > 0 ? (
                        ticketImages.map((imageUrl, index) => (
                          <img
                            key={`${ticket.id}-${index}`}
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
                  <td style={s.td}>
                    <span style={{ ...s.pill, ...getStatusPillStyle(ticket.status) }}>
                      {ticket.status || 'Open'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      {normalizedStatus === 'OPEN' && (
                        <button
                          type="button"
                          style={s.actionBtnSecondary}
                          onClick={() => openEditIncidentModal(ticket)}
                        >
                          Edit ticket
                        </button>
                      )}
                      <button
                        type="button"
                        style={s.actionBtn}
                        onClick={() => setExpandedTicketId(isExpanded ? '' : ticketKey)}
                      >
                        {isExpanded ? 'Hide comments' : 'View comments'}
                      </button>

                      {canHide ? (
                        <button
                          type="button"
                          style={{
                            padding: '7px 12px',
                            borderRadius: 8,
                            border: '1px solid #cbd5e1',
                            background: '#fff',
                            color: '#334155',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          onClick={() => hideTicketFromView(ticket.ticketId || ticket.id)}
                        >
                          Remove from view
                        </button>
                      ) : (
                        <span style={s.mutedText}>Visible to staff</span>
                      )}
                    </div>
                  </td>
                </tr>

                {isExpanded && (
                  <tr style={s.tr}>
                    <td style={s.td} colSpan={6}>
                      <TicketCommentsPanel
                        ticket={ticket}
                        currentUser={userDetails}
                        onCommentsChange={(nextComments) => {
                          setOverview((prev) => ({
                            ...prev,
                            activeTickets: prev.activeTickets.map((item) => (
                              (item.ticketId || item.id) === ticketKey
                                ? { ...item, comments: nextComments }
                                : item
                            )),
                            incidentTickets: prev.incidentTickets.map((item) => (
                              (item.ticketId || item.id) === ticketKey
                                ? { ...item, comments: nextComments }
                                : item
                            )),
                          }));
                          setTicketNotice(null);
                        }}
                        onError={(message) => setTicketNotice({ type: 'error', message: message || 'Failed to update comments' })}
                        onSuccess={(message) => setTicketNotice({ type: 'success', message: message || 'Comment updated' })}
                      />
                    </td>
                  </tr>
                )}
                </Fragment>
          )})}
        </tbody>
      </table>
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
                  <div style={s.emptyState}>Resource catalogue content will appear here.</div>
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
    border: '1px solid #bfdbfe',
    background: '#eff6ff',
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  actionBtnSecondary: {
    padding: '7px 12px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    background: '#fff',
    color: '#334155',
    fontSize: 12,
    fontWeight: 600,
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
