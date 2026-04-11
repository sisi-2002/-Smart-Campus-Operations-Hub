import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import bookingApi from '../../api/bookingApi';

/* ─── Stylesheet ─────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Epilogue:wght@400;500;600&display=swap');

:root {
  --bg:       #f4f1eb;
  --surface:  #ffffff;
  --border:   #e4dfd4;
  --text:     #1c1917;
  --muted:    #78716c;
  --accent:   #0d7a6b;
  --aclt:     #0d7a6b18;
  --danger:   #be123c;
  --danlt:    #be123c10;
  --warn:     #d97706;
  --warnlt:   #d9770612;
  --radius:   14px;
  --shadow:   0 2px 16px #1c191710;
  --shadow-lg:0 8px 40px #1c191720;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.bl-wrap {
  font-family: 'Epilogue', sans-serif;
  color: var(--text);
  min-height: 300px;
}

.bl-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 14px; flex-wrap: wrap;
  margin-bottom: 24px;
}
.bl-title {
  font-family: 'Playfair Display', serif;
  font-size: 22px; font-weight: 700; color: var(--text); letter-spacing: -.01em;
}
.bl-count-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 20px;
  background: var(--aclt); border: 1px solid #0d7a6b22;
  color: var(--accent); font-size: 11px; font-weight: 700;
  letter-spacing: .05em; margin-left: 8px; vertical-align: middle;
}

.bl-filter-wrap { position: relative; }
.bl-filter-wrap svg {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  pointer-events: none; color: var(--muted);
}
.bl-select {
  padding: 9px 36px 9px 14px;
  border: 1px solid var(--border); border-radius: 9px;
  font-family: 'Epilogue', sans-serif; font-size: 13px;
  color: var(--text); background: var(--surface); outline: none;
  appearance: none; -webkit-appearance: none;
  cursor: pointer; transition: border-color .18s, box-shadow .18s;
  min-width: 160px;
}
.bl-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--aclt); }

.bl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 18px;
}

.bl-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: box-shadow .22s, transform .18s;
  display: flex; flex-direction: column;
  animation: blFadeUp .35s ease both;
}
.bl-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
@keyframes blFadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

.bl-card-head {
  padding: 15px 18px 12px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;
  background: #faf9f7;
}
.bl-res-name {
  font-family: 'Playfair Display', serif;
  font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 3px;
}
.bl-res-type {
  font-size: 10px; font-weight: 700; letter-spacing: .12em;
  text-transform: uppercase; color: var(--accent);
}

.bl-badge {
  padding: 3px 11px; border-radius: 20px;
  font-size: 10px; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; white-space: nowrap; flex-shrink: 0;
}
.bl-badge-PENDING   { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
.bl-badge-APPROVED  { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
.bl-badge-REJECTED  { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
.bl-badge-CANCELLED { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

.bl-card-body { padding: 14px 18px; flex: 1; display: flex; flex-direction: column; gap: 9px; }

.bl-row {
  display: flex; gap: 8px; font-size: 13px;
  align-items: flex-start; flex-wrap: wrap;
}
.bl-row-key {
  font-weight: 600; color: var(--muted); flex-shrink: 0;
  min-width: 14px;
}
.bl-row-val { color: var(--text); line-height: 1.5; }

.bl-reason-box {
  padding: 9px 12px; border-radius: 8px; font-size: 12px; line-height: 1.5;
  display: flex; gap: 7px; align-items: flex-start;
}
.bl-reason-box.reject { background: var(--danlt); border: 1px solid #be123c22; color: var(--danger); }
.bl-reason-box.cancel { background: var(--warnlt); border: 1px solid #d9770622; color: var(--warn); }

.bl-card-foot {
  padding: 12px 18px;
  border-top: 1px solid var(--border);
  background: #faf9f7;
  display: flex; gap: 7px; flex-wrap: wrap; justify-content: flex-end;
}

.bl-btn {
  padding: 7px 14px; border-radius: 8px; border: none;
  font-family: 'Epilogue', sans-serif; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: opacity .18s, transform .12s;
  display: inline-flex; align-items: center; gap: 5px;
}
.bl-btn:hover:not(:disabled){ opacity:.85; transform:translateY(-1px); }
.bl-btn:disabled{ opacity:.4; cursor:not-allowed; transform:none; }
.bl-btn-approve { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
.bl-btn-reject  { background: var(--danlt); color: var(--danger); border: 1px solid #be123c28; }
.bl-btn-cancel  { background: var(--warnlt); color: var(--warn); border: 1px solid #d9770628; }
.bl-btn-view    { background: var(--aclt); color: var(--accent); border: 1px solid #0d7a6b28; }

.bl-spinner {
  width: 14px; height: 14px;
  border: 2px solid #0d7a6b44; border-top-color: var(--accent);
  border-radius: 50%; animation: blSpin .65s linear infinite; flex-shrink: 0;
}
@keyframes blSpin { to{transform:rotate(360deg)} }

.bl-loading {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 18px;
}
.bl-skel-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 20px;
  display: flex; flex-direction: column; gap: 12px;
}
.bl-skel {
  background: linear-gradient(90deg,#ebe8e0 25%,#f4f1eb 50%,#ebe8e0 75%);
  background-size: 200% 100%;
  animation: blShimmer 1.4s infinite; border-radius: 6px;
}
@keyframes blShimmer { to{background-position:-200% 0} }

.bl-error {
  padding: 18px 20px; border-radius: 12px;
  background: var(--danlt); border: 1px solid #be123c28;
  color: var(--danger); font-size: 13px; font-weight: 500;
  display: flex; align-items: center; gap: 9px;
}
.bl-empty {
  text-align: center; padding: 60px 40px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius);
}
.bl-empty-icon { font-size: 40px; margin-bottom: 12px; opacity: .4; }
.bl-empty-title { font-family:'Playfair Display',serif; font-size:18px; color:var(--text); margin-bottom:6px; }
.bl-empty-sub   { font-size:13px; color:var(--muted); }

.bl-overlay {
  position: fixed; inset: 0;
  background: rgba(28,25,23,.55);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  animation: blFadeIn .2s ease;
}
@keyframes blFadeIn { from{opacity:0} to{opacity:1} }

.bl-modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  max-width: 90%; width: 520px;
  max-height: 85vh; overflow-y: auto;
  box-shadow: var(--shadow-lg);
  animation: blSlideUp .25s cubic-bezier(.16,1,.3,1);
}
@keyframes blSlideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

.bl-modal-head {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  background: #faf9f7;
  position: sticky; top: 0; z-index: 1;
}
.bl-modal-title {
  font-family: 'Playfair Display', serif;
  font-size: 18px; font-weight: 700; color: var(--text);
}
.bl-modal-close {
  width: 30px; height: 30px; border-radius: 8px;
  border: 1px solid var(--border); background: var(--surface);
  color: var(--muted); font-size: 16px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s, color .15s;
}
.bl-modal-close:hover { background: var(--danlt); color: var(--danger); }

.bl-modal-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 18px; }

.bl-detail-section {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 10px; padding: 14px 16px;
}
.bl-detail-section-title {
  font-size: 10px; font-weight: 700; letter-spacing: .12em;
  text-transform: uppercase; color: var(--muted);
  margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--border);
}
.bl-detail-item {
  display: flex; gap: 8px; align-items: flex-start;
  font-size: 13px; margin-bottom: 7px;
}
.bl-detail-item:last-child { margin-bottom: 0; }
.bl-detail-item-key { font-weight: 600; color: var(--muted); min-width: 100px; flex-shrink: 0; }
.bl-detail-item-val { color: var(--text); line-height: 1.5; word-break: break-word; }

.bl-modal-foot {
  padding: 14px 24px 20px;
  border-top: 1px solid var(--border);
  display: flex; justify-content: flex-end;
}

.bl-reject-label {
  font-size: 12px; font-weight: 600; letter-spacing: .07em;
  text-transform: uppercase; color: var(--muted); margin-bottom: 8px; display: block;
}
.bl-reject-textarea {
  width: 100%; padding: 11px 14px;
  border: 1px solid var(--border); border-radius: 9px;
  font-family: 'Epilogue', sans-serif; font-size: 14px; color: var(--text);
  background: var(--bg); outline: none; resize: vertical; min-height: 100px;
  transition: border-color .18s, box-shadow .18s; line-height: 1.6;
}
.bl-reject-textarea:focus { border-color: var(--danger); box-shadow: 0 0 0 3px var(--danlt); }
.bl-modal-actions { display: flex; gap: 9px; justify-content: flex-end; margin-top: 16px; }

.bl-btn-close-modal {
  padding: 9px 20px; border-radius: 9px;
  background: var(--aclt); color: var(--accent);
  border: 1px solid #0d7a6b28;
  font-family: 'Epilogue', sans-serif; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: opacity .18s;
}
.bl-btn-close-modal:hover { opacity: .8; }
.bl-btn-cancel-modal {
  padding: 9px 18px; border-radius: 9px;
  background: var(--bg); color: var(--muted);
  border: 1px solid var(--border);
  font-family: 'Epilogue', sans-serif; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: background .15s;
}
.bl-btn-cancel-modal:hover { background: var(--border); }
.bl-btn-confirm-reject {
  padding: 9px 18px; border-radius: 9px;
  background: var(--danger); color: #fff;
  border: none;
  font-family: 'Epilogue', sans-serif; font-size: 13px; font-weight: 700;
  cursor: pointer; transition: opacity .18s;
}
.bl-btn-confirm-reject:hover { opacity: .88; }

@media(max-width:600px){
  .bl-grid,.bl-loading{ grid-template-columns:1fr; }
  .bl-modal{ width:95%; }
  .bl-modal-head,.bl-modal-body,.bl-modal-foot{ padding-left:16px; padding-right:16px; }
}
`;

const SkeletonCard = () => (
  <div className="bl-skel-card">
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
      <div style={{flex:1}}>
        <div className="bl-skel" style={{height:18,width:'60%',marginBottom:8}} />
        <div className="bl-skel" style={{height:11,width:'30%'}} />
      </div>
      <div className="bl-skel" style={{height:22,width:72,borderRadius:20}} />
    </div>
    <div className="bl-skel" style={{height:12,width:'80%'}} />
    <div className="bl-skel" style={{height:12,width:'65%'}} />
    <div className="bl-skel" style={{height:12,width:'50%'}} />
    <div style={{display:'flex',gap:7,justifyContent:'flex-end',marginTop:4}}>
      <div className="bl-skel" style={{height:32,width:80}} />
      <div className="bl-skel" style={{height:32,width:80}} />
    </div>
  </div>
);

const BookingList = ({ isAdmin = false, statusFilter = null }) => {
  const { user } = useAuth();
  const notificationContext = useNotification();

  const showLocalToast =
    notificationContext?.showToast ||
    ((title, message) => {
      alert(`${title}: ${message}`);
    });

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [qrData, setQrData] = useState('');
  const [qrBookingName, setQrBookingName] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    if (statusFilter) {
      setFilter(statusFilter.toLowerCase());
    } else {
      setFilter('all');
    }
  }, [statusFilter]);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);

      let response;

      if (isAdmin) {
        const params = filter !== 'all' ? { status: filter.toUpperCase() } : {};
        response = await bookingApi.getAllBookings(params);
      } else {
        response = await bookingApi.getMyBookings();
      }

      setBookings(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, filter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleApprove = async (bookingId) => {
    if (!window.confirm('Are you sure you want to approve this booking?')) return;

    setActionLoading(true);
    try {
      const response = await bookingApi.approveBooking(bookingId, true, null);
      console.log('Approve response:', response.data);
      alert('Booking approved successfully!');
      await fetchBookings();
    } catch (err) {
      console.error('Error approving booking:', err);
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Failed to approve booking';
      showLocalToast('Error', errorMsg, 'SYSTEM_ANNOUNCEMENT');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (bookingId) => {
    setCurrentBookingId(bookingId);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      showLocalToast('Warning', 'Please provide a rejection reason.', 'SYSTEM_ANNOUNCEMENT');
      return;
    }

    setActionLoading(true);
    try {
      const response = await bookingApi.approveBooking(currentBookingId, false, rejectionReason);
      console.log('Reject response:', response.data);
      alert('Booking rejected successfully!');
      setShowRejectModal(false);
      setCurrentBookingId(null);
      await fetchBookings();
    } catch (err) {
      console.error('Error rejecting booking:', err);
      const errorMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Failed to reject booking';
      showLocalToast('Error', errorMsg, 'SYSTEM_ANNOUNCEMENT');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    const reason = prompt('Please enter cancellation reason (optional):');
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    setActionLoading(true);
    try {
      await bookingApi.cancelBooking(bookingId, reason || 'Cancelled by user');
      showLocalToast('Success', 'Booking cancelled successfully!', 'SYSTEM_ANNOUNCEMENT');
      await fetchBookings();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      showLocalToast(
        'Error',
        err?.response?.data?.message || 'Failed to cancel booking',
        'SYSTEM_ANNOUNCEMENT'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleShowQr = async (booking) => {
    try {
      const response = await bookingApi.getCheckInQr(booking.id);
      setQrData(response.data?.qrData || booking.checkInQrData || '');
      setQrBookingName(booking.resourceName || 'Booking');
      setShowQrModal(true);
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Failed to load QR';
      alert(message);
    }
  };

  const getStatusBadgeStyle = (status) => {
    const styles = {
      PENDING:   { background:'rgba(245,158,11,0.2)',  color:'#fbbf24', border:'1px solid rgba(245,158,11,0.3)' },
      APPROVED:  { background:'rgba(16,185,129,0.2)',  color:'#34d399', border:'1px solid rgba(16,185,129,0.3)' },
      REJECTED:  { background:'rgba(239,68,68,0.2)',   color:'#f87171', border:'1px solid rgba(239,68,68,0.3)' },
      CANCELLED: { background:'rgba(107,114,128,0.2)', color:'#9ca3af', border:'1px solid rgba(107,114,128,0.3)' },
    };

    return styles[status] || styles.PENDING;
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  return (
    <>
      <style>{CSS}</style>
      <div className="bl-wrap">
        <div className="bl-header">
          <div>
            <span className="bl-title">{isAdmin ? 'All Bookings' : 'My Bookings'}</span>
            {!loading && <span className="bl-count-chip">{bookings.length}</span>}
          </div>

          {isAdmin && (
            <div className="bl-filter-wrap">
              <select
                className="bl-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <svg width="11" height="7" viewBox="0 0 12 8" fill="none">
                <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          )}
        </div>

        {loading && (
          <div className="bl-loading">
            {[1, 2, 3].map((k) => <SkeletonCard key={k} />)}
          </div>
        )}

        {!loading && error && (
          <div className="bl-error">
            <span style={{fontSize:16,flexShrink:0}}>⚠</span>
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="bl-empty">
            <div className="bl-empty-icon">📋</div>
            <div className="bl-empty-title">No bookings found</div>
            <div className="bl-empty-sub">
              {filter !== 'all'
                ? `No ${filter} bookings to display.`
                : isAdmin
                  ? 'There are no bookings in the system yet.'
                  : "You haven't made any bookings yet."}
            </div>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="bl-grid">
            {bookings.map((booking, i) => (
              <div
                key={booking.id}
                className="bl-card"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="bl-card-head">
                  <div>
                    <div className="bl-res-name">{booking.resourceName}</div>
                    <div className="bl-res-type">{booking.resourceType}</div>
                  </div>
                  <span className={`bl-badge bl-badge-${booking.status}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="bl-card-body">
                  <div className="bl-row">
                    <span className="bl-row-key">📅</span>
                    <span className="bl-row-val">
                      {formatDate(booking.startTime)} – {formatDate(booking.endTime)}
                    </span>
                  </div>

                  <div className="bl-row">
                    <span className="bl-row-key">📝</span>
                    <span className="bl-row-val">{booking.purpose}</span>
                  </div>

                  {booking.expectedAttendees > 0 && (
                    <div className="bl-row">
                      <span className="bl-row-key">👥</span>
                      <span className="bl-row-val">{booking.expectedAttendees} people</span>
                    </div>
                  )}

                  {!isAdmin && booking.userName && (
                    <div className="bl-row">
                      <span className="bl-row-key">👤</span>
                      <span className="bl-row-val">{booking.userName}</span>
                    </div>
                  )}

                  {isAdmin && booking.userName && (
                    <div className="bl-row">
                      <span className="bl-row-key">👤</span>
                      <span className="bl-row-val">{booking.userName} ({booking.userEmail})</span>
                    </div>
                  )}

                  {booking.specialRequests && (
                    <div className="bl-row">
                      <span className="bl-row-key">💬</span>
                      <span className="bl-row-val">{booking.specialRequests}</span>
                    </div>
                  )}

                  {booking.rejectionReason && (
                    <div className="bl-reason-box reject">
                      <span style={{flexShrink:0}}>❌</span>
                      <span><strong>Rejection:</strong> {booking.rejectionReason}</span>
                    </div>
                  )}

                  {booking.cancellationReason && (
                    <div className="bl-reason-box cancel">
                      <span style={{flexShrink:0}}>⚠️</span>
                      <span><strong>Cancelled:</strong> {booking.cancellationReason}</span>
                    </div>
                  )}
                </div>

                <div className="bl-card-foot">
                  {isAdmin && booking.status === 'PENDING' && (
                    <>
                      <button
                        className="bl-btn bl-btn-approve"
                        onClick={() => handleApprove(booking.id)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <span className="bl-spinner" /> : '✓'} Approve
                      </button>
                      <button
                        className="bl-btn bl-btn-reject"
                        onClick={() => handleRejectClick(booking.id)}
                        disabled={actionLoading}
                      >
                        ✗ Reject
                      </button>
                    </>
                  )}

                  {booking.status === 'APPROVED' && booking.canCancel && (
                    <button
                      className="bl-btn bl-btn-cancel"
                      onClick={() => handleCancel(booking.id)}
                      disabled={actionLoading}
                    >
                      Cancel Booking
                    </button>
                  )}

                  {booking.status === 'APPROVED' && (
                    <button
                      className="bl-btn bl-btn-view"
                      onClick={() => handleShowQr(booking)}
                    >
                      QR Check-in
                    </button>
                  )}

                  {!isAdmin && booking.status === 'PENDING' && booking.canCancel && (
                    <button
                      className="bl-btn bl-btn-cancel"
                      onClick={() => handleCancel(booking.id)}
                      disabled={actionLoading}
                    >
                      Cancel Request
                    </button>
                  )}

                  <button
                    className="bl-btn bl-btn-view"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedBooking && (
          <div className="bl-overlay" onClick={() => setSelectedBooking(null)}>
            <div className="bl-modal" onClick={(e) => e.stopPropagation()}>
              <div className="bl-modal-head">
                <span className="bl-modal-title">Booking Details</span>
                <button className="bl-modal-close" onClick={() => setSelectedBooking(null)}>×</button>
              </div>
              <div className="bl-modal-body">
                <div className="bl-detail-section">
                  <div className="bl-detail-section-title">📋 Booking Information</div>
                  {[
                    ['ID', selectedBooking.id],
                    ['Status', <span className={`bl-badge bl-badge-${selectedBooking.status}`}>{selectedBooking.status}</span>],
                    ['Resource', selectedBooking.resourceName],
                    ['Type', selectedBooking.resourceType],
                    ['Start', formatDate(selectedBooking.startTime)],
                    ['End', formatDate(selectedBooking.endTime)],
                    ['Purpose', selectedBooking.purpose],
                    selectedBooking.expectedAttendees > 0 && ['Attendees', selectedBooking.expectedAttendees],
                    selectedBooking.specialRequests && ['Special Requests', selectedBooking.specialRequests],
                    selectedBooking.rejectionReason && ['Rejection Reason', selectedBooking.rejectionReason],
                    selectedBooking.cancellationReason && ['Cancellation Reason', selectedBooking.cancellationReason],
                  ].filter(Boolean).map(([k, v]) => (
                    <div key={k} className="bl-detail-item">
                      <span className="bl-detail-item-key">{k}</span>
                      <span className="bl-detail-item-val">{v}</span>
                    </div>
                  ))}
                </div>

                {isAdmin && (
                  <div className="bl-detail-section">
                    <div className="bl-detail-section-title">👤 User Information</div>
                    {[
                      ['Name', selectedBooking.userName],
                      ['Email', selectedBooking.userEmail],
                      ['User ID', selectedBooking.userId],
                    ].map(([k, v]) => (
                      <div key={k} className="bl-detail-item">
                        <span className="bl-detail-item-key">{k}</span>
                        <span className="bl-detail-item-val">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bl-modal-foot">
                <button className="bl-btn-close-modal" onClick={() => setSelectedBooking(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showRejectModal && (
          <div className="bl-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="bl-modal" onClick={(e) => e.stopPropagation()}>
              <div className="bl-modal-head">
                <span className="bl-modal-title">Reject Booking</span>
                <button className="bl-modal-close" onClick={() => setShowRejectModal(false)}>×</button>
              </div>
              <div className="bl-modal-body">
                <div className="bl-reason-box reject" style={{marginBottom:16}}>
                  <span style={{flexShrink:0}}>⚠</span>
                  <span>Please provide a clear reason. This will be sent to the user.</span>
                </div>
                <label className="bl-reject-label">
                  Rejection Reason <span style={{color:'var(--danger)'}}>*</span>
                </label>
                <textarea
                  className="bl-reject-textarea"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Resource unavailable for maintenance, conflicting event scheduled…"
                  rows="4"
                />
                <div className="bl-modal-actions">
                  <button className="bl-btn-cancel-modal" onClick={() => setShowRejectModal(false)}>
                    Cancel
                  </button>
                  <button className="bl-btn-confirm-reject" onClick={handleConfirmReject}>
                    {actionLoading ? 'Rejecting…' : 'Confirm Reject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showQrModal && (
          <div className="bl-overlay" onClick={() => setShowQrModal(false)}>
            <div className="bl-modal" onClick={(e) => e.stopPropagation()}>
              <div className="bl-modal-head">
                <span className="bl-modal-title">Check-in QR</span>
                <button className="bl-modal-close" onClick={() => setShowQrModal(false)}>×</button>
              </div>
              <div className="bl-modal-body" style={{alignItems:'center'}}>
                <div className="bl-detail-section" style={{width:'100%', textAlign:'center'}}>
                  <div className="bl-detail-section-title">{qrBookingName}</div>
                  {qrData ? (
                    <>
                      <QRCodeCanvas value={qrData} size={220} includeMargin={true} />
                      <div style={{marginTop:12, fontSize:12, color:'#78716c', wordBreak:'break-all'}}>{qrData}</div>
                    </>
                  ) : (
                    <div style={{fontSize:13, color:'#be123c'}}>QR payload not available</div>
                  )}
                </div>
              </div>
              <div className="bl-modal-foot">
                <button className="bl-btn-close-modal" onClick={() => setShowQrModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BookingList;