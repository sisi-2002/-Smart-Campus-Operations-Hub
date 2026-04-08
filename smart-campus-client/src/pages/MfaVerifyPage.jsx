import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

export default function MfaVerifyPage({ userId }) {
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
        {/* Shield icon */}
        <div style={s.icon}>🔐</div>
        <h2 style={s.title}>2-Step Verification</h2>
        <p style={s.sub}>
          Open <strong>Google Authenticator</strong> and enter the
          6-digit code for <strong>SmartCampus</strong>.
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
            autoFocus
            required
          />
          <button
            style={{ ...s.btn,
              opacity: code.length === 6 ? 1 : 0.6 }}
            type="submit"
            disabled={loading || code.length !== 6}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <p style={s.note}>
          Code refreshes every 30 seconds. Make sure your phone time is correct.
        </p>
      </div>
    </div>
  );
}

const s = {
  page:      { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#f1f5f9' },
  card:      { background:'#fff', padding:'2.5rem', borderRadius:16, width:380, boxShadow:'0 4px 24px rgba(0,0,0,0.08)', textAlign:'center' },
  icon:      { fontSize:40, marginBottom:8 },
  title:     { fontSize:22, fontWeight:600, margin:'0 0 8px' },
  sub:       { color:'#64748b', fontSize:14, marginBottom:'1.5rem', lineHeight:1.6 },
  codeInput: { width:'100%', padding:'14px', fontSize:28, textAlign:'center', border:'2px solid #e2e8f0', borderRadius:10, letterSpacing:12, boxSizing:'border-box', marginBottom:'1rem', outline:'none' },
  btn:       { width:'100%', padding:12, background:'#6366f1', color:'#fff', border:'none', borderRadius:8, fontSize:15, cursor:'pointer', fontWeight:500 },
  error:     { background:'#fef2f2', color:'#dc2626', padding:'10px 12px', borderRadius:8, fontSize:13, marginBottom:'1rem' },
  note:      { fontSize:12, color:'#94a3b8', marginTop:'1rem' },
};