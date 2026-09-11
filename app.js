/**
 * QSMART CLINIC - DIGITAL TOKENIZER & QUEUE MANAGEMENT
 * Simple, practical, single-clinic token system with glassmorphism UI.
 */

// -------------------------------------------------------------
// 1. DEFAULT MOCK CLINIC CONFIGURATION & DATA
// -------------------------------------------------------------
const CLINIC_DOCTORS = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Jenkins',
    department: 'General Medicine',
    room: 'Consulting Room 1',
    prefix: 'A',
    avgConsultMins: 10,
    avatarColor: '#00f2fe'
  },
  {
    id: 'doc-2',
    name: 'Dr. Alan Miller',
    department: 'Pediatrics & Child Care',
    room: 'Consulting Room 2',
    prefix: 'B',
    avgConsultMins: 12,
    avatarColor: '#10b981'
  },
  {
    id: 'doc-3',
    name: 'Dr. Priya Patel',
    department: 'Dermatology & Skin Care',
    room: 'Consulting Room 3',
    prefix: 'C',
    avgConsultMins: 15,
    avatarColor: '#8b5cf6'
  }
];

const INITIAL_MOCK_STATE = {
  doctors: CLINIC_DOCTORS,
  tokens: [
    {
      id: 'tok-101',
      number: 'A-101',
      doctorId: 'doc-1',
      patientName: 'David Clark',
      status: 'completed',
      createdAt: new Date(Date.now() - 40 * 60000).toISOString(),
      calledAt: new Date(Date.now() - 30 * 60000).toISOString(),
      completedAt: new Date(Date.now() - 18 * 60000).toISOString()
    },
    {
      id: 'tok-102',
      number: 'A-102',
      doctorId: 'doc-1',
      patientName: 'Emma Watson',
      status: 'serving',
      createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
      calledAt: new Date(Date.now() - 5 * 60000).toISOString(),
      completedAt: null
    },
    {
      id: 'tok-103',
      number: 'A-103',
      doctorId: 'doc-1',
      patientName: 'Michael Chang',
      status: 'waiting',
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      calledAt: null,
      completedAt: null
    },
    {
      id: 'tok-104',
      number: 'A-104',
      doctorId: 'doc-1',
      patientName: 'Sophia Rodriguez',
      status: 'waiting',
      createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
      calledAt: null,
      completedAt: null
    },
    // Doctor B
    {
      id: 'tok-201',
      number: 'B-101',
      doctorId: 'doc-2',
      patientName: 'Liam Johnson',
      status: 'serving',
      createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
      calledAt: new Date(Date.now() - 4 * 60000).toISOString(),
      completedAt: null
    },
    {
      id: 'tok-202',
      number: 'B-102',
      doctorId: 'doc-2',
      patientName: 'Oliver Smith',
      status: 'waiting',
      createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
      calledAt: null,
      completedAt: null
    },
    // Doctor C
    {
      id: 'tok-301',
      number: 'C-101',
      doctorId: 'doc-3',
      patientName: 'Aria Stark',
      status: 'serving',
      createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
      calledAt: new Date(Date.now() - 12 * 60000).toISOString(),
      completedAt: null
    }
  ],
  sequenceCounters: {
    'doc-1': 105,
    'doc-2': 103,
    'doc-3': 102
  }
};

// -------------------------------------------------------------
// 2. STATE REPOSITORY (localStorage backed)
// -------------------------------------------------------------
const STORAGE_KEY = 'qsmart_clinic_state_v1';
const ACTIVE_USER_TOKEN_KEY = 'qsmart_my_active_token_id';

function loadClinicState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveClinicState(INITIAL_MOCK_STATE);
      return JSON.parse(JSON.stringify(INITIAL_MOCK_STATE));
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading localStorage, reverting to mock state', e);
    return JSON.parse(JSON.stringify(INITIAL_MOCK_STATE));
  }
}

function saveClinicState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  // Broadcast custom event for internal same-page components
  window.dispatchEvent(new Event('clinic-state-updated'));
}

let appState = loadClinicState();

// -------------------------------------------------------------
// 3. SOUND SYNTHESIZER (Pleasant Chime without audio files)
// -------------------------------------------------------------
function playClinicChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const notes = [587.33, 880.00]; // D5, A5 chime
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.18);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.18);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.18 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.18 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.18);
      osc.stop(ctx.currentTime + idx * 0.18 + 0.65);
    });
  } catch (e) {
    console.log('Audio chime disabled or blocked by browser gesture policy');
  }
}

// -------------------------------------------------------------
// 4. TAB NAVIGATION & VIEW SWITCHER
// -------------------------------------------------------------
const tabButtons = document.querySelectorAll('.nav-tabs .tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    const targetId = btn.getAttribute('data-tab');
    document.getElementById(targetId)?.classList.add('active');

    renderAllViews();
  });
});

// Staff Dashboard Subtabs (Waiting / Skipped / History)
const subtabButtons = document.querySelectorAll('.subtab-btn');
const subtabContents = document.querySelectorAll('.subtab-content');

subtabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    subtabButtons.forEach(b => b.classList.remove('active'));
    subtabContents.forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    const targetId = btn.getAttribute('data-subtab');
    document.getElementById(targetId)?.classList.add('active');
  });
});

// -------------------------------------------------------------
// 5. PATIENT VIEW CONTROLLER
// -------------------------------------------------------------
const doctorSelectionGrid = document.getElementById('doctor-selection-grid');
const selectedDoctorInput = document.getElementById('selected-doctor-id');
const tokenForm = document.getElementById('token-form');
const patientEntryCard = document.getElementById('patient-entry-card');
const patientTokenDisplay = document.getElementById('patient-token-display');

// Render Doctor Cards on Kiosk form
function renderDoctorSelectionCards() {
  if (!doctorSelectionGrid) return;
  doctorSelectionGrid.innerHTML = '';

  appState.doctors.forEach((doc, index) => {
    // calculate current queue depth
    const waitingCount = appState.tokens.filter(
      t => t.doctorId === doc.id && t.status === 'waiting'
    ).length;
    const estTotalWait = waitingCount * doc.avgConsultMins;

    const card = document.createElement('div');
    card.className = `doctor-select-card ${index === 0 && !selectedDoctorInput.value ? 'selected' : ''}`;
    if (selectedDoctorInput.value === doc.id) {
      card.classList.add('selected');
    }

    card.innerHTML = `
      <div class="doc-top">
        <span class="doc-room-badge">${doc.room}</span>
        <span style="font-size: 0.72rem; color: #10b981;">&bull; Available</span>
      </div>
      <div class="doc-name">${doc.name}</div>
      <div class="doc-dept">${doc.department}</div>
      <div class="doc-queue-brief">
        <span>In Queue: <strong>${waitingCount}</strong></span>
        <span>Est: <strong>~${estTotalWait}m</strong></span>
      </div>
    `;

    card.addEventListener('click', () => {
      document.querySelectorAll('.doctor-select-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedDoctorInput.value = doc.id;
    });

    doctorSelectionGrid.appendChild(card);

    if (index === 0 && !selectedDoctorInput.value) {
      selectedDoctorInput.value = doc.id;
    }
  });
}

// Generate Token Handler
tokenForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const nameInput = document.getElementById('patient-name');
  const patientName = nameInput.value.trim();
  const docId = selectedDoctorInput.value || appState.doctors[0].id;
  const doc = appState.doctors.find(d => d.id === docId);

  if (!patientName) return;

  // Next Token Number
  const nextSeq = appState.sequenceCounters[docId] || 101;
  const tokenNumber = `${doc.prefix}-${nextSeq}`;

  const newToken = {
    id: 'tok-' + Date.now(),
    number: tokenNumber,
    doctorId: docId,
    patientName: patientName,
    status: 'waiting',
    createdAt: new Date().toISOString(),
    calledAt: null,
    completedAt: null
  };

  appState.tokens.push(newToken);
  appState.sequenceCounters[docId] = nextSeq + 1;
  saveClinicState(appState);

  // Store active token in session/localStorage so the user can track it
  localStorage.setItem(ACTIVE_USER_TOKEN_KEY, newToken.id);

  nameInput.value = '';
  playClinicChime();
  renderAllViews();
});

// Render Active Patient Ticket
function renderPatientTokenTicket() {
  const activeTokenId = localStorage.getItem(ACTIVE_USER_TOKEN_KEY);
  if (!activeTokenId) {
    patientEntryCard.classList.remove('hidden');
    patientTokenDisplay.classList.add('hidden');
    return;
  }

  const token = appState.tokens.find(t => t.id === activeTokenId);
  if (!token) {
    localStorage.removeItem(ACTIVE_USER_TOKEN_KEY);
    patientEntryCard.classList.remove('hidden');
    patientTokenDisplay.classList.add('hidden');
    return;
  }

  // Active token found! Display ticket
  patientEntryCard.classList.add('hidden');
  patientTokenDisplay.classList.remove('hidden');

  const doctor = appState.doctors.find(d => d.id === token.doctorId);

  // Fill in Ticket details
  document.getElementById('ticket-doctor-name').textContent = doctor.name;
  document.getElementById('ticket-dept-name').textContent = `${doctor.department} • ${doctor.room}`;
  document.getElementById('ticket-token-number').textContent = token.number;
  document.getElementById('ticket-patient-name').textContent = `Patient: ${token.patientName}`;

  const createdTime = new Date(token.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  document.getElementById('ticket-timestamp').textContent = createdTime;

  // Calculate Metrics
  const servingToken = appState.tokens.find(t => t.doctorId === doctor.id && t.status === 'serving');
  const currentlyServingText = servingToken ? servingToken.number : 'None';
  document.getElementById('ticket-currently-serving').textContent = currentlyServingText;

  // Calculate people ahead
  let peopleAhead = 0;
  if (token.status === 'waiting') {
    const waitingList = appState.tokens
      .filter(t => t.doctorId === doctor.id && t.status === 'waiting')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const myIndex = waitingList.findIndex(t => t.id === token.id);
    peopleAhead = myIndex >= 0 ? myIndex : 0;
  } else if (token.status === 'serving') {
    peopleAhead = 0;
  }

  document.getElementById('ticket-people-ahead').textContent = peopleAhead;

  // Estimated wait time
  const estMinutes = peopleAhead * doctor.avgConsultMins;
  document.getElementById('ticket-est-wait').textContent = token.status === 'serving'
    ? 'Now'
    : token.status === 'completed'
      ? '0 min'
      : `~ ${estMinutes} mins`;

  // Status Chip & Alerts
  const statusChip = document.getElementById('ticket-status-chip');
  const alertBanner = document.getElementById('alert-turn-approaching');

  statusChip.className = 'status-indicator-chip';

  if (token.status === 'serving') {
    statusChip.classList.add('serving');
    statusChip.textContent = `🟢 Currently Inside: ${doctor.room}`;
    alertBanner.classList.remove('hidden');
    document.getElementById('alert-title').textContent = "IT'S YOUR TURN NOW!";
    document.getElementById('alert-message').textContent = `Please proceed immediately inside ${doctor.room} with ${doctor.name}.`;
  } else if (token.status === 'waiting') {
    if (peopleAhead <= 1) {
      alertBanner.classList.remove('hidden');
      document.getElementById('alert-title').textContent = "YOUR TURN IS APPROACHING!";
      document.getElementById('alert-message').textContent = `Only ${peopleAhead} patient ahead of you. Please be near ${doctor.room}.`;
      statusChip.textContent = `Next in Line (${peopleAhead} ahead)`;
    } else {
      alertBanner.classList.add('hidden');
      statusChip.textContent = `Waiting in Queue (${peopleAhead} ahead)`;
    }
  } else if (token.status === 'skipped') {
    statusChip.classList.add('skipped');
    statusChip.textContent = `⚠️ Token Was Skipped (Visit Reception)`;
    alertBanner.classList.add('hidden');
  } else if (token.status === 'completed') {
    statusChip.classList.add('completed');
    statusChip.textContent = `✓ Consultation Completed`;
    alertBanner.classList.add('hidden');
  }

  // Progress Bar
  const totalInLine = peopleAhead + 1;
  const progressPercent = token.status === 'serving' ? 95 : token.status === 'completed' ? 100 : Math.max(15, 100 - (peopleAhead * 25));
  document.getElementById('ticket-progress-fill').style.width = `${progressPercent}%`;
  document.getElementById('progress-percent-label').textContent = token.status === 'serving'
    ? 'Now Calling'
    : `${peopleAhead} ahead`;
}

// Cancel / Reset my token button
document.getElementById('btn-cancel-token')?.addEventListener('click', () => {
  if (confirm('Cancel your current token?')) {
    const activeTokenId = localStorage.getItem(ACTIVE_USER_TOKEN_KEY);
    if (activeTokenId) {
      appState.tokens = appState.tokens.filter(t => t.id !== activeTokenId);
      saveClinicState(appState);
    }
    localStorage.removeItem(ACTIVE_USER_TOKEN_KEY);
    renderAllViews();
  }
});

document.getElementById('btn-take-another')?.addEventListener('click', () => {
  localStorage.removeItem(ACTIVE_USER_TOKEN_KEY);
  renderAllViews();
});

// -------------------------------------------------------------
// 6. WAITING HALL PUBLIC DISPLAY BOARD
// -------------------------------------------------------------
function renderPublicDisplayBoard() {
  const container = document.getElementById('public-boards-container');
  if (!container) return;
  container.innerHTML = '';

  appState.doctors.forEach(doc => {
    const serving = appState.tokens.find(t => t.doctorId === doc.id && t.status === 'serving');
    const waitingTokens = appState.tokens
      .filter(t => t.doctorId === doc.id && t.status === 'waiting')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const nextTokensPreview = waitingTokens.slice(0, 3);

    const card = document.createElement('div');
    card.className = 'kiosk-board-box';
    card.innerHTML = `
      <div class="kiosk-board-top">
        <div>
          <h4>${doc.name}</h4>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${doc.department}</span>
        </div>
        <span class="kiosk-room-pill">${doc.room}</span>
      </div>

      <div class="kiosk-serving-hero">
        <span class="label">CURRENTLY SERVING</span>
        <div class="big-token">${serving ? serving.number : '--'}</div>
        <div class="pat-name">${serving ? 'Patient: ' + serving.patientName : 'Doctor is Ready'}</div>
      </div>

      <div class="kiosk-next-up">
        <span style="color: var(--text-muted);">Next in Queue:</span>
        <div class="next-tokens-list">
          ${nextTokensPreview.length > 0
            ? nextTokensPreview.map(t => `<span class="kiosk-token-tag">${t.number}</span>`).join('')
            : '<span style="color: var(--text-dim);">Queue empty</span>'
          }
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// Live Clock for Waiting Display
function updateLiveClock() {
  const clockEl = document.getElementById('live-clock');
  if (clockEl) {
    clockEl.textContent = new Date().toLocaleTimeString();
  }
}
setInterval(updateLiveClock, 1000);
updateLiveClock();

// -------------------------------------------------------------
// 7. CLINIC STAFF DASHBOARD CONTROLLER
// -------------------------------------------------------------
const staffDoctorSelect = document.getElementById('staff-doctor-select');
let activeStaffDocId = appState.doctors[0].id;

function initStaffDoctorDropdown() {
  if (!staffDoctorSelect) return;
  staffDoctorSelect.innerHTML = '';
  appState.doctors.forEach(doc => {
    const opt = document.createElement('option');
    opt.value = doc.id;
    opt.textContent = `${doc.name} (${doc.room})`;
    staffDoctorSelect.appendChild(opt);
  });
  staffDoctorSelect.value = activeStaffDocId;
}

staffDoctorSelect?.addEventListener('change', (e) => {
  activeStaffDocId = e.target.value;
  renderStaffDashboard();
});

// Render Staff Screen Elements
function renderStaffDashboard() {
  const currentDoc = appState.doctors.find(d => d.id === activeStaffDocId);
  if (!currentDoc) return;

  // 1. Current Serving Token
  const servingToken = appState.tokens.find(
    t => t.doctorId === activeStaffDocId && t.status === 'serving'
  );

  const numEl = document.getElementById('staff-current-token-num');
  const patEl = document.getElementById('staff-current-patient-name');
  const timerEl = document.getElementById('consult-timer');

  if (servingToken) {
    numEl.textContent = servingToken.number;
    patEl.textContent = `Patient: ${servingToken.patientName}`;
    const elapsed = servingToken.calledAt
      ? Math.floor((Date.now() - new Date(servingToken.calledAt)) / 1000 / 60)
      : 0;
    timerEl.textContent = `In consultation: ~${elapsed} min`;
  } else {
    numEl.textContent = '--';
    patEl.textContent = 'No patient currently called';
    timerEl.textContent = 'Room vacant';
  }

  // 2. Waiting List
  const waitingTokens = appState.tokens
    .filter(t => t.doctorId === activeStaffDocId && t.status === 'waiting')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  document.getElementById('count-waiting').textContent = waitingTokens.length;
  const waitingTbody = document.getElementById('table-waiting-body');
  waitingTbody.innerHTML = '';

  if (waitingTokens.length === 0) {
    waitingTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-dim); padding: 24px;">No patients waiting in queue.</td></tr>`;
  } else {
    waitingTokens.forEach((tok, idx) => {
      const row = document.createElement('tr');
      const waitMins = idx * currentDoc.avgConsultMins;
      const createdStr = new Date(tok.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      row.innerHTML = `
        <td><span class="table-token-badge">${tok.number}</span></td>
        <td><strong>${tok.patientName}</strong></td>
        <td>${createdStr}</td>
        <td>~${waitMins}m</td>
        <td>
          <button class="row-action-btn" onclick="directCallToken('${tok.id}')">Call Now</button>
        </td>
      `;
      waitingTbody.appendChild(row);
    });
  }

  // 3. Skipped List
  const skippedTokens = appState.tokens
    .filter(t => t.doctorId === activeStaffDocId && t.status === 'skipped');

  document.getElementById('count-skipped').textContent = skippedTokens.length;
  const skippedTbody = document.getElementById('table-skipped-body');
  skippedTbody.innerHTML = '';

  if (skippedTokens.length === 0) {
    skippedTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-dim); padding: 24px;">No skipped tokens.</td></tr>`;
  } else {
    skippedTokens.forEach(tok => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><span class="table-token-badge" style="color: var(--accent-rose); border-color: rgba(244,63,94,0.3);">${tok.number}</span></td>
        <td>${tok.patientName}</td>
        <td>${tok.skippedAt ? new Date(tok.skippedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Earlier'}</td>
        <td>No-show / Requested hold</td>
        <td>
          <button class="row-action-btn" onclick="requeueSkippedToken('${tok.id}')">Re-queue</button>
        </td>
      `;
      skippedTbody.appendChild(row);
    });
  }

  // 4. Today's History
  const historyTokens = appState.tokens
    .filter(t => t.doctorId === activeStaffDocId && (t.status === 'completed' || t.status === 'cancelled'))
    .sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));

  document.getElementById('count-history').textContent = historyTokens.length;
  const historyTbody = document.getElementById('table-history-body');
  historyTbody.innerHTML = '';

  if (historyTokens.length === 0) {
    historyTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-dim); padding: 24px;">No consultations completed today yet.</td></tr>`;
  } else {
    historyTokens.forEach(tok => {
      const row = document.createElement('tr');
      let durationStr = '--';
      if (tok.calledAt && tok.completedAt) {
        const diff = Math.max(1, Math.round((new Date(tok.completedAt) - new Date(tok.calledAt)) / 60000));
        durationStr = `${diff} mins`;
      }

      row.innerHTML = `
        <td><span class="table-token-badge" style="color: var(--text-muted);">${tok.number}</span></td>
        <td>${tok.patientName}</td>
        <td>${currentDoc.name}</td>
        <td>${durationStr}</td>
        <td><span class="status-tag ${tok.status === 'completed' ? 'done' : 'skipped'}">${tok.status.toUpperCase()}</span></td>
      `;
      historyTbody.appendChild(row);
    });
  }
}

// Staff Action Handlers
document.getElementById('btn-call-next')?.addEventListener('click', () => {
  // 1. If someone is already serving, automatically complete them or prompt
  const currentlyServing = appState.tokens.find(
    t => t.doctorId === activeStaffDocId && t.status === 'serving'
  );

  if (currentlyServing) {
    currentlyServing.status = 'completed';
    currentlyServing.completedAt = new Date().toISOString();
  }

  // 2. Find first waiting token
  const nextWaiting = appState.tokens
    .filter(t => t.doctorId === activeStaffDocId && t.status === 'waiting')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];

  if (!nextWaiting) {
    alert('No more waiting patients for this doctor queue!');
    saveClinicState(appState);
    renderAllViews();
    return;
  }

  nextWaiting.status = 'serving';
  nextWaiting.calledAt = new Date().toISOString();

  playClinicChime();
  saveClinicState(appState);
  renderAllViews();
});

// Recall Button
document.getElementById('btn-recall')?.addEventListener('click', () => {
  const currentlyServing = appState.tokens.find(
    t => t.doctorId === activeStaffDocId && t.status === 'serving'
  );
  if (!currentlyServing) {
    alert('No patient is currently being called. Click "Call Next" first.');
    return;
  }
  playClinicChime();
  alert(`Re-announced Token ${currentlyServing.number} for ${currentlyServing.patientName}.`);
});

// Complete Button
document.getElementById('btn-complete')?.addEventListener('click', () => {
  const currentlyServing = appState.tokens.find(
    t => t.doctorId === activeStaffDocId && t.status === 'serving'
  );
  if (!currentlyServing) {
    alert('No active consultation to complete.');
    return;
  }
  currentlyServing.status = 'completed';
  currentlyServing.completedAt = new Date().toISOString();
  saveClinicState(appState);
  renderAllViews();
});

// Skip Button
document.getElementById('btn-skip')?.addEventListener('click', () => {
  const currentlyServing = appState.tokens.find(
    t => t.doctorId === activeStaffDocId && t.status === 'serving'
  );
  if (!currentlyServing) {
    alert('No patient currently in consultation to skip.');
    return;
  }
  currentlyServing.status = 'skipped';
  currentlyServing.skippedAt = new Date().toISOString();
  saveClinicState(appState);
  renderAllViews();
});

// Walk-in Generator
document.getElementById('btn-issue-walkin')?.addEventListener('click', () => {
  const walkinInput = document.getElementById('walkin-patient-name');
  const name = walkinInput.value.trim();
  if (!name) return;

  const doc = appState.doctors.find(d => d.id === activeStaffDocId);
  const nextSeq = appState.sequenceCounters[activeStaffDocId] || 101;
  const tokenNumber = `${doc.prefix}-${nextSeq}`;

  const newToken = {
    id: 'tok-' + Date.now(),
    number: tokenNumber,
    doctorId: activeStaffDocId,
    patientName: name + ' (Walk-in)',
    status: 'waiting',
    createdAt: new Date().toISOString(),
    calledAt: null,
    completedAt: null
  };

  appState.tokens.push(newToken);
  appState.sequenceCounters[activeStaffDocId] = nextSeq + 1;
  walkinInput.value = '';
  saveClinicState(appState);
  renderAllViews();
});

// Direct Call Token from Table
window.directCallToken = function(tokenId) {
  // Complete any currently serving
  const currentlyServing = appState.tokens.find(
    t => t.doctorId === activeStaffDocId && t.status === 'serving'
  );
  if (currentlyServing) {
    currentlyServing.status = 'completed';
    currentlyServing.completedAt = new Date().toISOString();
  }

  const token = appState.tokens.find(t => t.id === tokenId);
  if (token) {
    token.status = 'serving';
    token.calledAt = new Date().toISOString();
    playClinicChime();
    saveClinicState(appState);
    renderAllViews();
  }
};

// Requeue Skipped Token
window.requeueSkippedToken = function(tokenId) {
  const token = appState.tokens.find(t => t.id === tokenId);
  if (token) {
    token.status = 'waiting';
    token.createdAt = new Date().toISOString(); // puts at end of queue
    delete token.skippedAt;
    saveClinicState(appState);
    renderAllViews();
  }
};

// Reset to Sample Demo Data
document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
  if (confirm('Reset clinic queue to sample mock state?')) {
    localStorage.removeItem(ACTIVE_USER_TOKEN_KEY);
    appState = JSON.parse(JSON.stringify(INITIAL_MOCK_STATE));
    saveClinicState(appState);
    renderAllViews();
  }
});

// -------------------------------------------------------------
// 8. GLOBAL RENDER & CROSS-TAB REAL-TIME SYNCHRONIZATION
// -------------------------------------------------------------
function renderAllViews() {
  renderDoctorSelectionCards();
  renderPatientTokenTicket();
  renderPublicDisplayBoard();
  renderStaffDashboard();
}

// Listen for storage event (if staff advances queue in one tab, patient tab updates immediately!)
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    appState = loadClinicState();
    renderAllViews();
  }
});

window.addEventListener('clinic-state-updated', () => {
  renderAllViews();
});

// Initial Bootstrap
initStaffDoctorDropdown();
renderAllViews();
