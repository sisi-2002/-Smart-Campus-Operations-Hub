import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [activeField, setActiveField] = useState(null);

  // Validation Functions
  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid university email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character';
    return '';
  };

  const getPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    const passed = Object.values(checks).filter(Boolean).length;
    if (passed === 5) return 'strong';
    if (passed >= 3) return 'medium';
    return 'weak';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'email') setEmailError(validateEmail(value));
    else if (name === 'password') setPasswordError(validatePassword(value));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'email') setEmailError(validateEmail(form.email));
    else if (field === 'password') setPasswordError(validatePassword(form.password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(form.email);
    const passwordErr = validatePassword(form.password);
    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setTouched({ email: true, password: true });
    if (emailErr || passwordErr || !form.name.trim()) {
      setError('Please fix the errors before continuing');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      const { token, ...userData } = res.data;
      login(token, userData);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object' && data !== null && !data.error) {
        setError(Object.values(data).join(', '));
      } else {
        setError(data?.error || data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Animated Tech Background - No words */}
      <div style={styles.bgCanvas}>
        <div style={styles.glowOrb1} />
        <div style={styles.glowOrb2} />
        <div style={styles.gridOverlay} />
        <div style={styles.dataStream} />
        {/* Smart Campus Network SVG - text removed */}
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
          
          {/* Network connections */}
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
          
          {/* Animated nodes - no text labels */}
          <g filter="url(#glow)">
            <circle cx="200" cy="250" r="14" fill="#4f46e5" opacity="0.7" style={{ animation: activeField === 'name' ? 'pulseNode 1.8s infinite' : 'none' }}>
              <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="500" cy="180" r="12" fill="#06b6d4" opacity="0.7" style={{ animation: activeField === 'email' ? 'pulseNode 1.8s infinite' : 'none' }}>
              <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="850" cy="300" r="10" fill="#f59e0b" opacity="0.6" />
            <circle cx="350" cy="450" r="11" fill="#ec4899" opacity="0.6" />
            <circle cx="700" cy="550" r="13" fill="#10b981" opacity="0.6" />
            <circle cx="1100" cy="220" r="9" fill="#8b5cf6" opacity="0.6" />
          </g>
        </svg>
      </div>

      {/* Glassmorphic Form Card (unchanged) */}
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
              <span>
                Smart<span style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Campus</span>
              </span>
            </div>
            <h1>Join the network</h1>
            <p className="login-subtitle">Create your smart campus account</p>
          </div>

          {error && (
            <div style={styles.error} role="alert">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={styles.inputGroup}>
              <label htmlFor="name" style={styles.label}>Full Name</label>
              <div style={{...styles.inputWrapper, borderColor: '#334155'}}>
                <span style={styles.inputIcon}>👤</span>
                <input
                  id="name"
                  style={styles.input}
                  type="text"
                  name="name"
                  placeholder="Alex Johnson"
                  value={form.name}
                  onChange={handleChange}
                  onFocus={() => setActiveField('name')}
                  onBlur={() => setActiveField(null)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* Email */}
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
                  onBlur={() => {
                    setActiveField(null);
                    handleBlur('email');
                  }}
                  autoComplete="email"
                  required
                />
              </div>
              {touched.email && emailError && (
                <div style={styles.fieldError}>{emailError}</div>
              )}
            </div>

            {/* Password with strength indicator */}
            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <div style={{...styles.inputWrapper, borderColor: passwordError && touched.password ? '#ef4444' : '#334155'}}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  id="password"
                  style={{...styles.input, borderColor: passwordError && touched.password ? '#ef4444' : 'transparent'}}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setActiveField('password')}
                  onBlur={() => {
                    setActiveField(null);
                    handleBlur('password');
                  }}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {form.password && (
                <div style={styles.strengthContainer}>
                  <div style={styles.strengthBar}>
                    <div style={{
                      ...styles.strengthFill,
                      width: form.password ? `${(getPasswordStrength(form.password) === 'strong' ? 100 : getPasswordStrength(form.password) === 'medium' ? 60 : 30)}%` : '0%',
                      background: getPasswordStrength(form.password) === 'strong' ? '#10b981' : getPasswordStrength(form.password) === 'medium' ? '#f59e0b' : '#ef4444',
                    }} />
                  </div>
                  <div style={styles.strengthChecks}>
                    <span style={{ color: form.password.length >= 8 ? '#10b981' : '#64748b' }}>✓ 8+ chars</span>
                    <span style={{ color: /[A-Z]/.test(form.password) ? '#10b981' : '#64748b' }}>✓ Uppercase</span>
                    <span style={{ color: /[a-z]/.test(form.password) ? '#10b981' : '#64748b' }}>✓ Lowercase</span>
                    <span style={{ color: /[0-9]/.test(form.password) ? '#10b981' : '#64748b' }}>✓ Number</span>
                    <span style={{ color: /[!@#$%^&*(),.?":{}|<>]/.test(form.password) ? '#10b981' : '#64748b' }}>✓ Special</span>
                  </div>
                </div>
              )}
              {touched.password && passwordError && (
                <div style={styles.fieldError}>{passwordError}</div>
              )}
            </div>

            <button style={styles.loginBtn} type="submit" disabled={loading}>
              {loading ? <span style={styles.loader} /> : 'Create account →'}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>join the future</span>
          </div>

          <div style={styles.register}>
            Already have an account?{' '}
            <Link to="/login" style={styles.registerLink}>
              Sign in →
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatBG {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-1%, -1%) scale(1.02); }
        }
        @keyframes pulseNode {
          0% { opacity: 0.4; r: 8; }
          50% { opacity: 1; r: 18; }
          100% { opacity: 0.4; r: 8; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes dataFlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .login-subtitle {
          color: #94a3b8;
          font-size: 0.9rem;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}

// Styles (unchanged from before)
const styles = {
  page: {
    minHeight: '100vh',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    background: '#0b0f19',
  },
  bgCanvas: {
    position: 'absolute',
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
    opacity: 0.5,
  },
  formContainer: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '480px',
    padding: '20px',
    boxSizing: 'border-box',
  },
  card: {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(16px)',
    borderRadius: '40px',
    padding: '44px 36px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '36px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    fontSize: '26px',
    fontWeight: 700,
    marginBottom: '24px',
    color: '#f1f5f9',
  },
  logoIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '20px',
    padding: '12px 16px',
    marginBottom: '28px',
    fontSize: '13px',
    color: '#f87171',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backdropFilter: 'blur(4px)',
  },
  inputGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '8px',
    color: '#cbd5e1',
    letterSpacing: '0.3px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: '#0f172a',
    borderRadius: '20px',
    border: '1px solid',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  input: {
    width: '100%',
    height: '52px',
    padding: '0 48px 0 44px',
    background: 'transparent',
    border: 'none',
    borderRadius: '20px',
    fontSize: '0.95rem',
    outline: 'none',
    color: '#f1f5f9',
    boxSizing: 'border-box',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    fontSize: '16px',
    pointerEvents: 'none',
    opacity: 0.7,
  },
  passwordToggle: {
    position: 'absolute',
    right: '16px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
    transition: 'opacity 0.2s',
  },
  fieldError: {
    fontSize: '12px',
    color: '#f87171',
    marginTop: '6px',
    marginLeft: '12px',
  },
  strengthContainer: {
    marginTop: '12px',
  },
  strengthBar: {
    height: '4px',
    background: '#1e293b',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '10px',
  },
  strengthFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease, background 0.3s ease',
  },
  strengthChecks: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    fontSize: '11px',
    fontWeight: 500,
    color: '#64748b',
    marginBottom: '8px',
  },
  loginBtn: {
    width: '100%',
    minHeight: '54px',
    padding: '14px',
    background: 'linear-gradient(105deg, #4f46e5, #6366f1)',
    color: 'white',
    border: 'none',
    borderRadius: '32px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  loader: {
    width: '20px',
    height: '20px',
    border: '2px solid white',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  divider: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '28px 0 20px',
  },
  dividerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, #334155, #4f46e5, #334155, transparent)',
  },
  dividerText: {
    position: 'relative',
    zIndex: 1,
    background: 'rgba(15, 23, 42, 0.8)',
    padding: '0 14px',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
  register: {
    textAlign: 'center',
    marginTop: '32px',
    fontSize: '13px',
    color: '#94a3b8',
  },
  registerLink: {
    color: '#818cf8',
    textDecoration: 'none',
    fontWeight: 600,
    marginLeft: '4px',
  },
};