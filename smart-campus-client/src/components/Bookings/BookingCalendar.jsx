import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import bookingApi from '../../api/bookingApi';

// Import locale directly instead of using require
import enUS from 'date-fns/locale/en-US';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const BookingCalendar = ({ isAdmin = false }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [isAdmin]);

  const fetchBookings = async () => {
    try {
      let response;
      if (isAdmin) {
        response = await bookingApi.getAllBookings();
      } else {
        response = await bookingApi.getMyBookings();
      }
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert bookings to calendar events
  const events = bookings.map(booking => {
    let backgroundColor = '#6366f1';
    let borderColor = '#6366f1';
    
    switch (booking.status) {
      case 'APPROVED':
        backgroundColor = '#10b981';
        borderColor = '#059669';
        break;
      case 'PENDING':
        backgroundColor = '#f59e0b';
        borderColor = '#d97706';
        break;
      case 'REJECTED':
        backgroundColor = '#ef4444';
        borderColor = '#dc2626';
        break;
      case 'CANCELLED':
        backgroundColor = '#6b7280';
        borderColor = '#4b5563';
        break;
      default:
        backgroundColor = '#6366f1';
        borderColor = '#4f46e5';
    }

    return {
      id: booking.id,
      title: `${booking.resourceName} - ${booking.purpose.substring(0, 30)}${booking.purpose.length > 30 ? '...' : ''}`,
      start: new Date(booking.startTime),
      end: new Date(booking.endTime),
      status: booking.status,
      resourceName: booking.resourceName,
      resourceType: booking.resourceType,
      purpose: booking.purpose,
      userName: booking.userName,
      userEmail: booking.userEmail,
      expectedAttendees: booking.expectedAttendees,
      specialRequests: booking.specialRequests,
      rejectionReason: booking.rejectionReason,
      cancellationReason: booking.cancellationReason,
      backgroundColor,
      borderColor,
    };
  });

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: `2px solid ${event.borderColor}`,
        display: 'block',
        fontSize: '12px',
        padding: '2px 4px',
        fontWeight: 500,
      },
    };
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Legend */}
      <div style={styles.legend}>
        <h4 style={styles.legendTitle}>Status Legend</h4>
        <div style={styles.legendItems}>
          <div style={styles.legendItem}>
            <div style={{...styles.legendColor, backgroundColor: '#10b981'}}></div>
            <span>Approved</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendColor, backgroundColor: '#f59e0b'}}></div>
            <span>Pending</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendColor, backgroundColor: '#ef4444'}}></div>
            <span>Rejected</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendColor, backgroundColor: '#6b7280'}}></div>
            <span>Cancelled</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div style={styles.calendarWrapper}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={styles.calendar}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleEventClick}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
          toolbar={true}
          popup={true}
          messages={{
            next: "Next",
            previous: "Previous",
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day",
            agenda: "Agenda",
          }}
        />
      </div>

      {/* Event Details Modal */}
      {showModal && selectedEvent && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Booking Details</h3>
              <button style={styles.closeButton} onClick={() => setShowModal(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.modalSection}>
                <h4 style={{ color: selectedEvent.backgroundColor }}>{selectedEvent.status}</h4>
                <p><strong>Resource:</strong> {selectedEvent.resourceName}</p>
                <p><strong>Type:</strong> {selectedEvent.resourceType}</p>
                <p><strong>Date & Time:</strong> {formatDate(selectedEvent.start)} - {formatDate(selectedEvent.end)}</p>
                <p><strong>Purpose:</strong> {selectedEvent.purpose}</p>
                {selectedEvent.expectedAttendees > 0 && (
                  <p><strong>Expected Attendees:</strong> {selectedEvent.expectedAttendees}</p>
                )}
                {selectedEvent.specialRequests && (
                  <p><strong>Special Requests:</strong> {selectedEvent.specialRequests}</p>
                )}
                {selectedEvent.rejectionReason && (
                  <p style={{ color: '#ef4444' }}><strong>Rejection Reason:</strong> {selectedEvent.rejectionReason}</p>
                )}
                {selectedEvent.cancellationReason && (
                  <p style={{ color: '#6b7280' }}><strong>Cancellation Reason:</strong> {selectedEvent.cancellationReason}</p>
                )}
              </div>
              {isAdmin && (
                <div style={styles.modalSection}>
                  <h4>User Information</h4>
                  <p><strong>Name:</strong> {selectedEvent.userName}</p>
                  <p><strong>Email:</strong> {selectedEvent.userEmail}</p>
                </div>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.closeModalBtn} onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    background: '#f4f1eb',
    minHeight: '400px',
  },
  legend: {
    background: '#fff',
    borderRadius: '12px',
    padding: '15px 20px',
    marginBottom: '20px',
    border: '1px solid #e4dfd4',
  },
  legendTitle: {
    margin: '0 0 10px 0',
    color: '#1c1917',
    fontSize: '14px',
    fontWeight: 600,
  },
  legendItems: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#78716c',
    fontSize: '12px',
  },
  legendColor: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
  },
  calendarWrapper: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e4dfd4',
  },
  calendar: {
    height: '600px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    color: '#78716c',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e4dfd4',
    borderTopColor: '#0d7a6b',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
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
    background: '#fff',
    borderRadius: '16px',
    maxWidth: '90%',
    width: '500px',
    maxHeight: '80%',
    overflow: 'auto',
    border: '1px solid #e4dfd4',
  },
  modalHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #e4dfd4',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalBody: {
    padding: '20px',
  },
  modalSection: {
    marginBottom: '20px',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '8px',
  },
  modalFooter: {
    padding: '16px 20px',
    borderTop: '1px solid #e4dfd4',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#78716c',
  },
  closeModalBtn: {
    padding: '8px 16px',
    background: '#0d7a6b',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
  },
};

// Add animation styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .rbc-calendar {
    background: transparent;
  }
  
  .rbc-header {
    color: #78716c;
    padding: 10px;
    border-bottom: 1px solid #e4dfd4;
  }
  
  .rbc-off-range-bg {
    background: #faf9f7;
  }
  
  .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
    border: 1px solid #e4dfd4;
  }
  
  .rbc-day-bg + .rbc-day-bg {
    border-left: 1px solid #e4dfd4;
  }
  
  .rbc-month-row + .rbc-month-row {
    border-top: 1px solid #e4dfd4;
  }
  
  .rbc-date-cell {
    color: #1c1917;
    padding: 8px;
  }
  
  .rbc-date-cell.rbc-now {
    color: #0d7a6b;
    font-weight: bold;
  }
  
  .rbc-toolbar button {
    color: #78716c;
    background: #fff;
    border: 1px solid #e4dfd4;
  }
  
  .rbc-toolbar button:hover {
    background: #faf9f7;
    color: #1c1917;
  }
  
  .rbc-toolbar button.rbc-active {
    background: #0d7a6b;
    color: white;
    border-color: #0d7a6b;
  }
  
  .rbc-today {
    background: rgba(13,122,107,0.05);
  }
  
  .rbc-event {
    cursor: pointer;
  }
  
  .rbc-event:hover {
    opacity: 1;
    transform: scale(1.02);
  }
  
  .rbc-agenda-table {
    color: #1c1917;
  }
  
  .rbc-agenda-table td {
    border-top: 1px solid #e4dfd4;
  }
  
  .rbc-agenda-table th {
    border-bottom: 1px solid #e4dfd4;
  }
`;
document.head.appendChild(styleSheet);

export default BookingCalendar;