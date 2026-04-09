import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import authBg from '../assets/auth-bg.jpg';

export default function MfaVerifyPage({ userId }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (loading || code.length !== 6) return;

    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login/verify-mfa', {
        userId,
        code: parseInt(code, 10),
      });

      if (res.data.status === 'SUCCESS') {
        const { token, ...userData } = res.data;
        login(token, userData);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code. Try again.');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code.length === 6) {
      handleVerify();
    }
  }, [code]);

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
        <div style={styles.card}>
          <div style={styles.iconWrap}>
            <div style={styles.icon}>🔐</div>
          </div>

          <h2 style={styles.title}>2-Step Verification</h2>

          <p style={styles.sub}>
            Open <strong>Google Authenticator</strong> and enter the
            6-digit code for <strong>SmartCampus</strong>.
          </p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleVerify} style={styles.form}>
            <input
              style={styles.codeInput}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              autoFocus
              required
            />

            <button
              style={{
                ...styles.btn,
                opacity: code.length === 6 ? 1 : 0.65,
                cursor: loading || code.length !== 6 ? 'not-allowed' : 'pointer',
              }}
              type="submit"
              disabled={loading || code.length !== 6}
            >
              {loading ? <span style={styles.loader} /> : 'Verify Code'}
            </button>
          </form>

          <p style={styles.note}>
            Code refreshes every 30 seconds. Make sure your phone time is correct.
          </p>
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
    background: '#eff6ff',
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
    background: 'linear-gradient(135deg, rgba(239,246,255,0.78), rgba(191,219,254,0.72))',
    backdropFilter: 'blur(2px)',
  },

  glowOrb1: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: '50%',
    height: '50%',
    background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, rgba(37,99,235,0.05) 50%, transparent 70%)',
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
    background: 'radial-gradient(circle, rgba(30,64,175,0.15) 0%, rgba(30,64,175,0.05) 50%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(80px)',
    animation: 'floatBG 18s ease-in-out infinite alternate-reverse',
  },

  gridOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'linear-gradient(rgba(37,99,235,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.08) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    opacity: 0.28,
  },

  dataStream: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #2563eb, transparent)',
    animation: 'dataFlow 6s linear infinite',
    opacity: 0.35,
  },

  mainContainer: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '480px',
  },

  card: {
    background: 'rgba(239, 246, 255, 0.78)',
    border: '2px solid rgba(37,99,235,0.75)',
    borderRadius: '30px',
    boxShadow: '0 15px 35px rgba(37,99,235,0.15)',
    padding: '40px 32px',
    textAlign: 'center',
    backdropFilter: 'blur(12px)',
  },

  iconWrap: {
    width: '74px',
    height: '74px',
    margin: '0 auto 14px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2563eb, #1e40af)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 24px rgba(37,99,235,0.25)',
  },

  icon: {
    fontSize: '34px',
  },

  title: {
    fontSize: '30px',
    fontWeight: 700,
    margin: '0 0 10px',
    color: '#1e3a8a',
  },

  sub: {
    color: '#1e40af',
    fontSize: '14px',
    marginBottom: '22px',
    lineHeight: 1.7,
  },

  form: {
    width: '100%',
  },

  codeInput: {
    width: '100%',
    padding: '16px',
    fontSize: '30px',
    textAlign: 'center',
    border: '2px solid #2563eb',
    borderRadius: '12px',
    letterSpacing: '12px',
    boxSizing: 'border-box',
    marginBottom: '14px',
    outline: 'none',
    background: 'rgba(255,255,255,0.58)',
    color: '#1e3a8a',
    fontWeight: 600,
  },

  btn: {
    width: '100%',
    minHeight: '50px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 10px rgba(37,99,235,0.2)',
  },

  loader: {
    width: '20px',
    height: '20px',
    border: '2px solid white',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },

  error: {
    background: '#fff1f1',
    color: '#a94442',
    border: '1px solid #d9534f',
    padding: '10px 12px',
    borderRadius: '10px',
    fontSize: '13px',
    marginBottom: '16px',
    textAlign: 'left',
  },

  note: {
    fontSize: '12px',
    color: '#1e40af',
    marginTop: '16px',
    lineHeight: 1.6,
    opacity: 0.9,
  },
};