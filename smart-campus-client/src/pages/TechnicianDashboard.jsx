import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTechnicianOverview, updateAssignedTicket } from '../api/technicianApi';
import TicketCommentsPanel from '../components/TicketCommentsPanel';

const STATUS_STYLE = {
  OPEN: { background: '#fee2e2', color: '#991b1b' },
  PENDING: { background: '#fef3c7', color: '#92400e' },
  IN_PROGRESS: { background: '#fef3c7', color: '#92400e' },
  RESOLVED: { background: '#dcfce7', color: '#166534' },
  CLOSED: { background: '#e2e8f0', color: '#334155' },
  REJECTED: { background: '#f3e8ff', color: '#6b21a8' },
};

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

const SLA_BADGE_BASE_STYLE = {
  padding: '2px 8px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.2,
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

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [overview, setOverview] = useState({ technician: null, stats: null, assignedTickets: [] });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDraft, setTicketDraft] = useState({ status: 'OPEN', resolutionNotes: '' });
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await getTechnicianOverview();
      const data = res.data || {};
      setOverview({
        technician: data.technician || null,
        stats: data.stats || { assigned: 0, open: 0, inProgress: 0, resolvedClosed: 0 },
        assignedTickets: Array.isArray(data.assignedTickets) ? data.assignedTickets : [],
      });
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to load technician dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const normalizedTickets = useMemo(() => {
    const isRenderableImageSrc = (value) => (
      typeof value === 'string'
      && (
        value.startsWith('data:image/')
        || value.startsWith('http://')
        || value.startsWith('https://')
        || value.startsWith('blob:')
      )
    );

    return overview.assignedTickets.map((ticket) => {
      const imageDataUrls = Array.isArray(ticket.imageDataUrls) ? ticket.imageDataUrls : [];
      const imageNames = Array.isArray(ticket.imageNames) ? ticket.imageNames : [];
      const imageAttachments = [
        ...imageDataUrls,
        ...imageNames.filter(isRenderableImageSrc),
      ].filter(isRenderableImageSrc);

      return {
        ...ticket,
        status: (ticket.status || 'OPEN').toUpperCase(),
        comments: Array.isArray(ticket.comments) ? ticket.comments : [],
        imageAttachments,
        attachmentNames: imageNames.filter((name) => !isRenderableImageSrc(name)),
      };
    });
  }, [overview.assignedTickets]);

  const selectedTicketFirstResponseSla = selectedTicket
    ? getSlaHealth(selectedTicket.timeToFirstResponseMinutes, 'firstResponse')
    : null;
  const selectedTicketResolutionSla = selectedTicket
    ? getSlaHealth(selectedTicket.timeToResolutionMinutes, 'resolution')
    : null;

  const openTicket = (ticket) => {
    setSelectedTicket(ticket);
    setTicketDraft({
      status: ticket.status || 'OPEN',
      resolutionNotes: ticket.resolutionNotes || '',
    });
  };

  const getAllowedStatusOptions = (currentStatus) => {
    const normalized = (currentStatus || 'OPEN').trim().toUpperCase();

    if (normalized === 'OPEN' || normalized === 'PENDING') {
      return ['OPEN', 'IN_PROGRESS'];
    }

    if (normalized === 'IN_PROGRESS') {
      return ['IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    }

    if (normalized === 'RESOLVED') {
      return ['RESOLVED', 'CLOSED'];
    }

    if (normalized === 'CLOSED') {
      return ['CLOSED'];
    }

    return ['REJECTED'];
  };

  const closeTicket = () => setSelectedTicket(null);

  const handleTicketCommentsChange = (nextComments) => {
    if (!selectedTicket) {
      return;
    }

    setSelectedTicket((current) => (current ? { ...current, comments: nextComments } : current));
    setOverview((prev) => ({
      ...prev,
      assignedTickets: prev.assignedTickets.map((ticket) => (
        ticket.id === selectedTicket.id
          ? { ...ticket, comments: nextComments }
          : ticket
      )),
    }));
  };

  const saveTicket = async () => {
    if (!selectedTicket) return;

    const nextStatus = ticketDraft.status;
    const nextNotes = ticketDraft.resolutionNotes.trim();
    const existingNotes = (selectedTicket.resolutionNotes || '').trim();
    const effectiveNotes = nextNotes || existingNotes;

    if (nextStatus === 'RESOLVED' && !nextNotes) {
      showToast('Resolution notes are required before marking a ticket as resolved', 'error');
      return;
    }

    if (nextStatus === 'CLOSED' && selectedTicket.status !== 'CLOSED' && !effectiveNotes) {
      showToast('Resolution notes are required before closing a ticket', 'error');
      return;
    }

    try {
      const res = await updateAssignedTicket(selectedTicket.id, {
        status: ticketDraft.status,
        resolutionNotes: ticketDraft.resolutionNotes,
      });

      const updated = res.data;
      setOverview((prev) => ({
        ...prev,
        assignedTickets: prev.assignedTickets.map((ticket) => (
          ticket.id === selectedTicket.id
            ? {
              ...ticket,
              status: updated.status || ticketDraft.status,
              resolutionNotes: updated.resolutionNotes || '',
              createdAt: updated.createdAt || ticket.createdAt || null,
              firstResponseAt: updated.firstResponseAt || ticket.firstResponseAt || null,
              resolvedAt: updated.resolvedAt || ticket.resolvedAt || null,
              timeToFirstResponseMinutes: Number.isFinite(updated.timeToFirstResponseMinutes)
                ? updated.timeToFirstResponseMinutes
                : ticket.timeToFirstResponseMinutes,
              timeToResolutionMinutes: Number.isFinite(updated.timeToResolutionMinutes)
                ? updated.timeToResolutionMinutes
                : ticket.timeToResolutionMinutes,
              comments: Array.isArray(updated.comments) ? updated.comments : ticket.comments,
            }
            : ticket
        )),
      }));

      setSelectedTicket((prev) => prev
        ? {
          ...prev,
          status: updated.status || ticketDraft.status,
          resolutionNotes: updated.resolutionNotes || '',
          createdAt: updated.createdAt || prev.createdAt || null,
          firstResponseAt: updated.firstResponseAt || prev.firstResponseAt || null,
          resolvedAt: updated.resolvedAt || prev.resolvedAt || null,
          timeToFirstResponseMinutes: Number.isFinite(updated.timeToFirstResponseMinutes)
            ? updated.timeToFirstResponseMinutes
            : prev.timeToFirstResponseMinutes,
          timeToResolutionMinutes: Number.isFinite(updated.timeToResolutionMinutes)
            ? updated.timeToResolutionMinutes
            : prev.timeToResolutionMinutes,
          comments: Array.isArray(updated.comments) ? updated.comments : prev.comments,
        }
        : prev);
      showToast('Ticket updated', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update ticket', 'error');
    }
  };

  return (
    <div style={s.layout}>
      {toast && (
        <div style={{ ...s.toast, background: toast.type === 'success' ? '#10b981' : '#ef4444' }}>
          {toast.msg}
        </div>
      )}

      {previewImageUrl && (
        <div style={s.previewOverlay} onClick={() => setPreviewImageUrl('')}>
          <div style={s.previewModal} onClick={(event) => event.stopPropagation()}>
            <button type="button" style={s.previewCloseButton} onClick={() => setPreviewImageUrl('')} aria-label="Close image preview">×</button>
            <img src={previewImageUrl} alt="Ticket evidence" style={s.previewImage} />
          </div>
        </div>
      )}

      {selectedTicket && (
        <div style={s.modalOverlay}>
          <div style={s.ticketModalCard}>
            <div style={s.ticketModalHeader}>
              <div>
                <h3 style={s.ticketModalTitle}>Assigned Ticket - {selectedTicket.ticketId}</h3>
                <p style={s.ticketModalSub}>Update progress and add resolution notes.</p>
              </div>
              <button style={s.ticketModalCloseBtn} onClick={closeTicket}>x</button>
            </div>

            <div style={s.ticketModalBody}>
              <div style={s.ticketInfoGrid}>
                <div style={s.ticketInfoItem}><span style={s.ticketInfoLabel}>Location</span><span>{selectedTicket.location || '-'}</span></div>
                <div style={s.ticketInfoItem}><span style={s.ticketInfoLabel}>Category</span><span>{selectedTicket.category || '-'}</span></div>
                <div style={s.ticketInfoItem}><span style={s.ticketInfoLabel}>Priority</span><span>{selectedTicket.priority || '-'}</span></div>
                <div style={s.ticketInfoItem}><span style={s.ticketInfoLabel}>Reporter</span><span>{selectedTicket.reporterName || '-'}</span></div>
                <div style={s.ticketInfoItem}><span style={s.ticketInfoLabel}>Reporter Email</span><span>{selectedTicket.reporterEmail || '-'}</span></div>
                <div style={s.ticketInfoItem}><span style={s.ticketInfoLabel}>Contact</span><span>{selectedTicket.preferredContact || '-'}</span></div>
              </div>

              <div style={s.ticketSection}>
                <div style={s.ticketSectionTitle}>Description</div>
                <p style={s.ticketDescription}>{selectedTicket.description || 'No description provided'}</p>
              </div>

              <div style={s.ticketSection}>
                <div style={s.ticketSectionTitle}>Service-Level Timer</div>
                <div style={s.ticketInfoGrid}>
                  <div style={s.ticketInfoItem}><span style={s.ticketInfoLabel}>Submitted</span><span>{formatDateTime(selectedTicket.createdAt)}</span></div>
                  <div style={s.ticketInfoItem}><span style={s.ticketInfoLabel}>First Response At</span><span>{formatDateTime(selectedTicket.firstResponseAt)}</span></div>
                  <div style={s.ticketInfoItem}><span style={s.ticketInfoLabel}>Resolved At</span><span>{formatDateTime(selectedTicket.resolvedAt)}</span></div>
                  <div style={s.ticketInfoItem}>
                    <span style={s.ticketInfoLabel}>Time To First Response</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {formatSlaDuration(selectedTicket.timeToFirstResponseMinutes)}
                      <span style={{ ...SLA_BADGE_BASE_STYLE, ...(selectedTicketFirstResponseSla?.style || SLA_TONE_STYLE.pending) }}>
                        {selectedTicketFirstResponseSla?.label || 'Pending'}
                      </span>
                    </span>
                  </div>
                  <div style={s.ticketInfoItem}>
                    <span style={s.ticketInfoLabel}>Time To Resolution</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {formatSlaDuration(selectedTicket.timeToResolutionMinutes)}
                      <span style={{ ...SLA_BADGE_BASE_STYLE, ...(selectedTicketResolutionSla?.style || SLA_TONE_STYLE.pending) }}>
                        {selectedTicketResolutionSla?.label || 'Pending'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div style={s.ticketSection}>
                <div style={s.ticketSectionTitle}>Evidence</div>
                {selectedTicket.imageAttachments?.length ? (
                  <div style={s.evidenceGrid}>
                    {selectedTicket.imageAttachments.slice(0, 3).map((src, idx) => (
                      <img key={`${selectedTicket.id}-img-${idx}`} src={src} alt={`Evidence ${idx + 1}`} style={s.evidenceImage} onClick={() => setPreviewImageUrl(src)} />
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
                    {getAllowedStatusOptions(selectedTicket.status).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label style={s.ticketField}>
                <span style={s.ticketFieldLabel}>Resolution Notes / Comments</span>
                <textarea
                  style={s.ticketTextarea}
                  value={ticketDraft.resolutionNotes}
                  placeholder={ticketDraft.status === 'RESOLVED' || ticketDraft.status === 'CLOSED'
                    ? 'Add the fix, steps taken, or confirmation notes'
                    : 'Add progress updates or technician comments'}
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
              <button style={s.cancelBtn} onClick={closeTicket}>Close</button>
              <button style={s.saveTicketBtn} onClick={saveTicket}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <div style={s.header}>
        <div>
          <h1 style={s.headerTitle}>Technician Dashboard</h1>
          <p style={s.headerSub}>Assigned incidents and resolution workflow</p>
        </div>
      </div>

      <div style={s.contentArea}>
        <div style={s.statsGrid}>
          {[
            { label: 'Assigned', value: overview.stats?.assigned || 0, color: '#2563eb' },
            { label: 'Open / Pending', value: overview.stats?.open || 0, color: '#ef4444' },
            { label: 'In Progress', value: overview.stats?.inProgress || 0, color: '#f59e0b' },
            { label: 'Resolved / Closed', value: overview.stats?.resolvedClosed || 0, color: '#10b981' },
          ].map((stat) => (
            <div key={stat.label} style={s.statCard}>
              <div style={{ ...s.statNum, color: stat.color }}>{stat.value}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={s.tableWrap}>
          {loading ? (
            <div style={s.loadingBox}>Loading assigned tickets...</div>
          ) : normalizedTickets.length === 0 ? (
            <div style={s.emptyBox}>No tickets are currently assigned to you.</div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>Ticket ID</th>
                  <th style={s.th}>Location</th>
                  <th style={s.th}>Category</th>
                  <th style={s.th}>Priority</th>
                  <th style={s.th}>Status</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {normalizedTickets.map((ticket) => (
                  <tr key={ticket.id} style={s.tr}>
                    <td style={s.td}><strong>{ticket.ticketId || ticket.id}</strong></td>
                    <td style={s.td}>{ticket.location || '-'}</td>
                    <td style={s.td}>{ticket.category || '-'}</td>
                    <td style={s.td}>{ticket.priority || '-'}</td>
                    <td style={s.td}>
                      <span style={{ ...s.pill, ...(STATUS_STYLE[ticket.status] || STATUS_STYLE.OPEN) }}>{ticket.status}</span>
                    </td>
                    <td style={s.td}>
                      <button style={s.viewDetailsBtn} onClick={() => openTicket(ticket)}>Open Ticket</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  layout: { minHeight: '100vh', background: '#f8fafc' },
  header: { background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' },
  headerSub: { margin: '4px 0 0', fontSize: 13, color: '#64748b' },
  techBadge: { background: '#dbeafe', color: '#1e40af', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  logoutBtn: { padding: '7px 16px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  contentArea: { paddingBottom: '3rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, padding: '1.5rem 2rem 0' },
  statCard: { background: '#fff', borderRadius: 12, padding: '1.2rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' },
  statNum: { fontSize: 28, fontWeight: 700 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 500 },
  tableWrap: { margin: '1rem 2rem 0', background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid #f1f5f9' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8fafc' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 16px', verticalAlign: 'middle' },
  pill: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  viewDetailsBtn: { padding: '7px 14px', borderRadius: 8, border: '1px solid #c7d2fe', background: '#eef2ff', color: '#3730a3', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  loadingBox: { textAlign: 'center', padding: '3rem', color: '#64748b' },
  emptyBox: { textAlign: 'center', padding: '3rem', color: '#64748b' },
  toast: { position: 'fixed', top: 24, right: 24, color: '#fff', padding: '14px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 9999 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  ticketModalCard: { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 980, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
  ticketModalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '16px 20px', borderBottom: '1px solid #e2e8f0' },
  ticketModalTitle: { margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' },
  ticketModalSub: { margin: '4px 0 0', fontSize: 13, color: '#64748b' },
  ticketModalCloseBtn: { border: '1px solid #e2e8f0', background: '#f8fafc', color: '#334155', width: 34, height: 34, borderRadius: 999, cursor: 'pointer', fontSize: 14, fontWeight: 700 },
  ticketModalBody: { padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 },
  ticketInfoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 },
  ticketInfoItem: { display: 'flex', flexDirection: 'column', gap: 4, border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#334155' },
  ticketInfoLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: '#64748b', fontWeight: 600 },
  ticketSection: { border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px' },
  ticketSectionTitle: { fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 },
  ticketDescription: { margin: 0, fontSize: 14, lineHeight: 1.55, color: '#334155' },
  evidenceGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 },
  evidenceImage: { width: '100%', height: 150, objectFit: 'cover', borderRadius: 10, border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'zoom-in' },
  attachmentNamesWrap: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  imageNameChip: { padding: '6px 10px', borderRadius: 999, border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 12, color: '#475569' },
  noEvidenceBox: { background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 8, padding: '12px', fontSize: 13, color: '#64748b' },
  ticketFormGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 },
  ticketField: { display: 'flex', flexDirection: 'column', gap: 8 },
  ticketFieldLabel: { fontSize: 12, color: '#475569', fontWeight: 600 },
  filterSelect: { padding: '9px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff', cursor: 'pointer' },
  ticketTextarea: { minHeight: 100, resize: 'vertical', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#1e293b', outline: 'none' },
  ticketModalFooter: { padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 10 },
  cancelBtn: { padding: '12px 24px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  saveTicketBtn: { padding: '12px 24px', borderRadius: 10, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  previewOverlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  previewModal: { position: 'relative', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  previewCloseButton: { position: 'absolute', top: -12, right: -12, width: 34, height: 34, borderRadius: '50%', border: 'none', background: '#fff', color: '#0f172a', fontSize: 24, lineHeight: 1, cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.25)' },
  previewImage: { maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain', boxShadow: '0 12px 32px rgba(0,0,0,0.4)' },
};
