import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.page}>
      {/* Animated Tech Background */}
      <div style={styles.bgCanvas}>
        <div style={styles.glowOrb1} />
        <div style={styles.glowOrb2} />
        <div style={styles.gridOverlay} />
        <div style={styles.dataStream} />
        <svg style={styles.networkSvg} viewBox="0 0 1400 900" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {[
            { x1: 200, y1: 250, x2: 500, y2: 180 },
            { x1: 500, y1: 180, x2: 850, y2: 300 },
            { x1: 850, y1: 300, x2: 1100, y2: 220 },
            { x1: 200, y1: 250, x2: 350, y2: 450 },
            { x1: 350, y1: 450, x2: 700, y2: 550 },
            { x1: 700, y1: 550, x2: 1050, y2: 480 },
            { x1: 1050, y1: 480, x2: 1200, y2: 350 },
            { x1: 500, y1: 180, x2: 700, y2: 550 },
          ].map((line, idx) => (
            <line key={`line-${idx}`} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="6 6" />
          ))}
          <g filter="url(#glow)">
            <circle cx="200" cy="250" r="14" fill="#4f46e5" opacity="0.7" />
            <circle cx="500" cy="180" r="12" fill="#06b6d4" opacity="0.7" />
            <circle cx="850" cy="300" r="10" fill="#f59e0b" opacity="0.6" />
            <circle cx="350" cy="450" r="11" fill="#ec4899" opacity="0.6" />
            <circle cx="700" cy="550" r="13" fill="#10b981" opacity="0.6" />
            <circle cx="1100" cy="220" r="9" fill="#8b5cf6" opacity="0.6" />
          </g>
        </svg>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <path d="M16 4L4 12L16 20L28 12L16 4Z" stroke="url(#logoGrad)" strokeWidth="2" fill="none"/>
                <path d="M4 18L16 26L28 18" stroke="url(#logoGrad)" strokeWidth="2" fill="none"/>
                <path d="M4 13L16 21L28 13" stroke="url(#logoGrad)" strokeWidth="2" fill="none"/>
                <defs>
                  <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1"/>
                    <stop offset="100%" stopColor="#06b6d4"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span>Smart<span style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Campus</span></span>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>

        {/* Welcome Card */}
        <div style={styles.card}>
          <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '1.5rem', fontWeight: 600 }}>Welcome, {user?.name} 👋</h3>
          <div style={styles.row}>
            <span style={styles.label}>Email</span>
            <span style={styles.value}>{user?.email}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Role</span>
            <span style={{
              ...styles.badge,
              background: user?.role === 'ADMIN' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.15)',
              color: user?.role === 'ADMIN' ? '#fbbf24' : '#a5b4fc',
              border: `1px solid ${user?.role === 'ADMIN' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`
            }}>
              {user?.role}
            </span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>User ID</span>
            <span style={styles.userId}>{user?.id}</span>
          </div>
        </div>

        {/* Booking Management Cards - This is what was missing */}
        <div style={styles.bookingGrid}>
          {/* Create Booking Card */}
          <div 
            style={styles.bookingCard} 
            onClick={() => navigate('/create-booking')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/create-booking')}
          >
            <div style={styles.bookingIcon}>➕</div>
            <div style={styles.bookingContent}>
              <strong style={{ fontSize: '1rem' }}>Create Booking</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                Book lecture halls, labs, meeting rooms, or equipment
              </p>
            </div>
            <div style={styles.arrowIcon}>→</div>
          </div>

          {/* My Bookings Card */}
          <div 
            style={styles.bookingCard} 
            onClick={() => navigate('/my-bookings')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/my-bookings')}
          >
            <div style={styles.bookingIcon}>📅</div>
            <div style={styles.bookingContent}>
              <strong style={{ fontSize: '1rem' }}>My Bookings</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                View and manage your facility and equipment bookings
              </p>
            </div>
            <div style={styles.arrowIcon}>→</div>
          </div>
        </div>

        {/* Admin Section (if admin) */}
        {isAdmin() && (
          <div style={styles.adminGrid}>
            <div 
              style={styles.adminCard} 
              onClick={() => navigate('/admin')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/admin')}
            >
              <div style={styles.adminIcon}>⚙️</div>
              <div style={styles.adminContent}>
                <strong style={{ fontSize: '1rem' }}>Admin Dashboard</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                  Manage users and system settings
                </p>
              </div>
              <div style={styles.arrowIcon}>→</div>
            </div>

            <div 
              style={styles.adminBookingCard} 
              onClick={() => navigate('/admin/bookings')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/bookings')}
            >
              <div style={styles.adminBookingIcon}>📊</div>
              <div style={styles.adminBookingContent}>
                <strong style={{ fontSize: '1rem' }}>Manage All Bookings</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                  Approve/reject booking requests
                </p>
              </div>
              <div style={styles.arrowIcon}>→</div>
            </div>
          </div>
        )}
      </div>

      {/* Inject Global Animations */}
      <style>{`
        @keyframes floatBG {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-1%, -1%) scale(1.02); }
        }
        @keyframes dataFlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

// Modern Smart Campus Styles
const styles = {
  page: {
    minHeight: '100vh',
    position: 'relative',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    background: '#0b0f19',
  },
  bgCanvas: {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    background: 'radial-gradient(ellipse at 20% 30%, #0f172a, #020617)',
    overflow: 'hidden',
  },
  glowOrb1: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: '60%',
    height: '60%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(6,182,212,0.1) 50%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(80px)',
    animation: 'floatBG 15s ease-in-out infinite alternate',
  },
  glowOrb2: {
    position: 'absolute',
    bottom: '-20%',
    right: '-10%',
    width: '55%',
    height: '55%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.1) 50%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(80px)',
    animation: 'floatBG 18s ease-in-out infinite alternate-reverse',
  },
  gridOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'linear-gradient(rgba(51, 65, 85, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(51, 65, 85, 0.2) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    opacity: 0.5,
  },
  dataStream: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #4f46e5, #06b6d4, transparent)',
    animation: 'dataFlow 6s linear infinite',
  },
  networkSvg: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    top: '-10%',
    left: '-10%',
    opacity: 0.4,
  },
  content: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#f1f5f9',
  },
  logoIcon: {
    display: 'flex',
    alignItems: 'center',
  },
  logoutBtn: {
    padding: '8px 20px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '40px',
    color: '#e2e8f0',
    fontSize: '0.85rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(4px)',
  },
  card: {
    background: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(12px)',
    borderRadius: '28px',
    padding: '2rem',
    marginBottom: '1.5rem',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    boxShadow: '0 20px 35px -12px rgba(0,0,0,0.3)',
    color: '#f1f5f9',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 0',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  label: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    fontWeight: 500,
    letterSpacing: '0.3px',
  },
  value: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#e2e8f0',
  },
  userId: {
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    color: '#64748b',
    background: 'rgba(0,0,0,0.3)',
    padding: '4px 8px',
    borderRadius: '12px',
  },
  badge: {
    padding: '4px 14px',
    borderRadius: '40px',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.3px',
  },
  bookingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  bookingCard: {
    background: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(12px)',
    borderRadius: '20px',
    padding: '1.25rem',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      borderColor: 'rgba(99, 102, 241, 0.5)',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
    }
  },
  bookingIcon: {
    fontSize: '2rem',
    background: 'rgba(99,102,241,0.15)',
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingContent: {
    flex: 1,
    color: '#f1f5f9',
  },
  arrowIcon: {
    fontSize: '1.25rem',
    color: '#6366f1',
    opacity: 0.7,
  },
  adminGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
  },
  adminCard: {
    background: 'rgba(245, 158, 11, 0.08)',
    backdropFilter: 'blur(12px)',
    borderRadius: '20px',
    padding: '1.25rem',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      borderColor: 'rgba(245, 158, 11, 0.5)',
    }
  },
  adminIcon: {
    fontSize: '2rem',
    background: 'rgba(245,158,11,0.15)',
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminContent: {
    flex: 1,
    color: '#fde68a',
  },
  adminBookingCard: {
    background: 'rgba(16, 185, 129, 0.08)',
    backdropFilter: 'blur(12px)',
    borderRadius: '20px',
    padding: '1.25rem',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      borderColor: 'rgba(16, 185, 129, 0.5)',
    }
  },
  adminBookingIcon: {
    fontSize: '2rem',
    background: 'rgba(16,185,129,0.15)',
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBookingContent: {
    flex: 1,
    color: '#6ee7b7',
  },
};

// Add hover styles
const styleTag = document.createElement('style');
styleTag.textContent = `
  button:hover {
    transform: translateY(-1px);
  }
  [style*="bookingCard"]:hover,
  [style*="adminCard"]:hover,
  [style*="adminBookingCard"]:hover {
    transform: translateY(-2px);
  }
`;
if (!document.querySelector('#dashboard-hover-styles')) {
  styleTag.id = 'dashboard-hover-styles';
  document.head.appendChild(styleTag);
}