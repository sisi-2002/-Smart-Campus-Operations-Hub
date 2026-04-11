import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import MfaSetupPage from './MfaSetupPage';
import MfaVerifyPage from './MfaVerifyPage';

export default function OAuth2CallbackPage() {
  const [searchParams] = useSearchParams();
  const { login }      = useAuth();
  const navigate       = useNavigate();

  const [mfaState, setMfaState] = useState(null);

  useEffect(() => {
    const mfaRequired = searchParams.get('mfaRequired');

    // ✅ If MFA is required (privileged role via Google OAuth)
    if (mfaRequired === 'true') {
      const mfaStatus = searchParams.get('mfaStatus');
      const userId    = searchParams.get('userId');

      if (mfaStatus === 'MFA_SETUP_REQUIRED') {
        setMfaState({
          status: 'MFA_SETUP_REQUIRED',
          userId,
          qrCodeUri: decodeURIComponent(searchParams.get('qrCodeUri') || ''),
          secretKey: searchParams.get('secretKey'),
        });
      } else if (mfaStatus === 'MFA_CODE_REQUIRED') {
        setMfaState({
          status: 'MFA_CODE_REQUIRED',
          userId,
        });
      } else {
        navigate('/auth?mode=login&error=oauth2_failed');
      }
      return;
    }

    // ✅ Standard flow — token was issued directly (non-privileged role)
    const token = searchParams.get('token');

    if (!token) {
      navigate('/auth?mode=login&error=oauth2_failed');
      return;
    }

    // Store token first so the API call can use it
    localStorage.setItem('token', token);

    api.get('/auth/me')
      .then((res) => {
        const { token: _, ...userData } = res.data;
        login(token, userData);
        const nextPath = userData.role === 'ADMIN'
          ? '/admin'
          : userData.role === 'TECHNICIAN'
            ? '/technician'
            : '/';
        navigate(nextPath, { replace: true });
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/auth?mode=login&error=oauth2_failed');
      });
  }, []);

  // ✅ Show MFA setup page (first-time QR code scan)
  if (mfaState?.status === 'MFA_SETUP_REQUIRED') {
    return (
      <MfaSetupPage
        userId={mfaState.userId}
        qrCodeUri={mfaState.qrCodeUri}
        secretKey={mfaState.secretKey}
      />
    );
  }

  // ✅ Show MFA verify page (returning user, enter 6-digit code)
  if (mfaState?.status === 'MFA_CODE_REQUIRED') {
    return <MfaVerifyPage userId={mfaState.userId} />;
  }

  // ✅ Loading spinner while processing
  return (
    <div style={{ display:'flex', justifyContent:'center',
      alignItems:'center', height:'100vh', flexDirection:'column', gap:12 }}>
      <div style={{ width:32, height:32, border:'3px solid #6366f1',
        borderTopColor:'transparent', borderRadius:'50%',
        animation:'spin 0.8s linear infinite' }} />
      <p style={{ color:'#64748b' }}>Signing you in with Google...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}