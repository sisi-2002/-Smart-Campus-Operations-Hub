import React, { useState, useEffect, useRef } from 'react';
import resourceApi from '../../api/resourceApi';

/* ─── Stylesheet ──────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Epilogue:wght@300;400;500;600&display=swap');

:root {
  --bg:        #f4f1eb;
  --surface:   #ffffff;
  --border:    #e4dfd4;
  --text:      #1c1917;
  --muted:     #78716c;
  --accent:    #0d7a6b;
  --accent-lt: #0d7a6b18;
  --warn:      #b45309;
  --danger:    #be123c;
  --danger-lt: #be123c12;
  --gold:      #d97706;
  --gold-lt:   #d9770614;
  --radius:    14px;
  --shadow:    0 2px 16px #1c191710;
  --shadow-lg: 0 8px 48px #1c191722;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.rm-page {
  min-height: 100vh;
  background: var(--bg);
  font-family: 'Epilogue', sans-serif;
  color: var(--text);
  padding: 0;
}

/* ── Top bar ── */
.rm-topbar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 20px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  position: sticky; top: 0; z-index: 10;
}
.rm-topbar-left { display: flex; flex-direction: column; gap: 2px; }
.rm-eyebrow {
  font-size: 10px; font-weight: 600; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--accent);
}
.rm-pagetitle {
  font-family: 'Playfair Display', serif;
  font-size: 22px; font-weight: 700; color: var(--text);
  letter-spacing: -0.01em;
}
.rm-topbar-right { display: flex; align-items: center; gap: 12px; }

/* search */
.rm-search-wrap { position: relative; }
.rm-search-wrap svg {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  color: var(--muted); pointer-events: none;
}
.rm-search {
  padding: 9px 12px 9px 36px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: 'Epilogue', sans-serif;
  font-size: 13px; color: var(--text);
  background: var(--bg);
  outline: none; width: 220px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.rm-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-lt); }

/* filter tabs */
.rm-tabs { display: flex; gap: 4px; }
.rm-tab {
  padding: 7px 14px; border-radius: 7px;
  border: 1px solid transparent;
  font-family: 'Epilogue', sans-serif; font-size: 12px; font-weight: 500;
  color: var(--muted); cursor: pointer; background: transparent;
  transition: all 0.18s;
}
.rm-tab:hover { background: var(--border); color: var(--text); }
.rm-tab.active { background: var(--accent); color: #fff; border-color: var(--accent); }

/* add button */
.rm-add-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 18px; border-radius: 8px;
  background: var(--accent); color: #fff;
  border: none; cursor: pointer;
  font-family: 'Epilogue', sans-serif; font-size: 13px; font-weight: 600;
  letter-spacing: 0.02em;
  transition: opacity 0.2s, transform 0.15s;
  white-space: nowrap;
}
.rm-add-btn:hover { opacity: 0.88; transform: translateY(-1px); }

/* ── Main content ── */
.rm-body { padding: 32px 40px; }

/* stats strip */
.rm-stats {
  display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap;
}
.rm-stat {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 14px 20px;
  display: flex; flex-direction: column; gap: 4px;
  flex: 1; min-width: 120px;
  animation: fadeUp 0.4s ease both;
}
.rm-stat:nth-child(1) { animation-delay: 0.05s; }
.rm-stat:nth-child(2) { animation-delay: 0.1s; }
.rm-stat:nth-child(3) { animation-delay: 0.15s; }
.rm-stat:nth-child(4) { animation-delay: 0.2s; }
.rm-stat-val {
  font-family: 'Playfair Display', serif;
  font-size: 26px; font-weight: 700; line-height: 1;
  color: var(--text);
}
.rm-stat-label { font-size: 11px; font-weight: 500; letter-spacing: 0.06em; color: var(--muted); text-transform: uppercase; }
.rm-stat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

/* resource grid */
.rm-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
}

/* card */
.rm-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: box-shadow 0.22s, transform 0.18s;
  animation: fadeUp 0.4s ease both;
  display: flex; flex-direction: column;
}
.rm-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-3px); }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

.rm-card-top {
  padding: 18px 20px 14px;
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 12px;
}
.rm-card-type-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.rm-card-icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: var(--accent-lt);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
}
.rm-card-type-label {
  font-size: 10px; font-weight: 600; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--accent);
}
.rm-card-name {
  font-family: 'Playfair Display', serif;
  font-size: 17px; font-weight: 700; color: var(--text); line-height: 1.2;
}
.rm-status-pill {
  padding: 3px 10px; border-radius: 20px;
  font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; flex-shrink: 0;
}
.status-ACTIVE       { background: #d1fae5; color: #065f46; }
.status-MAINTENANCE  { background: #fef3c7; color: #92400e; }
.status-OUT_OF_SERVICE { background: #fee2e2; color: #991b1b; }

.rm-card-divider { height: 1px; background: var(--border); margin: 0 20px; }

.rm-card-body { padding: 14px 20px; flex: 1; }
.rm-card-meta {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
.rm-meta-item { display: flex; flex-direction: column; gap: 2px; }
.rm-meta-key { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
.rm-meta-val { font-size: 13px; font-weight: 500; color: var(--text); }

.rm-card-features { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 12px; }
.rm-feat-tag {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 5px; padding: 2px 8px;
  font-size: 11px; font-weight: 500; color: var(--muted);
}
.rm-feat-none { font-size: 12px; color: var(--border); font-style: italic; margin-top: 10px; }

.rm-card-foot {
  padding: 12px 20px;
  border-top: 1px solid var(--border);
  display: flex; gap: 8px;
  background: #faf9f7;
}
.rm-btn-edit {
  flex: 1; padding: 8px; border-radius: 7px;
  background: var(--gold-lt); color: var(--gold);
  border: 1px solid #d9770630;
  font-family: 'Epilogue', sans-serif; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: background 0.18s;
}
.rm-btn-edit:hover { background: #d9770624; }
.rm-btn-del {
  padding: 8px 14px; border-radius: 7px;
  background: var(--danger-lt); color: var(--danger);
  border: 1px solid #be123c20;
  font-family: 'Epilogue', sans-serif; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: background 0.18s;
}
.rm-btn-del:hover { background: #be123c22; }

/* confirm delete overlay on card */
.rm-del-confirm {
  position: absolute; inset: 0;
  background: #fff9f9ee;
  backdrop-filter: blur(2px);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 14px; padding: 20px; border-radius: var(--radius);
  animation: fadeUp 0.2s ease;
  z-index: 2;
}
.rm-del-confirm p {
  font-size: 13px; font-weight: 500; color: var(--danger);
  text-align: center; line-height: 1.5;
}
.rm-del-confirm-actions { display: flex; gap: 8px; }
.rm-del-yes {
  padding: 8px 18px; border-radius: 7px;
  background: var(--danger); color: #fff;
  border: none; font-family: 'Epilogue', sans-serif;
  font-size: 13px; font-weight: 600; cursor: pointer;
}
.rm-del-no {
  padding: 8px 18px; border-radius: 7px;
  background: var(--border); color: var(--text);
  border: none; font-family: 'Epilogue', sans-serif;
  font-size: 13px; font-weight: 500; cursor: pointer;
}

/* empty */
.rm-empty {
  grid-column: 1 / -1;
  text-align: center; padding: 80px 40px;
  color: var(--muted);
}
.rm-empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.4; }
.rm-empty-title { font-family: 'Playfair Display', serif; font-size: 20px; color: var(--text); margin-bottom: 8px; }
.rm-empty-sub { font-size: 14px; }

/* skeleton */
.rm-skel {
  background: linear-gradient(90deg, #ebe8e0 25%, #f4f1eb 50%, #ebe8e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 6px;
}
@keyframes shimmer { to { background-position: -200% 0; } }

/* ── Drawer overlay ── */
.rm-overlay {
  position: fixed; inset: 0;
  background: #1c191766;
  backdrop-filter: blur(3px);
  z-index: 100;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.rm-drawer {
  position: fixed; top: 0; right: 0; bottom: 0;
  width: min(580px, 100vw);
  background: var(--surface);
  border-left: 1px solid var(--border);
  box-shadow: -8px 0 48px #1c191722;
  z-index: 101;
  display: flex; flex-direction: column;
  animation: slideIn 0.28s cubic-bezier(0.16,1,0.3,1);
  overflow: hidden;
}
@keyframes slideIn {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}

.rm-drawer-head {
  padding: 22px 28px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  background: var(--bg);
  flex-shrink: 0;
}
.rm-drawer-title {
  font-family: 'Playfair Display', serif;
  font-size: 20px; font-weight: 700; color: var(--text);
}
.rm-drawer-close {
  width: 32px; height: 32px; border-radius: 8px;
  border: 1px solid var(--border); background: var(--surface);
  color: var(--muted); font-size: 18px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.18s, color 0.18s;
}
.rm-drawer-close:hover { background: var(--danger-lt); color: var(--danger); }

.rm-drawer-body {
  flex: 1; overflow-y: auto; padding: 24px 28px;
  display: flex; flex-direction: column; gap: 24px;
}

/* form section */
.rm-form-section { display: flex; flex-direction: column; gap: 14px; }
.rm-form-section-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--muted);
  padding-bottom: 6px; border-bottom: 1px solid var(--border);
}
.rm-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.rm-form-grid.cols-1 { grid-template-columns: 1fr; }

.rm-field { display: flex; flex-direction: column; gap: 6px; }
.rm-field.span2 { grid-column: 1 / -1; }
.rm-flabel {
  font-size: 11px; font-weight: 600; letter-spacing: 0.07em;
  text-transform: uppercase; color: var(--muted);
}
.rm-flabel span { color: var(--accent); }

.rm-input, .rm-select {
  padding: 10px 13px;
  border: 1px solid var(--border); border-radius: 8px;
  font-family: 'Epilogue', sans-serif; font-size: 14px; color: var(--text);
  background: var(--bg); outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
  appearance: none; -webkit-appearance: none; width: 100%;
}
.rm-input:focus, .rm-select:focus {
  border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-lt);
}
.rm-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2378716c' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px;
}

/* days picker */
.rm-days { display: flex; gap: 6px; flex-wrap: wrap; }
.rm-day-btn {
  width: 38px; height: 38px; border-radius: 8px;
  border: 1px solid var(--border);
  font-family: 'Epilogue', sans-serif; font-size: 12px; font-weight: 600;
  color: var(--muted); background: var(--bg); cursor: pointer;
  transition: all 0.15s; display: flex; align-items: center; justify-content: center;
}
.rm-day-btn:hover { border-color: var(--accent); color: var(--accent); }
.rm-day-btn.on { background: var(--accent); border-color: var(--accent); color: #fff; }

/* time range */
.rm-time-row { display: flex; align-items: center; gap: 10px; }
.rm-time-sep { font-size: 13px; color: var(--muted); flex-shrink: 0; }

/* feature tags */
.rm-feat-input-row { display: flex; gap: 8px; }
.rm-feat-add {
  padding: 10px 14px; border-radius: 8px;
  background: var(--accent-lt); color: var(--accent);
  border: 1px solid #0d7a6b30;
  font-family: 'Epilogue', sans-serif; font-size: 13px; font-weight: 600;
  cursor: pointer; white-space: nowrap;
  transition: background 0.18s;
}
.rm-feat-add:hover { background: #0d7a6b28; }
.rm-feat-cloud { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.rm-feat-chip {
  display: flex; align-items: center; gap: 5px;
  background: var(--accent-lt); color: var(--accent);
  border: 1px solid #0d7a6b22; border-radius: 6px;
  padding: 4px 10px; font-size: 12px; font-weight: 500;
}
.rm-feat-chip button {
  background: none; border: none; cursor: pointer;
  color: var(--accent); font-size: 14px; line-height: 1;
  padding: 0 0 0 2px; opacity: 0.7;
}
.rm-feat-chip button:hover { opacity: 1; }

/* toggle */
.rm-toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px;
  background: var(--bg); cursor: pointer;
}
.rm-toggle-info { display: flex; flex-direction: column; gap: 2px; }
.rm-toggle-title { font-size: 13px; font-weight: 600; color: var(--text); }
.rm-toggle-sub   { font-size: 11px; color: var(--muted); }
.rm-switch {
  width: 42px; height: 24px; border-radius: 12px;
  background: var(--border); position: relative;
  transition: background 0.22s; flex-shrink: 0;
}
.rm-switch.on { background: var(--accent); }
.rm-switch::after {
  content: ''; position: absolute;
  top: 3px; left: 3px;
  width: 18px; height: 18px; border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px #00000022;
  transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
}
.rm-switch.on::after { transform: translateX(18px); }

/* drawer footer */
.rm-drawer-foot {
  padding: 18px 28px;
  border-top: 1px solid var(--border);
  display: flex; gap: 10px;
  background: var(--bg);
  flex-shrink: 0;
}
.rm-save-btn {
  flex: 1; padding: 12px; border-radius: 9px;
  background: var(--accent); color: #fff;
  border: none; font-family: 'Epilogue', sans-serif;
  font-size: 14px; font-weight: 700; cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.rm-save-btn:hover { opacity: 0.88; transform: translateY(-1px); }
.rm-save-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
.rm-cancel-btn {
  padding: 12px 22px; border-radius: 9px;
  background: var(--surface); color: var(--muted);
  border: 1px solid var(--border);
  font-family: 'Epilogue', sans-serif; font-size: 14px; font-weight: 500;
  cursor: pointer; transition: background 0.18s;
}
.rm-cancel-btn:hover { background: var(--border); color: var(--text); }

/* toast */
.rm-toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
  background: #1c1917; color: #fff;
  padding: 11px 22px; border-radius: 10px;
  font-family: 'Epilogue', sans-serif; font-size: 13px; font-weight: 500;
  box-shadow: 0 4px 24px #00000033; z-index: 999;
  display: flex; align-items: center; gap: 8px;
  animation: toastIn 0.3s cubic-bezier(0.16,1,0.3,1);
}
@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(16px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
.rm-toast.success .rm-toast-icon { color: #34d399; }
.rm-toast.error   .rm-toast-icon { color: #f87171; }

/* spinner */
.rm-spinner {
  width: 15px; height: 15px;
  border: 2px solid #ffffff44; border-top-color: #fff;
  border-radius: 50%; animation: spin 0.65s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .rm-topbar { padding: 16px 20px; }
  .rm-body    { padding: 20px; }
  .rm-search  { width: 160px; }
  .rm-drawer-body { padding: 20px; }
  .rm-drawer-head, .rm-drawer-foot { padding: 16px 20px; }
  .rm-form-grid { grid-template-columns: 1fr; }
}
`;

/* ─── Constants ──────────────────────────────────────────────────────── */
const TYPES = [
  { value: 'LECTURE_HALL',  label: 'Lecture Hall',    icon: '🏛️' },
  { value: 'LAB',           label: 'Lab',             icon: '🔬' },
  { value: 'MEETING_ROOM',  label: 'Meeting Room',    icon: '🤝' },
  { value: 'EQUIPMENT',     label: 'Equipment',       icon: '🔧' },
  { value: 'STUDIO',        label: 'Studio',          icon: '🎨' },
  { value: 'CONFERENCE',    label: 'Conference Room', icon: '🎙️' },
];
const ICON_MAP = Object.fromEntries(TYPES.map(t => [t.value, t.icon]));
const DAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
const DAY_FULL = { MON:'MONDAY',TUE:'TUESDAY',WED:'WEDNESDAY',THU:'THURSDAY',FRI:'FRIDAY',SAT:'SATURDAY',SUN:'SUNDAY' };
const BLANK = {
  name:'', type:'LECTURE_HALL', capacity:'', location:'',
  building:'', floor:'', status:'ACTIVE',
  availableDays:['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'],
  availableFrom:'08:00', availableTo:'20:00',
  features:[], requiresApproval:true, department:''
};

/* ─── Toast ──────────────────────────────────────────────────────────── */
const Toast = ({ msg, kind }) => (
  <div className={`rm-toast ${kind}`}>
    <span className="rm-toast-icon">{kind === 'success' ? '✓' : '⚠'}</span>
    {msg}
  </div>
);

/* ─── Skeleton card ──────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="rm-card" style={{padding:20,gap:12,display:'flex',flexDirection:'column'}}>
    <div className="rm-skel" style={{height:14,width:'40%'}}/>
    <div className="rm-skel" style={{height:20,width:'70%'}}/>
    <div className="rm-skel" style={{height:12,width:'55%'}}/>
    <div className="rm-skel" style={{height:12,width:'45%'}}/>
    <div className="rm-skel" style={{height:32,width:'100%',marginTop:8}}/>
  </div>
);

/* ─── Component ──────────────────────────────────────────────────────── */
const ResourceManagement = ({
  canCreateDelete = true,
  canCreate = canCreateDelete,
  canDelete = canCreateDelete,
  roleLabel = 'Admin'
}) => {
  const [resources, setResources]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [showDrawer, setShowDrawer]   = useState(false);
  const [editing, setEditing]         = useState(null);
  const [formData, setFormData]       = useState(BLANK);
  const [featureInput, setFeatureInput] = useState('');
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState('ALL');
  const [confirmId, setConfirmId]     = useState(null);
  const [toast, setToast]             = useState(null);
  const featRef = useRef(null);

  const showToast = (msg, kind = 'success') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { fetchResources(); }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await resourceApi.getAllResources();
      setResources(res.data);
    } catch { showToast('Failed to load resources', 'error'); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    if (!canCreate) {
      showToast('Managers can only edit existing resources', 'error');
      return;
    }
    setEditing(null); setFormData(BLANK); setFeatureInput(''); setShowDrawer(true);
  };
  const openEdit = (r) => {
    setEditing(r);
    setFormData({
      name: r.name||'', type: r.type||'LECTURE_HALL', capacity: r.capacity||'',
      location: r.location||'', building: r.building||'', floor: r.floor||'',
      status: r.status||'ACTIVE',
      availableDays: r.availableDays||['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'],
      availableFrom: r.availableFrom||'08:00', availableTo: r.availableTo||'20:00',
      features: r.features||[], requiresApproval: r.requiresApproval??true,
      department: r.department||''
    });
    setFeatureInput('');
    setShowDrawer(true);
  };
  const closeDrawer = () => { setShowDrawer(false); setEditing(null); };

  const patch = (key, val) => setFormData(f => ({ ...f, [key]: val }));

  const toggleDay = (full) => {
    const days = formData.availableDays;
    patch('availableDays', days.includes(full) ? days.filter(d => d !== full) : [...days, full]);
  };

  const addFeature = () => {
    const v = featureInput.trim();
    if (v && !formData.features.includes(v)) { patch('features', [...formData.features, v]); }
    setFeatureInput('');
    featRef.current?.focus();
  };
  const removeFeature = (i) => patch('features', formData.features.filter((_, idx) => idx !== i));

  const normalizeEnum = (v) => String(v || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

  const parseOptionalInt = (v) => {
    const text = String(v ?? '').trim();
    if (!text) return null;
    if (!/^\d+$/.test(text)) return Number.NaN;
    return parseInt(text, 10);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing && !canCreate) {
      showToast('Managers can only edit existing resources', 'error');
      return;
    }
    setSaving(true);
    try {
      const parsedFloor = parseOptionalInt(formData.floor);
      if (Number.isNaN(parsedFloor)) {
        showToast('Floor must be a valid whole number', 'error');
        return;
      }

      const payload = {
        ...formData,
        type: normalizeEnum(formData.type),
        status: normalizeEnum(formData.status),
        capacity: parseInt(formData.capacity) || 0,
        floor: parsedFloor
      };
      if (editing) {
        await resourceApi.updateResource(editing.id, payload);
        showToast('Resource updated!');
      } else {
        await resourceApi.createResource(payload);
        showToast('Resource created!');
      }
      fetchResources();
      closeDrawer();
    } catch (err) {
      const apiMessage = err?.response?.data?.error || err?.response?.data?.message;
      showToast(apiMessage || 'Failed to save resource', 'error');
    }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!canDelete) {
      showToast('You do not have permission to delete resources', 'error');
      setConfirmId(null);
      return;
    }
    try {
      await resourceApi.deleteResource(id);
      showToast('Resource deleted');
      setResources(rs => rs.filter(r => r.id !== id));
    } catch { showToast('Failed to delete resource', 'error'); }
    finally { setConfirmId(null); }
  };

  /* stats */
  const total    = resources.length;
  const active   = resources.filter(r => r.status === 'ACTIVE').length;
  const maint    = resources.filter(r => r.status === 'MAINTENANCE').length;
  const oos      = resources.filter(r => r.status === 'OUT_OF_SERVICE').length;

  /* filtered */
  const visible = resources.filter(r => {
    const matchSearch = r.name?.toLowerCase().includes(search.toLowerCase()) ||
                        r.type?.toLowerCase().includes(search.toLowerCase()) ||
                        r.building?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || r.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <>
      <style>{CSS}</style>

      <div className="rm-page">
        {/* Top bar */}
        <div className="rm-topbar">
          <div className="rm-topbar-left">
            <span className="rm-eyebrow">{roleLabel} Console</span>
            <h1 className="rm-pagetitle">Resource Management</h1>
          </div>
          <div className="rm-topbar-right">
            <div className="rm-search-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                className="rm-search" placeholder="Search resources…"
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            {canCreate && (
              <button className="rm-add-btn" onClick={openAdd}>
                <span style={{fontSize:17,lineHeight:1}}>+</span> New Resource
              </button>
            )}
          </div>
        </div>

        <div className="rm-body">
          {/* Stats */}
          <div className="rm-stats">
            {[
              { val: total,  label: 'Total Resources',   dot: '#1c1917' },
              { val: active, label: 'Active',             dot: '#065f46' },
              { val: maint,  label: 'Maintenance',        dot: '#92400e' },
              { val: oos,    label: 'Out of Service',     dot: '#991b1b' },
            ].map(s => (
              <div className="rm-stat" key={s.label}>
                <span className="rm-stat-val">{s.val}</span>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span className="rm-stat-dot" style={{background:s.dot}}/>
                  <span className="rm-stat-label">{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="rm-tabs" style={{marginBottom:20}}>
            {['ALL','ACTIVE','MAINTENANCE','OUT_OF_SERVICE'].map(f => (
              <button key={f} className={`rm-tab ${filter===f?'active':''}`} onClick={() => setFilter(f)}>
                {f === 'OUT_OF_SERVICE' ? 'Out of Service' : f.charAt(0)+f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="rm-grid">
            {loading
              ? [1,2,3,4,5,6].map(k => <SkeletonCard key={k}/>)
              : visible.length === 0
              ? (
                <div className="rm-empty">
                  <div className="rm-empty-icon">🗂️</div>
                  <div className="rm-empty-title">No resources found</div>
                  <div className="rm-empty-sub">
                    {search
                      ? 'Try a different search term.'
                      : canCreate
                        ? 'Click "New Resource" to add one.'
                        : 'No resources are available yet. Please ask an admin to add resources so you can manage them.'}
                  </div>
                </div>
              )
              : visible.map((r, i) => (
                <div key={r.id} className="rm-card" style={{animationDelay:`${i*0.05}s`, position:'relative'}}>
                  <div className="rm-card-top">
                    <div>
                      <div className="rm-card-type-row">
                        <div className="rm-card-icon">{ICON_MAP[r.type] || '📍'}</div>
                        <span className="rm-card-type-label">{r.type?.replace(/_/g,' ')}</span>
                      </div>
                      <div className="rm-card-name">{r.name}</div>
                    </div>
                    <span className={`rm-status-pill status-${r.status}`}>{r.status?.replace(/_/g,' ')}</span>
                  </div>
                  <div className="rm-card-divider"/>
                  <div className="rm-card-body">
                    <div className="rm-card-meta">
                      <div className="rm-meta-item">
                        <span className="rm-meta-key">Capacity</span>
                        <span className="rm-meta-val">{r.capacity ?? '—'} people</span>
                      </div>
                      <div className="rm-meta-item">
                        <span className="rm-meta-key">Building</span>
                        <span className="rm-meta-val">{r.building || '—'}</span>
                      </div>
                      <div className="rm-meta-item">
                        <span className="rm-meta-key">Location</span>
                        <span className="rm-meta-val">{r.location || '—'}</span>
                      </div>
                      <div className="rm-meta-item">
                        <span className="rm-meta-key">Hours</span>
                        <span className="rm-meta-val">{r.availableFrom} – {r.availableTo}</span>
                      </div>
                    </div>
                    {r.features?.length > 0
                      ? <div className="rm-card-features">{r.features.map(f => <span key={f} className="rm-feat-tag">{f}</span>)}</div>
                      : <div className="rm-feat-none">No features listed</div>
                    }
                  </div>
                  <div className="rm-card-foot">
                    <button className="rm-btn-edit" onClick={() => openEdit(r)}>✎ Edit</button>
                    {canDelete && (
                      <button className="rm-btn-del" onClick={() => setConfirmId(r.id)}>🗑</button>
                    )}
                  </div>

                  {/* Inline delete confirm */}
                  {confirmId === r.id && (
                    <div className="rm-del-confirm">
                      <p>Delete <strong>{r.name}</strong>?<br/>This cannot be undone.</p>
                      <div className="rm-del-confirm-actions">
                        <button className="rm-del-yes" onClick={() => handleDelete(r.id)}>Yes, delete</button>
                        <button className="rm-del-no"  onClick={() => setConfirmId(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* ── Drawer ── */}
      {showDrawer && (
        <>
          <div className="rm-overlay" onClick={closeDrawer}/>
          <div className="rm-drawer">
            <div className="rm-drawer-head">
              <span className="rm-drawer-title">{editing ? 'Edit Resource' : 'New Resource'}</span>
              <button className="rm-drawer-close" onClick={closeDrawer}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={{display:'contents'}}>
              <div className="rm-drawer-body">

                {/* Identity */}
                <div className="rm-form-section">
                  <div className="rm-form-section-label">Identity</div>
                  <div className="rm-form-grid">
                    <div className="rm-field span2">
                      <label className="rm-flabel">Name <span>*</span></label>
                      <input className="rm-input" required value={formData.name}
                        onChange={e => patch('name', e.target.value)}
                        placeholder="e.g. Main Lecture Hall A"/>
                    </div>
                    <div className="rm-field">
                      <label className="rm-flabel">Type <span>*</span></label>
                      <select className="rm-select" required value={formData.type} onChange={e => patch('type', e.target.value)}>
                        {TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                      </select>
                    </div>
                    <div className="rm-field">
                      <label className="rm-flabel">Status</label>
                      <select className="rm-select" value={formData.status} onChange={e => patch('status', e.target.value)}>
                        <option value="ACTIVE">Active</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="OUT_OF_SERVICE">Out of Service</option>
                      </select>
                    </div>
                    <div className="rm-field">
                      <label className="rm-flabel">Department</label>
                      <input className="rm-input" value={formData.department}
                        onChange={e => patch('department', e.target.value)} placeholder="e.g. Computer Science"/>
                    </div>
                    <div className="rm-field">
                      <label className="rm-flabel">Capacity</label>
                      <input className="rm-input" type="number" min="1" value={formData.capacity}
                        onChange={e => patch('capacity', e.target.value)} placeholder="No. of people"/>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="rm-form-section">
                  <div className="rm-form-section-label">Location</div>
                  <div className="rm-form-grid">
                    <div className="rm-field">
                      <label className="rm-flabel">Building</label>
                      <input className="rm-input" value={formData.building}
                        onChange={e => patch('building', e.target.value)} placeholder="Main Building"/>
                    </div>
                    <div className="rm-field">
                      <label className="rm-flabel">Floor</label>
                      <input className="rm-input" type="number" min="0" step="1" value={formData.floor}
                        onChange={e => patch('floor', e.target.value)} placeholder="e.g. 2"/>
                    </div>
                    <div className="rm-field span2">
                      <label className="rm-flabel">Location / Room</label>
                      <input className="rm-input" value={formData.location}
                        onChange={e => patch('location', e.target.value)} placeholder="e.g. Block A, Room 204"/>
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div className="rm-form-section">
                  <div className="rm-form-section-label">Availability</div>
                  <div>
                    <label className="rm-flabel" style={{marginBottom:8,display:'block'}}>Available Days</label>
                    <div className="rm-days">
                      {DAYS.map(d => (
                        <button key={d} type="button"
                          className={`rm-day-btn ${formData.availableDays.includes(DAY_FULL[d]) ? 'on' : ''}`}
                          onClick={() => toggleDay(DAY_FULL[d])}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="rm-flabel" style={{marginBottom:8,display:'block'}}>Operating Hours</label>
                    <div className="rm-time-row">
                      <input type="time" className="rm-input" style={{flex:1}}
                        value={formData.availableFrom} onChange={e => patch('availableFrom', e.target.value)}/>
                      <span className="rm-time-sep">to</span>
                      <input type="time" className="rm-input" style={{flex:1}}
                        value={formData.availableTo} onChange={e => patch('availableTo', e.target.value)}/>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="rm-form-section">
                  <div className="rm-form-section-label">Features & Equipment</div>
                  <div className="rm-feat-input-row">
                    <input className="rm-input" ref={featRef} value={featureInput}
                      onChange={e => setFeatureInput(e.target.value)}
                      onKeyDown={e => { if(e.key==='Enter'){e.preventDefault();addFeature();} }}
                      placeholder="e.g. Projector, AC, Whiteboard…"/>
                    <button type="button" className="rm-feat-add" onClick={addFeature}>Add</button>
                  </div>
                  {formData.features.length > 0 && (
                    <div className="rm-feat-cloud">
                      {formData.features.map((f,i) => (
                        <span key={i} className="rm-feat-chip">
                          {f}
                          <button type="button" onClick={() => removeFeature(i)}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Settings */}
                <div className="rm-form-section">
                  <div className="rm-form-section-label">Settings</div>
                  <div className="rm-toggle-row" onClick={() => patch('requiresApproval', !formData.requiresApproval)}>
                    <div className="rm-toggle-info">
                      <span className="rm-toggle-title">Requires Admin Approval</span>
                      <span className="rm-toggle-sub">Bookings need review before confirmation</span>
                    </div>
                    <div className={`rm-switch ${formData.requiresApproval ? 'on' : ''}`}/>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="rm-drawer-foot">
                <button type="submit" className="rm-save-btn" disabled={saving}>
                  {saving ? <><div className="rm-spinner"/> Saving…</> : (editing ? '✓ Update Resource' : '+ Create Resource')}
                </button>
                <button type="button" className="rm-cancel-btn" onClick={closeDrawer}>Cancel</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} kind={toast.kind}/>}
    </>
  );
};

export default ResourceManagement;