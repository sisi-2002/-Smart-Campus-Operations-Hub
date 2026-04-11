import { useEffect, useRef, useState } from 'react';

const resourceOptions = ['Lab A', 'Meeting Room 3B', 'Projector 01', 'Library Desk 2', 'Computer Lab C'];
const categoryOptions = ['Hardware', 'Software', 'Network', 'Facility', 'Other'];
const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];
const MAX_ATTACHMENTS = 3;
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const CONTACT_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_PHONE_PATTERN = /^\+?[0-9][0-9\s()\-]{6,}$/;

const initialFormState = {
  resourceLocation: '',
  category: '',
  priority: '',
  description: '',
  preferredContact: '',
};

// Centralized validation keeps create/edit submission rules consistent.
const validateIncidentForm = (formData) => {
  const errors = {};
  const resourceLocation = String(formData.resourceLocation || '').trim();
  const category = String(formData.category || '').trim();
  const priority = String(formData.priority || '').trim();
  const description = String(formData.description || '').trim();
  const preferredContact = String(formData.preferredContact || '').trim();

  if (!resourceLocation) {
    errors.resourceLocation = 'Please select a resource or location.';
  } else if (!resourceOptions.includes(resourceLocation)) {
    errors.resourceLocation = 'Please select a valid resource or location.';
  }

  if (!category) {
    errors.category = 'Please select a category.';
  } else if (!categoryOptions.includes(category)) {
    errors.category = 'Please select a valid category.';
  }

  if (!priority) {
    errors.priority = 'Please select a priority level.';
  } else if (!priorityOptions.includes(priority)) {
    errors.priority = 'Please select a valid priority level.';
  }

  if (!description) {
    errors.description = 'Description is required.';
  } else if (description.length < 20) {
    errors.description = 'Description must be at least 20 characters.';
  } else if (description.length > 2000) {
    errors.description = 'Description must be 2000 characters or less.';
  }

  if (!preferredContact) {
    errors.preferredContact = 'Preferred contact is required.';
  } else {
    const isEmail = CONTACT_EMAIL_PATTERN.test(preferredContact);
    const isPhone = CONTACT_PHONE_PATTERN.test(preferredContact);
    if (!isEmail && !isPhone) {
      errors.preferredContact = 'Enter a valid email address or phone number.';
    }
  }

  return errors;
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

.ir-input-error {
  border-color: var(--ir-danger) !important;
  box-shadow: 0 0 0 3px var(--ir-danlt);
  background: #fff7f9;
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

.ir-field-error {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--ir-danger);
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

// Ticket report/edit modal used in the user incident workflow.
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
  const [fieldErrors, setFieldErrors] = useState({});
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
      setFieldErrors({});
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
    setFieldErrors({});
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
      setFieldErrors({});
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

    setFieldErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    // Enforce attachment limits before doing FileReader work.
    if (selectedFiles.length > MAX_ATTACHMENTS) {
      setAttachmentError(`You can upload a maximum of ${MAX_ATTACHMENTS} images. Please select up to ${MAX_ATTACHMENTS} files.`);
      setAttachments([]);
      event.target.value = '';
      return;
    }

    const nonImageFile = selectedFiles.find((file) => !String(file.type || '').startsWith('image/'));
    if (nonImageFile) {
      setAttachmentError(`Only image files are allowed. "${nonImageFile.name}" is not an image.`);
      setAttachments([]);
      event.target.value = '';
      return;
    }

    const oversizedFile = selectedFiles.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (oversizedFile) {
      setAttachmentError(`"${oversizedFile.name}" is larger than ${MAX_IMAGE_SIZE_MB}MB.`);
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

    // Validate first so users get field-level feedback before API calls.
    const validationErrors = validateIncidentForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setSubmitError('Please fix the highlighted fields and try again.');
      return;
    }

    if (attachmentError) {
      setSubmitError('Please resolve attachment errors before submitting.');
      return;
    }

    setFieldErrors({});

    if (!onSubmitTicket) {
      setSubmitError('Submit handler is not configured.');
      return;
    }

    setSubmitError('');
    setSubmitMessage('');
    setIsSubmitting(true);

    try {
      const normalizedFormData = {
        ...formData,
        resourceLocation: formData.resourceLocation.trim(),
        category: formData.category.trim(),
        priority: formData.priority.trim(),
        description: formData.description.trim(),
        preferredContact: formData.preferredContact.trim(),
      };

      const payload = {
        ...normalizedFormData,
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
    setFieldErrors({});
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
                    className={`ir-input${fieldErrors.resourceLocation ? ' ir-input-error' : ''}`}
                    aria-invalid={Boolean(fieldErrors.resourceLocation)}
                    required
                  >
                    <option value="">Select a resource or location</option>
                    {resourceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.resourceLocation && <p className="ir-field-error">{fieldErrors.resourceLocation}</p>}
                </label>

                <label className="ir-field">
                  <span className="ir-label">Category <span className="ir-req">*</span></span>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFieldChange}
                    className={`ir-input${fieldErrors.category ? ' ir-input-error' : ''}`}
                    aria-invalid={Boolean(fieldErrors.category)}
                    required
                  >
                    <option value="">Select a category</option>
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.category && <p className="ir-field-error">{fieldErrors.category}</p>}
                </label>

                <label className="ir-field">
                  <span className="ir-label">Priority <span className="ir-req">*</span></span>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleFieldChange}
                    className={`ir-input${fieldErrors.priority ? ' ir-input-error' : ''}`}
                    aria-invalid={Boolean(fieldErrors.priority)}
                    required
                  >
                    <option value="">Select priority</option>
                    {priorityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.priority && <p className="ir-field-error">{fieldErrors.priority}</p>}
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
                    className={`ir-textarea${fieldErrors.description ? ' ir-input-error' : ''}`}
                    aria-invalid={Boolean(fieldErrors.description)}
                    rows="5"
                    placeholder="Describe what happened, when it started, and any immediate impact."
                    required
                  />
                  {fieldErrors.description && <p className="ir-field-error">{fieldErrors.description}</p>}
                </label>

                <label className="ir-field full">
                  <span className="ir-label">Preferred Contact <span className="ir-req">*</span></span>
                  <input
                    type="text"
                    name="preferredContact"
                    value={formData.preferredContact}
                    onChange={handleFieldChange}
                    className={`ir-input${fieldErrors.preferredContact ? ' ir-input-error' : ''}`}
                    aria-invalid={Boolean(fieldErrors.preferredContact)}
                    placeholder="Phone number or email"
                    required
                  />
                  {fieldErrors.preferredContact && <p className="ir-field-error">{fieldErrors.preferredContact}</p>}
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
                <span className="ir-helper">Attach up to {MAX_ATTACHMENTS} images (max {MAX_IMAGE_SIZE_MB}MB each).</span>
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