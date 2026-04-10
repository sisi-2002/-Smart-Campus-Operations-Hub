import { useEffect, useRef, useState } from 'react';

const resourceOptions = ['Lab A', 'Meeting Room 3B', 'Projector 01', 'Library Desk 2', 'Computer Lab C'];
const categoryOptions = ['Hardware', 'Software', 'Network', 'Facility', 'Other'];
const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

const initialFormState = {
  resourceLocation: '',
  category: '',
  priority: '',
  description: '',
  preferredContact: '',
};

export default function IncidentModal({
  open,
  onClose,
  onSubmitTicket,
  mode = 'create',
  initialValues = initialFormState,
  initialAttachments = [],
  submitLabel,
  onSubmitted,
  currentTicketId = '',
}) {
  const resolvedSubmitLabel = submitLabel || (mode === 'edit' ? 'Save Changes' : 'Submit Ticket');
  const title = mode === 'edit' ? 'Edit Incident Ticket' : 'Report a New Incident';
  const subtitle = mode === 'edit'
    ? 'Update the ticket details while it is still open.'
    : 'Submit a detailed report so the operations team can respond quickly.';
  const [formData, setFormData] = useState(initialFormState);
  const [attachments, setAttachments] = useState([]);
  const [attachmentError, setAttachmentError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setFormData({
        resourceLocation: initialValues.resourceLocation || '',
        category: initialValues.category || '',
        priority: initialValues.priority || '',
        description: initialValues.description || '',
        preferredContact: initialValues.preferredContact || '',
      });
      setAttachments(Array.isArray(initialAttachments) ? initialAttachments : []);
      setAttachmentError('');
      setSubmitError('');
      setSubmitMessage('');
      setIsSubmitting(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setFormData(initialFormState);
    setAttachments([]);
    setAttachmentError('');
    setSubmitError('');
    setSubmitMessage('');
    setIsSubmitting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [open, initialAttachments, initialValues]);

  useEffect(() => {
    if (!open) {
      setFormData(initialFormState);
      setAttachments([]);
      setAttachmentError('');
      setSubmitError('');
      setSubmitMessage('');
      setIsSubmitting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length > 3) {
      setAttachmentError('You can upload a maximum of 3 images. Please select up to 3 files.');
      setAttachments([]);
      event.target.value = '';
      return;
    }

    Promise.all(
      selectedFiles.map((file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: file.name, dataUrl: String(reader.result || '') });
        reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
        reader.readAsDataURL(file);
      }))
    )
      .then((loadedAttachments) => {
        setAttachmentError('');
        setAttachments(loadedAttachments);
      })
      .catch((error) => {
        setAttachmentError(error.message || 'Failed to load selected images.');
        setAttachments([]);
        event.target.value = '';
      });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Client-side validation
    const requiredFields = ['resourceLocation', 'category', 'priority', 'description', 'preferredContact'];
    for (const field of requiredFields) {
      if (!formData[field] || !formData[field].trim()) {
        setSubmitError(`${field.replace(/([A-Z])/g, ' $1').trim()} is required.`);
        return;
      }
    }

    if (!onSubmitTicket) {
      setSubmitError('Submit handler is not configured.');
      return;
    }

    setSubmitError('');
    setSubmitMessage('');
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        imageNames: attachments.map((file) => file.name),
        imageDataUrls: attachments.map((file) => file.dataUrl),
      };

      const response = await onSubmitTicket(payload);
      const createdTicketId = response?.data?.ticketId;
      setSubmitMessage(
        createdTicketId
          ? `Ticket ${createdTicketId} submitted successfully.`
          : 'Ticket submitted successfully.'
      );
      if (onSubmitted) {
        onSubmitted(response);
      }
    } catch (err) {
      // Handle different error response formats
      const errorMessage = 
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to submit ticket. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setAttachments([]);
    setAttachmentError('');
    setSubmitError('');
    setSubmitMessage('');
    setIsSubmitting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose?.();
  };

  return (
    <div style={styles.overlay} onClick={handleCancel}>
      <div style={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>{title}</h2>
            <p style={styles.subtitle}>{subtitle}</p>
            {mode === 'edit' && currentTicketId && (
              <div style={styles.ticketRef}>Editing ticket {currentTicketId}</div>
            )}
          </div>
          <button type="button" style={styles.closeButton} onClick={handleCancel} aria-label="Close modal">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {submitError && <div style={styles.errorText}>{submitError}</div>}
          {submitMessage && <div style={styles.successText}>{submitMessage}</div>}

          <div style={styles.grid}>
            <label style={styles.field}>
              <span style={styles.label}>Resource / Location</span>
              <select
                name="resourceLocation"
                value={formData.resourceLocation}
                onChange={handleFieldChange}
                style={styles.input}
                required
              >
                <option value="">Select a resource or location</option>
                {resourceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label style={styles.field}>
              <span style={styles.label}>Category</span>
              <select
                name="category"
                value={formData.category}
                onChange={handleFieldChange}
                style={styles.input}
                required
              >
                <option value="">Select a category</option>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label style={styles.field}>
              <span style={styles.label}>Priority</span>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleFieldChange}
                style={styles.input}
                required
              >
                <option value="">Select priority</option>
                {priorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ ...styles.field, gridColumn: '1 / -1' }}>
              <span style={styles.label}>Description</span>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFieldChange}
                style={{ ...styles.input, ...styles.textarea }}
                rows="5"
                placeholder="Describe what happened, when it started, and any immediate impact."
                required
              />
            </label>

            <label style={{ ...styles.field, gridColumn: '1 / -1' }}>
              <span style={styles.label}>Preferred Contact</span>
              <input
                type="text"
                name="preferredContact"
                value={formData.preferredContact}
                onChange={handleFieldChange}
                style={styles.input}
                placeholder="Phone number or email"
                required
              />
            </label>

            <label style={{ ...styles.field, gridColumn: '1 / -1' }}>
              <span style={styles.label}>Image Attachments</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={styles.fileInput}
              />
              <span style={styles.helperText}>Attach up to 3 images showing the issue.</span>
              {attachmentError && <div style={styles.errorText}>{attachmentError}</div>}
              {!attachmentError && attachments.length > 0 && (
                <div style={styles.fileList}>
                  {attachments.map((file, index) => (
                    <div key={`${file.name}-${index}`} style={styles.filePreview}>
                      <img src={file.dataUrl} alt={file.name} style={styles.fileThumbnail} />
                      <div style={styles.fileChip}>{file.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </label>
          </div>

          <div style={styles.actions}>
            <button type="button" style={styles.cancelButton} onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" style={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : resolvedSubmitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(8px)',
  },
  modal: {
    width: '100%',
    maxWidth: 760,
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: 20,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.25)',
    padding: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: '#0f172a',
  },
  subtitle: {
    margin: '6px 0 0',
    color: '#64748b',
    fontSize: 14,
    lineHeight: 1.5,
  },
  ticketRef: {
    display: 'inline-flex',
    marginTop: 8,
    padding: '4px 10px',
    borderRadius: 999,
    background: '#eef2ff',
    border: '1px solid #c7d2fe',
    color: '#3730a3',
    fontSize: 12,
    fontWeight: 700,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    color: '#475569',
    fontSize: 24,
    lineHeight: 1,
    cursor: 'pointer',
    flexShrink: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 16,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#334155',
  },
  input: {
    width: '100%',
    borderRadius: 12,
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#0f172a',
    padding: '12px 14px',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box',
  },
  textarea: {
    resize: 'vertical',
    minHeight: 140,
  },
  fileInput: {
    width: '100%',
    borderRadius: 12,
    border: '1px dashed #94a3b8',
    background: '#f8fafc',
    color: '#334155',
    padding: '12px 14px',
    fontSize: 14,
    boxSizing: 'border-box',
  },
  helperText: {
    fontSize: 12,
    color: '#64748b',
  },
  errorText: {
    fontSize: 13,
    color: '#b91c1c',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 10,
    padding: '10px 12px',
  },
  successText: {
    marginBottom: 16,
    fontSize: 13,
    color: '#166534',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 10,
    padding: '10px 12px',
    fontWeight: 600,
  },
  fileList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  filePreview: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    alignItems: 'flex-start',
  },
  fileThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 12,
    objectFit: 'cover',
    border: '1px solid #cbd5e1',
    background: '#f8fafc',
  },
  fileChip: {
    padding: '6px 10px',
    borderRadius: 999,
    background: '#e2e8f0',
    color: '#334155',
    fontSize: 12,
    fontWeight: 600,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
    flexWrap: 'wrap',
  },
  cancelButton: {
    borderRadius: 12,
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#334155',
    padding: '11px 18px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  submitButton: {
    borderRadius: 12,
    border: '1px solid #1d4ed8',
    background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
    color: '#ffffff',
    padding: '11px 18px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 12px 24px rgba(37, 99, 235, 0.18)',
  },
};