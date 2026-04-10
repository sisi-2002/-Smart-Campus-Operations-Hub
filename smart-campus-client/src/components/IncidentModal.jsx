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

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Epilogue:wght@400;500;600&display=swap');

:root {
  --ir-bg: #f4f1eb;
  --ir-surface: #ffffff;
  --ir-border: #e4dfd4;
  --ir-text: #1c1917;
  --ir-muted: #78716c;
  --ir-accent: #0d7a6b;
  --ir-aclt: #0d7a6b18;
  --ir-danger: #be123c;
  --ir-danlt: #be123c10;
}

.ir-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.62);
  backdrop-filter: blur(6px);
}

.ir-modal {
  width: 100%;
  max-width: 860px;
  max-height: 92vh;
  overflow-y: auto;
  border-radius: 22px;
  background: var(--ir-surface);
  border: 1px solid var(--ir-border);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
  font-family: 'Epilogue', sans-serif;
  color: var(--ir-text);
}

.ir-header {
  padding: 26px 32px 20px;
  border-bottom: 1px solid var(--ir-border);
  background: #faf9f7;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.ir-eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: var(--ir-accent);
  margin-bottom: 6px;
}

.ir-title {
  margin: 0;
  font-family: 'Playfair Display', serif;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -.01em;
}

.ir-subtitle {
  margin: 8px 0 0;
  color: var(--ir-muted);
  font-size: 13px;
  line-height: 1.6;
}

.ir-ticket-ref {
  display: inline-flex;
  align-items: center;
  margin-top: 10px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--ir-aclt);
  border: 1px solid #0d7a6b35;
  color: var(--ir-accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .06em;
}

.ir-close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--ir-border);
  background: #fff;
  color: var(--ir-muted);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}

.ir-close:hover {
  background: var(--ir-danlt);
  color: var(--ir-danger);
}

.ir-body {
  padding: 24px 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ir-banner {
  padding: 11px 14px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.45;
  border: 1px solid;
}

.ir-banner.error {
  color: var(--ir-danger);
  background: var(--ir-danlt);
  border-color: #be123c2b;
}

.ir-banner.success {
  color: #166534;
  background: #f0fdf4;
  border-color: #bbf7d0;
  font-weight: 600;
}

.ir-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ir-section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--ir-muted);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--ir-border);
}

.ir-grid-3,
.ir-grid-2 {
  display: grid;
  gap: 14px;
}

.ir-grid-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.ir-grid-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.ir-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.ir-field.full {
  grid-column: 1 / -1;
}

.ir-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--ir-muted);
}

.ir-req {
  color: var(--ir-accent);
}

.ir-input,
.ir-textarea,
.ir-file {
  width: 100%;
  border: 1px solid var(--ir-border);
  border-radius: 11px;
  background: var(--ir-bg);
  color: var(--ir-text);
  padding: 12px 14px;
  font-family: 'Epilogue', sans-serif;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  transition: border-color .18s, box-shadow .18s, background .18s;
}

.ir-input:focus,
.ir-textarea:focus,
.ir-file:focus {
  border-color: var(--ir-accent);
  box-shadow: 0 0 0 3px var(--ir-aclt);
  background: #fff;
}

.ir-input {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 38px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2378716c' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 13px center;
}

.ir-textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.ir-file {
  border-style: dashed;
  background: #faf9f7;
}

.ir-helper {
  font-size: 11px;
  color: var(--ir-muted);
}

.ir-file-list {
  margin-top: 2px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.ir-file-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ir-file-thumb {
  width: 100%;
  height: 86px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid var(--ir-border);
  background: #f8fafc;
}

.ir-file-name {
  padding: 5px 8px;
  border-radius: 8px;
  border: 1px solid var(--ir-border);
  background: #fff;
  color: #44403c;
  font-size: 11px;
  line-height: 1.35;
  word-break: break-word;
}

.ir-footer {
  border-top: 1px solid var(--ir-border);
  padding: 18px 32px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.ir-btn-cancel,
.ir-btn-submit {
  border-radius: 10px;
  font-family: 'Epilogue', sans-serif;
  font-size: 14px;
  cursor: pointer;
}

.ir-btn-cancel {
  border: 1px solid var(--ir-border);
  background: var(--ir-bg);
  color: var(--ir-muted);
  padding: 12px 20px;
  font-weight: 500;
}

.ir-btn-cancel:hover {
  background: var(--ir-border);
  color: var(--ir-text);
}

.ir-btn-submit {
  border: 1px solid var(--ir-accent);
  background: var(--ir-accent);
  color: #fff;
  padding: 12px 20px;
  font-weight: 700;
  min-width: 140px;
}

.ir-btn-submit:hover:not(:disabled) {
  opacity: .9;
}

.ir-btn-submit:disabled {
  opacity: .45;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .ir-grid-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .ir-overlay {
    padding: 12px;
  }

  .ir-header,
  .ir-body,
  .ir-footer {
    padding-left: 18px;
    padding-right: 18px;
  }

  .ir-grid-3,
  .ir-grid-2 {
    grid-template-columns: 1fr;
  }

  .ir-title {
    font-size: 24px;
  }

  .ir-footer {
    flex-direction: column-reverse;
  }

  .ir-btn-cancel,
  .ir-btn-submit {
    width: 100%;
  }
}
`;

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
    <div className="ir-overlay" onClick={handleCancel}>
      <style>{CSS}</style>
      <div className="ir-modal" onClick={(event) => event.stopPropagation()}>
        <div className="ir-header">
          <div>
            <div className="ir-eyebrow">Incident Reporting</div>
            <h2 className="ir-title">{title}</h2>
            <p className="ir-subtitle">{subtitle}</p>
            {mode === 'edit' && currentTicketId && (
              <div className="ir-ticket-ref">Editing ticket {currentTicketId}</div>
            )}
          </div>
          <button type="button" className="ir-close" onClick={handleCancel} aria-label="Close modal">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ir-body">
            {submitError && <div className="ir-banner error">{submitError}</div>}
            {submitMessage && <div className="ir-banner success">{submitMessage}</div>}

            <div className="ir-section">
              <div className="ir-section-label">Step 1 - Incident Classification</div>
              <div className="ir-grid-3">
                <label className="ir-field">
                  <span className="ir-label">Resource / Location <span className="ir-req">*</span></span>
                  <select
                    name="resourceLocation"
                    value={formData.resourceLocation}
                    onChange={handleFieldChange}
                    className="ir-input"
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

                <label className="ir-field">
                  <span className="ir-label">Category <span className="ir-req">*</span></span>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFieldChange}
                    className="ir-input"
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

                <label className="ir-field">
                  <span className="ir-label">Priority <span className="ir-req">*</span></span>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleFieldChange}
                    className="ir-input"
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
              </div>
            </div>

            <div className="ir-section">
              <div className="ir-section-label">Step 2 - Describe The Incident</div>
              <div className="ir-grid-2">
                <label className="ir-field full">
                  <span className="ir-label">Description <span className="ir-req">*</span></span>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFieldChange}
                    className="ir-textarea"
                    rows="5"
                    placeholder="Describe what happened, when it started, and any immediate impact."
                    required
                  />
                </label>

                <label className="ir-field full">
                  <span className="ir-label">Preferred Contact <span className="ir-req">*</span></span>
                  <input
                    type="text"
                    name="preferredContact"
                    value={formData.preferredContact}
                    onChange={handleFieldChange}
                    className="ir-input"
                    placeholder="Phone number or email"
                    required
                  />
                </label>
              </div>
            </div>

            <div className="ir-section">
              <div className="ir-section-label">Step 3 - Upload Evidence</div>
              <label className="ir-field">
                <span className="ir-label">Image Attachments</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="ir-file"
                />
                <span className="ir-helper">Attach up to 3 images showing the issue.</span>
                {attachmentError && <div className="ir-banner error">{attachmentError}</div>}
                {!attachmentError && attachments.length > 0 && (
                  <div className="ir-file-list">
                    {attachments.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="ir-file-card">
                        <img src={file.dataUrl} alt={file.name} className="ir-file-thumb" />
                        <div className="ir-file-name">{file.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="ir-footer">
            <button type="button" className="ir-btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="ir-btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : resolvedSubmitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}