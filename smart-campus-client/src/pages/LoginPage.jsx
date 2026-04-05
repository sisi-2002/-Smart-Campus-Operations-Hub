import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const style = document.createElement('style');
    style.setAttribute('data-login-page-styles', 'true');
    style.textContent = `
      @keyframes floatMap {
        0% { transform: translate(0, 0) scale(1); }
        100% { transform: translate(-2%, -2%) scale(1.02); }
      }

      @keyframes pulseBuilding {
        0%, 100% { filter: drop-shadow(0 0 2px rgba(99,102,241,0.3)); }
        50% { filter: drop-shadow(0 0 12px rgba(99,102,241,0.8)); }
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .login-card h1 {
        font-size: 2rem;
        line-height: 1.15;
        margin: 0 0 10px;
        color: #0f172a;
        font-weight: 800;
      }

      .login-card p.login-subtitle {
        margin: 0;
        color: #475569;
        font-size: 1rem;
      }

      .login-label {
        display: block;
        font-size: 0.95rem;
        font-weight: 600;
        margin-bottom: 8px;
        color: #334155;
      }

      .login-input {
        width: 100%;
        height: 52px;
        padding: 0 48px 0 46px;
        border: 1.5px solid #dbe3ef;
        border-radius: 14px;
        font-size: 0.98rem;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        background: #f8fafc;
        color: #0f172a;
        box-sizing: border-box;
      }

      .login-input::placeholder {
        color: #94a3b8;
      }

      .login-input:focus {
        border-color: #6366f1;
        background: #ffffff;
        box-shadow: 0 0 0 4px rgba(99,102,241,0.12);
      }

      .password-toggle:hover,
      .forgot-link:hover,
      .register-link:hover,
      .google-btn:hover,
      .login-btn:hover {
        filter: brightness(0.98);
      }

      .login-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 10px 24px rgba(99,102,241,0.28);
      }

      .google-btn:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
      }

      .forgot-link:hover,
      .register-link:hover {
        text-decoration: underline;
      }

      @media (max-width: 640px) {
        .login-card {
          border-radius: 24px !important;
          padding: 28px 20px !important;
        }

        .login-options {
          flex-direction: column;
          align-items: flex-start !important;
          gap: 12px;
        }
      }
    `;

    document.head.appendChild(style);

    return () => {
      const existing = document.querySelector('style[data-login-page-styles="true"]');
      if (existing) existing.remove();
    };
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', form);
      const { token, ...userData } = res.data;
      login(token, userData);
      navigate('/');
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

  return (
    <div style={styles.page}>
      <div style={styles.mapContainer}>
        <svg style={styles.campusMap} viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M0 400 Q200 350, 400 380 T800 350 T1200 400" fill="none" stroke="#4ade80" strokeWidth="2" opacity="0.3" />
          <path d="M0 500 Q300 480, 600 520 T1200 500" fill="none" stroke="#4ade80" strokeWidth="1.5" opacity="0.2" />

          <g style={{ animation: activeField === 'email' ? 'pulseBuilding 1.5s infinite' : 'none' }}>
            <rect x="150" y="200" width="80" height="60" rx="8" fill="#6366f1" opacity="0.55" />
            <text x="190" y="235" fill="white" fontSize="14" textAnchor="middle" opacity="0.95">Library</text>
          </g>

          <g style={{ animation: activeField === 'password' ? 'pulseBuilding 1.5s infinite' : 'none' }}>
            <rect x="350" y="150" width="110" height="72" rx="8" fill="#8b5cf6" opacity="0.55" />
            <text x="405" y="192" fill="white" fontSize="13" textAnchor="middle">Admin Block</text>
          </g>

          <g>
            <rect x="850" y="180" width="86" height="65" rx="8" fill="#f59e0b" opacity="0.55" />
            <text x="893" y="215" fill="white" fontSize="13" textAnchor="middle">Student Hub</text>
          </g>

          <g>
            <rect x="950" y="400" width="60" height="50" rx="8" fill="#ec4899" opacity="0.5" />
            <text x="980" y="430" fill="white" fontSize="12" textAnchor="middle">Gym</text>
          </g>

          <circle cx="100" cy="300" r="12" fill="#22c55e" opacity="0.4" />
          <circle cx="280" cy="120" r="10" fill="#22c55e" opacity="0.3" />
          <circle cx="1100" cy="300" r="11" fill="#22c55e" opacity="0.3" />
        </svg>
        <div style={styles.mapOverlay} />
      </div>

      <div style={styles.formContainer}>
        <div style={styles.card} className="login-card">
          <div style={styles.header}>
            <div style={styles.logo}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#6366f1" strokeWidth="1.5" />
                <path d="M2 17L12 22L22 17" stroke="#6366f1" strokeWidth="1.5" />
                <path d="M2 12L12 17L22 12" stroke="#6366f1" strokeWidth="1.5" />
              </svg>
              <span>
                Smart<span style={{ color: '#6366f1' }}>Campus</span>
              </span>
            </div>
            <h1>Explore &amp; Access</h1>
            <p className="login-subtitle">Sign in to navigate your campus hub</p>
          </div>

          {error && (
            <div style={styles.error} role="alert">
              <span aria-hidden="true">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label htmlFor="email" className="login-label">University Email</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon} aria-hidden="true">📧</span>
                <input
                  id="email"
                  className="login-input"
                  type="email"
                  name="email"
                  placeholder="student@university.edu"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setActiveField('email')}
                  onBlur={() => setActiveField(null)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="password" className="login-label">Password</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon} aria-hidden="true">🔒</span>
                <input
                  id="password"
                  className="login-input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setActiveField('password')}
                  onBlur={() => setActiveField(null)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={styles.options} className="login-options">
              <label style={styles.checkbox}>
                <input type="checkbox" style={styles.checkboxInput} />
                <span>Keep me signed in</span>
              </label>
              <Link to="/forgot-password" style={styles.forgotLink} className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button style={styles.loginBtn} className="login-btn" type="submit" disabled={loading}>
              {loading ? <span style={styles.loader} /> : 'Access Campus →'}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>or</span>
          </div>

          <button type="button" style={styles.googleBtn} className="google-btn" onClick={handleGoogleLogin}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div style={styles.register}>
            First time on campus?{' '}
            <Link to="/register" style={styles.registerLink} className="register-link">
              Create account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
  },
  mapContainer: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
  campusMap: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    top: '-10%',
    left: '-10%',
    animation: 'floatMap 20s ease-in-out infinite alternate',
  },
  mapOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at center, transparent 25%, rgba(15,23,42,0.72) 88%)',
  },
  formContainer: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    maxWidth: '520px',
    padding: '24px',
    boxSizing: 'border-box',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.97)',
    backdropFilter: 'blur(10px)',
    borderRadius: '36px',
    padding: '42px 32px',
    boxShadow: '0 25px 45px -12px rgba(0,0,0,0.35)',
    border: '1px solid rgba(255,255,255,0.25)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    fontSize: '24px',
    fontWeight: 800,
    marginBottom: '20px',
    color: '#0f172a',
  },
  error: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '14px',
    padding: '12px 14px',
    marginBottom: '24px',
    fontSize: '14px',
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    fontSize: '16px',
    pointerEvents: 'none',
    lineHeight: 1,
  },
  passwordToggle: {
    position: 'absolute',
    right: '14px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  options: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    fontSize: '14px',
    gap: '16px',
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    color: '#475569',
  },
  checkboxInput: {
    width: '16px',
    height: '16px',
    accentColor: '#6366f1',
  },
  forgotLink: {
    color: '#6366f1',
    textDecoration: 'none',
    fontWeight: 600,
  },
  loginBtn: {
    width: '100%',
    minHeight: '54px',
    padding: '14px',
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    color: 'white',
    border: 'none',
    borderRadius: '28px',
    fontSize: '18px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease',
    boxShadow: '0 8px 22px rgba(99,102,241,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    margin: '24px 0',
  },
  dividerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '1px',
    background: '#e2e8f0',
  },
  dividerText: {
    position: 'relative',
    zIndex: 1,
    background: 'rgba(255,255,255,0.97)',
    padding: '0 12px',
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'lowercase',
  },
  googleBtn: {
    width: '100%',
    minHeight: '52px',
    padding: '12px',
    background: '#fff',
    border: '1.5px solid #e2e8f0',
    borderRadius: '28px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
    color: '#0f172a',
  },
  register: {
    textAlign: 'center',
    marginTop: '28px',
    fontSize: '14px',
    color: '#64748b',
  },
  registerLink: {
    color: '#6366f1',
    textDecoration: 'none',
    fontWeight: 700,
  },
};
