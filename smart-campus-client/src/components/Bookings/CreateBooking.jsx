import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingApi from '../../api/bookingApi';
import resourceApi from '../../api/resourceApi';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Epilogue:wght@400;500;600&display=swap');

:root {
  --bg:       #f4f1eb;
  --surface:  #ffffff;
  --border:   #e4dfd4;
  --text:     #1c1917;
  --muted:    #78716c;
  --accent:   #0d7a6b;
  --aclt:     #0d7a6b18;
  --danger:   #be123c;
  --danlt:    #be123c10;
  --radius:   12px;
  --shadow:   0 2px 18px #1c191712;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.cb-wrap {
  min-height: 100vh;
  background: var(--bg);
  font-family: 'Epilogue', sans-serif;
  color: var(--text);
  padding: 40px 16px 80px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.cb-card {
  width: 100%;
  max-width: 640px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: var(--shadow);
  overflow: hidden;
  animation: fadeUp .4s ease both;
}
@keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

/* header strip */
.cb-card-header {
  padding: 26px 32px 20px;
  border-bottom: 1px solid var(--border);
  background: #faf9f7;
}
.cb-eyebrow {
  font-size: 10px; font-weight: 600; letter-spacing: .16em;
  text-transform: uppercase; color: var(--accent); margin-bottom: 5px;
}
.cb-title {
  font-family: 'Playfair Display', serif;
  font-size: 26px; font-weight: 700; color: var(--text);
  letter-spacing: -.01em;
}

/* form body */
.cb-form-body {
  padding: 28px 32px;
  display: flex; flex-direction: column; gap: 22px;
}

/* section divider */
.cb-section {
  display: flex; flex-direction: column; gap: 14px;
}
.cb-section-label {
  font-size: 10px; font-weight: 700; letter-spacing: .14em;
  text-transform: uppercase; color: var(--muted);
  padding-bottom: 8px; border-bottom: 1px solid var(--border);
}

/* field */
.cb-field { display: flex; flex-direction: column; gap: 7px; }
.cb-label {
  font-size: 11px; font-weight: 600; letter-spacing: .08em;
  text-transform: uppercase; color: var(--muted);
}
.cb-req { color: var(--accent); }

.cb-input, .cb-select, .cb-textarea {
  padding: 11px 14px;
  border: 1px solid var(--border); border-radius: 10px;
  font-family: 'Epilogue', sans-serif; font-size: 14px; color: var(--text);
  background: var(--bg); outline: none; width: 100%;
  transition: border-color .18s, box-shadow .18s;
  appearance: none; -webkit-appearance: none;
}
.cb-input:focus,.cb-select:focus,.cb-textarea:focus {
  border-color: var(--accent); box-shadow: 0 0 0 3px var(--aclt); background: #fff;
}
.cb-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2378716c' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 13px center; padding-right: 38px;
}
.cb-textarea { resize: vertical; min-height: 86px; line-height: 1.6; }
.cb-char { font-size: 11px; color: var(--muted); text-align: right; }
.cb-hint { font-size: 11px; color: var(--muted); }

/* loading skeleton */
.cb-skel {
  height: 44px; border-radius: 10px;
  background: linear-gradient(90deg,#ebe8e0 25%,#f4f1eb 50%,#ebe8e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer { to{background-position:-200% 0} }

/* resource info box */
.cb-info-box {
  background: var(--aclt); border: 1px solid #0d7a6b22;
  border-radius: 12px; padding: 15px 18px;
  display: flex; gap: 13px; align-items: flex-start;
  animation: fadeUp .25s ease;
}
.cb-info-icon {
  width: 36px; height: 36px; border-radius: 9px;
  background: var(--accent); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; flex-shrink: 0;
}
.cb-info-name {
  font-family: 'Playfair Display', serif;
  font-size: 15px; font-weight: 700; margin-bottom: 4px;
}
.cb-info-detail { font-size: 12px; color: var(--muted); line-height: 1.8; }
.cb-ftag {
  display: inline-block; background: var(--surface);
  border: 1px solid var(--border); border-radius: 4px;
  padding: 1px 7px; font-size: 10px; color: var(--muted);
  margin: 3px 3px 0 0;
}

/* slot grid */
.cb-slots { display: flex; flex-wrap: wrap; gap: 7px; }
.cb-slot {
  padding: 8px 14px; border-radius: 8px;
  border: 1px solid var(--border);
  font-family: 'Epilogue', sans-serif;
  font-size: 12px; font-weight: 500; color: var(--muted);
  background: var(--bg); cursor: pointer;
  transition: all .15s;
}
.cb-slot:hover { border-color: #0d7a6b55; color: var(--text); }
.cb-slot.active { background: var(--accent); border-color: var(--accent); color: #fff; font-weight: 600; }
.cb-slot-hint { font-size: 11px; color: var(--muted); }

/* slots loading */
.cb-slots-loading { display: flex; gap: 7px; }

/* time row */
.cb-time-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

/* duration badge */
.cb-dur {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px; border-radius: 6px;
  background: var(--aclt); color: var(--accent);
  border: 1px solid #0d7a6b22;
  font-size: 12px; font-weight: 600;
  animation: fadeUp .2s ease;
}

/* error alert */
.cb-error {
  display: flex; align-items: flex-start; gap: 9px;
  padding: 12px 16px; border-radius: 10px;
  background: var(--danlt); border: 1px solid #be123c28;
  color: var(--danger); font-size: 13px; font-weight: 500;
}

/* footer buttons */
.cb-footer {
  padding: 20px 32px 28px;
  display: flex; gap: 12px;
  border-top: 1px solid var(--border);
}
.cb-submit-btn {
  flex: 1; padding: 13px;
  background: var(--accent); color: #fff;
  border: none; border-radius: 10px;
  font-family: 'Epilogue', sans-serif;
  font-size: 14px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: opacity .2s, transform .15s;
}
.cb-submit-btn:hover:not(:disabled){ opacity:.88; transform:translateY(-1px); }
.cb-submit-btn:disabled { opacity:.38; cursor:not-allowed; transform:none; }
.cb-cancel-btn {
  padding: 13px 22px;
  background: var(--bg); color: var(--muted);
  border: 1px solid var(--border); border-radius: 10px;
  font-family: 'Epilogue', sans-serif;
  font-size: 14px; font-weight: 500;
  cursor: pointer; transition: background .18s, color .18s;
}
.cb-cancel-btn:hover { background: var(--border); color: var(--text); }

.cb-spinner {
  width: 15px; height: 15px;
  border: 2px solid #fff4; border-top-color: #fff;
  border-radius: 50%; animation: spin .65s linear infinite;
}
@keyframes spin { to{transform:rotate(360deg)} }

@media(max-width:520px){
  .cb-card-header,.cb-form-body,.cb-footer{ padding-left:20px; padding-right:20px; }
  .cb-time-row{ grid-template-columns:1fr; }
}
`;

/* ─── helpers ── */
const TYPE_ICONS = { LECTURE_HALL:'🏛️', LAB:'🔬', MEETING_ROOM:'🤝', EQUIPMENT:'🔧', STUDIO:'🎨', CONFERENCE:'🎙️' };
const ico = (t) => TYPE_ICONS[t] || '📍';
const calcDur = (s, e) => {
  if (!s || !e) return null;
  const m = (new Date(e) - new Date(s)) / 60000;
  if (m <= 0) return null;
  const h = Math.floor(m/60), r = m%60;
  return h > 0 ? `${h}h${r>0?` ${r}m`:''}` : `${r}m`;
};

/* ─────────────────────────────────────────────────────────────────────
   SAME EXACT STRUCTURE & LOGIC — only the JSX/styles are improved
───────────────────────────────────────────────────────────────────── */
const CreateBooking = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    resourceId: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
    specialRequests: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set minimum date to today
  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setResourcesLoading(true);
      const response = await resourceApi.getAllResources();
      const activeResources = response.data.filter((r) => r.status === 'ACTIVE');
      setResources(activeResources);
      setError(null);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources');
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleResourceSelect = async (resourceId) => {
    const res = resources.find((r) => r.id === resourceId);
    setSelectedResource(res);
    setFormData({ ...formData, resourceId, startTime: '', endTime: '' });
    setSelectedSlot(null);
    setSlotsLoading(true);
    try {
      const response = await bookingApi.getAvailableTimeSlots(resourceId, new Date());
      setAvailableSlots(response.data || []);
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    const startDate = new Date(slot[0]);
    const endDate = new Date(slot[1]);

    const formatForInput = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setFormData({
      ...formData,
      startTime: formatForInput(startDate),
      endTime: formatForInput(endDate),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.resourceId) {
      setError('Please select a resource');
      setLoading(false);
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      setError('Please select start time and end time');
      setLoading(false);
      return;
    }
    if (!formData.purpose || formData.purpose.trim().length < 5) {
      setError('Please enter a purpose (minimum 5 characters)');
      setLoading(false);
      return;
    }

    try {
      const startDate = new Date(formData.startTime);
      const endDate = new Date(formData.endTime);
      const now = new Date();

      console.log('Current time:', now);
      console.log('Start date:', startDate);
      console.log('End date:', endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        setError('Invalid date format');
        setLoading(false);
        return;
      }

      const minStartTime = new Date(now.getTime() + 5 * 60000);
      if (startDate < minStartTime) {
        setError('Start time must be at least 5 minutes in the future');
        setLoading(false);
        return;
      }
      if (startDate >= endDate) {
        setError('Start time must be before end time');
        setLoading(false);
        return;
      }

      const durationHours = (endDate - startDate) / (1000 * 60 * 60);
      if (durationHours < 0.5) {
        setError('Minimum booking duration is 30 minutes');
        setLoading(false);
        return;
      }
      if (durationHours > 8) {
        setError('Maximum booking duration is 8 hours');
        setLoading(false);
        return;
      }

      const formatToUTC = (date) => {
        return new Date(Date.UTC(
          date.getFullYear(), date.getMonth(), date.getDate(),
          date.getHours(), date.getMinutes(), date.getSeconds()
        )).toISOString();
      };

      const bookingData = {
        resourceId: formData.resourceId,
        startTime: formatToUTC(startDate),
        endTime: formatToUTC(endDate),
        purpose: formData.purpose.trim(),
        expectedAttendees: formData.expectedAttendees ? parseInt(formData.expectedAttendees) : 0,
        specialRequests: formData.specialRequests || '',
      };

      console.log('Sending booking data:', bookingData);
      const response = await bookingApi.createBooking(bookingData);
      console.log('Success response:', response.data);

      navigate('/my-bookings');
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      console.error('Error status:', err.response?.status);

      let errorMessage = 'Failed to create booking.';
      if (err.response?.data?.message)       errorMessage = err.response.data.message;
      else if (err.response?.data?.error)    errorMessage = err.response.data.error;
      else if (err.response?.status === 400) errorMessage = 'Invalid booking data. Please check your input.';
      else if (err.response?.status === 401) errorMessage = 'Please login again to continue.';
      else if (err.response?.status === 403) errorMessage = 'You do not have permission to create bookings.';
      else if (err.response?.status === 409) errorMessage = 'This time slot is already booked. Please choose another time.';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const dur = calcDur(formData.startTime, formData.endTime);

  /* ── JSX ── */
  return (
    <>
      <style>{CSS}</style>
      <div className="cb-wrap">
        <div className="cb-card">

          {/* Header */}
          <div className="cb-card-header">
            <div className="cb-eyebrow">Booking System</div>
            <h1 className="cb-title">New Booking</h1>
          </div>

          <div className="cb-form-body">
            {/* Error */}
            {error && (
              <div className="cb-error">
                <span style={{fontSize:16,flexShrink:0}}>⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* ── Section 1: Resource ── */}
            <div className="cb-section">
              <div className="cb-section-label">Step 1 — Choose a Resource</div>

              <div className="cb-field">
                <label className="cb-label">Resource <span className="cb-req">*</span></label>
                {resourcesLoading ? (
                  <div className="cb-skel"/>
                ) : (
                  <select
                    className="cb-select"
                    value={formData.resourceId}
                    onChange={(e) => handleResourceSelect(e.target.value)}
                    required
                  >
                    <option value="">Choose a resource…</option>
                    {resources.map(resource => (
                      <option key={resource.id} value={resource.id}>
                        {resource.name} — {resource.type?.replace(/_/g,' ')} (Cap: {resource.capacity})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Resource info */}
              {selectedResource && (
                <div className="cb-info-box">
                  <div className="cb-info-icon">{ico(selectedResource.type)}</div>
                  <div>
                    <div className="cb-info-name">{selectedResource.name}</div>
                    <div className="cb-info-detail">
                      📍 {selectedResource.location}, {selectedResource.building}<br/>
                      👥 Capacity: {selectedResource.capacity} people<br/>
                      ⏰ {selectedResource.availableFrom} – {selectedResource.availableTo}
                    </div>
                    {selectedResource.features?.length > 0 && (
                      <div style={{marginTop:6}}>
                        {selectedResource.features.map(f => <span key={f} className="cb-ftag">{f}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Section 2: Time ── */}
            <div className="cb-section">
              <div className="cb-section-label">Step 2 — Pick a Time</div>

              {/* Available slots */}
              {selectedResource && (
                slotsLoading ? (
                  <div className="cb-slots-loading">
                    {[1,2,3].map(k => (
                      <div key={k} className="cb-skel" style={{height:36,width:100,flex:'none'}}/>
                    ))}
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="cb-field">
                    <label className="cb-label">Available Slots — Today</label>
                    <div className="cb-slots">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`cb-slot ${selectedSlot === slot ? 'active' : ''}`}
                          onClick={() => handleSlotSelect(slot)}
                        >
                          {formatTime(slot[0])} – {formatTime(slot[1])}
                        </button>
                      ))}
                    </div>
                    <span className="cb-slot-hint">Or set a custom time below</span>
                  </div>
                ) : null
              )}

              {/* Manual time inputs */}
              <div className="cb-time-row">
                <div className="cb-field">
                  <label className="cb-label">Start Time <span className="cb-req">*</span></label>
                  <input
                    type="datetime-local"
                    className="cb-input"
                    value={formData.startTime}
                    min={getMinDateTime()}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    required
                  />
                </div>
                <div className="cb-field">
                  <label className="cb-label">End Time <span className="cb-req">*</span></label>
                  <input
                    type="datetime-local"
                    className="cb-input"
                    value={formData.endTime}
                    min={formData.startTime || getMinDateTime()}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>

              {dur && <span className="cb-dur">⏱ Duration: {dur}</span>}
            </div>

            {/* ── Section 3: Details ── */}
            <div className="cb-section">
              <div className="cb-section-label">Step 3 — Details</div>

              <div className="cb-field">
                <label className="cb-label">Purpose <span className="cb-req">*</span></label>
                <textarea
                  className="cb-textarea"
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  required
                  placeholder="What is the purpose of this booking? (minimum 5 characters)"
                  rows="3"
                  maxLength={300}
                />
                <span className="cb-char">{formData.purpose.length}/300</span>
              </div>

              <div className="cb-field">
                <label className="cb-label">Expected Attendees</label>
                <input
                  type="number"
                  className="cb-input"
                  value={formData.expectedAttendees}
                  onChange={(e) => setFormData({...formData, expectedAttendees: e.target.value})}
                  min="1"
                  max={selectedResource?.capacity || 500}
                  placeholder={`1 – ${selectedResource?.capacity || 500}`}
                />
                {selectedResource && (
                  <span className="cb-hint">Max capacity: {selectedResource.capacity} people</span>
                )}
              </div>

              <div className="cb-field">
                <label className="cb-label">Special Requests</label>
                <textarea
                  className="cb-textarea"
                  style={{minHeight:68}}
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                  placeholder="Projector, catering, accessibility needs…"
                  rows="2"
                  maxLength={200}
                />
                <span className="cb-char">{formData.specialRequests.length}/200</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="cb-footer">
            <button
              type="button"
              onClick={handleSubmit}
              className="cb-submit-btn"
              disabled={loading || !formData.resourceId || !formData.startTime || !formData.purpose}
            >
              {loading
                ? <><div className="cb-spinner"/> Creating…</>
                : '✓ Create Booking'
              }
            </button>
            <button
              type="button"
              className="cb-cancel-btn"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default CreateBooking;