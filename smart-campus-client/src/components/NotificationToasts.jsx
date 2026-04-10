import { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';

// We share this with NotificationPanel for consistent look
const TYPE_CONFIG = {
  BOOKING_CREATED:       { icon: '📅', color: '#3b82f6', label: 'Booking' },
  BOOKING_APPROVED:      { icon: '✅', color: '#10b981', label: 'Booking' },
  BOOKING_REJECTED:      { icon: '❌', color: '#ef4444', label: 'Booking' },
  BOOKING_CANCELLED:     { icon: '🚫', color: '#f59e0b', label: 'Booking' },
  TICKET_CREATED:        { icon: '🎫', color: '#8b5cf6', label: 'Ticket'  },
  TICKET_ASSIGNED:       { icon: '👷', color: '#06b6d4', label: 'Ticket'  },
  TICKET_STATUS_UPDATED: { icon: '🔄', color: '#f59e0b', label: 'Ticket'  },
  TICKET_RESOLVED:       { icon: '🔧', color: '#10b981', label: 'Ticket'  },
  TICKET_CLOSED:         { icon: '🔒', color: '#64748b', label: 'Ticket'  },
  TICKET_COMMENT_ADDED:  { icon: '💬', color: '#6366f1', label: 'Comment' },
  ROLE_CHANGED:          { icon: '🔑', color: '#f59e0b', label: 'Account' },
  ACCOUNT_ENABLED:       { icon: '✅', color: '#10b981', label: 'Account' },
  ACCOUNT_DISABLED:      { icon: '🚫', color: '#ef4444', label: 'Account' },
  SYSTEM_ANNOUNCEMENT:   { icon: '📢', color: '#6366f1', label: 'System'  },
  WELCOME:               { icon: '🎉', color: '#10b981', label: 'Welcome' },
};

const getConfig = (type) => TYPE_CONFIG[type] || { icon: '🔔', color: '#6366f1', label: 'Notification' };

const Toast = ({ notification, onRemove }) => {
  const [visible, setVisible] = useState(false);
  const cfg = getConfig(notification.type);

  useEffect(() => {
    // animate in
    requestAnimationFrame(() => setVisible(true));
    
    // Auto remove after 5s
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(notification.id), 300); // Wait for fade out
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [notification.id, onRemove]);

  return (
    <div style={{
      ...styles.toast,
      transform: visible ? 'translateX(0)' : 'translateX(120%)',
      opacity: visible ? 1 : 0,
      borderLeft: `4px solid ${cfg.color}`
    }}>
      <div style={{
        ...styles.iconBox,
        background: cfg.color + '18',
        color: cfg.color,
      }}>
        {cfg.icon}
      </div>
      
      <div style={styles.content}>
        <div style={styles.title}>{notification.title}</div>
        <div style={styles.message}>{notification.message}</div>
      </div>
      
      <button 
        style={styles.closeBtn} 
        onClick={() => {
          setVisible(false);
          setTimeout(() => onRemove(notification.id), 300);
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default function NotificationToasts() {
  const { activeToasts, removeToast } = useNotification();

  if (!activeToasts || activeToasts.length === 0) return null;

  return (
    <div style={styles.container}>
      {activeToasts.map(toast => (
        <Toast key={toast.id} notification={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    pointerEvents: 'none', // Prevent container from blocking clicks
  },
  toast: {
    pointerEvents: 'auto',
    width: 340,
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
    transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    paddingTop: 2,
  },
  title: {
    fontWeight: 600,
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 1.4,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: 14,
    padding: 4,
    marginLeft: -4,
    marginRight: -4,
    transition: 'color 0.2s',
  }
};
