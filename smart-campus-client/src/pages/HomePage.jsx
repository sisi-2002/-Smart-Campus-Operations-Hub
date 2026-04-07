import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={s.page}>
      {/* Animated Background */}
      <div style={s.bgGradient}>
        <div style={s.bgBlob1} />
        <div style={s.bgBlob2} />
        <div style={s.bgBlob3} />
      </div>

      {/* Header */}
      <header style={{ ...s.header, ...(scrolled && s.headerScrolled) }}>
        <div style={s.headerInner}>
          <Link to="/" style={s.brand}>
            <div style={s.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={s.brandText}>Smart<span style={{ color: '#6366f1' }}>Campus</span></span>
          </Link>

          <nav style={s.nav}>
            <a href="#features" style={s.navLink}>Features</a>
            <a href="#workflows" style={s.navLink}>Workflows</a>
            <a href="#roles" style={s.navLink}>Roles</a>
            <a href="#contact" style={s.navLink}>Contact</a>
          </nav>

          <div style={s.headerActions}>
            {!user ? (
              <>
                <Link to="/login" style={s.linkBtn}>Sign In</Link>
                <Link to="/register" style={s.primaryBtn}>Get Started</Link>
              </>
            ) : (
              <>
                <div style={s.userPill}>
                  <div style={s.userAvatar}>
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div style={s.userInfo}>
                    <span style={s.userName}>{user.name?.split(' ')[0] || 'User'}</span>
                    <span style={s.userRole}>{isAdmin() ? 'Admin' : 'User'}</span>
                  </div>
                </div>
                <Link to={isAdmin() ? "/admin" : "/dashboard"} style={s.dashboardBtn}>
                  {isAdmin() ? "Admin Dashboard" : "User Dashboard"}
                </Link>
                <button onClick={handleLogout} style={s.ghostBtn}>Logout</button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section style={s.hero}>
          <div style={s.heroInner}>
            <div style={s.heroContent}>
              <div style={s.heroBadge}>
                <span style={s.pulseDot} />
                Smart Campus Operations Hub 2.0
              </div>
              <h1 style={s.h1}>
                Book resources.{' '}
                <span style={s.gradientText}>Report incidents.</span>
                <br />
                Stay in full control.
              </h1>
              <p style={s.heroP}>
                A single platform to manage facility bookings, maintenance tickets, 
                approvals, and real-time notifications — with role-based access and 
                intelligent workflow automation.
              </p>

              <div style={s.heroCtas}>
                {!user ? (
                  <>
                    <Link to="/register" style={s.primaryBtnLg}>
                      Start Free Trial
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </Link>
                    <Link to="/login" style={s.secondaryBtnLg}>Sign In</Link>
                  </>
                ) : (
                  <>
                    <Link to={isAdmin() ? "/admin" : "/dashboard"} style={s.primaryBtnLg}>
                      {isAdmin() ? "Go to Admin Dashboard" : "Go to User Dashboard"}
                    </Link>
                    <a href="#features" style={s.secondaryBtnLg}>Explore Features</a>
                  </>
                )}
              </div>

              <div style={s.heroStats}>
                <div style={s.stat}>
                  <div style={s.statNum}>500+</div>
                  <div style={s.statLabel}>Resources Managed</div>
                </div>
                <div style={s.stat}>
                  <div style={s.statNum}>98%</div>
                  <div style={s.statLabel}>Resolution Rate</div>
                </div>
                <div style={s.stat}>
                  <div style={s.statNum}>24/7</div>
                  <div style={s.statLabel}>Real-time Sync</div>
                </div>
              </div>
            </div>

            <div style={s.heroVisual}>
               <div style={s.floatingCard}>
                <div style={s.visualCard}>
                  <div style={s.visualHeader}>
                    <div style={s.visualTitle}>Live Activity</div>
                    <div style={s.liveBadge}>● LIVE</div>
                  </div>
                  <div style={s.activityList}>
                    <div style={s.activityItem}>
                      <div style={s.activityIcon}>📅</div>
                      <div>
                        <div style={s.activityTitle}>Lab A Booking</div>
                        <div style={s.activityTime}>10:00 AM - 12:00 PM</div>
                      </div>
                      <div style={s.activityStatus}>Pending</div>
                    </div>
                    <div style={s.activityItem}>
                      <div style={s.activityIcon}>🛠️</div>
                      <div>
                        <div style={s.activityTitle}>Projector Malfunction</div>
                        <div style={s.activityTime}>Incident #INC-2024</div>
                      </div>
                      <div style={{ ...s.activityStatus, background: '#fef3c7', color: '#d97706' }}>In Progress</div>
                    </div>
                    <div style={s.activityItem}>
                      <div style={s.activityIcon}>✅</div>
                      <div>
                        <div style={s.activityTitle}>Meeting Room 3B</div>
                        <div style={s.activityTime}>Approved by Admin</div>
                      </div>
                      <div style={{ ...s.activityStatus, background: '#d1fae5', color: '#059669' }}>Approved</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={s.floatingCard2}>
                <div style={s.statsCard}>
                  <div style={s.statsValue}>12</div>
                  <div style={s.statsLabel}>Active Bookings Today</div>
                  <div style={s.statsTrend}>↑ 23% vs yesterday</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" style={s.section}>
          <div style={s.sectionInner}>
            <div style={s.sectionHeader}>
              <span style={s.sectionTag}>Platform Capabilities</span>
              <h2 style={s.h2}>Everything you need to run<br />campus operations seamlessly</h2>
              <p style={s.sectionP}>
                Designed around clear workflows, auditability, and usability — with a UI that stays simple 
                even as modules grow.
              </p>
            </div>

            <div style={s.cards}>
              <div style={s.card}>
                <div style={s.cardIconWrapper}>
                  <div style={s.cardIconBg}>
                    <span style={s.cardIcon}>🏫</span>
                  </div>
                </div>
                <div style={s.cardTitle}>Facilities & Assets</div>
                <div style={s.cardText}>
                  Maintain a comprehensive catalogue of rooms, labs, and equipment with capacity, 
                  location, availability windows, and real-time status tracking.
                </div>
                <Link to="#" style={s.cardLink}>Learn more →</Link>
              </div>

              <div style={s.card}>
                <div style={s.cardIconWrapper}>
                  <div style={s.cardIconBg}>
                    <span style={s.cardIcon}>📅</span>
                  </div>
                </div>
                <div style={s.cardTitle}>Booking Management</div>
                <div style={s.cardText}>
                  Request bookings with purpose and time range. Admins approve/reject with reasons, 
                  and conflicts are automatically prevented by our smart scheduler.
                </div>
                <Link to="#" style={s.cardLink}>Learn more →</Link>
              </div>

              <div style={s.card}>
                <div style={s.cardIconWrapper}>
                  <div style={s.cardIconBg}>
                    <span style={s.cardIcon}>🛠️</span>
                  </div>
                </div>
                <div style={s.cardTitle}>Incident Ticketing</div>
                <div style={s.cardText}>
                  Report faults with category, priority, and image evidence. Track ticket progress 
                  from OPEN to CLOSED with resolution notes and comments.
                </div>
                <Link to="#" style={s.cardLink}>Learn more →</Link>
              </div>

              <div style={s.card}>
                <div style={s.cardIconWrapper}>
                  <div style={s.cardIconBg}>
                    <span style={s.cardIcon}>🔔</span>
                  </div>
                </div>
                <div style={s.cardTitle}>Smart Notifications</div>
                <div style={s.cardText}>
                  Get real-time updates for approvals, ticket status changes, and comments — 
                  delivered via in-app notifications and email alerts.
                </div>
                <Link to="#" style={s.cardLink}>Learn more →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Workflows Section */}
        <section id="workflows" style={s.sectionAlt}>
          <div style={s.sectionInner}>
            <div style={s.sectionHeader}>
              <span style={s.sectionTag}>Process Automation</span>
              <h2 style={s.h2}>Clear workflows, fewer mistakes</h2>
              <p style={s.sectionP}>
                Streamlined approval processes with complete transparency and audit trails
              </p>
            </div>

            <div style={s.workflowGrid}>
              <div style={s.workflowCard}>
                <div style={s.workflowHeader}>
                  <div style={s.workflowTitle}>
                    <span style={s.workflowIcon}>📆</span>
                    Booking Workflow
                  </div>
                  <div style={s.workflowTag}>Conflict-safe</div>
                </div>
                <div style={s.flowDiagram}>
                  <div style={s.flowStep}>
                    <div style={s.flowStepCircle}>1</div>
                    <div style={s.flowStepLabel}>PENDING</div>
                  </div>
                  <div style={s.flowArrow}>→</div>
                  <div style={s.flowStep}>
                    <div style={s.flowStepCircle}>2</div>
                    <div style={s.flowStepLabel}>APPROVED</div>
                  </div>
                  <div style={s.flowArrow}>→</div>
                  <div style={s.flowStep}>
                    <div style={s.flowStepCircle}>3</div>
                    <div style={s.flowStepLabel}>CONFIRMED</div>
                  </div>
                </div>
                <div style={s.workflowText}>
                  Users request time ranges; admins review with reason; the system automatically blocks overlapping bookings for the same resource.
                </div>
                <div style={s.workflowMeta}>
                  <span>✓ Auto-conflict detection</span>
                  <span>✓ Approval reasons</span>
                  <span>✓ Audit trail</span>
                </div>
              </div>

              <div style={s.workflowCard}>
                <div style={s.workflowHeader}>
                  <div style={s.workflowTitle}>
                    <span style={s.workflowIcon}>🎫</span>
                    Ticket Workflow
                  </div>
                  <div style={s.workflowTag}>Trackable</div>
                </div>
                <div style={s.flowDiagram}>
                  <div style={s.flowStep}>
                    <div style={{ ...s.flowStepCircle, background: '#ef4444' }}>1</div>
                    <div style={s.flowStepLabel}>OPEN</div>
                  </div>
                  <div style={s.flowArrow}>→</div>
                  <div style={s.flowStep}>
                    <div style={{ ...s.flowStepCircle, background: '#f59e0b' }}>2</div>
                    <div style={s.flowStepLabel}>IN PROG</div>
                  </div>
                  <div style={s.flowArrow}>→</div>
                  <div style={s.flowStep}>
                    <div style={{ ...s.flowStepCircle, background: '#10b981' }}>3</div>
                    <div style={s.flowStepLabel}>RESOLVED</div>
                  </div>
                  <div style={s.flowArrow}>→</div>
                  <div style={s.flowStep}>
                    <div style={{ ...s.flowStepCircle, background: '#6b7280' }}>4</div>
                    <div style={s.flowStepLabel}>CLOSED</div>
                  </div>
                </div>
                <div style={s.workflowText}>
                  Attach images, assign staff, add resolution notes, and keep a comment trail with ownership rules and SLA tracking.
                </div>
                <div style={s.workflowMeta}>
                  <span>✓ Image attachments</span>
                  <span>✓ Technician assignment</span>
                  <span>✓ SLA monitoring</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section id="roles" style={s.section}>
          <div style={s.sectionInner}>
            <div style={s.sectionHeader}>
              <span style={s.sectionTag}>Role-Based Access</span>
              <h2 style={s.h2}>Built for roles and accountability</h2>
              <p style={s.sectionP}>
                Granular permissions ensuring the right people have the right access
              </p>
            </div>

            <div style={s.roleGrid}>
              <div style={s.roleCard}>
                <div style={s.roleIcon}>👤</div>
                <div style={s.roleTitle}>Standard User</div>
                <ul style={s.roleList}>
                  <li>✓ Browse and search resource catalogue</li>
                  <li>✓ Request bookings with conflict prevention</li>
                  <li>✓ Create incident tickets with evidence</li>
                  <li>✓ Track requests and notifications</li>
                  <li>✓ Add comments to tickets</li>
                </ul>
                <div style={s.roleBadge}>Default Access</div>
              </div>

              <div style={{ ...s.roleCard, borderColor: '#6366f1', background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(34,197,94,0.02) 100%)' }}>
                <div style={s.roleIcon}>👑</div>
                <div style={s.roleTitle}>Administrator</div>
                <ul style={s.roleList}>
                  <li>✓ Approve/reject bookings with reasons</li>
                  <li>✓ View all bookings and tickets with filters</li>
                  <li>✓ Manage resource catalogue</li>
                  <li>✓ Assign technicians to tickets</li>
                  <li>✓ System-wide analytics dashboard</li>
                </ul>
                <div style={{ ...s.roleBadge, background: '#6366f1', color: '#fff' }}>Full Control</div>
              </div>
            </div>

            <div style={s.ctaBar}>
              <div style={s.ctaContent}>
                <div style={s.ctaTitle}>Ready to simplify campus operations?</div>
                <div style={s.ctaText}>
                  Start with authentication today, then expand modules step-by-step.
                </div>
              </div>
              <div style={s.ctaButtons}>
                {!user ? (
                  <>
                    <Link to="/register" style={s.primaryBtnLg}>Create Account</Link>
                    <Link to="/login" style={s.linkBtn}>Sign In</Link>
                  </>
                ) : (
                  <Link to={isAdmin() ? "/admin" : "/dashboard"} style={s.primaryBtnLg}>Open Dashboard</Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.footerBrand}>
            <div style={s.footerLogo}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#6366f1" strokeWidth="1.5"/>
                <path d="M2 17L12 22L22 17" stroke="#6366f1" strokeWidth="1.5"/>
                <path d="M2 12L12 17L22 12" stroke="#6366f1" strokeWidth="1.5"/>
              </svg>
              <span>SmartCampus</span>
            </div>
            <div style={s.footerMuted}>
              Built with Spring Boot + React for IT3030 (PAF) 2026.
            </div>
          </div>
          <div style={s.footerLinks}>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Product</div>
              <a href="#features">Features</a>
              <a href="#workflows">Workflows</a>
              <a href="#roles">Roles</a>
            </div>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Company</div>
              <a href="#">About</a>
              <a href="#">Contact</a>
              <a href="#">Support</a>
            </div>
            <div style={s.footerCol}>
              <div style={s.footerColTitle}>Legal</div>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </div>
        </div>
        <div style={s.footerBottom}>
          <div style={s.footerBottomInner}>
            © 2026 Smart Campus Operations Hub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Styles
const s = {
  page: {
    minHeight: '100vh',
    position: 'relative',
    overflowX: 'hidden',
  },

  bgGradient: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    overflow: 'hidden',
  },
  bgBlob1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '70%',
    height: '70%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%)',
    filter: 'blur(60px)',
  },
  bgBlob2: {
    position: 'absolute',
    bottom: '-10%',
    left: '-10%',
    width: '60%',
    height: '60%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0) 70%)',
    filter: 'blur(60px)',
  },
  bgBlob3: {
    position: 'absolute',
    top: '40%',
    left: '30%',
    width: '40%',
    height: '40%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0) 70%)',
    filter: 'blur(60px)',
  },

  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    transition: 'all 0.3s ease',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(226,232,240,0.6)',
  },
  headerScrolled: {
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    background: 'rgba(255,255,255,0.98)',
  },
  headerInner: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    textDecoration: 'none',
  },
  logoIcon: {
    display: 'flex',
    alignItems: 'center',
    color: '#6366f1',
  },
  brandText: {
    fontSize: 20,
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.3px',
  },

  nav: {
    display: 'flex',
    gap: 32,
    alignItems: 'center',
  },
  navLink: {
    textDecoration: 'none',
    color: '#475569',
    fontSize: 15,
    fontWeight: 500,
    transition: 'color 0.2s',
    ':hover': {
      color: '#6366f1',
    },
  },

  headerActions: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  linkBtn: {
    textDecoration: 'none',
    color: '#475569',
    padding: '8px 16px',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.2s',
    border: '1px solid #e2e8f0',
    background: '#fff',
  },
  primaryBtn: {
    textDecoration: 'none',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#fff',
    padding: '8px 20px',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
  },
  ghostBtn: {
    background: 'transparent',
    border: '1px solid #e2e8f0',
    padding: '8px 16px',
    borderRadius: 12,
    fontSize: 14,
    cursor: 'pointer',
    color: '#475569',
  },
  dashboardBtn: {
    textDecoration: 'none',
    background: '#f1f5f9',
    color: '#0f172a',
    padding: '8px 16px',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 500,
  },

  userPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '4px 12px 4px 4px',
    borderRadius: 40,
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 600,
    fontSize: 14,
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#0f172a',
  },
  userRole: {
    fontSize: 11,
    color: '#64748b',
  },

  hero: {
    padding: '80px 0 60px',
    position: 'relative',
  },
  heroInner: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 32px',
    display: 'grid',
    gridTemplateColumns: '1fr 0.9fr',
    gap: 60,
    alignItems: 'center',
  },
  heroContent: {
    maxWidth: 600,
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 16px',
    borderRadius: 40,
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.2)',
    fontSize: 13,
    fontWeight: 500,
    color: '#6366f1',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 0 0 rgba(34,197,94,0.7)',
    animation: 'pulse 2s infinite',
  },
  h1: {
    fontSize: 52,
    lineHeight: 1.1,
    letterSpacing: '-1.5px',
    margin: '24px 0 20px',
    color: '#0f172a',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #6366f1 0%, #22c55e 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroP: {
    fontSize: 18,
    lineHeight: 1.6,
    color: '#475569',
    marginBottom: 32,
  },
  heroCtas: {
    display: 'flex',
    gap: 16,
    marginBottom: 48,
  },
  primaryBtnLg: {
    textDecoration: 'none',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#fff',
    padding: '14px 28px',
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
  },
  secondaryBtnLg: {
    textDecoration: 'none',
    background: '#fff',
    color: '#475569',
    padding: '14px 28px',
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 600,
    border: '1px solid #e2e8f0',
  },
  heroStats: {
    display: 'flex',
    gap: 48,
  },
  stat: {},
  statNum: {
    fontSize: 32,
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.5px',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },

  heroVisual: {
    position: 'relative',
    minHeight: 450,
  },
  floatingCard: {
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(20px)',
    borderRadius: 28,
    border: '1px solid rgba(255,255,255,0.5)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    padding: 20,
    animation: 'float 3s ease-in-out infinite',
  },
  floatingCard2: {
    position: 'absolute',
    bottom: 20,
    left: -30,
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.5)',
    boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
    padding: 20,
    animation: 'floatReverse 3.5s ease-in-out infinite',
  },
  visualCard: {
    width: 320,
  },
  visualHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: '1px solid #e2e8f0',
  },
  visualTitle: {
    fontWeight: 700,
    color: '#0f172a',
  },
  liveBadge: {
    fontSize: 11,
    color: '#22c55e',
    fontWeight: 600,
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    fontSize: 24,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#0f172a',
  },
  activityTime: {
    fontSize: 12,
    color: '#64748b',
  },
  activityStatus: {
    fontSize: 11,
    padding: '4px 10px',
    borderRadius: 20,
    background: '#fef3c7',
    color: '#d97706',
    marginLeft: 'auto',
  },
  statsCard: {
    width: 200,
    textAlign: 'center',
  },
  statsValue: {
    fontSize: 48,
    fontWeight: 800,
    color: '#6366f1',
    letterSpacing: '-1px',
  },
  statsLabel: {
    fontSize: 13,
    color: '#475569',
    marginTop: 8,
  },
  statsTrend: {
    fontSize: 11,
    color: '#22c55e',
    marginTop: 8,
  },

  section: {
    padding: '80px 0',
  },
  sectionAlt: {
    padding: '80px 0',
    background: 'rgba(248,250,252,0.7)',
  },
  sectionInner: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 32px',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: 48,
  },
  sectionTag: {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: 40,
    background: 'rgba(99,102,241,0.1)',
    color: '#6366f1',
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 16,
  },
  h2: {
    fontSize: 36,
    letterSpacing: '-0.5px',
    marginBottom: 16,
    color: '#0f172a',
  },
  sectionP: {
    fontSize: 18,
    color: '#64748b',
    maxWidth: 700,
    margin: '0 auto',
    lineHeight: 1.6,
  },

  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 24,
  },
  card: {
    background: '#fff',
    borderRadius: 24,
    padding: 28,
    transition: 'transform 0.3s, box-shadow 0.3s',
    border: '1px solid #e2e8f0',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
    },
  },
  cardIconWrapper: {
    marginBottom: 20,
  },
  cardIconBg: {
    width: 56,
    height: 56,
    borderRadius: 18,
    background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(34,197,94,0.05) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 12,
    color: '#0f172a',
  },
  cardText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 1.6,
    marginBottom: 16,
  },
  cardLink: {
    textDecoration: 'none',
    color: '#6366f1',
    fontSize: 14,
    fontWeight: 500,
  },

  workflowGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 32,
  },
  workflowCard: {
    background: '#fff',
    borderRadius: 28,
    padding: 32,
    border: '1px solid #e2e8f0',
  },
  workflowHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  workflowTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 20,
    fontWeight: 700,
    color: '#0f172a',
  },
  workflowIcon: {
    fontSize: 28,
  },
  workflowTag: {
    padding: '6px 14px',
    borderRadius: 20,
    background: '#f1f5f9',
    fontSize: 12,
    fontWeight: 500,
    color: '#475569',
  },
  flowDiagram: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    padding: '20px 0',
  },
  flowStep: {
    textAlign: 'center',
  },
  flowStepCircle: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '#6366f1',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    marginBottom: 8,
  },
  flowStepLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#475569',
  },
  flowArrow: {
    fontSize: 24,
    color: '#cbd5e1',
  },
  workflowText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 1.6,
    marginBottom: 20,
  },
  workflowMeta: {
    display: 'flex',
    gap: 16,
    fontSize: 13,
    color: '#22c55e',
    paddingTop: 16,
    borderTop: '1px solid #e2e8f0',
  },

  roleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 32,
    marginBottom: 60,
  },
  roleCard: {
    background: '#fff',
    borderRadius: 28,
    padding: 36,
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s',
  },
  roleIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 20,
    color: '#0f172a',
  },
  roleList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 24px 0',
    'li': {
      padding: '8px 0',
      color: '#475569',
      fontSize: 15,
    },
  },
  roleBadge: {
    display: 'inline-block',
    padding: '8px 16px',
    borderRadius: 30,
    background: '#f1f5f9',
    fontSize: 13,
    fontWeight: 500,
    color: '#475569',
  },

  ctaBar: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    borderRadius: 28,
    padding: '48px 56px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaContent: {},
  ctaTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  ctaButtons: {
    display: 'flex',
    gap: 16,
  },

  footer: {
    background: '#0f172a',
    marginTop: 40,
  },
  footerInner: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '48px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 60,
  },
  footerBrand: {},
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 20,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 12,
  },
  footerMuted: {
    color: '#64748b',
    fontSize: 13,
  },
  footerLinks: {
    display: 'flex',
    gap: 60,
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    'a': {
      color: '#94a3b8',
      textDecoration: 'none',
      fontSize: 14,
      transition: 'color 0.2s',
      ':hover': {
        color: '#fff',
      },
    },
  },
  footerColTitle: {
    color: '#fff',
    fontWeight: 600,
    marginBottom: 4,
  },
  footerBottom: {
    borderTop: '1px solid #1e293b',
    padding: '20px 0',
  },
  footerBottomInner: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 32px',
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
  },
};

// Add animation keyframes to document
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes floatReverse {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(10px); }
  }
`;
document.head.appendChild(styleSheet);