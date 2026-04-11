import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword, verifyResetCode, resetPassword } from '../api/authApi';
import authBg from '../assets/auth-bg.jpg';

const STEPS = [
  { num: 1, label: 'Enter Email' },
  { num: 2, label: 'Verify Code' },
  { num: 3, label: 'New Password' },
];

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
  successSoft: '#dcfce7',
  warning: '#f97316',
  error: '#dc2626',
  errorSoft: '#fef2f2',
};

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess('Code sent! Check your email inbox and spam folder.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await verifyResetCode(email, code);
      setSuccess('Code verified! Create your new password.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPass !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (newPass.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, code, newPass);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setCode('');
    try {
      await forgotPassword(email);
      setSuccess('New code sent to your email.');
    } catch {
      setError('Failed to resend. Please try again.');
    }
  };

  const strengthLabel =
    newPass.length === 0
      ? ''
      : newPass.length < 4
      ? 'Weak'
      : newPass.length < 7
      ? 'Fair'
      : newPass.length < 10
      ? 'Good'
      : 'Strong';

  return (
    <div style={s.page}>
      <div style={s.bgCanvas}>
        <div style={s.bgImage} />
        <div style={s.bgOverlay} />
        <div style={s.glowOrb1} />
        <div style={s.glowOrb2} />
        <div style={s.gridOverlay} />
        <div style={s.dataStream} />
      </div>

      <div style={s.mainContainer}>
        <div style={s.card}>
          <div style={s.header}>
            <div style={s.logo}>Smart<span style={s.logoAccent}>Campus</span></div>
            {step !== 4 && <div style={s.badge}>PASSWORD RECOVERY</div>}
            {step !== 4 && <h2 style={s.title}>Forgot Password</h2>}
            {step !== 4 && (
              <p style={s.subtitle}>
                {step === 1 && 'Enter your email to receive a reset code.'}
                {step === 2 && `Enter the 6-digit code sent to ${email}`}
                {step === 3 && 'Create your new password.'}
              </p>
            )}
          </div>

          {step === 4 ? (
            <div style={s.successBox}>
              <div style={s.successIconWrap}>
                <div style={s.successIcon}>✅</div>
              </div>
              <h2 style={s.successTitle}>Password Reset!</h2>
              <p style={s.successMsg}>
                Your password has been updated successfully.
              </p>
              <Link to="/auth?mode=login" style={s.loginLink}>
                Back to Login →
              </Link>
            </div>
          ) : (
            <>
              <div style={s.steps}>
                {STEPS.map((st, i) => (
                  <div key={st.num} style={s.stepRow}>
                    <div
                      style={{
                        ...s.stepDot,
                        background:
                          step > st.num
                            ? theme.success
                            : step === st.num
                            ? theme.primary
                            : 'rgba(255,255,255,0.75)',
                        color: step >= st.num ? '#fff' : theme.textMuted,
                        border:
                          step < st.num
                            ? `1px solid ${theme.primary}33`
                            : 'none',
                        boxShadow:
                          step === st.num
                            ? '0 8px 20px rgba(234,88,12,0.25)'
                            : 'none',
                      }}
                    >
                      {step > st.num ? '✓' : st.num}
                    </div>

                    <span
                      style={{
                        ...s.stepLabel,
                        color:
                          step === st.num
                            ? theme.dark
                            : step > st.num
                            ? theme.success
                            : theme.textMuted,
                        fontWeight: step === st.num ? 700 : 500,
                      }}
                    >
                      {st.label}
                    </span>

                    {i < STEPS.length - 1 && (
                      <div
                        style={{
                          ...s.stepLine,
                          background:
                            step > st.num
                              ? `${theme.success}66`
                              : `${theme.primary}22`,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {error && <div style={s.error}>{error}</div>}
              {success && <div style={s.successMsg2}>{success}</div>}

              {step === 1 && (
                <form onSubmit={handleSendCode} style={s.form}>
                  <label style={s.label}>University Email</label>
                  <div style={s.inputBox}>
                    <input
                      style={s.input}
                      type="email"
                      placeholder="you@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <button style={s.btn} type="submit" disabled={loading}>
                    {loading ? <span style={s.loader} /> : 'Send Reset Code'}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleVerifyCode} style={s.form}>
                  <label style={s.label}>6-Digit Code</label>
                  <div style={s.inputBox}>
                    <input
                      style={{ ...s.input, ...s.codeInput }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="0 0 0 0 0 0"
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                      autoFocus
                      required
                    />
                  </div>

                  <p style={s.codeHint}>
                    Check your inbox at <strong>{email}</strong>
                  </p>

                  <button
                    style={{ ...s.btn, opacity: code.length === 6 ? 1 : 0.65 }}
                    type="submit"
                    disabled={loading || code.length !== 6}
                  >
                    {loading ? <span style={s.loader} /> : 'Verify Code'}
                  </button>

                  <div style={s.linkRow}>
                    <button type="button" style={s.linkBtn} onClick={handleResend}>
                      Resend code
                    </button>
                    <button
                      type="button"
                      style={s.linkBtn}
                      onClick={() => {
                        setStep(1);
                        setCode('');
                        setError('');
                        setSuccess('');
                      }}
                    >
                      Change email
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleResetPassword} style={s.form}>
                  <label style={s.label}>New Password</label>
                  <div style={s.passWrap}>
                    <div style={s.inputBox}>
                      <input
                        style={{ ...s.input, paddingRight: 46 }}
                        type={showPass ? 'text' : 'password'}
                        placeholder="At least 6 characters"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="button"
                      style={s.eyeBtn}
                      onClick={() => setShowPass(!showPass)}
                    >
                      {showPass ? '🙈' : '👁'}
                    </button>
                  </div>

                  <label style={s.label}>Confirm New Password</label>
                  <div
                    style={{
                      ...s.inputBox,
                      borderColor:
                        confirm && newPass !== confirm ? theme.error : theme.primary,
                    }}
                  >
                    <input
                      style={s.input}
                      type={showPass ? 'text' : 'password'}
                      placeholder="Repeat your new password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                    />
                  </div>

                  {confirm && newPass !== confirm && (
                    <p style={s.mismatch}>Passwords do not match</p>
                  )}

                  <div style={s.strengthBar}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          ...s.strengthSegment,
                          background:
                            newPass.length >= i * 2
                              ? i <= 1
                                ? theme.error
                                : i <= 2
                                ? theme.warning
                                : i <= 3
                                ? theme.success
                                : theme.primary
                              : 'rgba(203,213,225,0.65)',
                        }}
                      />
                    ))}
                    <span style={s.strengthLabel}>{strengthLabel}</span>
                  </div>

                  <button
                    style={{
                      ...s.btn,
                      opacity: newPass && confirm && newPass === confirm ? 1 : 0.65,
                    }}
                    type="submit"
                    disabled={loading || !newPass || newPass !== confirm}
                  >
                    {loading ? <span style={s.loader} /> : 'Reset Password'}
                  </button>
                </form>
              )}

              <p style={s.backLink}>
                <Link to="/auth?mode=login" style={s.backLinkAnchor}>
                  ← Back to Login
                </Link>
              </p>
            </>
          )}
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
          50% { box-shadow: 0 0 18px rgba(234, 88, 12, 0.18); }
        }
      `}</style>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    padding: '24px',
    fontFamily: "'Poppins', sans-serif",
    boxSizing: 'border-box',
    background: theme.light,
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
    filter: 'brightness(0.95) contrast(1.02)',
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
    background:
      'radial-gradient(circle, rgba(234,88,12,0.18) 0%, rgba(234,88,12,0.06) 50%, transparent 70%)',
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
    background:
      'radial-gradient(circle, rgba(234,88,12,0.14) 0%, rgba(234,88,12,0.04) 50%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(80px)',
    animation: 'floatBG 18s ease-in-out infinite alternate-reverse',
  },

  gridOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(234,88,12,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(234,88,12,0.06) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    opacity: 0.22,
  },

  dataStream: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)`,
    animation: 'dataFlow 6s linear infinite',
    opacity: 0.45,
  },

  mainContainer: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '540px',
  },

  card: {
    background: 'rgba(255,255,255,0.94)',
    border: '1px solid rgba(234,88,12,0.35)',
    borderRadius: '30px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.25), 0 10px 30px rgba(234,88,12,0.12)',
    padding: '38px 32px',
    backdropFilter: 'blur(12px)',
  },

  header: {
    textAlign: 'center',
    marginBottom: '22px',
  },

  logo: {
    fontSize: '24px',
    fontWeight: 700,
    color: theme.dark,
    marginBottom: '14px',
  },

  logoAccent: {
    color: theme.primary,
  },

  badge: {
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
    fontSize: '30px',
    fontWeight: 800,
    margin: '0 0 8px',
    color: theme.dark,
    letterSpacing: '-0.4px',
  },

  subtitle: {
    fontSize: '14px',
    color: theme.textMuted,
    margin: 0,
    lineHeight: 1.6,
  },

  steps: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '18px',
    gap: 4,
    flexWrap: 'wrap',
  },

  stepRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },

  stepDot: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },

  stepLabel: {
    fontSize: 12,
    whiteSpace: 'nowrap',
  },

  stepLine: {
    width: 22,
    height: 2,
    flexShrink: 0,
    borderRadius: 999,
  },

  form: {
    width: '100%',
  },

  label: {
    display: 'block',
    fontSize: 13,
    color: theme.dark,
    marginBottom: 6,
    fontWeight: 600,
  },

  inputBox: {
    position: 'relative',
    border: `2px solid ${theme.primary}`,
    borderRadius: '10px',
    background: '#ffffff',
    marginBottom: '14px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
    transition: 'all 0.3s ease',
  },

  input: {
    width: '100%',
    padding: '12px 14px',
    background: 'transparent',
    borderRadius: '10px',
    border: 'none',
    outline: 'none',
    fontSize: 14,
    fontWeight: 500,
    color: theme.text,
    boxSizing: 'border-box',
  },

  codeInput: {
    textAlign: 'center',
    fontSize: 26,
    letterSpacing: 10,
    fontWeight: 700,
    color: theme.primary,
  },

  codeHint: {
    fontSize: 12,
    color: theme.textMuted,
    textAlign: 'center',
    margin: '-4px 0 14px',
    lineHeight: 1.5,
  },

  btn: {
    width: '100%',
    minHeight: '50px',
    background: theme.primary,
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: 15,
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(234,88,12,0.25)',
    marginTop: 4,
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

  passWrap: {
    position: 'relative',
  },

  eyeBtn: {
    position: 'absolute',
    top: '50%',
    right: 14,
    transform: 'translateY(-68%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    padding: 0,
    zIndex: 2,
  },

  strengthBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    marginBottom: '14px',
  },

  strengthSegment: {
    height: 4,
    flex: 1,
    borderRadius: 999,
    transition: 'background .3s',
  },

  strengthLabel: {
    fontSize: 11,
    color: theme.textMuted,
    minWidth: 38,
    textAlign: 'right',
    fontWeight: 600,
  },

  linkRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
    flexWrap: 'wrap',
  },

  linkBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    color: theme.primary,
    textDecoration: 'underline',
    padding: 0,
    fontWeight: 600,
  },

  error: {
    background: theme.errorSoft,
    color: theme.error,
    border: `1px solid ${theme.error}33`,
    padding: '10px 12px',
    borderRadius: '10px',
    fontSize: '13px',
    marginBottom: '16px',
    textAlign: 'left',
    lineHeight: 1.5,
  },

  successMsg2: {
    background: '#fff7ed',
    color: theme.primaryDark,
    border: `1px solid ${theme.primary}33`,
    padding: '10px 12px',
    borderRadius: '10px',
    fontSize: '13px',
    marginBottom: '16px',
    textAlign: 'left',
    lineHeight: 1.5,
  },

  mismatch: {
    color: theme.error,
    fontSize: 12,
    margin: '-6px 0 10px',
    fontWeight: 500,
  },

  backLink: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: '18px',
    color: theme.textMuted,
  },

  backLinkAnchor: {
    color: theme.primary,
    textDecoration: 'none',
    fontWeight: 700,
  },

  successBox: {
    textAlign: 'center',
    padding: '8px 0',
  },

  successIconWrap: {
    width: '78px',
    height: '78px',
    margin: '0 auto 16px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${theme.success}, #15803d)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 24px rgba(22,163,74,0.22)',
  },

  successIcon: {
    fontSize: 36,
  },

  successTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: theme.dark,
    margin: '0 0 10px',
    letterSpacing: '-0.4px',
  },

  successMsg: {
    color: theme.textMuted,
    fontSize: 14,
    marginBottom: '20px',
    lineHeight: 1.6,
  },

  loginLink: {
    display: 'inline-block',
    padding: '12px 28px',
    background: theme.primary,
    color: '#fff',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 15,
    boxShadow: '0 8px 20px rgba(234,88,12,0.25)',
  },
};