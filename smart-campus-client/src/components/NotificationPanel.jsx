import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAll,
} from '../api/notificationApi';
import { useAuth } from '../context/AuthContext';

// ─── Icon map per notification type ───────────────────────────────
const TYPE_CONFIG = {
  // Booking types — MODULE B (will show when booking is implemented)
  BOOKING_CREATED:       { icon: '📅', color: '#3b82f6', label: 'Booking' },
  BOOKING_APPROVED:      { icon: '✅', color: '#10b981', label: 'Booking' },
  BOOKING_REJECTED:      { icon: '❌', color: '#ef4444', label: 'Booking' },
  BOOKING_CANCELLED:     { icon: '🚫', color: '#f59e0b', label: 'Booking' },

  // Ticket types — MODULE C (will show when ticketing is implemented)
  TICKET_CREATED:        { icon: '🎫', color: '#8b5cf6', label: 'Ticket'  },
  TICKET_ASSIGNED:       { icon: '👷', color: '#06b6d4', label: 'Ticket'  },
  TICKET_STATUS_UPDATED: { icon: '🔄', color: '#f59e0b', label: 'Ticket'  },
  TICKET_RESOLVED:       { icon: '🔧', color: '#10b981', label: 'Ticket'  },
  TICKET_CLOSED:         { icon: '🔒', color: '#64748b', label: 'Ticket'  },
  TICKET_COMMENT_ADDED:  { icon: '💬', color: '#6366f1', label: 'Comment' },

  // Account types — works now
  ROLE_CHANGED:          { icon: '🔑', color: '#f59e0b', label: 'Account' },
  ACCOUNT_ENABLED:       { icon: '✅', color: '#10b981', label: 'Account' },
  ACCOUNT_DISABLED:      { icon: '🚫', color: '#ef4444', label: 'Account' },
  SYSTEM_ANNOUNCEMENT:   { icon: '📢', color: '#6366f1', label: 'System'  },
  WELCOME:               { icon: '🎉', color: '#10b981', label: 'Welcome' },
};

const getConfig = (type) =>
  TYPE_CONFIG[type] || { icon: '🔔', color: '#6366f1', label: 'Info' };

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7)  return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

export default function NotificationPanel() {
  const { user }                            = useAuth();
  const navigate                            = useNavigate();
  const [open, setOpen]                     = useState(false);
  const [notifications, setNotifications]   = useState([]);
  const [unreadCount, setUnreadCount]       = useState(0);
  const [loading, setLoading]               = useState(false);
  const [filter, setFilter]                 = useState('ALL');
  const panelRef                            = useRef(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Poll unread count every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications when panel opens
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.count);
    } catch {}
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      const deleted = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (deleted && !deleted.read) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleClearAll = async () => {
    try {
      await clearAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch {}
  };

  const handleNotificationClick = async (n) => {
    // Mark as read
    if (!n.read) {
      await markAsRead(n.id);
      setNotifications(prev =>
        prev.map(x => x.id === n.id ? { ...x, read: true } : x));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // Navigate to related page
    // MODULE B: Uncomment when BookingManagement page is implemented
    // if (n.relatedEntityType === 'BOOKING') {
    //   navigate(`/bookings/${n.relatedEntityId}`);
    //   setOpen(false);
    // }

    // MODULE C: Uncomment when Ticketing page is implemented
    // if (n.relatedEntityType === 'TICKET') {
    //   navigate(`/tickets/${n.relatedEntityId}`);
    //   setOpen(false);
    // }

    if (n.type === 'ROLE_CHANGED' || n.type === 'WELCOME') {
      navigate('/dashboard');
      setOpen(false);
    }
  };

  // Filter tabs
  const FILTERS = [
    { key: 'ALL',     label: 'All'      },
    { key: 'UNREAD',  label: 'Unread'   },
    { key: 'BOOKING', label: 'Bookings' }, // MODULE B
    { key: 'TICKET',  label: 'Tickets'  }, // MODULE C
    { key: 'ACCOUNT', label: 'Account'  },
  ];

  const filtered = notifications.filter(n => {
    if (filter === 'ALL')    return true;
    if (filter === 'UNREAD') return !n.read;
    const config = getConfig(n.type);
    return config.label.toUpperCase() === filter;
  });

  return (
    <div ref={panelRef} style={s.wrapper}>

      {/* Bell button */}
      <button style={s.bell} onClick={() => setOpen(!open)}>
        🔔
        {unreadCount > 0 && (
          <span style={s.badge}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div style={s.panel}>

          {/* Header */}
          <div style={s.header}>
            <div>
              <div style={s.headerTitle}>Notifications</div>
              {unreadCount > 0 && (
                <div style={s.headerSub}>{unreadCount} unread</div>
              )}
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {unreadCount > 0 && (
                <button style={s.textBtn} onClick={handleMarkAllRead}>
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button style={{ ...s.textBtn, color:'#ef4444' }}
                  onClick={handleClearAll}>
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          <div style={s.tabs}>
            {FILTERS.map(f => (
              <button
                key={f.key}
                style={{
                  ...s.tab,
                  ...(filter === f.key ? s.tabActive : {}),
                }}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                {f.key === 'UNREAD' && unreadCount > 0 && (
                  <span style={s.tabBadge}>{unreadCount}</span>
                )}
              </button>
            ))}
          </div>

          {/* Notification list */}
          <div style={s.list}>
            {loading ? (
              <div style={s.center}>
                <div style={s.spinner}/>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : filtered.length === 0 ? (
              <div style={s.empty}>
                <div style={{ fontSize:40, marginBottom:8 }}>🔔</div>
                <div style={{ fontWeight:500, color:'#1e293b' }}>
                  {filter === 'UNREAD' ? 'All caught up!' : 'No notifications'}
                </div>
                <div style={{ fontSize:12, color:'#94a3b8', marginTop:4 }}>
                  {filter === 'UNREAD'
                    ? 'You have no unread notifications.'
                    : 'Notifications will appear here.'}
                </div>
              </div>
            ) : (
              filtered.map((n) => {
                const cfg = getConfig(n.type);
                return (
                  <div
                    key={n.id}
                    style={{
                      ...s.item,
                      background: n.read ? '#fff' : '#f8f7ff',
                      borderLeft: n.read
                        ? '3px solid transparent'
                        : `3px solid ${cfg.color}`,
                    }}
                    onClick={() => handleNotificationClick(n)}
                  >
                    {/* Icon */}
                    <div style={{
                      ...s.iconBox,
                      background: cfg.color + '18',
                      color: cfg.color,
                    }}>
                      {cfg.icon}
                    </div>

                    {/* Content */}
                    <div style={s.content}>
                      <div style={s.itemTitle}>{n.title}</div>
                      <div style={s.itemMsg}>{n.message}</div>
                      <div style={s.itemMeta}>
                        <span style={{
                          ...s.typeTag,
                          background: cfg.color + '18',
                          color: cfg.color,
                        }}>
                          {cfg.label}
                        </span>
                        <span style={s.time}>{timeAgo(n.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={s.actions}>
                      {!n.read && (
                        <button
                          style={s.readBtn}
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                          title="Mark as read"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        style={s.deleteBtn}
                        onClick={(e) => handleDelete(n.id, e)}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────
const s = {
  wrapper:     { position:'relative' },
  bell:        { background:'none', border:'none', cursor:'pointer', fontSize:20, position:'relative', padding:'4px 8px' },
  badge:       { position:'absolute', top:-2, right:-2, background:'#ef4444', color:'#fff', borderRadius:10, fontSize:10, minWidth:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px', fontWeight:700 },
  panel:       { position:'absolute', top:'calc(100% + 8px)', right:0, width:380, maxHeight:520, background:'#fff', borderRadius:16, boxShadow:'0 8px 40px rgba(0,0,0,0.15)', display:'flex', flexDirection:'column', zIndex:1000, overflow:'hidden' },
  header:      { padding:'14px 16px 10px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'flex-start' },
  headerTitle: { fontWeight:600, fontSize:16, color:'#1e293b' },
  headerSub:   { fontSize:12, color:'#6366f1', marginTop:2 },
  textBtn:     { background:'none', border:'none', cursor:'pointer', fontSize:12, color:'#6366f1', padding:'2px 4px' },
  tabs:        { display:'flex', gap:4, padding:'8px 12px', borderBottom:'1px solid #f1f5f9', overflowX:'auto' },
  tab:         { background:'none', border:'none', cursor:'pointer', padding:'5px 10px', borderRadius:20, fontSize:12, color:'#64748b', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:4 },
  tabActive:   { background:'#ede9fe', color:'#6366f1', fontWeight:600 },
  tabBadge:    { background:'#6366f1', color:'#fff', borderRadius:10, fontSize:10, padding:'1px 5px' },
  list:        { overflowY:'auto', flex:1 },
  item:        { display:'flex', gap:10, padding:'12px 14px', cursor:'pointer', borderBottom:'1px solid #f8fafc', transition:'background .15s', alignItems:'flex-start' },
  iconBox:     { width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 },
  content:     { flex:1, minWidth:0 },
  itemTitle:   { fontSize:13, fontWeight:600, color:'#1e293b', marginBottom:2 },
  itemMsg:     { fontSize:12, color:'#475569', lineHeight:1.4, marginBottom:4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' },
  itemMeta:    { display:'flex', alignItems:'center', gap:6 },
  typeTag:     { fontSize:10, fontWeight:500, padding:'1px 7px', borderRadius:10 },
  time:        { fontSize:11, color:'#94a3b8' },
  actions:     { display:'flex', flexDirection:'column', gap:4, flexShrink:0 },
  readBtn:     { background:'#dcfce7', color:'#166534', border:'none', borderRadius:6, width:22, height:22, cursor:'pointer', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center' },
  deleteBtn:   { background:'#fee2e2', color:'#991b1b', border:'none', borderRadius:6, width:22, height:22, cursor:'pointer', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center' },
  center:      { display:'flex', justifyContent:'center', padding:'2rem' },
  spinner:     { width:28, height:28, border:'3px solid #e2e8f0', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin .8s linear infinite' },
  empty:       { textAlign:'center', padding:'2.5rem 1rem', color:'#64748b' },
};