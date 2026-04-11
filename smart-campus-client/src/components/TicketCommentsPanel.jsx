import { useMemo, useState } from 'react';
import {
  createTicketComment,
  deleteTicketComment,
  updateTicketComment,
} from '../api/ticketCommentsApi';

// Only staff roles can post threaded replies in ticket discussions.
const STAFF_ROLES = new Set(['ADMIN', 'MANAGER', 'TECHNICIAN']);

const ROLE_STYLE = {
  ADMIN: { background: '#fef3c7', color: '#92400e' },
  MANAGER: { background: '#f3e8ff', color: '#6b21a8' },
  TECHNICIAN: { background: '#dbeafe', color: '#1e40af' },
  USER: { background: '#dcfce7', color: '#166534' },
};

// Shared ticket discussion panel used in user, admin, and technician ticket views.
export default function TicketCommentsPanel({
  ticket,
  currentUser,
  onCommentsChange,
  onError,
  onSuccess,
}) {
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [editingText, setEditingText] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const ticketId = ticket?.id || ticket?.ticketId;
  const role = (currentUser?.role || '').toUpperCase();
  const isStaff = STAFF_ROLES.has(role);

  const comments = useMemo(() => {
    const raw = Array.isArray(ticket?.comments) ? ticket.comments : [];
    return [...raw].sort((a, b) => {
      const left = a?.createdAt ? Date.parse(a.createdAt) : 0;
      const right = b?.createdAt ? Date.parse(b.createdAt) : 0;
      return left - right;
    });
  }, [ticket?.comments]);

  const topLevelComments = comments.filter((item) => !item.parentCommentId);
  const repliesByParent = useMemo(() => {
    const map = new Map();
    comments.forEach((item) => {
      if (!item.parentCommentId) {
        return;
      }
      const existing = map.get(item.parentCommentId) || [];
      existing.push(item);
      map.set(item.parentCommentId, existing);
    });
    return map;
  }, [comments]);

  const canEdit = (comment) => comment?.authorUserId && comment.authorUserId === currentUser?.id;
  const canDelete = (comment) => canEdit(comment) || role === 'ADMIN' || role === 'MANAGER';
  const replyingToComment = comments.find((item) => item.id === replyTo);

  const showError = (error) => {
    const apiMessage = typeof error?.response?.data === 'string'
      ? error.response.data
      : error?.response?.data?.error;

    if (onError) {
      onError(apiMessage || 'Comment operation failed');
    }
  };

  const pushComments = (nextComments) => {
    if (onCommentsChange) {
      onCommentsChange(nextComments);
    }
  };

  const submitComment = async () => {
    const message = draft.trim();
    if (!message || !ticketId) {
      return;
    }

    setSaving(true);
    try {
      const res = await createTicketComment(ticketId, {
        message,
        parentCommentId: replyTo || undefined,
      });
      const created = res.data;
      pushComments([...comments, created]);
      setDraft('');
      setReplyTo('');
      if (onSuccess) {
        onSuccess('Comment posted');
      }
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditingText(comment.message || '');
  };

  const saveEdit = async () => {
    const message = editingText.trim();
    if (!message || !ticketId || !editingId) {
      return;
    }

    setSaving(true);
    try {
      const res = await updateTicketComment(ticketId, editingId, { message });
      const updated = res.data;
      pushComments(comments.map((item) => (item.id === editingId ? updated : item)));
      setEditingId('');
      setEditingText('');
      if (onSuccess) {
        onSuccess('Comment updated');
      }
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  const removeComment = async (commentId) => {
    if (!ticketId || !commentId) {
      return;
    }

    setDeletingId(commentId);
    try {
      await deleteTicketComment(ticketId, commentId);
      pushComments(comments.filter((item) => item.id !== commentId && item.parentCommentId !== commentId));
      if (onSuccess) {
        onSuccess('Comment deleted');
      }
    } catch (error) {
      showError(error);
    } finally {
      setDeletingId('');
    }
  };

  const commentTimestamp = (value) => {
    if (!value) {
      return '-';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }
    return date.toLocaleString();
  };

  const roleBadgeStyle = (authorRole) => ({
    ...styles.roleBadge,
    ...(ROLE_STYLE[(authorRole || '').toUpperCase()] || { background: '#e2e8f0', color: '#334155' }),
  });

  const initials = (name) => {
    const raw = (name || 'U').trim();
    if (!raw) {
      return 'U';
    }
    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
  };

  const renderComment = (comment, isReply = false) => (
    <div key={comment.id} style={{ ...styles.commentCard, ...(isReply ? styles.replyCard : null) }}>
      <div style={styles.commentHeader}>
        <div style={styles.authorWrap}>
          <div style={styles.avatar}>{initials(comment.authorName)}</div>
          <div>
            <div style={styles.authorLine}>
              <strong style={styles.authorName}>{comment.authorName || 'Unknown'}</strong>
              <span style={roleBadgeStyle(comment.authorRole)}>{comment.authorRole || '-'}</span>
              {comment.updatedAt && comment.createdAt && comment.updatedAt !== comment.createdAt && (
                <span style={styles.editedPill}>edited</span>
              )}
            </div>
            <div style={styles.metaText}>{commentTimestamp(comment.updatedAt || comment.createdAt)}</div>
          </div>
        </div>
      </div>

      {editingId === comment.id ? (
        <div style={styles.editWrap}>
          <textarea
            style={styles.textarea}
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
          />
          <div style={styles.rowBtns}>
            <button type="button" style={styles.cancelBtn} onClick={() => setEditingId('')}>
              Cancel
            </button>
            <button type="button" style={styles.primaryBtn} onClick={saveEdit} disabled={saving}>
              Save
            </button>
          </div>
        </div>
      ) : (
        <p style={styles.messageText}>{comment.message}</p>
      )}

      <div style={styles.rowBtns}>
        {isStaff && !isReply && (
          <button type="button" style={styles.secondaryBtn} onClick={() => setReplyTo(comment.id)}>
            Reply
          </button>
        )}
        {canEdit(comment) && editingId !== comment.id && (
          <button type="button" style={styles.secondaryBtn} onClick={() => startEdit(comment)}>
            Edit
          </button>
        )}
        {canDelete(comment) && (
          <button
            type="button"
            style={styles.dangerBtn}
            onClick={() => removeComment(comment.id)}
            disabled={deletingId === comment.id}
          >
            {deletingId === comment.id ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>

      {(repliesByParent.get(comment.id) || []).map((reply) => renderComment(reply, true))}
    </div>
  );

  return (
    <div style={styles.wrap}>
      <div style={styles.sectionTitle}>Comments</div>
      <div style={styles.listWrap}>
        {topLevelComments.length === 0 ? (
          <div style={styles.emptyText}>No comments yet.</div>
        ) : (
          topLevelComments.map((comment) => renderComment(comment))
        )}
      </div>

      {replyTo && (
        <div style={styles.replyingTo}>
          <span>
            Replying to <strong>{replyingToComment?.authorName || 'comment'}</strong>
          </span>
          <button type="button" style={styles.clearReplyBtn} onClick={() => setReplyTo('')}>Cancel reply</button>
        </div>
      )}

      <textarea
        style={styles.textarea}
        value={draft}
        placeholder={replyTo ? 'Write a reply...' : 'Add a comment about this ticket...'}
        onChange={(e) => setDraft(e.target.value)}
      />
      <div style={styles.composerMeta}>
        <span>{draft.trim().length} chars</span>
      </div>
      <div style={styles.rowBtns}>
        <button type="button" style={styles.primaryBtn} onClick={submitComment} disabled={saving || !draft.trim()}>
          {saving ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    border: '1px solid #e2e8f0',
    borderRadius: 14,
    padding: 14,
    background: '#ffffff',
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 10,
  },
  listWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    maxHeight: 280,
    overflowY: 'auto',
    paddingRight: 4,
    marginBottom: 12,
  },
  commentCard: {
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: 12,
    background: '#f8fafc',
  },
  replyCard: {
    marginTop: 10,
    marginLeft: 26,
    background: '#ffffff',
    borderLeft: '3px solid #bfdbfe',
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  authorWrap: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    background: '#e2e8f0',
    color: '#1e293b',
    flexShrink: 0,
  },
  authorLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  authorName: {
    fontSize: 13,
    color: '#0f172a',
  },
  roleBadge: {
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 999,
    padding: '2px 8px',
  },
  editedPill: {
    fontSize: 10,
    fontWeight: 600,
    borderRadius: 999,
    padding: '2px 7px',
    background: '#f1f5f9',
    color: '#64748b',
  },
  metaText: {
    fontSize: 11,
    color: '#64748b',
  },
  messageText: {
    margin: '0 0 8px',
    fontSize: 13,
    color: '#334155',
    whiteSpace: 'pre-wrap',
  },
  rowBtns: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  secondaryBtn: {
    border: '1px solid #cbd5e1',
    background: '#fff',
    color: '#334155',
    padding: '5px 10px',
    borderRadius: 999,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
  },
  dangerBtn: {
    border: '1px solid #fecaca',
    background: '#fff5f5',
    color: '#dc2626',
    padding: '5px 10px',
    borderRadius: 999,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
  },
  textarea: {
    width: '100%',
    minHeight: 68,
    resize: 'vertical',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: 13,
    color: '#0f172a',
    outline: 'none',
    marginBottom: 8,
    boxSizing: 'border-box',
  },
  composerMeta: {
    marginTop: -4,
    marginBottom: 8,
    fontSize: 11,
    color: '#64748b',
    textAlign: 'right',
  },
  primaryBtn: {
    padding: '8px 14px',
    borderRadius: 10,
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '7px 12px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    background: '#fff',
    color: '#334155',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
  },
  replyingTo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    color: '#1e293b',
    fontSize: 12,
    fontWeight: 600,
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: 8,
    padding: '8px 10px',
  },
  clearReplyBtn: {
    border: '1px solid #bfdbfe',
    background: '#fff',
    color: '#1d4ed8',
    borderRadius: 999,
    padding: '4px 10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 12,
  },
  editWrap: {
    marginBottom: 8,
  },
};
