import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

export default function RegisterPage() {
  const [form, setForm]       = useState({ name:'', email:'', password:'' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <div style={s.page}>
      <div style={s.card}>
        <h2 style={s.title}>Create account</h2>
        <p style={s.subtitle}>Join Smart Campus</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={s.label}>Full Name</label>
          <input style={s.input} type="text" name="name"
            value={form.name} onChange={handleChange} required />

          <label style={s.label}>Email</label>
          <input style={s.input} type="email" name="email"
            value={form.email} onChange={handleChange} required />

          <label style={s.label}>Password</label>
          <input style={s.input} type="password" name="password"
            value={form.password} onChange={handleChange} required />

          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p style={s.foot}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page:     { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#f1f5f9' },
  card:     { background:'#fff', padding:'2.5rem', borderRadius:16, width:380, boxShadow:'0 4px 24px rgba(0,0,0,0.08)' },
  title:    { fontSize:24, fontWeight:600, margin:0 },
  subtitle: { color:'#64748b', fontSize:14, marginBottom:'1.5rem' },
  label:    { display:'block', fontSize:13, color:'#374151', marginBottom:4 },
  input:    { width:'100%', padding:'10px 12px', border:'1px solid #e2e8f0', borderRadius:8, marginBottom:'1rem', boxSizing:'border-box', fontSize:14 },
  btn:      { width:'100%', padding:11, background:'#6366f1', color:'#fff', border:'none', borderRadius:8, fontSize:15, cursor:'pointer', fontWeight:500 },
  error:    { background:'#fef2f2', color:'#dc2626', padding:'10px 12px', borderRadius:8, fontSize:13, marginBottom:'1rem' },
  foot:     { textAlign:'center', fontSize:13, marginTop:'1rem', color:'#64748b' },
};