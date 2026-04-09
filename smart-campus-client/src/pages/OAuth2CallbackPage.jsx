import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

export default function OAuth2CallbackPage() {
  const [searchParams] = useSearchParams();
  const { login }      = useAuth();
  const navigate       = useNavigate();

  useEffect(() => {
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