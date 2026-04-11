import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import NotificationPanel from '../components/NotificationPanel';
import heroBg from '../assets/hero-bg.jpg';
import computingFacultyBg from '../assets/faculties/computing.png';
import engineeringFacultyBg from '../assets/faculties/engineering.png';
import businessFacultyBg from '../assets/faculties/business.png';
import lawFacultyBg from '../assets/faculties/law.png';
import humanitiesFacultyBg from '../assets/faculties/humanities-sciences.png';
import graduateStudiesFacultyBg from '../assets/faculties/graduate-studies.png';
import architectureFacultyBg from '../assets/faculties/architecture.png';

export default function HomePage() {
  const { user, logout, isAdmin, isManager, isTechnician, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  
  // Animation states
  const [counts, setCounts] = useState({ resources: 0, faculties: 0, students: 0 });
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const processRef = useRef(null);
  const facultiesRef = useRef(null);
  const aboutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-section');
            if (entry.target.id === 'stats-section') {
              setStatsVisible(true);
            }
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    const sections = [featuresRef.current, processRef.current, facultiesRef.current, aboutRef.current];
    sections.forEach((section) => {
      if (section) observer.observe(section);
    });
    if (statsRef.current) observer.observe(statsRef.current);

    return () => observer.disconnect();
  }, []);

  // Count-up animation for stats
  useEffect(() => {
    if (!statsVisible) return;
    
    const duration = 2000;
    const stepTime = 20;
    const steps = duration / stepTime;
    
    const targetResources = 500;
    const targetFaculties = 7;
    const targetStudents = 10000;
    
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      const progress = Math.min(1, currentStep / steps);
      setCounts({
        resources: Math.floor(progress * targetResources),
        faculties: Math.floor(progress * targetFaculties),
        students: Math.floor(progress * targetStudents),
      });
      
      if (progress === 1) clearInterval(interval);
    }, stepTime);
    
    return () => clearInterval(interval);
  }, [statsVisible]);

  const handleLogoutClick = () => setShowLogoutConfirm(true);
  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/');
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const facultyCards = [
    { code: 'FOC', name: 'Computing', image: computingFacultyBg, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
    { code: 'FOE', name: 'Engineering', image: engineeringFacultyBg, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
    { code: 'FOB', name: 'Business', image: businessFacultyBg, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    { code: 'FOL', name: 'Law', image: lawFacultyBg, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h18"/><path d="M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg> },
    { code: 'FOHS', name: 'Humanities & Sciences', image: humanitiesFacultyBg, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg> },
    { code: 'FOGS', name: 'Graduate Studies', image: graduateStudiesFacultyBg, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
    { code: 'FOA', name: 'Architecture', image: architectureFacultyBg, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 22 7"/><line x1="6" y1="22" x2="6" y2="11"/><line x1="10" y1="22" x2="10" y2="11"/><line x1="14" y1="22" x2="14" y2="11"/><line x1="18" y1="22" x2="18" y2="11"/><line x1="2" y1="22" x2="22" y2="22"/></svg> },
  ];

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
          <Link to="/" style={s.brand} className="hover-lift">
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
            <a href="#features" style={s.navLink} className="nav-link">Features</a>
            <a href="#how-it-works" style={s.navLink} className="nav-link">How it works</a>
            <a href="#faculties" style={s.navLink} className="nav-link">Faculties</a>
            <a href="#about" style={s.navLink} className="nav-link">About</a>
            <a href="#contact" style={s.navLink} className="nav-link">Contact</a>
          </nav>

          <div style={s.headerActions}>
            {!user ? (
              <>
                <Link to="/auth?mode=login" style={s.linkBtn} className="hover-scale">Sign in</Link>
                <Link to="/auth?mode=register" style={s.primaryBtn} className="hover-scale">Get started</Link>
              </>
            ) : (
              <>
                <div style={s.userPill} className="hover-lift">
                  <div style={s.userAvatar}>
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div style={s.userInfo}>
                    <span style={s.userName}>{user.name?.split(' ')[0] || 'User'}</span>
                    <span style={s.userRole}>{isAdmin() ? 'Admin' : isManager() ? 'Manager' : isTechnician() ? 'Technician' : 'User'}</span>
                  </div>
                </div>
                <Link to={getDashboardPath()} style={s.dashboardBtn} className="hover-scale">Dashboard</Link>
                <button onClick={handleLogoutClick} style={s.ghostBtn} className="hover-scale">Logout</button>
                <NotificationPanel />
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ backgroundColor: '#ffffff' }}>
        {/* HERO SECTION with animated background */}
        <section style={s.hero} className="hero-section">
          {/* Animated background div */}
          <div className="hero-bg-animated" style={{ backgroundImage: `url(${heroBg})` }}></div>
          <div style={s.heroOverlay}></div>
          <div style={s.heroInner}>
            <div style={s.heroContent} className="fade-up">
              <div style={s.heroBadge} className="pulse-badge floating-badge">
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
                <Link to="/auth?mode=register" style={s.primaryBtnLg} className="hover-glow">
                  Get started for free →
                </Link>
                <a href="#how-it-works" style={{ ...s.secondaryBtnLg, padding: '14px 28px', color: '#fff' }} className="hover-glow">
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
        <div ref={statsRef} id="stats-section" style={{ background: '#121c32', padding: '40px 0', textAlign: 'center' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', padding: '0 32px' }}>
            <div className="stat-item">
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '8px' }} className="stat-number">{counts.resources}+</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#ea580c', letterSpacing: '1px', textTransform: 'uppercase' }}>CAMPUS RESOURCES</div>
            </div>
            <div className="stat-item">
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '8px' }} className="stat-number">{counts.faculties}</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#ea580c', letterSpacing: '1px', textTransform: 'uppercase' }}>FACULTIES SUPPORTED</div>
            </div>
            <div className="stat-item">
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '8px' }} className="stat-number">{counts.students.toLocaleString()}+</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#ea580c', letterSpacing: '1px', textTransform: 'uppercase' }}>STUDENTS ENROLLED</div>
            </div>
            <div className="stat-item">
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>24/7</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#ea580c', letterSpacing: '1px', textTransform: 'uppercase' }}>ALWAYS AVAILABLE</div>
            </div>
          </div>
        </div>

        {/* CORE CAPABILITIES */}
        <section id="features" ref={featuresRef} style={s.sectionLight} className="animate-on-scroll">
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
              <div style={s.capCard} className="feature-card hover-lift">
                <div style={s.capIconWrapper}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div style={s.capFeatureTag}>FEATURE 01</div>
                <h3 style={s.capTitle}>Book a facility</h3>
                <p style={s.capText}>
                  Browse available lecture halls, labs, meeting rooms and equipment. Check capacity and request bookings instantly.
                </p>
              </div>
              <div style={s.capCard} className="feature-card hover-lift" style={{ transitionDelay: '0.1s' }}>
                <div style={s.capIconWrapper}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                </div>
                <div style={s.capFeatureTag}>FEATURE 02</div>
                <h3 style={s.capTitle}>Report an incident</h3>
                <p style={s.capText}>
                  Spotted a fault or maintenance issue? Submit a detailed report with photo evidence to get it fixed faster.
                </p>
              </div>
              <div style={s.capCard} className="feature-card hover-lift" style={{ transitionDelay: '0.2s' }}>
                <div style={s.capIconWrapper}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </div>
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
        <section id="how-it-works" ref={processRef} style={s.sectionLightAlt} className="animate-on-scroll">
          <div style={s.sectionInner}>
            <div style={s.sectionHeader}>
              <div style={s.tagOutline}>SIMPLE PROCESS</div>
              <h2 style={s.sectionTitleLight}>Up and running in minutes</h2>
              <p style={s.sectionSubtitleLight}>
                No training needed. If you can use a website, you can use Smart Campus.
              </p>
            </div>

            <div style={s.processGrid}>
              <div className="process-step hover-lift" style={{ transitionDelay: '0s' }}>
                <div style={s.processIconCircle}>
                  <div style={s.processNumber}>01</div>
                  <span style={s.processIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </span>
                </div>
                <h3 style={s.processTitle}>Create your account</h3>
                <p style={s.processText}>
                  Register with your student details. Students are active immediately — choose your faculty, academic year, and semester.
                </p>
              </div>
              <div className="process-step hover-lift" style={{ transitionDelay: '0.1s' }}>
                <div style={s.processIconCircle}>
                  <div style={s.processNumber}>02</div>
                  <span style={s.processIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </span>
                </div>
                <h3 style={s.processTitle}>Browse and request</h3>
                <p style={s.processText}>
                  Find available facilities and equipment across the campus. Submit a booking or report a fault in under a minute.
                </p>
              </div>
              <div className="process-step hover-lift" style={{ transitionDelay: '0.2s' }}>
                <div style={s.processIconCircle}>
                  <div style={s.processNumber}>03</div>
                  <span style={s.processIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </span>
                </div>
                <h3 style={s.processTitle}>Track and get notified</h3>
                <p style={s.processText}>
                  Receive real-time notifications on every update. Your booking confirmation, ticket status changes — all in one place.
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <Link to="/auth?mode=register" style={s.darkBtn} className="hover-glow">
                Start now — it's free
              </Link>
            </div>
          </div>
        </section>

        {/* INSTITUTIONAL REACH */}
        <section id="faculties" ref={facultiesRef} style={s.sectionDark} className="animate-on-scroll">
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
              {facultyCards.map((faculty, i) => (
                <div key={i} style={s.facultyCard} className="faculty-card hover-lift">
                  <div
                    style={{
                      ...s.facultyBgPlaceholder,
                      backgroundImage: `linear-gradient(180deg, rgba(11, 19, 37, 0.08) 0%, rgba(11, 19, 37, 0.55) 100%), url(${faculty.image})`,
                    }}
                  ></div>
                  <div style={s.facultyInfo}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={s.facultyCode}>{faculty.code}</span>
                      <div style={s.facultyIconWrap}>{faculty.icon}</div>
                    </div>
                    <h3 style={s.facultyName}>{faculty.name}</h3>
                  </div>
                </div>
              ))}
              <div style={s.facultyComingSoon} className="hover-scale">
                <div style={{ color: '#ea580c', fontWeight: '700', fontSize: '14px', textAlign: 'center' }}>
                  MORE CAMPUSES<br/>COMING SOON
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SMART CAMPUS */}
        <section id="about" ref={aboutRef} style={s.sectionLight} className="animate-on-scroll">
          <div style={s.sectionInner}>
            <div style={s.aboutContainer}>
              <div style={s.aboutLeft} className="fade-up">
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
                  <div className="about-feature hover-lift">
                    <div style={s.aboutFeatureIcon}>🛡️</div>
                    <div>
                      <h4 style={s.aboutFeatureTitle}>Secure by design</h4>
                      <p style={s.aboutFeatureText}>Role-based access ensures every user sees only what they need. Your data stays secure within the platform.</p>
                    </div>
                  </div>
                  <div className="about-feature hover-lift" style={{ transitionDelay: '0.1s' }}>
                    <div style={s.aboutFeatureIcon}>⚡</div>
                    <div>
                      <h4 style={s.aboutFeatureTitle}>Built for speed</h4>
                      <p style={s.aboutFeatureText}>Real-time notifications and instant availability checks mean no more waiting or guessing.</p>
                    </div>
                  </div>
                  <div className="about-feature hover-lift" style={{ transitionDelay: '0.2s' }}>
                    <div style={s.aboutFeatureIcon}>👥</div>
                    <div>
                      <h4 style={s.aboutFeatureTitle}>For the community</h4>
                      <p style={s.aboutFeatureText}>Designed around the daily needs of students, lecturers, and campus staff.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={s.aboutRight} className="fade-up" style={{ animationDelay: '0.2s' }}>
                <div style={s.aboutStatsCard} className="hover-lift">
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
                <div key={i} style={s.faqItem} onClick={() => toggleFaq(i)} className="faq-item hover-lift">
                  <div style={s.faqQuestion}>
                    {q}
                    <span style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: '0.3s ease', color: '#ea580c' }}>
                      ▼
                    </span>
                  </div>
                  {openFaq === i && (
                    <div style={s.faqAnswer} className="fade-in">
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
              <div style={s.contactLeft} className="fade-up">
                <div style={s.tagOutline}>CONTACT US</div>
                <h2 style={{ ...s.sectionTitleLight, textAlign: 'left', marginTop: '16px', marginBottom: '24px' }}>We are here to help</h2>
                <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', marginBottom: '40px', maxWidth: '400px' }}>
                  Have a question about Smart Campus? Need help with your account? Reach out and we will get back to you as soon as possible.
                </p>
                
                <div style={s.contactInfoItem} className="hover-lift">
                  <span style={s.contactInfoIcon}>✉️</span>
                  <span>support@smartcampus.com</span>
                </div>
                <div style={s.contactInfoItem} className="hover-lift" style={{ transitionDelay: '0.1s' }}>
                  <span style={s.contactInfoIcon}>📞</span>
                  <span>+94 11 754 4801</span>
                </div>
                <div style={s.contactInfoItem} className="hover-lift" style={{ transitionDelay: '0.2s' }}>
                  <span style={s.contactInfoIcon}>📍</span>
                  <span>New Kandy Rd, Malabe, Sri Lanka</span>
                </div>
              </div>

              <div style={s.contactRight} className="fade-up" style={{ animationDelay: '0.2s' }}>
                <div style={s.contactFormBox} className="hover-lift">
                  <div style={s.inputGroup}>
                    <label style={s.inputLabel}>Full name</label>
                    <input type="text" placeholder="Your full name" style={s.inputField} className="input-focus" />
                  </div>
                  <div style={s.inputGroup}>
                    <label style={s.inputLabel}>Email address</label>
                    <input type="email" placeholder="your@email.com" style={s.inputField} className="input-focus" />
                  </div>
                  <div style={s.inputGroup}>
                    <label style={s.inputLabel}>Message</label>
                    <textarea placeholder="How can we help you?" style={{ ...s.inputField, minHeight: '120px', resize: 'vertical' }} className="input-focus"></textarea>
                  </div>
                  <button style={s.submitBtn} className="hover-glow">Send message</button>
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
            <a href="#features" style={s.footerLink} className="footer-link">Features</a>
            <a href="#how-it-works" style={s.footerLink} className="footer-link">How it works</a>
            <a href="#faculties" style={s.footerLink} className="footer-link">Faculties</a>
            <a href="#about" style={s.footerLink} className="footer-link">About</a>
            <a href="#faq" style={s.footerLink} className="footer-link">FAQ</a>
            <a href="#contact" style={s.footerLink} className="footer-link">Contact</a>
          </div>

          <div style={s.footerCta}>
            <div style={s.footerColTitle}>GET STARTED</div>
            <Link to="/auth?mode=register" style={s.footerPrimaryBtn} className="hover-scale">Create account</Link>
            <Link to="/auth?mode=login" style={s.footerSecondaryBtn} className="hover-scale">Sign in</Link>
          </div>
        </div>
      </footer>

      {/* LOGOUT MODAL */}
      {showLogoutConfirm && (
        <div style={s.modalOverlay}>
          <div style={s.modalCard} className="modal-popup">
            <div style={s.modalIcon}>👋</div>
            <h3 style={s.modalTitle}>Log Out</h3>
            <p style={s.modalDest}>Are you sure you want to log out of your account?</p>
            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={() => setShowLogoutConfirm(false)} className="hover-scale">No</button>
              <button style={s.confirmBtn} onClick={confirmLogout} className="hover-glow">Yes</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Base animations */
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 5px rgba(234, 88, 12, 0.3); }
          50% { box-shadow: 0 0 20px rgba(234, 88, 12, 0.6); }
        }

        /* Ken Burns zoom effect for hero background */
        @keyframes kenBurns {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
          }
        }

        /* Hero section animated background */
        .hero-bg-animated {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          z-index: 0;
          animation: kenBurns 20s ease-in-out infinite;
          will-change: transform;
        }

        /* Floating badge animation */
        .floating-badge {
          animation: float 3s ease-in-out infinite;
        }

        /* Scroll-triggered animations */
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .animate-on-scroll.animate-section {
          opacity: 1;
          transform: translateY(0);
        }

        .fade-up {
          animation: fadeUp 0.8s ease-out forwards;
        }

        .fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }

        /* Hover effects */
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 30px -15px rgba(0, 0, 0, 0.2);
        }

        .hover-scale {
          transition: transform 0.2s ease;
        }

        .hover-scale:hover {
          transform: scale(1.05);
        }

        .hover-glow {
          transition: all 0.3s ease;
        }

        .hover-glow:hover {
          box-shadow: 0 0 15px rgba(234, 88, 12, 0.5);
          transform: translateY(-2px);
        }

        /* Specific element animations */
        .feature-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.15);
          border-color: #ea580c;
        }

        .process-step {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .process-step:hover {
          transform: translateY(-5px);
        }

        .process-step:hover .process-icon-circle {
          border-color: #ea580c;
          background: rgba(234, 88, 12, 0.05);
        }

        .faculty-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .faculty-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.3);
        }

        .faculty-card:hover > div:first-child {
          transform: scale(1.06);
        }

        .about-feature {
          transition: all 0.3s ease;
          cursor: pointer;
          padding: 10px;
          border-radius: 12px;
        }

        .about-feature:hover {
          background: #f8fafc;
          transform: translateX(5px);
        }

        .faq-item {
          transition: all 0.3s ease;
        }

        .faq-item:hover {
          border-color: #ea580c;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }

        .stat-item {
          transition: all 0.3s ease;
          cursor: default;
        }

        .stat-item:hover .stat-number {
          transform: scale(1.1);
          color: #ea580c;
        }

        .stat-number {
          transition: transform 0.3s ease, color 0.3s ease;
          display: inline-block;
        }

        .nav-link {
          position: relative;
          transition: color 0.3s ease;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 0;
          height: 2px;
          background: #ea580c;
          transition: width 0.3s ease;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .nav-link:hover {
          color: #ffffff;
        }

        .footer-link {
          transition: all 0.3s ease;
          display: inline-block;
        }

        .footer-link:hover {
          color: #ea580c;
          transform: translateX(5px);
        }

        .input-focus {
          transition: all 0.3s ease;
        }

        .input-focus:focus {
          border-color: #ea580c;
          box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1);
          outline: none;
        }

        .modal-popup {
          animation: scaleIn 0.3s ease-out;
        }

        .pulse-badge {
          animation: float 3s ease-in-out infinite;
        }

        /* Hero section overlay */
        .hero-section {
          position: relative;
          overflow: hidden;
        }
      `}</style>
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
    minHeight: 280,
    border: '1px solid rgba(255,255,255,0.05)',
  },
  facultyBgPlaceholder: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    transition: 'transform 0.5s ease',
  },
  facultyInfo: {
    padding: '20px',
    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.92) 38%, rgba(15, 23, 42, 0.98) 100%)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTop: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(4px)'
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
  facultyIconWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(234, 88, 12, 0.1)',
    borderRadius: '8px',
    padding: '6px'
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