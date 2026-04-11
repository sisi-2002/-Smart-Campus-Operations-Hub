import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import bookingApi from '../api/bookingApi';

export default function CheckInVerificationPage() {
  const location = useLocation();
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get('qr');
    if (fromQuery) {
      setQrData(fromQuery);
    }
  }, [location.search]);

  const verify = async () => {
    const value = qrData.trim();
    if (!value) {
      setError('Paste scanned QR payload first');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await bookingApi.verifyCheckIn(value);
      setResult(response.data);
    } catch (err) {
      const apiMessage = err?.response?.data?.error || err?.response?.data?.message;
      setError(apiMessage || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.eyebrow}>Booking Check-in</div>
        <h1 style={s.title}>QR Verification</h1>
        <p style={s.sub}>Open via scanned QR link or paste the QR payload to verify approved bookings.</p>

        <textarea
          value={qrData}
          onChange={(e) => setQrData(e.target.value)}
          placeholder="SCHECKIN|bookingId|token"
          style={s.textarea}
          rows={4}
        />

        <button onClick={verify} disabled={loading} style={s.button}>
          {loading ? 'Verifying...' : 'Verify & Check-in'}
        </button>

        {error && <div style={s.error}>{error}</div>}

        {result && (
          <div style={s.result}>
            <div style={s.resultTitle}>Check-in Successful</div>
            <div><strong>Booking:</strong> {result.id}</div>
            <div><strong>Resource:</strong> {result.resourceName}</div>
            <div><strong>User:</strong> {result.userName} ({result.userEmail})</div>
            <div><strong>Start:</strong> {new Date(result.startTime).toLocaleString()}</div>
            <div><strong>End:</strong> {new Date(result.endTime).toLocaleString()}</div>
            <div><strong>Checked-in By:</strong> {result.checkedInBy || '-'}</div>
            <div><strong>Checked-in At:</strong> {result.checkedInAt ? new Date(result.checkedInAt).toLocaleString() : '-'}</div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: 'calc(100vh - 60px)',
    background: '#f4f1eb',
    display: 'grid',
    placeItems: 'center',
    padding: '24px'
  },
  card: {
    width: 'min(720px, 100%)',
    background: '#fff',
    border: '1px solid #e4dfd4',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 30px #1c191710'
  },
  eyebrow: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '.12em',
    color: '#0d7a6b',
    fontWeight: 700
  },
  title: {
    margin: '6px 0 4px',
    fontSize: 28,
    color: '#1c1917'
  },
  sub: {
    margin: '0 0 16px',
    color: '#78716c'
  },
  textarea: {
    width: '100%',
    border: '1px solid #e4dfd4',
    borderRadius: 10,
    padding: 12,
    fontFamily: 'monospace',
    fontSize: 13,
    marginBottom: 12,
    outline: 'none'
  },
  button: {
    background: '#0d7a6b',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '10px 16px',
    fontWeight: 700,
    cursor: 'pointer'
  },
  error: {
    marginTop: 12,
    background: '#fee2e2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    borderRadius: 10,
    padding: 10,
    fontSize: 13
  },
  result: {
    marginTop: 12,
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#065f46',
    borderRadius: 10,
    padding: 12,
    lineHeight: 1.6,
    fontSize: 13
  },
  resultTitle: {
    fontWeight: 700,
    marginBottom: 8
  }
};
