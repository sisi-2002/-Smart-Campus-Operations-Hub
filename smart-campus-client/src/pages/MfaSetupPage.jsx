import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

export default function MfaSetupPage({ userId, qrCodeUri, secretKey }) {
  const [code, setCode]       = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (loading || code.length !== 6) return;
    
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login/verify-mfa', {
        userId,
        code: parseInt(code),
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
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.title}>Set up 2-Step Verification</h2>
        <p style={s.sub}>
          Your role requires extra security. Scan this QR code with
          <strong> Google Authenticator</strong> or <strong>Authy</strong>.
        </p>

        {/* QR Code */}
        <div style={s.qrBox}>
          <QRCodeSVG value={qrCodeUri} size={180} />
        </div>

        {/* Manual entry backup */}
        <div style={s.secretBox}>
          <p style={s.secretLabel}>Or enter this key manually:</p>
          <code style={s.secret}>{secretKey}</code>
        </div>

        <p style={s.instruction}>
          After scanning, enter the <strong>6-digit code</strong> shown
          in your authenticator app:
        </p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleVerify}>
          <input
            style={s.codeInput}
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            required
          />
          <button style={s.btn} type="submit" disabled={loading || code.length !== 6}>
            {loading ? 'Verifying...' : 'Verify & Activate'}
          </button>
        </form>
      </div>
    </div>
  );
}

const s = {
  page:        { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#f1f5f9' },
  card:        { background:'#fff', padding:'2.5rem', borderRadius:16, width:420, boxShadow:'0 4px 24px rgba(0,0,0,0.08)', textAlign:'center' },
  title:       { fontSize:22, fontWeight:600, margin:'0 0 8px' },
  sub:         { color:'#64748b', fontSize:14, marginBottom:'1.5rem', lineHeight:1.6 },
  qrBox:       { display:'flex', justifyContent:'center', padding:'1rem', background:'#f8fafc', borderRadius:12, marginBottom:'1rem', border:'1px solid #e2e8f0' },
  secretBox:   { background:'#f1f5f9', borderRadius:8, padding:'10px', marginBottom:'1rem' },
  secretLabel: { fontSize:12, color:'#64748b', margin:'0 0 4px' },
  secret:      { fontSize:13, color:'#334155', wordBreak:'break-all' },
  instruction: { fontSize:14, color:'#475569', marginBottom:'1rem' },
  codeInput:   { width:'100%', padding:'14px', fontSize:28, textAlign:'center', border:'2px solid #e2e8f0', borderRadius:10, letterSpacing:12, boxSizing:'border-box', marginBottom:'1rem', outline:'none' },
  btn:         { width:'100%', padding:12, background:'#6366f1', color:'#fff', border:'none', borderRadius:8, fontSize:15, cursor:'pointer', fontWeight:500, opacity:1 },
  error:       { background:'#fef2f2', color:'#dc2626', padding:'10px 12px', borderRadius:8, fontSize:13, marginBottom:'1rem' },
};