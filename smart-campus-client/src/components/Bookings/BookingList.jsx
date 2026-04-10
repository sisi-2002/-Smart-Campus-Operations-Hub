import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import bookingApi from '../../api/bookingApi';

const BookingList = ({ isAdmin = false }) => {
  const { user } = useAuth();
  const { showLocalToast } = useNotification();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

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
      setError('Failed to load bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, filter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

<<<<<<< Updated upstream
  const handleApprove = async (bookingId) => {
    if (!window.confirm('Are you sure you want to approve this booking?')) {
      return;
    }
    
=======
  const handleApproveClick = (bookingId) => {
    setCurrentBookingId(bookingId);
    setShowApproveModal(true);
  };

  const handleConfirmApprove = async () => {
>>>>>>> Stashed changes
    setActionLoading(true);
    try {
      console.log('Approving booking:', currentBookingId);
      const response = await bookingApi.approveBooking(currentBookingId, true, null);
      console.log('Approve response:', response.data);
<<<<<<< Updated upstream
      
      alert('Booking approved successfully!');
=======
      showLocalToast('Success', 'Booking approved successfully!', 'SYSTEM_ANNOUNCEMENT');
      setShowApproveModal(false);
>>>>>>> Stashed changes
      await fetchBookings();
    } catch (err) {
      console.error('Error approving booking:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to approve booking';
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
      console.log('Rejecting booking:', currentBookingId, 'Reason:', rejectionReason);
      const response = await bookingApi.approveBooking(currentBookingId, false, rejectionReason);
      console.log('Reject response:', response.data);
<<<<<<< Updated upstream
      
      alert('Booking rejected successfully!');
=======
      showLocalToast('Success', 'Booking rejected successfully!', 'SYSTEM_ANNOUNCEMENT');
>>>>>>> Stashed changes
      setShowRejectModal(false);
      await fetchBookings();
    } catch (err) {
      console.error('Error rejecting booking:', err);
      showLocalToast('Error', 'Failed to reject booking.', 'SYSTEM_ANNOUNCEMENT');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelClick = (bookingId) => {
    setCurrentBookingId(bookingId);
    setCancellationReason('');
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    setActionLoading(true);
    try {
      await bookingApi.cancelBooking(currentBookingId, cancellationReason || 'Cancelled by user');
      showLocalToast('Success', 'Booking cancelled successfully!', 'SYSTEM_ANNOUNCEMENT');
      setShowCancelModal(false);
      await fetchBookings();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      showLocalToast('Error', err.response?.data?.message || 'Failed to cancel booking', 'SYSTEM_ANNOUNCEMENT');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    const styles = {
      PENDING: { background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' },
      APPROVED: { background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' },
      REJECTED: { background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' },
      CANCELLED: { background: 'rgba(107,114,128,0.2)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.3)' }
    };
    return styles[status] || styles.PENDING;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) return (
    <div style={styles.loading}>
      Loading bookings...
    </div>
  );
  
  if (error) return (
    <div style={styles.error}>
      {error}
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>{isAdmin ? 'All Bookings' : 'My Bookings'}</h2>
        {isAdmin && (
          <div style={styles.filterControls}>
            <select 
              style={styles.select}
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}
      </div>

      {bookings.length === 0 ? (
        <div style={styles.emptyState}>
          No bookings found
        </div>
<<<<<<< Updated upstream
      ) : (
        <div style={styles.grid}>
          {bookings.map((booking) => (
            <div key={booking.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.resourceName}>{booking.resourceName}</h3>
                  <span style={styles.resourceType}>{booking.resourceType}</span>
=======

        {/* Loading */}
        {loading && (
          <div className="bl-loading">
            {[1,2,3].map(k => <SkeletonCard key={k}/>)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bl-error">
            <span style={{fontSize:16,flexShrink:0}}>⚠</span>
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && bookings.length === 0 && (
          <div className="bl-empty">
            <div className="bl-empty-icon">📋</div>
            <div className="bl-empty-title">No bookings found</div>
            <div className="bl-empty-sub">
              {filter !== 'all'
                ? `No ${filter} bookings to display.`
                : isAdmin ? 'There are no bookings in the system yet.' : "You haven't made any bookings yet."
              }
            </div>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && bookings.length > 0 && (
          <div className="bl-grid">
            {bookings.map((booking, i) => (
              <div
                key={booking.id}
                className="bl-card"
                style={{animationDelay:`${i * 0.04}s`}}
              >
                {/* Card head */}
                <div className="bl-card-head">
                  <div>
                    <div className="bl-res-name">{booking.resourceName}</div>
                    <div className="bl-res-type">{booking.resourceType}</div>
                  </div>
                  <span className={`bl-badge bl-badge-${booking.status}`}>
                    {booking.status}
                  </span>
                </div>

                {/* Card body */}
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

                {/* Card footer / actions */}
                <div className="bl-card-foot">
                  {isAdmin && booking.status === 'PENDING' && (
                    <>
                      <button
                        className="bl-btn bl-btn-approve"
                        onClick={() => handleApproveClick(booking.id)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <span className="bl-spinner"/> : '✓'} Approve
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
                      onClick={() => handleCancelClick(booking.id)}
                      disabled={actionLoading}
                    >
                      Cancel Booking
                    </button>
                  )}

                  {!isAdmin && booking.status === 'PENDING' && booking.canCancel && (
                    <button
                      className="bl-btn bl-btn-cancel"
                      onClick={() => handleCancelClick(booking.id)}
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
>>>>>>> Stashed changes
                </div>
                <span style={{
                  ...styles.statusBadge,
                  ...getStatusBadgeStyle(booking.status)
                }}>
                  {booking.status}
                </span>
              </div>
              
              <div style={styles.cardBody}>
                <div style={styles.detailRow}>
                  <strong>📅 Time:</strong>
                  <span>{formatDate(booking.startTime)} - {formatDate(booking.endTime)}</span>
                </div>
                
                <div style={styles.detailRow}>
                  <strong>📝 Purpose:</strong>
                  <span>{booking.purpose}</span>
                </div>
                
                {booking.expectedAttendees > 0 && (
                  <div style={styles.detailRow}>
                    <strong>👥 Attendees:</strong>
                    <span>{booking.expectedAttendees} people</span>
                  </div>
                )}
                
                {!isAdmin && booking.userName && (
                  <div style={styles.detailRow}>
                    <strong>👤 Booked by:</strong>
                    <span>{booking.userName}</span>
                  </div>
                )}
                
                {isAdmin && booking.userName && (
                  <div style={styles.detailRow}>
                    <strong>👤 User:</strong>
                    <span>{booking.userName} ({booking.userEmail})</span>
                  </div>
                )}
                
                {booking.specialRequests && (
                  <div style={styles.detailRow}>
                    <strong>💬 Special Requests:</strong>
                    <span>{booking.specialRequests}</span>
                  </div>
                )}
                
                {booking.rejectionReason && (
                  <div style={styles.rejectionReason}>
                    <strong>❌ Rejection Reason:</strong>
                    <span>{booking.rejectionReason}</span>
                  </div>
                )}
                
                {booking.cancellationReason && (
                  <div style={styles.cancellationReason}>
                    <strong>⚠️ Cancellation Reason:</strong>
                    <span>{booking.cancellationReason}</span>
                  </div>
                )}
              </div>
              
              <div style={styles.cardActions}>
                {/* Admin actions for PENDING bookings */}
                {isAdmin && booking.status === 'PENDING' && (
                  <>
                    <button 
                      style={{...styles.button, ...styles.approveButton}}
                      onClick={() => handleApprove(booking.id)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Processing...' : '✓ Approve'}
                    </button>
                    <button 
                      style={{...styles.button, ...styles.rejectButton}}
                      onClick={() => handleRejectClick(booking.id)}
                      disabled={actionLoading}
                    >
                      ✗ Reject
                    </button>
                  </>
                )}
                
                {/* Cancel button for APPROVED bookings (if within cancellation window) */}
                {booking.status === 'APPROVED' && booking.canCancel && (
                  <button 
                    style={{...styles.button, ...styles.cancelButton}}
                    onClick={() => handleCancel(booking.id)}
                    disabled={actionLoading}
                  >
                    Cancel Booking
                  </button>
                )}
                
                {/* Cancel button for PENDING bookings (users can cancel their requests) */}
                {!isAdmin && booking.status === 'PENDING' && booking.canCancel && (
                  <button 
                    style={{...styles.button, ...styles.cancelButton}}
                    onClick={() => handleCancel(booking.id)}
                    disabled={actionLoading}
                  >
                    Cancel Request
                  </button>
                )}
                
                <button 
                  style={{...styles.button, ...styles.viewButton}}
                  onClick={() => setSelectedBooking(booking)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div style={styles.modalOverlay} onClick={() => setSelectedBooking(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Booking Details</h3>
              <button style={styles.closeButton} onClick={() => setSelectedBooking(null)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.detailSection}>
                <h4>📋 Booking Information</h4>
                <p><strong>ID:</strong> {selectedBooking.id}</p>
                <p><strong>Status:</strong> <span style={{color: getStatusBadgeStyle(selectedBooking.status).color}}>{selectedBooking.status}</span></p>
                <p><strong>Resource:</strong> {selectedBooking.resourceName}</p>
                <p><strong>Type:</strong> {selectedBooking.resourceType}</p>
                <p><strong>Start:</strong> {formatDate(selectedBooking.startTime)}</p>
                <p><strong>End:</strong> {formatDate(selectedBooking.endTime)}</p>
                <p><strong>Purpose:</strong> {selectedBooking.purpose}</p>
                {selectedBooking.expectedAttendees > 0 && <p><strong>Attendees:</strong> {selectedBooking.expectedAttendees}</p>}
                {selectedBooking.specialRequests && <p><strong>Special Requests:</strong> {selectedBooking.specialRequests}</p>}
                {selectedBooking.rejectionReason && <p><strong>Rejection Reason:</strong> {selectedBooking.rejectionReason}</p>}
                {selectedBooking.cancellationReason && <p><strong>Cancellation Reason:</strong> {selectedBooking.cancellationReason}</p>}
              </div>
              {isAdmin && (
                <div style={styles.detailSection}>
                  <h4>👤 User Information</h4>
                  <p><strong>Name:</strong> {selectedBooking.userName}</p>
                  <p><strong>Email:</strong> {selectedBooking.userEmail}</p>
                  <p><strong>User ID:</strong> {selectedBooking.userId}</p>
                </div>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.closeModalBtn} onClick={() => setSelectedBooking(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Reject Booking</h3>
              <button style={styles.closeButton} onClick={() => setShowRejectModal(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <label style={styles.modalLabel}>Rejection Reason:</label>
              <textarea
                style={styles.modalTextarea}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this booking..."
                rows="4"
              />
              <div style={styles.modalActions}>
                <button style={styles.cancelModalButton} onClick={() => setShowRejectModal(false)}>
                  Cancel
                </button>
                <button style={styles.confirmModalButton} onClick={handleConfirmReject}>
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
<<<<<<< Updated upstream
        </div>
      )}
    </div>
=======
        )}

        {/* ── Reject Modal ── */}
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
                <label className="bl-reject-label">Rejection Reason <span style={{color:'var(--danger)'}}>*</span></label>
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

        {/* ── Cancel Modal ── */}
        {showCancelModal && (
          <div className="bl-overlay" onClick={() => setShowCancelModal(false)}>
            <div className="bl-modal" onClick={(e) => e.stopPropagation()}>
              <div className="bl-modal-head">
                <span className="bl-modal-title">Cancel Booking</span>
                <button className="bl-modal-close" onClick={() => setShowCancelModal(false)}>×</button>
              </div>
              <div className="bl-modal-body">
                <div className="bl-reason-box cancel" style={{marginBottom:16}}>
                  <span style={{flexShrink:0}}>⚠️</span>
                  <span>Are you sure you want to cancel this booking? This action cannot be undone.</span>
                </div>
                <label className="bl-reject-label">Cancellation Reason (Optional)</label>
                <textarea
                  className="bl-reject-textarea"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="e.g. Plans changed, no longer needed…"
                  rows="4"
                  style={{borderColor: "var(--border)"}}
                  onFocus={(e) => e.target.style.borderColor = "var(--warn)"}
                  onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                />
                <div className="bl-modal-actions">
                  <button className="bl-btn-cancel-modal" onClick={() => setShowCancelModal(false)}>
                    Go Back
                  </button>
                  <button className="bl-btn-confirm-reject" onClick={handleConfirmCancel} style={{backgroundColor: "var(--warn)"}}>
                    {actionLoading ? 'Cancelling…' : 'Confirm Cancel'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Approve Modal ── */}
        {showApproveModal && (
          <div className="bl-overlay" onClick={() => setShowApproveModal(false)}>
            <div className="bl-modal" onClick={(e) => e.stopPropagation()}>
              <div className="bl-modal-head">
                <span className="bl-modal-title">Approve Booking</span>
                <button className="bl-modal-close" onClick={() => setShowApproveModal(false)}>×</button>
              </div>
              <div className="bl-modal-body">
                <div className="bl-reason-box" style={{marginBottom:16, background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0'}}>
                  <span style={{flexShrink:0}}>✓</span>
                  <span>Are you sure you want to approve this booking? The user will be notified.</span>
                </div>
                <div className="bl-modal-actions">
                  <button className="bl-btn-cancel-modal" onClick={() => setShowApproveModal(false)}>
                    Cancel
                  </button>
                  <button className="bl-btn-confirm-reject" onClick={handleConfirmApprove} style={{backgroundColor: '#059669'}}>
                    {actionLoading ? 'Approving…' : 'Confirm Approve'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
>>>>>>> Stashed changes
  );
};

const styles = {
  container: {
    padding: '20px',
    color: '#f1f5f9',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
  },
  filterControls: {
    width: '200px',
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    background: 'rgba(15,23,42,0.7)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '8px',
    color: '#f1f5f9',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '20px',
  },
  card: {
    background: 'rgba(15,23,42,0.7)',
    backdropFilter: 'blur(12px)',
    borderRadius: '16px',
    border: '1px solid rgba(99,102,241,0.2)',
    overflow: 'hidden',
    transition: 'transform 0.2s',
  },
  cardHeader: {
    padding: '16px',
    background: 'rgba(0,0,0,0.3)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  resourceName: {
    margin: '0 0 4px 0',
    fontSize: '1.1rem',
    color: '#f1f5f9',
  },
  resourceType: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  cardBody: {
    padding: '16px',
  },
  detailRow: {
    marginBottom: '8px',
    fontSize: '0.85rem',
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  rejectionReason: {
    marginTop: '10px',
    padding: '8px',
    background: 'rgba(239,68,68,0.1)',
    borderRadius: '6px',
    fontSize: '0.8rem',
    color: '#f87171',
  },
  cancellationReason: {
    marginTop: '10px',
    padding: '8px',
    background: 'rgba(107,114,128,0.1)',
    borderRadius: '6px',
    fontSize: '0.8rem',
    color: '#9ca3af',
  },
  cardActions: {
    padding: '12px 16px',
    background: 'rgba(0,0,0,0.3)',
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  button: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  approveButton: {
    background: '#10b981',
    color: 'white',
  },
  rejectButton: {
    background: '#ef4444',
    color: 'white',
  },
  cancelButton: {
    background: '#f59e0b',
    color: 'white',
  },
  viewButton: {
    background: '#8b5cf6',
    color: 'white',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#94a3b8',
  },
  error: {
    padding: '20px',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '12px',
    color: '#f87171',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    background: 'rgba(15,23,42,0.5)',
    borderRadius: '16px',
    color: '#94a3b8',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#0f172a',
    borderRadius: '16px',
    maxWidth: '90%',
    width: '500px',
    maxHeight: '80%',
    overflow: 'auto',
    border: '1px solid rgba(99,102,241,0.3)',
  },
  modalHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalBody: {
    padding: '20px',
  },
  modalFooter: {
    padding: '16px 20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  modalLabel: {
    display: 'block',
    marginBottom: '8px',
    color: '#e2e8f0',
    fontWeight: 500,
  },
  modalTextarea: {
    width: '100%',
    padding: '10px',
    background: '#1e293b',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '8px',
    color: '#f1f5f9',
    fontSize: '0.9rem',
    resize: 'vertical',
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '20px',
  },
  cancelModalButton: {
    padding: '8px 16px',
    background: '#6b7280',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
  },
  confirmModalButton: {
    padding: '8px 16px',
    background: '#ef4444',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#94a3b8',
  },
  closeModalBtn: {
    padding: '8px 16px',
    background: '#6366f1',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
  },
  detailSection: {
    marginBottom: '20px',
    padding: '12px',
    background: '#1e293b',
    borderRadius: '8px',
  },
};

export default BookingList;