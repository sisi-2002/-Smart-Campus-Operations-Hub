import { useMemo, useState } from 'react';
import { sendManagerBroadcastNotice } from '../../api/notificationApi';

const toInputDateTime = (date) => {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function ManagerBroadcastPanel() {
  const initialStart = useMemo(() => new Date(), []);
  const initialEnd = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d;
  }, []);

  const [title, setTitle] = useState('Maintenance Notice');
  const [message, setMessage] = useState('Planned maintenance may affect your booking. Please check your resource details before arrival.');
  const [resourceQuery, setResourceQuery] = useState('');
  const [windowStart, setWindowStart] = useState(toInputDateTime(initialStart));
  const [windowEnd, setWindowEnd] = useState(toInputDateTime(initialEnd));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError('Title and message are required');
      return;
    }

    setSending(true);
    setError('');
    setResult(null);

    try {
      const response = await sendManagerBroadcastNotice({
        title: title.trim(),
        message: message.trim(),
        resourceQuery: resourceQuery.trim() || null,
        windowStart: windowStart || null,
        windowEnd: windowEnd || null,
      });
      setResult(response.data);
    } catch (err) {
      const apiMessage = err?.response?.data?.error || err?.response?.data?.message;
      setError(apiMessage || 'Failed to send notice');
    } finally {
      setSending(false);
    }
  };

  return (
    <section style={s.wrap}>
      <div style={s.headRow}>
        <div>
          <h2 style={s.title}>Manager Broadcast Notices</h2>
          <p style={s.sub}>Targets users with upcoming APPROVED/PENDING bookings that overlap the selected window.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} style={s.form}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Notice title"
          style={s.input}
          maxLength={120}
        />

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Notice message"
          rows={4}
          style={{ ...s.input, resize: 'vertical' }}
          maxLength={1000}
        />

        <div style={s.grid}>
          <input
            value={resourceQuery}
            onChange={(event) => setResourceQuery(event.target.value)}
            placeholder="Optional filter: building, room, location, type"
            style={s.input}
            maxLength={120}
          />
          <input
            type="datetime-local"
            value={windowStart}
            onChange={(event) => setWindowStart(event.target.value)}
            style={s.input}
          />
          <input
            type="datetime-local"
            value={windowEnd}
            onChange={(event) => setWindowEnd(event.target.value)}
            style={s.input}
          />
        </div>

        <button type="submit" style={s.button} disabled={sending}>
          {sending ? 'Sending...' : 'Send Notice'}
        </button>
      </form>

      {error && <div style={s.error}>{error}</div>}

      {result && (
        <div style={s.success}>
          Notice sent to {result.notifiedUsers} users ({result.matchedBookings} matched bookings).
        </div>
      )}
    </section>
  );
}

const s = {
  wrap: {
    margin: '16px 16px 0',
    background: '#fff',
    border: '1px solid #e4dfd4',
    borderRadius: 14,
    padding: 16,
  },
  headRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    margin: 0,
    color: '#1c1917',
    fontSize: 20,
    letterSpacing: '-0.01em',
  },
  sub: {
    margin: '4px 0 0',
    color: '#78716c',
    fontSize: 13,
  },
  form: {
    display: 'grid',
    gap: 10,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr 1fr',
    gap: 10,
  },
  input: {
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '9px 10px',
    fontSize: 13,
    color: '#0f172a',
    background: '#fff',
  },
  button: {
    width: 'fit-content',
    border: 'none',
    borderRadius: 8,
    background: '#0d7a6b',
    color: '#fff',
    padding: '10px 14px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  error: {
    marginTop: 10,
    background: '#fee2e2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    borderRadius: 8,
    padding: '9px 10px',
    fontSize: 13,
  },
  success: {
    marginTop: 10,
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#065f46',
    borderRadius: 8,
    padding: '9px 10px',
    fontSize: 13,
    fontWeight: 600,
  },
};
