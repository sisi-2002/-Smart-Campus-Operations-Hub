import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import MfaSetupPage from './MfaSetupPage';
import MfaVerifyPage from './MfaVerifyPage';
import authBg from '../assets/auth-bg.jpg';

const theme = {
  primary: '#ea580c',
  primaryDark: '#c2410c',
  dark: '#121c32',
  dark2: '#1e293b',
  dark3: '#0b1325',
  light: '#ffffff',
  lightAlt: '#fafafa',
  border: '#334155',
  text: '#1e293b',
  textMuted: '#64748b',
  textSoft: '#94a3b8',
  textLight: '#cbd5e1',
  success: '#16a34a',
  warning: '#f97316',
  error: '#dc2626',
};

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [isRegister, setIsRegister] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');

  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [loginEmailError, setLoginEmailError] = useState('');
  const [loginPasswordError, setLoginPasswordError] = useState('');
  const [loginTouched, setLoginTouched] = useState({
    email: false,
    password: false,
  });

  const [registerEmailError, setRegisterEmailError] = useState('');
  const [registerPasswordError, setRegisterPasswordError] = useState('');
  const [registerTouched, setRegisterTouched] = useState({
    email: false,
    password: false,
  });

  const [mfaState, setMfaState] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    const errorParam = params.get('error');

    setIsRegister(mode === 'register');

    if (errorParam) {
      if (errorParam === 'oauth2_failed') {
        setLoginError('Google Sign-In failed. Please try again.');
      } else if (errorParam === 'session_expired') {
        setLoginError('Your session has expired. Please log in again.');
      } else if (errorParam === 'idle_timeout') {
        setLoginError('You were logged out after 20 minutes of inactivity.');
      } else {
        setLoginError(decodeURIComponent(errorParam));
      }

      window.history.replaceState({}, document.title, location.pathname + (mode ? `?mode=${mode}` : ''));
    }
  }, [location]);

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid university email address';
    return '';
  };

  const validateLoginPassword = (password) => {
    if (!password) return 'Password is required';
    return '';
  };

  const validateRegisterPassword = (password) => {
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

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'email') setLoginEmailError(validateEmail(value));
    if (name === 'password') setLoginPasswordError(validateLoginPassword(value));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'email') setRegisterEmailError(validateEmail(value));
    if (name === 'password') setRegisterPasswordError(validateRegisterPassword(value));
  };

  const handleLoginBlur = (field) => {
    setLoginTouched((prev) => ({ ...prev, [field]: true }));

    if (field === 'email') setLoginEmailError(validateEmail(loginForm.email));
    if (field === 'password') setLoginPasswordError(validateLoginPassword(loginForm.password));
  };

  const handleRegisterBlur = (field) => {
    setRegisterTouched((prev) => ({ ...prev, [field]: true }));

    if (field === 'email') setRegisterEmailError(validateEmail(registerForm.email));
    if (field === 'password') setRegisterPasswordError(validateRegisterPassword(registerForm.password));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const emailErr = validateEmail(loginForm.email);
    const passwordErr = validateLoginPassword(loginForm.password);

    setLoginEmailError(emailErr);
    setLoginPasswordError(passwordErr);
    setLoginTouched({ email: true, password: true });

    if (emailErr || passwordErr) {
      setLoginError('Please fix the errors before continuing');
      return;
    }

    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await api.post('/auth/login', loginForm);
      const data = res.data;

      if (data.status === 'SUCCESS') {
        const { token, ...userData } = data;
        login(token, userData);
        navigate('/');
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
      setLoginError(data?.error || data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const emailErr = validateEmail(registerForm.email);
    const passwordErr = validateRegisterPassword(registerForm.password);

    setRegisterEmailError(emailErr);
    setRegisterPasswordError(passwordErr);
    setRegisterTouched({ email: true, password: true });

    if (emailErr || passwordErr || !registerForm.name.trim()) {
      setRegisterError('Please fix the errors before continuing');
      return;
    }

    setRegisterError('');
    setRegisterLoading(true);

    try {
      const res = await api.post('/auth/register', registerForm);
      const { token, ...userData } = res.data;
      login(token, userData);
      navigate('/');
    } catch (err) {
      const data = err.response?.data;

      if (typeof data === 'object' && data !== null && !data.error) {
        setRegisterError(Object.values(data).join(', '));
      } else {
        setRegisterError(data?.error || data?.message || 'Registration failed');
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      (import.meta.env.VITE_SERVER_URL?.trim() || 'http://localhost:8083') +
      '/oauth2/authorization/google';
  };

  const openRegister = () => {
    setIsRegister(true);
    setLoginError('');
    navigate('/auth?mode=register');
  };

  const openLogin = () => {
    setIsRegister(false);
    setRegisterError('');
    navigate('/auth?mode=login');
  };

  if (mfaState?.status === 'MFA_SETUP_REQUIRED') {
    return (
      <MfaSetupPage
        userId={mfaState.userId}
        qrCodeUri={mfaState.qrCodeUri}
        secretKey={mfaState.secretKey}
      />
    );
  }

  if (mfaState?.status === 'MFA_CODE_REQUIRED') {
    return <MfaVerifyPage userId={mfaState.userId} />;
  }

  return (
    <div style={styles.page}>
      <div style={styles.bgCanvas}>
        <div style={styles.bgImage} />
        <div style={styles.bgOverlay} />
        <div style={styles.glowOrb1} />
        <div style={styles.glowOrb2} />
        <div style={styles.gridOverlay} />
        <div style={styles.dataStream} />
      </div>

      <div style={styles.mainContainer}>
        <div style={styles.container}>
          <div
            style={{
              ...styles.formBox,
              ...styles.loginBox,
              ...(isRegister ? styles.loginBoxHidden : styles.loginBoxVisible),
            }}
          >
            <form onSubmit={handleLoginSubmit} style={styles.form}>
              <div style={styles.formBadge}>SMART CAMPUS</div>
              <h1 style={styles.title}>Login</h1>
              <p style={styles.subtitle}>Access your campus dashboard and continue where you left off.</p>

              {loginError && (
                <div style={styles.error} role="alert">
                  <span>⚠️</span>
                  <span>{loginError}</span>
                </div>
              )}

              <div style={styles.inputGroup}>
                <div
                  style={{
                    ...styles.inputBox,
                    borderColor: loginEmailError && loginTouched.email ? theme.error : theme.primary,
                  }}
                >
                  <input
                    type="email"
                    name="email"
                    placeholder="University Email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    onBlur={() => handleLoginBlur('email')}
                    autoComplete="email"
                    required
                    style={styles.input}
                  />
                </div>
                {loginTouched.email && loginEmailError && (
                  <div style={styles.fieldError}>{loginEmailError}</div>
                )}
              </div>

              <div style={styles.inputGroup}>
                <div
                  style={{
                    ...styles.inputBox,
                    borderColor: loginPasswordError && loginTouched.password ? theme.error : theme.primary,
                  }}
                >
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    onBlur={() => handleLoginBlur('password')}
                    autoComplete="current-password"
                    required
                    style={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    style={styles.eyeBtn}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {loginTouched.password && loginPasswordError && (
                  <div style={styles.fieldError}>{loginPasswordError}</div>
                )}
              </div>

              <div style={styles.optionsRow}>
                <label style={styles.checkbox}>
                  <input type="checkbox" style={styles.checkboxInput} />
                  <span>Remember device</span>
                </label>
                <a href="/forgot-password" style={styles.linkText}>
                  Forgot password?
                </a>
              </div>

              <button type="submit" style={styles.primaryBtn} disabled={loginLoading}>
                {loginLoading ? <span style={styles.loader} /> : 'Login'}
              </button>

              <div style={styles.socialArea}>
                <button type="button" style={styles.googleBtn} onClick={handleGoogleLogin}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>
              </div>
            </form>
          </div>

          <div
            style={{
              ...styles.formBox,
              ...styles.registerBox,
              ...(isRegister ? styles.registerBoxVisible : styles.registerBoxHidden),
            }}
          >
            <form onSubmit={handleRegisterSubmit} style={styles.form}>
              <div style={styles.formBadge}>SMART CAMPUS</div>
              <h1 style={styles.title}>Register</h1>
              <p style={styles.subtitle}>Create your account and start managing campus tasks smarter.</p>

              {registerError && (
                <div style={styles.error} role="alert">
                  <span>⚠️</span>
                  <span>{registerError}</span>
                </div>
              )}

              <div style={styles.inputGroup}>
                <div style={styles.inputBox}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={registerForm.name}
                    onChange={handleRegisterChange}
                    autoComplete="name"
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <div
                  style={{
                    ...styles.inputBox,
                    borderColor: registerEmailError && registerTouched.email ? theme.error : theme.primary,
                  }}
                >
                  <input
                    type="email"
                    name="email"
                    placeholder="University Email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    onBlur={() => handleRegisterBlur('email')}
                    autoComplete="email"
                    required
                    style={styles.input}
                  />
                </div>
                {registerTouched.email && registerEmailError && (
                  <div style={styles.fieldError}>{registerEmailError}</div>
                )}
              </div>

              <div style={styles.inputGroup}>
                <div
                  style={{
                    ...styles.inputBox,
                    borderColor: registerPasswordError && registerTouched.password ? theme.error : theme.primary,
                  }}
                >
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    onBlur={() => handleRegisterBlur('password')}
                    autoComplete="new-password"
                    required
                    style={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                    style={styles.eyeBtn}
                    aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegisterPassword ? '🙈' : '👁️'}
                  </button>
                </div>

                {registerForm.password && (
                  <div style={styles.strengthContainer}>
                    <div style={styles.strengthBar}>
                      <div
                        style={{
                          ...styles.strengthFill,
                          width:
                            getPasswordStrength(registerForm.password) === 'strong'
                              ? '100%'
                              : getPasswordStrength(registerForm.password) === 'medium'
                              ? '60%'
                              : '30%',
                          background:
                            getPasswordStrength(registerForm.password) === 'strong'
                              ? theme.success
                              : getPasswordStrength(registerForm.password) === 'medium'
                              ? theme.warning
                              : theme.error,
                        }}
                      />
                    </div>

                    <div style={styles.strengthChecks}>
                      <span style={{ color: registerForm.password.length >= 8 ? theme.success : theme.textMuted }}>✓ 8+ chars</span>
                      <span style={{ color: /[A-Z]/.test(registerForm.password) ? theme.success : theme.textMuted }}>✓ Uppercase</span>
                      <span style={{ color: /[a-z]/.test(registerForm.password) ? theme.success : theme.textMuted }}>✓ Lowercase</span>
                      <span style={{ color: /[0-9]/.test(registerForm.password) ? theme.success : theme.textMuted }}>✓ Number</span>
                      <span style={{ color: /[!@#$%^&*(),.?":{}|<>]/.test(registerForm.password) ? theme.success : theme.textMuted }}>✓ Special</span>
                    </div>
                  </div>
                )}

                {registerTouched.password && registerPasswordError && (
                  <div style={styles.fieldError}>{registerPasswordError}</div>
                )}
              </div>

              <button type="submit" style={styles.primaryBtn} disabled={registerLoading}>
                {registerLoading ? <span style={styles.loader} /> : 'Register'}
              </button>

              <div style={styles.socialArea}>
                <button type="button" style={styles.googleBtn} onClick={handleGoogleLogin}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>
              </div>
            </form>
          </div>

          <div style={styles.toggleBox}>
            <div
              style={{
                ...styles.toggleBackground,
                ...(isRegister ? styles.toggleBackgroundActive : {}),
              }}
            />

            <div
              style={{
                ...styles.togglePanel,
                ...styles.toggleLeft,
                ...(isRegister ? styles.toggleLeftHidden : styles.toggleLeftVisible),
              }}
            >
              <div style={styles.toggleMiniTag}>WELCOME</div>
              <h1 style={styles.toggleTitle}>Hello, Welcome</h1>
              <p style={styles.toggleText}>Don't have an account?</p>
              <button type="button" style={styles.toggleBtn} onClick={openRegister}>
                Register
              </button>
            </div>

            <div
              style={{
                ...styles.togglePanel,
                ...styles.toggleRight,
                ...(isRegister ? styles.toggleRightVisible : styles.toggleRightHidden),
              }}
            >
              <div style={styles.toggleMiniTag}>WELCOME BACK</div>
              <h1 style={styles.toggleTitle}>Welcome Back!</h1>
              <p style={styles.toggleText}>Already have an account?</p>
              <button type="button" style={styles.toggleBtn} onClick={openLogin}>
                Login
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatBG {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-1%, -1%) scale(1.02); }
        }

        @keyframes dataFlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 rgba(234, 88, 12, 0); }
          50% { box-shadow: 0 0 20px rgba(234, 88, 12, 0.25); }
        }
      `}</style>
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
    fontFamily: "'Poppins', sans-serif",
    background: theme.light,
    padding: '24px',
    boxSizing: 'border-box',
  },

  bgCanvas: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    overflow: 'hidden',
  },

  bgImage: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${authBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    transform: 'scale(1.03)',
  },

  bgOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(18,28,50,0.88), rgba(18,28,50,0.72))',
    backdropFilter: 'blur(2px)',
  },

  glowOrb1: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: '50%',
    height: '50%',
    background: 'radial-gradient(circle, rgba(234,88,12,0.18) 0%, rgba(234,88,12,0.06) 50%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(80px)',
    animation: 'floatBG 15s ease-in-out infinite alternate',
  },

  glowOrb2: {
    position: 'absolute',
    bottom: '-20%',
    right: '-10%',
    width: '45%',
    height: '45%',
    background: 'radial-gradient(circle, rgba(234,88,12,0.16) 0%, rgba(234,88,12,0.05) 50%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(80px)',
    animation: 'floatBG 18s ease-in-out infinite alternate-reverse',
  },

  gridOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(234,88,12,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(234,88,12,0.08) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    opacity: 0.24,
  },

  dataStream: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)`,
    animation: 'dataFlow 6s linear infinite',
    opacity: 0.5,
  },

  mainContainer: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '1020px',
  },

  container: {
    position: 'relative',
    width: '100%',
    minHeight: '620px',
    background: 'transparent',
    border: '1px solid rgba(234,88,12,0.35)',
    borderRadius: '30px',
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(0,0,0,0.25), 0 10px 30px rgba(234,88,12,0.12)',
    backdropFilter: 'blur(4px)',
  },

  formBox: {
    position: 'absolute',
    top: 0,
    width: '50%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    background: 'rgba(255,255,255,0.94)',
    backdropFilter: 'blur(14px)',
    transition: 'all 0.6s ease-in-out',
    zIndex: 1,
    boxSizing: 'border-box',
  },

  loginBox: {
    right: 0,
  },

  registerBox: {
    left: 0,
  },

  loginBoxVisible: {
    opacity: 1,
    visibility: 'visible',
    transform: 'translateX(0)',
  },

  loginBoxHidden: {
    opacity: 0,
    visibility: 'hidden',
    transform: 'translateX(100%)',
  },

  registerBoxVisible: {
    opacity: 1,
    visibility: 'visible',
    transform: 'translateX(0)',
    zIndex: 5,
  },

  registerBoxHidden: {
    opacity: 0,
    visibility: 'hidden',
    transform: 'translateX(-100%)',
  },

  form: {
    width: '100%',
    maxWidth: '360px',
    textAlign: 'center',
  },

  formBadge: {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: '20px',
    border: `1px solid ${theme.primary}33`,
    color: theme.primary,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1px',
    marginBottom: '16px',
    background: `${theme.primary}10`,
  },

  title: {
    fontSize: '36px',
    margin: '0 0 10px',
    color: theme.dark,
    fontWeight: 800,
    letterSpacing: '-0.5px',
  },

  subtitle: {
    margin: '0 0 22px',
    color: theme.textMuted,
    fontSize: '14px',
    lineHeight: 1.6,
  },

  error: {
    background: '#fff7ed',
    border: `1px solid ${theme.primary}55`,
    borderRadius: '12px',
    padding: '12px 14px',
    marginBottom: '18px',
    fontSize: '13px',
    color: theme.primaryDark,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textAlign: 'left',
  },

  inputGroup: {
    marginBottom: '16px',
    textAlign: 'left',
  },

  inputBox: {
    position: 'relative',
    border: `2px solid ${theme.primary}`,
    borderRadius: '10px',
    background: '#ffffff',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
  },

  input: {
    width: '100%',
    padding: '13px 50px 13px 20px',
    background: 'transparent',
    borderRadius: '10px',
    border: 'none',
    outline: 'none',
    fontSize: '15px',
    fontWeight: 500,
    color: theme.text,
    boxSizing: 'border-box',
  },

  eyeBtn: {
    position: 'absolute',
    top: '50%',
    right: '14px',
    transform: 'translateY(-50%)',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '16px',
    padding: 0,
  },

  fieldError: {
    fontSize: '12px',
    color: theme.error,
    marginTop: '6px',
    marginLeft: '4px',
  },

  optionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '6px 0 18px',
    gap: '12px',
    flexWrap: 'wrap',
  },

  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: theme.text,
    fontSize: '13px',
    cursor: 'pointer',
  },

  checkboxInput: {
    width: '16px',
    height: '16px',
    accentColor: theme.primary,
  },

  linkText: {
    fontSize: '14px',
    color: theme.primary,
    textDecoration: 'none',
    fontWeight: 600,
  },

  primaryBtn: {
    width: '200px',
    height: '48px',
    background: theme.primary,
    borderRadius: '10px',
    boxShadow: '0 8px 20px rgba(234,88,12,0.25)',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#fff',
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '6px',
    transition: 'all 0.3s ease',
  },

  loader: {
    width: '20px',
    height: '20px',
    border: '2px solid white',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },

  socialArea: {
    marginTop: '18px',
    display: 'flex',
    justifyContent: 'center',
  },

  googleBtn: {
    width: '200px',
    height: '48px',
    background: '#fff',
    borderRadius: '10px',
    border: `2px solid ${theme.primary}`,
    cursor: 'pointer',
    fontSize: '14px',
    color: theme.primary,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
  },

  strengthContainer: {
    marginTop: '10px',
  },

  strengthBar: {
    height: '5px',
    background: '#e2e8f0',
    borderRadius: '999px',
    overflow: 'hidden',
    marginBottom: '10px',
  },

  strengthFill: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 0.3s ease, background 0.3s ease',
  },

  strengthChecks: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    fontSize: '11px',
    fontWeight: 600,
    color: theme.textMuted,
    marginBottom: '6px',
  },

  toggleBox: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
  },

  toggleBackground: {
    position: 'absolute',
    left: '-250%',
    width: '300%',
    height: '100%',
    background: `linear-gradient(135deg, rgba(234,88,12,0.95), rgba(194,65,12,0.92))`,
    borderRadius: '150px',
    zIndex: 2,
    transition: '1s ease-in-out',
    backdropFilter: 'blur(4px)',
    boxShadow: 'inset 0 0 40px rgba(255,255,255,0.05)',
  },

  toggleBackgroundActive: {
    left: '50%',
  },

  togglePanel: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    transition: '0.6s ease-in-out',
    textAlign: 'center',
    padding: '40px',
    boxSizing: 'border-box',
  },

  toggleLeft: {
    left: 0,
  },

  toggleRight: {
    right: 0,
  },

  toggleLeftVisible: {
    transform: 'translateX(0)',
  },

  toggleLeftHidden: {
    transform: 'translateX(-100%)',
  },

  toggleRightVisible: {
    transform: 'translateX(0)',
  },

  toggleRightHidden: {
    transform: 'translateX(100%)',
  },

  toggleMiniTag: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1px',
    marginBottom: '14px',
    color: 'rgba(255,255,255,0.85)',
  },

  toggleTitle: {
    fontSize: '36px',
    marginBottom: '12px',
    fontWeight: 800,
    letterSpacing: '-0.5px',
  },

  toggleText: {
    fontSize: '14px',
    margin: '0 0 20px',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 1.6,
  },

  toggleBtn: {
    width: '160px',
    height: '46px',
    borderRadius: '10px',
    background: 'transparent',
    border: '2px solid #fff',
    boxShadow: 'none',
    fontSize: '16px',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
  },
};