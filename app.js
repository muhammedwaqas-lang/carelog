// ─────────────────────────────────────────────
//  CareLog — app.js
// ─────────────────────────────────────────────

// ── Storage helpers ──────────────────────────
const DB = {
  getSettings() {
    return JSON.parse(localStorage.getItem('carelog_settings') || '{}');
  },
  saveSettings(s) {
    localStorage.setItem('carelog_settings', JSON.stringify(s));
  },
  getRecords() {
    return JSON.parse(localStorage.getItem('carelog_records') || '[]');
  },
  saveRecords(r) {
    localStorage.setItem('carelog_records', JSON.stringify(r));
  },
  addRecord(r) {
    const records = DB.getRecords();
    r.id = Date.now().toString();
    records.unshift(r);
    DB.saveRecords(records);
    return r;
  },
  getRecord(id) {
    return DB.getRecords().find(r => r.id === id);
  },
  clearAll() {
    localStorage.removeItem('carelog_records');
  }
};

// ── Router ───────────────────────────────────
let currentScreen = 'home';
let screenHistory = [];

function go(screenId, pushHistory = true) {
  if (pushHistory && currentScreen !== screenId) {
    screenHistory.push(currentScreen);
  }
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const next = document.getElementById('screen-' + screenId);
  if (next) next.classList.add('active');
  currentScreen = screenId;

  const handlers = {
    'home': renderHome,
    'history': renderHistory,
    'settings': renderSettings,
    'appointment-preview': renderAppointmentPreview,
    'contact-preview': renderContactPreview,
  };
  if (handlers[screenId]) handlers[screenId]();
}

function goBack() {
  if (screenHistory.length > 0) {
    const prev = screenHistory.pop();
    go(prev, false);
  } else {
    go('home', false);
  }
}

// ── Toast ─────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── Formatters ───────────────────────────────
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function todayStr() {
  return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function nowDate() {
  return new Date().toISOString().split('T')[0];
}

function nowTime() {
  const d = new Date();
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// ── SVG Icons ─────────────────────────────────
const ICONS = {
  home: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  history: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  settings: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  calendar: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  contact: `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  chevron: `<svg class="chevron" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>`,
  back: `<svg width="10" height="17" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 10 17"><path d="M9 1L1 8.5 9 16"/></svg>`,
  whatsapp: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.1 1.5 5.823L0 24l6.335-1.477A11.955 11.955 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.007-1.374l-.36-.214-3.726.868.936-3.617-.235-.372A9.818 9.818 0 1 1 12 21.818z"/></svg>`,
  email: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  download: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
};

function tabBar(active) {
  return `
    <div class="tab-bar">
      <button class="tab ${active==='home'?'active':''}" onclick="go('home')">${ICONS.home}<span>Home</span></button>
      <button class="tab ${active==='history'?'active':''}" onclick="go('history')">${ICONS.history}<span>History</span></button>
      <button class="tab ${active==='settings'?'active':''}" onclick="go('settings')">${ICONS.settings}<span>Settings</span></button>
    </div>`;
}

// ── Pending form state ────────────────────────
let pendingAppointment = null;
let pendingContact = null;

// ── HOME ─────────────────────────────────────
function renderHome() {
  const records = DB.getRecords();
  const apptCount = records.filter(r => r.type === 'appointment').length;
  const contactCount = records.filter(r => r.type === 'contact').length;
  const recent = records.slice(0, 3);

  const settings = DB.getSettings();
  const carerName = settings.name || 'Carer';

  const recentHTML = recent.length === 0
    ? `<div class="empty-state" style="padding:32px;">
        ${ICONS.calendar.replace('stroke="currentColor"','stroke="#aaa"')}
        <p>No records yet.<br/>Tap a quick action to get started.</p>
       </div>`
    : recent.map(r => recordRow(r)).join('');

  document.getElementById('screen-home').querySelector('.screen-body').innerHTML = `
    <div class="nav-bar">
      <h1>CareLog</h1>
      <p class="subtitle">${todayStr()}</p>
    </div>

    <div class="hero">
      <div class="hero-eyebrow">Active Case</div>
      <div class="hero-title">${carerName}</div>
      <div class="hero-sub">Child Carer</div>
      <div class="hero-stats">
        <div class="hero-stat">${apptCount} Appointment${apptCount !== 1 ? 's' : ''}</div>
        <div class="hero-stat">${contactCount} Contact Report${contactCount !== 1 ? 's' : ''}</div>
      </div>
    </div>

    <div class="section-label">Quick Actions</div>
    <div class="quick-grid">
      <button class="quick-card" onclick="go('new-appointment')">
        ${ICONS.calendar.replace('stroke="currentColor"','stroke="#007AFF"')}
        <h3>New Appointment</h3>
        <p>Log a session summary</p>
      </button>
      <button class="quick-card" onclick="go('new-contact')">
        ${ICONS.contact.replace('stroke="currentColor"','stroke="#ff9500"')}
        <h3>Contact Report</h3>
        <p>Parent visit report</p>
      </button>
    </div>

    <div class="section-label">Recent</div>
    <div class="card">${recentHTML}</div>
  `;
}

// ── NEW APPOINTMENT ───────────────────────────
function initNewAppointment() {
  const f = pendingAppointment || {};
  document.getElementById('appt-date').value = f.date || nowDate();
  document.getElementById('appt-time').value = f.time || nowTime();
  document.getElementById('appt-childref').value = f.childRef || '';
  document.getElementById('appt-location').value = f.location || '';
  document.getElementById('appt-visittype').value = f.visitType || 'Home Visit';
  document.getElementById('appt-notes').value = f.notes || '';
  document.getElementById('appt-actions').value = f.actions || '';
  document.getElementById('appt-physical').value = f.physical || 'Good';
  document.getElementById('appt-emotional').value = f.emotional || 'Good';
  const sg = document.getElementById('appt-safeguarding');
  if (f.safeguarding) sg.classList.add('on'); else sg.classList.remove('on');
}

function collectAppointment() {
  return {
    type: 'appointment',
    date: document.getElementById('appt-date').value,
    time: document.getElementById('appt-time').value,
    childRef: document.getElementById('appt-childref').value,
    location: document.getElementById('appt-location').value,
    visitType: document.getElementById('appt-visittype').value,
    notes: document.getElementById('appt-notes').value,
    actions: document.getElementById('appt-actions').value,
    physical: document.getElementById('appt-physical').value,
    emotional: document.getElementById('appt-emotional').value,
    safeguarding: document.getElementById('appt-safeguarding').classList.contains('on'),
  };
}

function goToAppointmentPreview() {
  const data = collectAppointment();
  if (!data.childRef.trim()) { showToast('Please enter a child reference'); return; }
  if (!data.notes.trim()) { showToast('Please add session notes'); return; }
  pendingAppointment = data;
  go('appointment-preview');
}

function buildWhatsAppMessage(data) {
  const settings = DB.getSettings();
  const carer = settings.name || 'Carer';
  const sgLine = data.safeguarding
    ? '⚠️ SAFEGUARDING CONCERN RAISED'
    : 'No safeguarding concerns';

  return `📋 *Visit Summary*
Child Ref: ${data.childRef}
Date: ${formatDate(data.date)} | ${data.time}
Location: ${data.visitType}${data.location ? ' — ' + data.location : ''}

*Session Notes:*
${data.notes}

*Wellbeing:*
Physical: ${data.physical}
Emotional: ${data.emotional}
Safeguarding: ${sgLine}

*Actions / Follow-up:*
${data.actions || 'None noted'}

— ${carer} via CareLog`;
}

function renderAppointmentPreview() {
  if (!pendingAppointment) return;
  const msg = buildWhatsAppMessage(pendingAppointment);
  document.getElementById('appt-preview-text').textContent = msg;
}

function sendWhatsApp() {
  const settings = DB.getSettings();
  const num = (settings.whatsappNumber || '').replace(/\D/g, '');
  const msg = buildWhatsAppMessage(pendingAppointment);
  const saved = DB.addRecord({ ...pendingAppointment, status: 'sent', savedAt: new Date().toISOString() });
  pendingAppointment = null;
  const url = num
    ? `https://wa.me/${num}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
  showToast('Saved & opening WhatsApp');
  setTimeout(() => go('home'), 600);
}

function saveAppointmentOnly() {
  DB.addRecord({ ...pendingAppointment, status: 'saved', savedAt: new Date().toISOString() });
  pendingAppointment = null;
  showToast('Appointment saved');
  go('home');
}

// ── NEW CONTACT REPORT ────────────────────────
function initNewContact() {
  const f = pendingContact || {};
  document.getElementById('con-parentname').value = f.parentName || '';
  document.getElementById('con-childref').value = f.childRef || '';
  document.getElementById('con-date').value = f.date || nowDate();
  document.getElementById('con-timestart').value = f.timeStart || '';
  document.getElementById('con-timeend').value = f.timeEnd || '';
  document.getElementById('con-visittype').value = f.visitType || 'Supervised Visit';
  document.getElementById('con-location').value = f.location || '';
  document.getElementById('con-others').value = f.others || '';
  document.getElementById('con-description').value = f.description || '';
  document.getElementById('con-childmood').value = f.childMood || '';
  document.getElementById('con-parentpresentation').value = f.parentPresentation || '';
  document.getElementById('con-summary').value = f.summary || '';
  const sg = document.getElementById('con-safeguarding');
  const disc = document.getElementById('con-disclosures');
  const term = document.getElementById('con-terminated');
  if (f.safeguarding) sg.classList.add('on'); else sg.classList.remove('on');
  if (f.disclosures) disc.classList.add('on'); else disc.classList.remove('on');
  if (f.terminated) term.classList.add('on'); else term.classList.remove('on');
}

function collectContact() {
  return {
    type: 'contact',
    parentName: document.getElementById('con-parentname').value,
    childRef: document.getElementById('con-childref').value,
    date: document.getElementById('con-date').value,
    timeStart: document.getElementById('con-timestart').value,
    timeEnd: document.getElementById('con-timeend').value,
    visitType: document.getElementById('con-visittype').value,
    location: document.getElementById('con-location').value,
    others: document.getElementById('con-others').value,
    description: document.getElementById('con-description').value,
    childMood: document.getElementById('con-childmood').value,
    parentPresentation: document.getElementById('con-parentpresentation').value,
    summary: document.getElementById('con-summary').value,
    safeguarding: document.getElementById('con-safeguarding').classList.contains('on'),
    disclosures: document.getElementById('con-disclosures').classList.contains('on'),
    terminated: document.getElementById('con-terminated').classList.contains('on'),
  };
}

function goToContactPreview() {
  const data = collectContact();
  if (!data.parentName.trim()) { showToast('Please enter parent name'); return; }
  if (!data.description.trim()) { showToast('Please add visit observations'); return; }
  pendingContact = data;
  go('contact-preview');
}

function renderContactPreview() {
  if (!pendingContact) return;
  const d = pendingContact;
  const sgBadge = d.safeguarding
    ? `<span class="badge badge-red">⚠️ Safeguarding Concerns</span>`
    : `<span class="badge badge-green">No Safeguarding Concerns</span>`;

  document.getElementById('doc-preview-inner').innerHTML = `
    <div class="doc-eyebrow">Contact Visit Report</div>
    <div class="doc-title">${d.visitType}</div>
    <div class="doc-date">${formatDate(d.date)}</div>
    <div class="doc-grid">
      <div><div class="doc-field-label">Parent</div><div class="doc-field-val">${d.parentName}</div></div>
      <div><div class="doc-field-label">Child Ref</div><div class="doc-field-val">${d.childRef || '—'}</div></div>
      <div><div class="doc-field-label">Time</div><div class="doc-field-val">${d.timeStart}${d.timeEnd ? '–' + d.timeEnd : ''}</div></div>
      <div><div class="doc-field-label">Location</div><div class="doc-field-val">${d.location || '—'}</div></div>
    </div>
    ${d.description ? `<div class="doc-section-title">Observations</div><div class="doc-section-body">${d.description}</div>` : ''}
    ${d.childMood ? `<div class="doc-section-title">Child's Presentation</div><div class="doc-section-body">${d.childMood}</div>` : ''}
    ${d.parentPresentation ? `<div class="doc-section-title">Parent's Presentation</div><div class="doc-section-body">${d.parentPresentation}</div>` : ''}
    ${d.summary ? `<div class="doc-section-title">Assessment</div><div class="doc-section-body">${d.summary}</div>` : ''}
    <div class="doc-footer">${sgBadge}</div>
  `;
}

function buildDocContent(d) {
  const settings = DB.getSettings();
  const carer = settings.name || 'Carer';
  const sgText = d.safeguarding ? '⚠️ YES — Safeguarding concern raised' : 'No';
  const discText = d.disclosures ? '⚠️ YES — Disclosure made during contact' : 'No';
  const termText = d.terminated ? 'YES — Contact terminated early' : 'No';

  return `CONTACT VISIT REPORT
====================

Type: ${d.visitType}
Date: ${formatDate(d.date)}
Time: ${d.timeStart}${d.timeEnd ? ' – ' + d.timeEnd : ''}
Location: ${d.location || 'Not specified'}
Others Present: ${d.others || 'None noted'}

PARTIES
-------
Parent / Guardian: ${d.parentName}
Child Reference: ${d.childRef || 'Not specified'}
Written by: ${carer}

OBSERVATIONS
------------
${d.description}

CHILD'S PRESENTATION
--------------------
${d.childMood || 'Not recorded'}

PARENT'S PRESENTATION
---------------------
${d.parentPresentation || 'Not recorded'}

SAFEGUARDING
------------
Safeguarding Concerns: ${sgText}
Disclosures Made: ${discText}
Contact Terminated Early: ${termText}

OVERALL ASSESSMENT
------------------
${d.summary || 'Not recorded'}

--
Report generated: ${new Date().toLocaleString('en-GB')}
CareLog App`;
}

function downloadDoc() {
  const d = pendingContact;
  const content = buildDocContent(d);
  const filename = `Contact_Report_${d.parentName.replace(/\s+/g,'_')}_${d.date}.doc`;

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6; margin: 2cm; color: #000; }
  h1 { font-size: 16pt; border-bottom: 2px solid #000; padding-bottom: 8px; }
  h2 { font-size: 13pt; margin-top: 20px; margin-bottom: 4px; }
  .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  .meta-table td { padding: 4px 8px; border: 1px solid #ccc; font-size: 11pt; }
  .meta-table td:first-child { font-weight: bold; width: 40%; background: #f5f5f5; }
  .flag { font-weight: bold; color: #cc0000; }
  .ok { color: #006600; }
  p { margin: 4px 0 12px; }
  .footer { margin-top: 40px; font-size: 10pt; color: #666; border-top: 1px solid #ccc; padding-top: 8px; }
</style>
</head>
<body>
<h1>Contact Visit Report</h1>

<table class="meta-table">
  <tr><td>Visit Type</td><td>${d.visitType}</td></tr>
  <tr><td>Date</td><td>${formatDate(d.date)}</td></tr>
  <tr><td>Time</td><td>${d.timeStart}${d.timeEnd ? ' – ' + d.timeEnd : ''}</td></tr>
  <tr><td>Location</td><td>${d.location || '—'}</td></tr>
  <tr><td>Parent / Guardian</td><td>${d.parentName}</td></tr>
  <tr><td>Child Reference</td><td>${d.childRef || '—'}</td></tr>
  <tr><td>Others Present</td><td>${d.others || 'None noted'}</td></tr>
</table>

<h2>Observations</h2>
<p>${(d.description || '').replace(/\n/g,'<br/>')}</p>

<h2>Child's Presentation &amp; Mood</h2>
<p>${(d.childMood || 'Not recorded').replace(/\n/g,'<br/>')}</p>

<h2>Parent's Presentation</h2>
<p>${(d.parentPresentation || 'Not recorded').replace(/\n/g,'<br/>')}</p>

<h2>Safeguarding</h2>
<table class="meta-table">
  <tr><td>Safeguarding Concerns</td><td class="${d.safeguarding?'flag':'ok'}">${d.safeguarding?'⚠️ YES — Concern raised':'No'}</td></tr>
  <tr><td>Disclosures Made</td><td class="${d.disclosures?'flag':'ok'}">${d.disclosures?'⚠️ YES — Disclosure made':'No'}</td></tr>
  <tr><td>Contact Terminated Early</td><td class="${d.terminated?'flag':'ok'}">${d.terminated?'YES — Terminated early':'No'}</td></tr>
</table>

<h2>Overall Assessment</h2>
<p>${(d.summary || 'Not recorded').replace(/\n/g,'<br/>')}</p>

<div class="footer">
  Written by: ${DB.getSettings().name || 'Carer'} &nbsp;|&nbsp;
  Generated: ${new Date().toLocaleString('en-GB')} &nbsp;|&nbsp;
  CareLog
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function sendContactEmail() {
  const settings = DB.getSettings();
  const d = pendingContact;
  const email = settings.managerEmail || '';
  const subject = encodeURIComponent(`Contact Report — ${d.parentName} — ${formatDate(d.date)}`);
  const body = encodeURIComponent(
    `Hi,\n\nPlease find attached the contact visit report for ${d.parentName} (${d.visitType}, ${formatDate(d.date)}).\n\nKind regards,\n${settings.name || 'Carer'}`
  );

  downloadDoc();

  DB.addRecord({ ...pendingContact, status: 'sent', savedAt: new Date().toISOString() });
  pendingContact = null;

  setTimeout(() => {
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    showToast('Report downloaded — attach it to the email');
    setTimeout(() => go('home'), 800);
  }, 800);
}

function saveContactOnly() {
  DB.addRecord({ ...pendingContact, status: 'saved', savedAt: new Date().toISOString() });
  pendingContact = null;
  showToast('Contact report saved');
  go('home');
}

// ── HISTORY ───────────────────────────────────
let historyFilter = 'all';

function recordRow(r, showChevron = true) {
  const isAppt = r.type === 'appointment';
  const iconBg = isAppt ? '#e1f0ff' : '#fff3e0';
  const icon = isAppt
    ? ICONS.calendar.replace('stroke="currentColor"','stroke="#007AFF"')
    : ICONS.contact.replace('stroke="currentColor"','stroke="#ff9500"');
  const title = isAppt ? 'Appointment' : 'Contact Report';
  const sub = isAppt
    ? `${formatDate(r.date)} · ${r.visitType || ''}`
    : `${formatDate(r.date)} · ${r.visitType || ''}`;
  const badgeClass = isAppt ? 'badge-blue' : 'badge-green';
  const badgeText = r.status === 'sent' ? 'Sent' : 'Saved';

  return `<div class="list-row" onclick="viewRecord('${r.id}')">
    <div class="list-icon" style="background:${iconBg}">${icon}</div>
    <div class="list-row-text">
      <div class="list-row-title">${title}</div>
      <div class="list-row-sub">${sub}</div>
    </div>
    <span class="badge ${badgeClass}">${badgeText}</span>
    ${showChevron ? ICONS.chevron : ''}
  </div>`;
}

function renderHistory() {
  const all = DB.getRecords();
  const filtered = historyFilter === 'all' ? all
    : all.filter(r => r.type === historyFilter.replace('appointments','appointment').replace('contacts','contact'));

  const grouped = {};
  filtered.forEach(r => {
    const key = r.date ? new Date(r.date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 'Unknown';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  const groupsHTML = Object.entries(grouped).map(([month, records]) => `
    <div class="section-label">${month}</div>
    <div class="card">${records.map(r => recordRow(r)).join('')}</div>
  `).join('');

  const emptyHTML = `<div class="empty-state">
    ${ICONS.history.replace('stroke="currentColor"','stroke="#ccc"').replace('width="24"','width="48"').replace('height="24"','height="48"')}
    <h3>No records yet</h3>
    <p>Your appointments and contact reports will appear here.</p>
  </div>`;

  document.getElementById('screen-history').querySelector('.screen-body').innerHTML = `
    <div class="nav-bar">
      <h1>History</h1>
      <p class="subtitle">All records stored on this device</p>
    </div>
    <div class="filter-bar">
      <button class="chip ${historyFilter==='all'?'active':''}" onclick="setFilter('all')">All</button>
      <button class="chip ${historyFilter==='appointments'?'active':''}" onclick="setFilter('appointments')">Appointments</button>
      <button class="chip ${historyFilter==='contacts'?'active':''}" onclick="setFilter('contacts')">Contact Reports</button>
    </div>
    ${filtered.length === 0 ? emptyHTML : groupsHTML}
  `;
}

function setFilter(f) {
  historyFilter = f;
  renderHistory();
}

function viewRecord(id) {
  const r = DB.getRecord(id);
  if (!r) return;
  if (r.type === 'appointment') {
    pendingAppointment = r;
    go('appointment-preview');
  } else {
    pendingContact = r;
    go('contact-preview');
  }
}

// ── SETTINGS ──────────────────────────────────
function renderSettings() {
  const s = DB.getSettings();
  document.getElementById('set-name').value = s.name || '';
  document.getElementById('set-whatsapp').value = s.whatsappNumber || '';
  document.getElementById('set-email').value = s.managerEmail || '';
}

function saveSettings() {
  DB.saveSettings({
    name: document.getElementById('set-name').value,
    whatsappNumber: document.getElementById('set-whatsapp').value,
    managerEmail: document.getElementById('set-email').value,
  });
  showToast('Settings saved');
}

function confirmClearAll() {
  if (confirm('Delete all records? This cannot be undone.')) {
    DB.clearAll();
    showToast('All records deleted');
    renderSettings();
  }
}

// ── Toggle helper ─────────────────────────────
function toggleEl(id) {
  document.getElementById(id).classList.toggle('on');
}

// ── Init ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
  go('home', false);
});
