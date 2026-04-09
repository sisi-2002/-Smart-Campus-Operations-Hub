import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.icon}>⛔</div>

        <h1 style={styles.title}>Access Denied</h1>

        <p style={styles.text}>
          You do not have permission to access this page or perform this action.
        </p>

        <div style={styles.actions}>
          <Link to="/" style={styles.primaryBtn}>
            Go Home
          </Link>

          <Link to="/login" style={styles.secondaryBtn}>
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
    fontFamily: 'Inter, system-ui, sans-serif',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    background: '#fff',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
  },
  icon: {
    fontSize: '52px',
    marginBottom: '16px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    color: '#0f172a',
  },
  text: {
    marginTop: '12px',
    marginBottom: '28px',
    color: '#64748b',
    lineHeight: 1.6,
    fontSize: '15px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    textDecoration: 'none',
    background: '#4f46e5',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '10px',
    fontWeight: 600,
  },
  secondaryBtn: {
    textDecoration: 'none',
    background: '#fff',
    color: '#334155',
    padding: '12px 20px',
    borderRadius: '10px',
    fontWeight: 600,
    border: '1px solid #cbd5e1',
  },
};