import { useMemo, useState } from 'react';
import {
  createTicketComment,
  deleteTicketComment,
  updateTicketComment,
} from '../api/ticketCommentsApi';

const STAFF_ROLES = new Set(['ADMIN', 'MANAGER', 'TECHNICIAN']);

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

  const renderComment = (comment, isReply = false) => (
    <div key={comment.id} style={{ ...styles.commentCard, ...(isReply ? styles.replyCard : null) }}>
      <div style={styles.commentHeader}>
        <div>
          <strong style={styles.authorName}>{comment.authorName || 'Unknown'}</strong>
          <span style={styles.roleBadge}>{comment.authorRole || '-'}</span>
        </div>
        <span style={styles.metaText}>{commentTimestamp(comment.updatedAt || comment.createdAt)}</span>
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
          <button type="button" style={styles.linkBtn} onClick={() => setReplyTo(comment.id)}>
            Reply
          </button>
        )}
        {canEdit(comment) && editingId !== comment.id && (
          <button type="button" style={styles.linkBtn} onClick={() => startEdit(comment)}>
            Edit
          </button>
        )}
        {canDelete(comment) && (
          <button
            type="button"
            style={styles.dangerLinkBtn}
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
        <div style={styles.replyingTo}>Replying to staff thread
          <button type="button" style={styles.clearReplyBtn} onClick={() => setReplyTo('')}>Clear</button>
        </div>
      )}

      <textarea
        style={styles.textarea}
        value={draft}
        placeholder={replyTo ? 'Write a reply...' : 'Add a comment about this ticket...'}
        onChange={(e) => setDraft(e.target.value)}
      />
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
    borderRadius: 10,
    padding: 12,
    background: '#ffffff',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 8,
  },
  listWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    maxHeight: 240,
    overflowY: 'auto',
    paddingRight: 4,
    marginBottom: 10,
  },
  commentCard: {
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: 10,
    background: '#f8fafc',
  },
  replyCard: {
    marginTop: 8,
    marginLeft: 18,
    background: '#ffffff',
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  authorName: {
    fontSize: 13,
    color: '#0f172a',
    marginRight: 8,
  },
  roleBadge: {
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 999,
    padding: '2px 7px',
    background: '#e2e8f0',
    color: '#334155',
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
  },
  linkBtn: {
    border: 'none',
    background: 'transparent',
    color: '#2563eb',
    padding: 0,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
  },
  dangerLinkBtn: {
    border: 'none',
    background: 'transparent',
    color: '#dc2626',
    padding: 0,
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
  primaryBtn: {
    padding: '7px 12px',
    borderRadius: 8,
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
    color: '#0f172a',
    fontSize: 12,
    fontWeight: 600,
  },
  clearReplyBtn: {
    border: 'none',
    background: 'transparent',
    color: '#2563eb',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 12,
  },
  editWrap: {
    marginBottom: 8,
  },
};
