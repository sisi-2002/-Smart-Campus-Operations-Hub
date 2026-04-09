import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import MfaSetupPage from './MfaSetupPage';
import MfaVerifyPage from './MfaVerifyPage';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeField, setActiveField] = useState(null);
  
  // Validation states (simplified)
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  
  const [mfaState, setMfaState] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const errorParam = params.get('error');

  if (errorParam) {
    if (errorParam === 'oauth2_failed') {
      setError('Google Sign-In failed. Please try again.');
    } else if (errorParam === 'session_expired') {
      setError('Your session has expired. Please log in again.');
    } else if (errorParam === 'idle_timeout') {
      setError('You were logged out after 20 minutes of inactivity.');
    } else {
      setError(decodeURIComponent(errorParam));
    }

    window.history.replaceState({}, document.title, location.pathname);
  }
}, [location]);

  // Email validation (strict)
  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid university email address';
    return '';
  };

  // ✅ Password validation: only check if not empty (no complexity rules)
  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'email') setEmailError(validateEmail(value));
    if (name === 'password') setPasswordError(validatePassword(value));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'email') setEmailError(validateEmail(form.email));
    if (field === 'password') setPasswordError(validatePassword(form.password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(form.email);
    const passwordErr = validatePassword(form.password);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setTouched({ email: true, password: true });
    if (emailErr || passwordErr) {
      setError('Please fix the errors before continuing');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const data = res.data;
      if (data.status === 'SUCCESS') {
        const { token, ...userData } = data;
        login(token, userData);
        const nextPath = userData.role === 'ADMIN'
          ? '/admin'
          : userData.role === 'TECHNICIAN'
            ? '/technician'
            : '/';
        navigate(nextPath, { replace: true });
        return;
      }
      if (data.status === 'MFA_SETUP_REQUIRED') {
        setMfaState({
          status: 'MFA_SETUP_REQUIRED',
          userId: data.id,
          qrCodeUri: data.qrCodeUri,
          secretKey: data.secretKey,
        });
        return;
      }
      if (data.status === 'MFA_CODE_REQUIRED') {
        setMfaState({
          status: 'MFA_CODE_REQUIRED',
          userId: data.id,
        });
        return;
      }
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error || data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      (import.meta.env.VITE_SERVER_URL?.trim() || 'http://localhost:8083') +
      '/oauth2/authorization/google';
  };

  if (mfaState?.status === 'MFA_SETUP_REQUIRED') {
    return <MfaSetupPage userId={mfaState.userId} qrCodeUri={mfaState.qrCodeUri} secretKey={mfaState.secretKey} />;
  }
  if (mfaState?.status === 'MFA_CODE_REQUIRED') {
    return <MfaVerifyPage userId={mfaState.userId} />;
  }

  // Modern Smart Campus UI (same as before)
  return (
    <div style={styles.page}>
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
            <circle cx="200" cy="250" r="14" fill="#4f46e5" opacity="0.7" style={{ animation: activeField === 'email' ? 'pulseNode 1.8s infinite' : 'none' }}>
              <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite" />
            </circle>
            
            <circle cx="500" cy="180" r="12" fill="#06b6d4" opacity="0.7" style={{ animation: activeField === 'password' ? 'pulseNode 1.8s infinite' : 'none' }}>
              <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
            </circle>
            
          </g>
        </svg>
      </div>

      <div style={styles.formContainer}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.logo}>
              <div style={styles.logoIcon}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
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
            <h1>Welcome back</h1>
            <p className="login-subtitle">Access your smart campus experience</p>
          </div>

          {error && (
            <div style={styles.error} role="alert">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>University Email</label>
              <div style={{...styles.inputWrapper, borderColor: emailError && touched.email ? '#ef4444' : '#334155'}}>
                <span style={styles.inputIcon}>📧</span>
                <input
                  id="email"
                  style={{...styles.input, borderColor: emailError && touched.email ? '#ef4444' : 'transparent'}}
                  type="email"
                  name="email"
                  placeholder="student@university.edu"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setActiveField('email')}
                  onBlur={() => { setActiveField(null); handleBlur('email'); }}
                  autoComplete="email"
                  required
                />
              </div>
              {touched.email && emailError && <div style={styles.fieldError}>{emailError}</div>}
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <div style={{...styles.inputWrapper, borderColor: passwordError && touched.password ? '#ef4444' : '#334155'}}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  id="password"
                  style={{...styles.input, borderColor: passwordError && touched.password ? '#ef4444' : 'transparent'}}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setActiveField('password')}
                  onBlur={() => { setActiveField(null); handleBlur('password'); }}
                  autoComplete="current-password"
                  required
                />
                <button type="button" style={styles.passwordToggle} onClick={() => setShowPassword(prev => !prev)}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {touched.password && passwordError && <div style={styles.fieldError}>{passwordError}</div>}
            </div>

            <div style={styles.options}>
              <label style={styles.checkbox}>
                <input type="checkbox" style={styles.checkboxInput} />
                <span>Remember device</span>
              </label>
              <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
            </div>

            <button style={styles.loginBtn} type="submit" disabled={loading}>
              {loading ? <span style={styles.loader} /> : 'Sign in →'}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>or continue with</span>
          </div>

          <button type="button" style={styles.googleBtn} onClick={handleGoogleLogin}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>

          <div style={styles.register}>
            New to Smart Campus? <Link to="/register" style={styles.registerLink}>Create account →</Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatBG { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(-1%,-1%) scale(1.02); } }
        @keyframes pulseNode { 0% { opacity: 0.4; r: 8; } 50% { opacity: 1; r: 18; } 100% { opacity: 0.4; r: 8; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dataFlow { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .login-subtitle { color: #94a3b8; font-size: 0.9rem; margin-top: 8px; }
      `}</style>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif", background: '#0b0f19' },
  bgCanvas: { position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse at 20% 30%, #0f172a, #020617)', overflow: 'hidden' },
  glowOrb1: { position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(6,182,212,0.1) 50%, transparent 70%)', borderRadius: '50%', filter: 'blur(80px)', animation: 'floatBG 15s ease-in-out infinite alternate' },
  glowOrb2: { position: 'absolute', bottom: '-20%', right: '-10%', width: '55%', height: '55%', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(236,72,153,0.1) 50%, transparent 70%)', borderRadius: '50%', filter: 'blur(80px)', animation: 'floatBG 18s ease-in-out infinite alternate-reverse' },
  gridOverlay: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(51,65,85,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(51,65,85,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.5 },
  dataStream: { position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #4f46e5, #06b6d4, transparent)', animation: 'dataFlow 6s linear infinite' },
  networkSvg: { position: 'absolute', width: '120%', height: '120%', top: '-10%', left: '-10%', opacity: 0.5 },
  formContainer: { position: 'relative', zIndex: 10, width: '100%', maxWidth: '480px', padding: '20px', boxSizing: 'border-box' },
  card: { background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(16px)', borderRadius: '40px', padding: '44px 36px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' },
  header: { textAlign: 'center', marginBottom: '36px' },
  logo: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '26px', fontWeight: 700, marginBottom: '24px', color: '#f1f5f9' },
  logoIcon: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  error: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '20px', padding: '12px 16px', marginBottom: '28px', fontSize: '13px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '10px', backdropFilter: 'blur(4px)' },
  inputGroup: { marginBottom: '24px' },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: '#cbd5e1', letterSpacing: '0.3px' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center', background: '#0f172a', borderRadius: '20px', border: '1px solid', transition: 'border-color 0.2s ease' },
  input: { width: '100%', height: '52px', padding: '0 48px 0 44px', background: 'transparent', border: 'none', borderRadius: '20px', fontSize: '0.95rem', outline: 'none', color: '#f1f5f9', boxSizing: 'border-box' },
  inputIcon: { position: 'absolute', left: '16px', fontSize: '16px', pointerEvents: 'none', opacity: 0.7 },
  passwordToggle: { position: 'absolute', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: 0, opacity: 0.7 },
  fieldError: { fontSize: '12px', color: '#f87171', marginTop: '6px', marginLeft: '12px' },
  options: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', fontSize: '13px' },
  checkbox: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#94a3b8' },
  checkboxInput: { width: '16px', height: '16px', accentColor: '#6366f1' },
  forgotLink: { color: '#818cf8', textDecoration: 'none', fontWeight: 500 },
  loginBtn: { width: '100%', minHeight: '54px', padding: '14px', background: 'linear-gradient(105deg, #4f46e5, #6366f1)', color: 'white', border: 'none', borderRadius: '32px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', transition: 'transform 0.2s ease', boxShadow: '0 8px 20px rgba(79,70,229,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  loader: { width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' },
  divider: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '28px 0 20px' },
  dividerLine: { position: 'absolute', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #334155, #4f46e5, #334155, transparent)' },
  dividerText: { position: 'relative', zIndex: 1, background: 'rgba(15,23,42,0.8)', padding: '0 14px', color: '#64748b', fontSize: '12px', fontWeight: 500, letterSpacing: '0.5px' },
  googleBtn: { width: '100%', minHeight: '52px', padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '32px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#e2e8f0' },
  register: { textAlign: 'center', marginTop: '32px', fontSize: '13px', color: '#94a3b8' },
  registerLink: { color: '#818cf8', textDecoration: 'none', fontWeight: 600, marginLeft: '4px' },
};