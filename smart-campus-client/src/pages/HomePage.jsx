import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import NotificationPanel from '../components/NotificationPanel';
import heroBg from '../assets/hero-bg.jpg';

export default function HomePage() {
  const { user, logout, isAdmin, isManager, isTechnician, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoutClick = () => setShowLogoutConfirm(true);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/');
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    "Who can use Smart Campus?",
    "How do I book a facility?",
    "What happens after I report an incident?",
    "How long does booking approval take?",
    "Can I attach photos to an incident report?",
    "Is Smart Campus available on mobile?",
    "What if my booking request is rejected?"
  ];

  return (
    <div style={s.page}>
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
            <span style={s.brandText}>Smart<span style={{ color: '#f97316' }}>Campus</span></span>
          </Link>

          <nav style={s.nav}>
            <a href="#features" style={s.navLink}>Features</a>
            <a href="#how-it-works" style={s.navLink}>How it works</a>
            <a href="#faculties" style={s.navLink}>Faculties</a>
            <a href="#about" style={s.navLink}>About</a>
            <a href="#contact" style={s.navLink}>Contact</a>
          </nav>

          <div style={s.headerActions}>
            {!user ? (
              <>
                <Link to="/auth?mode=login" style={s.linkBtn}>Sign in</Link>
                <Link to="/auth?mode=register" style={s.primaryBtn}>Get started</Link>
              </>
            ) : (
              <>
                <div style={s.userPill}>
                  <div style={s.userAvatar}>
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div style={s.userInfo}>
                    <span style={s.userName}>{user.name?.split(' ')[0] || 'User'}</span>
                    <span style={s.userRole}>{isAdmin() ? 'Admin' : isManager() ? 'Manager' : isTechnician() ? 'Technician' : 'User'}</span>
                  </div>
                </div>
                <Link to={getDashboardPath()} style={s.dashboardBtn}>Dashboard</Link>
                <button onClick={handleLogoutClick} style={s.ghostBtn}>Logout</button>
                <NotificationPanel />
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ backgroundColor: '#ffffff' }}>
        {/* HERO SECTION */}
        <section style={{ ...s.hero, backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
          <div style={s.heroOverlay}></div>
          <div style={s.heroInner}>
            <div style={s.heroContent}>
              <div style={s.heroBadge}>
                <span style={s.pulseDot}></span>
                Campus Operations Hub — 2026
              </div>
              <h1 style={{ fontSize: '4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1, marginBottom: '24px', marginTop: '24px', letterSpacing: '-1px' }}>
                Your campus, <span style={s.gradientText}>managed smarter</span> and simpler
              </h1>
              <p style={s.heroP}>
                Book facilities, report incidents and track every request — built exclusively for the campus community across all faculties and campuses.
              </p>
              <div style={s.heroCtas}>
                <Link to="/auth?mode=register" style={s.primaryBtnLg}>
                  Get started for free →
                </Link>
                <a href="#how-it-works" style={{ ...s.secondaryBtnLg, padding: '14px 28px', color: '#fff' }}>
                  See how it works
                </a>
              </div>
              <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#cbd5e1', marginTop: '20px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✓ Free for all students and staff</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✓ All 7 faculties supported</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✓ Real-time notifications</span>
              </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <div style={{ background: '#121c32', padding: '40px 0', textAlign: 'center' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', padding: '0 32px' }}>
            <div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>500+</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#ea580c', letterSpacing: '1px', textTransform: 'uppercase' }}>CAMPUS RESOURCES</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>7</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#ea580c', letterSpacing: '1px', textTransform: 'uppercase' }}>FACULTIES SUPPORTED</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>10k+</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#ea580c', letterSpacing: '1px', textTransform: 'uppercase' }}>STUDENTS ENROLLED</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>24/7</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#ea580c', letterSpacing: '1px', textTransform: 'uppercase' }}>ALWAYS AVAILABLE</div>
            </div>
          </div>
        </div>

        {/* CORE CAPABILITIES */}
        <section id="features" style={s.sectionLight}>
          <div style={s.sectionInner}>
            <div style={s.sectionHeader}>
              <div style={s.tagOutline}>CORE CAPABILITIES</div>
              <h2 style={s.sectionTitleLight}>
                Everything your campus needs,<br/>
                <span style={{ color: '#ea580c' }}>in one smart hub</span>
              </h2>
              <p style={s.sectionSubtitleLight}>
                Streamline your academic life with tools built specifically for modern campus operations.
              </p>
            </div>

            <div style={s.capabilitiesGrid}>
              <div style={s.capCard}>
                <div style={s.capIconWrapper}>📅</div>
                <div style={s.capFeatureTag}>FEATURE 01</div>
                <h3 style={s.capTitle}>Book a facility</h3>
                <p style={s.capText}>
                  Browse available lecture halls, labs, meeting rooms and equipment. Check capacity and request bookings instantly.
                </p>
              </div>
              <div style={s.capCard}>
                <div style={s.capIconWrapper}>🔧</div>
                <div style={s.capFeatureTag}>FEATURE 02</div>
                <h3 style={s.capTitle}>Report an incident</h3>
                <p style={s.capText}>
                  Spotted a fault or maintenance issue? Submit a detailed report with photo evidence to get it fixed faster.
                </p>
              </div>
              <div style={s.capCard}>
                <div style={s.capIconWrapper}>🔔</div>
                <div style={s.capFeatureTag}>FEATURE 03</div>
                <h3 style={s.capTitle}>Track in real time</h3>
                <p style={s.capText}>
                  Receive instant notifications when your booking is confirmed or your incident ticket status is updated.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SIMPLE PROCESS */}
        <section id="how-it-works" style={s.sectionLightAlt}>
          <div style={s.sectionInner}>
            <div style={s.sectionHeader}>
              <div style={s.tagOutline}>SIMPLE PROCESS</div>
              <h2 style={s.sectionTitleLight}>Up and running in minutes</h2>
              <p style={s.sectionSubtitleLight}>
                No training needed. If you can use a website, you can use Smart Campus.
              </p>
            </div>

            <div style={s.processGrid}>
              <div style={s.processStep}>
                <div style={s.processIconCircle}>
                  <div style={s.processNumber}>01</div>
                  <span style={s.processIcon}>👤</span>
                </div>
                <h3 style={s.processTitle}>Create your account</h3>
                <p style={s.processText}>
                  Register with your student details. Students are active immediately — choose your faculty, academic year, and semester.
                </p>
              </div>
              <div style={s.processStep}>
                <div style={s.processIconCircle}>
                  <div style={s.processNumber}>02</div>
                  <span style={s.processIcon}>🔍</span>
                </div>
                <h3 style={s.processTitle}>Browse and request</h3>
                <p style={s.processText}>
                  Find available facilities and equipment across the campus. Submit a booking or report a fault in under a minute.
                </p>
              </div>
              <div style={s.processStep}>
                <div style={s.processIconCircle}>
                  <div style={s.processNumber}>03</div>
                  <span style={s.processIcon}>✅</span>
                </div>
                <h3 style={s.processTitle}>Track and get notified</h3>
                <p style={s.processText}>
                  Receive real-time notifications on every update. Your booking confirmation, ticket status changes — all in one place.
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <Link to="/auth?mode=register" style={s.darkBtn}>
                Start now — it's free
              </Link>
            </div>
          </div>
        </section>

        {/* INSTITUTIONAL REACH */}
        <section id="faculties" style={s.sectionDark}>
          <div style={s.sectionInner}>
            <div style={s.sectionHeader}>
              <div style={s.tagOutlineDark}>INSTITUTIONAL REACH</div>
              <h2 style={s.sectionTitleDark}>
                Built for <span style={{ color: '#ea580c' }}>every faculty</span>
              </h2>
              <p style={s.sectionSubtitleDark}>
                Discover the specialized resources and smart management systems tailored to each academic division at SLIIT.
              </p>
            </div>

            <div style={s.facultyGrid}>
              {[
                { code: 'FOC', name: 'Computing', icon: '💻' },
                { code: 'FOE', name: 'Engineering', icon: '⚙️' },
                { code: 'FOB', name: 'Business', icon: '📊' },
                { code: 'FOL', name: 'Law', icon: '⚖️' },
                { code: 'FOHS', name: 'Humanities & Sciences', icon: '🔬' },
                { code: 'FOGS', name: 'Graduate Studies', icon: '🎓' },
                { code: 'FOA', name: 'Architecture', icon: '🏛️' },
              ].map((faculty, i) => (
                <div key={i} style={s.facultyCard}>
                  <div style={s.facultyBgPlaceholder}></div>
                  <div style={s.facultyInfo}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={s.facultyCode}>{faculty.code}</span>
                      <span style={{ fontSize: '18px' }}>{faculty.icon}</span>
                    </div>
                    <h3 style={s.facultyName}>{faculty.name}</h3>
                  </div>
                </div>
              ))}
              <div style={s.facultyComingSoon}>
                <div style={{ color: '#ea580c', fontWeight: '700', fontSize: '14px', textAlign: 'center' }}>
                  MORE CAMPUSES<br/>COMING SOON
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SMART CAMPUS */}
        <section id="about" style={s.sectionLight}>
          <div style={s.sectionInner}>
            <div style={s.aboutContainer}>
              <div style={s.aboutLeft}>
                <div style={s.tagOutline}>ABOUT SMART CAMPUS</div>
                <h2 style={{ ...s.sectionTitleLight, textAlign: 'left', marginTop: '16px', marginBottom: '24px' }}>
                  Campus management,<br/><span style={{ color: '#ea580c' }}>finally done right</span>
                </h2>
                <p style={{ color: '#475569', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
                  Smart Campus was built to solve a real problem — managing bookings, tracking maintenance requests, and keeping everyone informed was scattered across emails, spreadsheets, and paper forms.
                </p>
                <p style={{ color: '#475569', fontSize: '16px', lineHeight: '1.6', marginBottom: '40px' }}>
                  We built a single, unified platform that replaces all of that. Whether you need a lab for your project group, want to report a broken AC unit, or simply need to know if Meeting Room B is free on Thursday morning — Smart Campus has you covered.
                </p>

                <div style={s.aboutFeaturesList}>
                  <div style={s.aboutFeatureItem}>
                    <div style={s.aboutFeatureIcon}>🛡️</div>
                    <div>
                      <h4 style={s.aboutFeatureTitle}>Secure by design</h4>
                      <p style={s.aboutFeatureText}>Role-based access ensures every user sees only what they need. Your data stays secure within the platform.</p>
                    </div>
                  </div>
                  <div style={s.aboutFeatureItem}>
                    <div style={s.aboutFeatureIcon}>⚡</div>
                    <div>
                      <h4 style={s.aboutFeatureTitle}>Built for speed</h4>
                      <p style={s.aboutFeatureText}>Real-time notifications and instant availability checks mean no more waiting or guessing.</p>
                    </div>
                  </div>
                  <div style={s.aboutFeatureItem}>
                    <div style={s.aboutFeatureIcon}>👥</div>
                    <div>
                      <h4 style={s.aboutFeatureTitle}>For the community</h4>
                      <p style={s.aboutFeatureText}>Designed around the daily needs of students, lecturers, and campus staff.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={s.aboutRight}>
                <div style={s.aboutStatsCard}>
                  <h3 style={{ fontSize: '32px', fontWeight: '800', color: '#ea580c', marginBottom: '16px' }}>Smart Campus</h3>
                  <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '40px' }}>The next generation of campus operations</p>
                  
                  <div style={s.aboutStatsGrid}>
                    <div style={s.aboutStatBox}>
                      <div style={s.aboutStatLabel}>Status</div>
                      <div style={s.aboutStatValue}>Operational</div>
                    </div>
                    <div style={s.aboutStatBox}>
                      <div style={s.aboutStatLabel}>Uptime</div>
                      <div style={s.aboutStatValue}>99.99%</div>
                    </div>
                    <div style={s.aboutStatBox}>
                      <div style={s.aboutStatLabel}>Support</div>
                      <div style={s.aboutStatValue}>24/7 Active</div>
                    </div>
                    <div style={s.aboutStatBox}>
                      <div style={s.aboutStatLabel}>Users</div>
                      <div style={s.aboutStatValue}>10k+ Registered</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" style={s.sectionLightAlt}>
          <div style={s.sectionInner}>
            <div style={s.sectionHeader}>
              <div style={s.tagOutline}>FAQ</div>
              <h2 style={s.sectionTitleLight}>Frequently asked questions</h2>
            </div>
            
            <div style={s.faqContainer}>
              {faqs.map((q, i) => (
                <div key={i} style={s.faqItem} onClick={() => toggleFaq(i)}>
                  <div style={s.faqQuestion}>
                    {q}
                    <span style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s', color: '#ea580c' }}>
                      ▼
                    </span>
                  </div>
                  {openFaq === i && (
                    <div style={s.faqAnswer}>
                      This is a placeholder answer for the frequently asked question. Smart Campus provides a unified hub for all these queries.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT US */}
        <section id="contact" style={s.sectionLight}>
          <div style={s.sectionInner}>
            <div style={s.contactContainer}>
              <div style={s.contactLeft}>
                <div style={s.tagOutline}>CONTACT US</div>
                <h2 style={{ ...s.sectionTitleLight, textAlign: 'left', marginTop: '16px', marginBottom: '24px' }}>We are here to help</h2>
                <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', marginBottom: '40px', maxWidth: '400px' }}>
                  Have a question about Smart Campus? Need help with your account? Reach out and we will get back to you as soon as possible.
                </p>
                
                <div style={s.contactInfoItem}>
                  <span style={s.contactInfoIcon}>✉️</span>
                  <span>support@smartcampus.com</span>
                </div>
                <div style={s.contactInfoItem}>
                  <span style={s.contactInfoIcon}>📞</span>
                  <span>+94 11 754 4801</span>
                </div>
                <div style={s.contactInfoItem}>
                  <span style={s.contactInfoIcon}>📍</span>
                  <span>New Kandy Rd, Malabe, Sri Lanka</span>
                </div>
              </div>

              <div style={s.contactRight}>
                <div style={s.contactFormBox}>
                  <div style={s.inputGroup}>
                    <label style={s.inputLabel}>Full name</label>
                    <input type="text" placeholder="Your full name" style={s.inputField} />
                  </div>
                  <div style={s.inputGroup}>
                    <label style={s.inputLabel}>Email address</label>
                    <input type="email" placeholder="your@email.com" style={s.inputField} />
                  </div>
                  <div style={s.inputGroup}>
                    <label style={s.inputLabel}>Message</label>
                    <textarea placeholder="How can we help you?" style={{ ...s.inputField, minHeight: '120px', resize: 'vertical' }}></textarea>
                  </div>
                  <button style={s.submitBtn}>Send message</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer style={s.newFooter}>
        <div style={s.newFooterInner}>
          <div style={s.footerLeft}>
            <div style={s.footerLogoContainer}>
              <div style={s.logoIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: '700', fontSize: '18px' }}>Smart Campus</div>
                <div style={{ color: '#ea580c', fontSize: '11px', fontWeight: '600' }}>Campus Operations</div>
              </div>
            </div>
            <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', maxWidth: '280px', marginTop: '20px' }}>
              A unified platform for booking facilities, reporting incidents, and managing campus operations.
            </p>
          </div>

          <div style={s.footerNav}>
            <div style={s.footerColTitle}>NAVIGATION</div>
            <a href="#features" style={s.footerLink}>Features</a>
            <a href="#how-it-works" style={s.footerLink}>How it works</a>
            <a href="#faculties" style={s.footerLink}>Faculties</a>
            <a href="#about" style={s.footerLink}>About</a>
            <a href="#faq" style={s.footerLink}>FAQ</a>
            <a href="#contact" style={s.footerLink}>Contact</a>
          </div>

          <div style={s.footerCta}>
            <div style={s.footerColTitle}>GET STARTED</div>
            <Link to="/auth?mode=register" style={s.footerPrimaryBtn}>Create account</Link>
            <Link to="/auth?mode=login" style={s.footerSecondaryBtn}>Sign in</Link>
          </div>
        </div>
      </footer>

      {/* LOGOUT MODAL */}
      {showLogoutConfirm && (
        <div style={s.modalOverlay}>
          <div style={s.modalCard}>
            <div style={s.modalIcon}>👋</div>
            <h3 style={s.modalTitle}>Log Out</h3>
            <p style={s.modalDest}>Are you sure you want to log out of your account?</p>
            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={() => setShowLogoutConfirm(false)}>No</button>
              <button style={s.confirmBtn} onClick={confirmLogout}>Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    position: 'relative',
    overflowX: 'hidden',
    backgroundColor: '#ffffff',
  },

  // HEADER STYLES
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    transition: 'all 0.3s ease',
    background: '#121c32',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  headerScrolled: {
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
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
    color: '#ffffff',
  },
  brandText: {
    fontSize: 20,
    fontWeight: 700,
    color: '#ffffff',
    letterSpacing: '-0.3px',
  },
  nav: {
    display: 'flex',
    gap: 32,
    alignItems: 'center',
  },
  navLink: {
    textDecoration: 'none',
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: 500,
  },
  headerActions: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  linkBtn: {
    textDecoration: 'none',
    color: '#cbd5e1',
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    border: '1px solid #334155',
    background: 'transparent',
  },
  primaryBtn: {
    textDecoration: 'none',
    background: '#ea580c',
    color: '#fff',
    padding: '8px 20px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
  },
  ghostBtn: {
    background: 'transparent',
    border: '1px solid #334155',
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 14,
    cursor: 'pointer',
    color: '#cbd5e1',
  },
  dashboardBtn: {
    textDecoration: 'none',
    background: '#1e293b',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
  },
  userPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '4px 12px 4px 4px',
    borderRadius: 40,
    background: '#1e293b',
    border: '1px solid #334155',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#ea580c',
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
    color: '#ffffff',
  },
  userRole: {
    fontSize: 11,
    color: '#94a3b8',
  },

  // HERO STYLES
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to right, rgba(18, 28, 50, 0.95) 0%, rgba(18, 28, 50, 0.7) 100%)',
    zIndex: 1,
  },
  hero: {
    padding: '80px 0 60px',
    position: 'relative',
  },
  heroInner: {
    position: 'relative',
    zIndex: 2,
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 32px',
  },
  heroContent: {
    maxWidth: 650,
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 16px',
    borderRadius: 40,
    background: 'rgba(234, 88, 12, 0.1)',
    border: '1px solid rgba(234, 88, 12, 0.2)',
    fontSize: 13,
    fontWeight: 500,
    color: '#ea580c',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 0 0 rgba(34,197,94,0.7)',
    animation: 'pulse 2s infinite',
  },
  gradientText: {
    color: '#ea580c',
  },
  heroP: {
    fontSize: 18,
    lineHeight: 1.6,
    color: '#cbd5e1',
    marginBottom: 32,
  },
  heroCtas: {
    display: 'flex',
    gap: 16,
  },
  primaryBtnLg: {
    textDecoration: 'none',
    background: '#ea580c',
    color: '#fff',
    padding: '14px 28px',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
  },
  secondaryBtnLg: {
    textDecoration: 'none',
    background: 'transparent',
    color: '#cbd5e1',
    padding: '14px 28px',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    border: '1px solid #475569',
  },

  // COMMON SECTION STYLES
  sectionLight: {
    padding: '100px 0',
    backgroundColor: '#ffffff',
  },
  sectionLightAlt: {
    padding: '100px 0',
    backgroundColor: '#fafafa',
  },
  sectionDark: {
    padding: '100px 0',
    backgroundColor: '#0b1325',
  },
  sectionInner: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 32px',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: 60,
  },
  tagOutline: {
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: 20,
    border: '1px solid #fed7aa',
    color: '#ea580c',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '1px',
    marginBottom: 20,
    textTransform: 'uppercase'
  },
  tagOutlineDark: {
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: 20,
    border: '1px solid #7c2d12',
    color: '#ea580c',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '1px',
    marginBottom: 20,
    textTransform: 'uppercase'
  },
  sectionTitleLight: {
    fontSize: 42,
    fontWeight: 800,
    color: '#1e293b',
    lineHeight: 1.2,
    marginBottom: 16,
  },
  sectionTitleDark: {
    fontSize: 42,
    fontWeight: 800,
    color: '#ffffff',
    lineHeight: 1.2,
    marginBottom: 16,
  },
  sectionSubtitleLight: {
    fontSize: 18,
    color: '#64748b',
    maxWidth: 600,
    margin: '0 auto',
    lineHeight: 1.6,
  },
  sectionSubtitleDark: {
    fontSize: 18,
    color: '#94a3b8',
    maxWidth: 600,
    margin: '0 auto',
    lineHeight: 1.6,
  },

  // CORE CAPABILITIES CARDS
  capabilitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 32,
  },
  capCard: {
    background: '#ffffff',
    borderRadius: 20,
    padding: '40px 30px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    textAlign: 'left'
  },
  capIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    border: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    marginBottom: 30,
    color: '#1e293b'
  },
  capFeatureTag: {
    fontSize: 11,
    fontWeight: 700,
    color: '#94a3b8',
    letterSpacing: '1px',
    marginBottom: 10,
  },
  capTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 16,
  },
  capText: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 1.6,
  },

  // SIMPLE PROCESS
  processGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 40,
    marginTop: 40,
  },
  processStep: {
    textAlign: 'center',
    position: 'relative'
  },
  processIconCircle: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    border: '2px solid #ea580c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    position: 'relative'
  },
  processNumber: {
    position: 'absolute',
    top: -5,
    right: -5,
    background: '#ea580c',
    color: '#fff',
    width: 24,
    height: 24,
    borderRadius: '50%',
    fontSize: 11,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  processIcon: {
    fontSize: 32,
    color: '#1e293b'
  },
  processTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 12,
  },
  processText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 1.6,
  },
  darkBtn: {
    display: 'inline-block',
    background: '#1e293b',
    color: '#ffffff',
    padding: '16px 32px',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 16,
  },

  // INSTITUTIONAL REACH (FACULTIES)
  facultyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 24,
  },
  facultyCard: {
    background: '#1e293b',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  facultyBgPlaceholder: {
    height: 180,
    background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
  },
  facultyInfo: {
    padding: '20px',
    background: 'rgba(30, 41, 59, 0.95)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTop: '1px solid rgba(255,255,255,0.1)'
  },
  facultyCode: {
    display: 'inline-block',
    background: '#ea580c',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
  },
  facultyName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 600,
  },
  facultyComingSoon: {
    background: '#0b1325',
    border: '2px dashed #334155',
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
  },

  // ABOUT
  aboutContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 80,
  },
  aboutLeft: {
    flex: 1,
  },
  aboutFeaturesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  aboutFeatureItem: {
    display: 'flex',
    gap: 16,
  },
  aboutFeatureIcon: {
    width: 40,
    height: 40,
    background: '#f1f5f9',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    flexShrink: 0
  },
  aboutFeatureTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 6,
  },
  aboutFeatureText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 1.5,
  },
  aboutRight: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center'
  },
  aboutStatsCard: {
    background: '#121c32',
    borderRadius: 24,
    padding: '50px 40px',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
  },
  aboutStatsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
  },
  aboutStatBox: {
    background: '#1e293b',
    padding: '20px',
    borderRadius: 12,
  },
  aboutStatLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
  },
  aboutStatValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 700,
  },

  // FAQ
  faqContainer: {
    maxWidth: 800,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  faqItem: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
    cursor: 'pointer'
  },
  faqQuestion: {
    padding: '20px 24px',
    fontSize: 16,
    fontWeight: 600,
    color: '#1e293b',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqAnswer: {
    padding: '0 24px 20px',
    fontSize: 15,
    color: '#64748b',
    lineHeight: 1.6,
  },

  // CONTACT
  contactContainer: {
    display: 'flex',
    gap: 80,
  },
  contactLeft: {
    flex: 1,
    paddingTop: 20,
  },
  contactInfoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    color: '#475569',
    fontSize: 15,
  },
  contactInfoIcon: {
    width: 40,
    height: 40,
    background: '#f1f5f9',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
  },
  contactRight: {
    flex: 1,
  },
  contactFormBox: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    padding: '40px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: 8,
  },
  inputField: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    fontSize: 15,
    outline: 'none',
    fontFamily: 'inherit'
  },
  submitBtn: {
    width: '100%',
    background: '#121c32',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer'
  },

  // NEW FOOTER
  newFooter: {
    background: '#0b1325',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  newFooterInner: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '60px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 40,
  },
  footerLeft: {
    flex: 2,
  },
  footerLogoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  footerNav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  footerCta: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  footerColTitle: {
    color: '#ea580c',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '1px',
    marginBottom: 8,
  },
  footerLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: 14,
  },
  footerPrimaryBtn: {
    background: '#ea580c',
    color: '#fff',
    textDecoration: 'none',
    padding: '10px 16px',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    textAlign: 'center',
  },
  footerSecondaryBtn: {
    background: 'transparent',
    color: '#cbd5e1',
    textDecoration: 'none',
    padding: '10px 16px',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    border: '1px solid #334155',
    textAlign: 'center',
  },

  // MODAL
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalCard: {
    background: '#1e293b',
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  modalIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  modalTitle: {
    margin: '0 0 12px',
    fontSize: '22px',
    color: '#f8fafc',
    fontWeight: 700
  },
  modalDest: {
    margin: '0 0 32px',
    fontSize: '14px',
    color: '#94a3b8',
    lineHeight: 1.6
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
  },
  cancelBtn: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: '1px solid #334155',
    background: 'transparent',
    color: '#cbd5e1',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '14px'
  },
  confirmBtn: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    background: '#ea580c',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '14px',
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
  }
`;
if (!document.getElementById('home-page-animations')) {
  styleSheet.id = 'home-page-animations';
  document.head.appendChild(styleSheet);
}