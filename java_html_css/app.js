/**
 * SISTEM PENGURUSAN KEAHLIAN - APP.JS (PURE JAVASCRIPT)
 * Beroperasi dengan Java Backend (REST API) atau LocalStorage secara automatik.
 */

// Konfigurasi Asas
const CONFIG = {
  prefix: 'MBR-',
  digits: 6,
  adminWhatsApp: '601120798015'
};

// Data State
let members = [];
let activityLogs = [];
let currentTab = 'dashboard';
let isJavaBackendAvailable = false;

// 1. Inisialisasi Aplikasi
window.addEventListener('DOMContentLoaded', async () => {
  checkAuth();
  await checkBackendAndLoadData();
  refreshDashboard();
  renderMembers();
});

// Semakan Akses Pentadbir
function checkAuth() {
  const session = localStorage.getItem('mms_java_session');
  if (!session) {
    document.getElementById('login-modal-screen').classList.remove('hidden');
  }
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const u = document.getElementById('login-username').value;
  const p = document.getElementById('login-password').value;
  if (u === 'admin' && p === 'admin123') {
    localStorage.setItem('mms_java_session', 'admin');
    document.getElementById('login-modal-screen').classList.add('hidden');
    showToast('Selamat datang, Administrator!');
  } else {
    alert('Nama pengguna atau kata laluan tidak sah! (Lalai: admin / admin123)');
  }
}

function handleLogout() {
  if (confirm('Adakah anda pasti mahu log keluar?')) {
    localStorage.removeItem('mms_java_session');
    location.reload();
  }
}

// 2. Semak Sambungan Java Backend atau Guna LocalStorage
async function checkBackendAndLoadData() {
  try {
    const res = await fetch('/api/members', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      members = data.members || [];
      isJavaBackendAvailable = true;
      return;
    }
  } catch (e) {
    // Java backend tidak aktif atau dibuka sebagai fail tempatan
    isJavaBackendAvailable = false;
  }

  // Muat dari LocalStorage jika tiada Java Backend aktif
  const localData = localStorage.getItem('mms_members_db');
  if (localData) {
    members = JSON.parse(localData);
  } else {
    // Sediakan 6 rekod awal
    seedInitialDemoData();
  }
}

function saveLocalMembers() {
  localStorage.setItem('mms_members_db', JSON.stringify(members));
}

// 3. Pendaftaran Ahli Baru (Atomic ID & Duplikasi)
async function handleRegisterSubmit(e) {
  e.preventDefault();

  const nama = document.getElementById('reg-nama').value.trim();
  const telefon = document.getElementById('reg-telefon').value.trim();
  const nric = document.getElementById('reg-nric').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const sponsorId = document.getElementById('reg-sponsor').value.trim().toUpperCase();
  const alamat = document.getElementById('reg-alamat').value.trim();

  // Semakan format NRIC
  const cleanNric = nric.replace(/\D/g, '');
  if (cleanNric.length !== 12) {
    showToast('NRIC mestilah mengandungi tepat 12 digit nombor.', 'error');
    return;
  }

  // Semakan Duplikasi No Telefon & NRIC
  const cleanPhone = telefon.replace(/\D/g, '');
  const isDuplicate = members.some(m => 
    (m.nric.replace(/\D/g, '') === cleanNric || m.telefon.replace(/\D/g, '') === cleanPhone) && m.status !== 'DELETED'
  );

  if (isDuplicate) {
    showToast('Ralat: No Telefon atau NRIC ini telah pun berdaftar!', 'error');
    return;
  }

  // Sekiranya Java Backend aktif, hantar ke API Java
  if (isJavaBackendAvailable) {
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, telefon, nric: cleanNric, email, sponsorId, alamat })
      });
      const data = await res.json();
      if (res.ok && data.member) {
        members.unshift(data.member);
        onRegisterSuccess(data.member);
        return;
      }
    } catch (err) {
      console.warn('Java server error, falling back to local.', err);
    }
  }

  // Janaan ID Berturutan (Atomic Simulation)
  const maxNumber = members.reduce((max, m) => {
    const num = parseInt(m.memberId.replace(/\D/g, ''), 10);
    return !isNaN(num) && num > max ? num : max;
  }, 0);
  const nextNumber = maxNumber + 1;
  const newMemberId = CONFIG.prefix + String(nextNumber).padStart(CONFIG.digits, '0');

  const newMember = {
    id: 'mbr_' + Date.now(),
    memberId: newMemberId,
    nama,
    telefon,
    nric: cleanNric,
    email,
    sponsorId: sponsorId || '-',
    alamat,
    tarikhDaftar: new Date().toISOString(),
    status: 'ACTIVE'
  };

  members.unshift(newMember);
  saveLocalMembers();
  addActivityLog('REGISTER', `Pendaftaran ahli baru: ${nama} (${newMemberId})`);
  onRegisterSuccess(newMember);
}

function onRegisterSuccess(member) {
  document.getElementById('form-register').reset();
  document.getElementById('success-member-id').innerText = member.memberId;
  document.getElementById('success-member-sub').innerText = `${member.nama} • ${member.telefon}`;

  // Sediakan pautan WhatsApp
  const cleanPhone = member.telefon.replace(/\D/g, '');
  const waPhone = '60' + (cleanPhone.startsWith('60') ? cleanPhone.slice(2) : cleanPhone.replace(/^0/, ''));
  const waMsg = `Assalamualaikum ${member.nama}.\n\nTerima kasih kerana mendaftar sebagai ahli.\n\nMember ID anda:\n${member.memberId}\n\nTerima kasih.`;
  document.getElementById('success-wa-member-btn').href = `https://wa.me/${waPhone}?text=${encodeURIComponent(waMsg)}`;

  // WhatsApp Admin Notification
  const adminMsg = `🔔 PENDAFTARAN AHLI BARU\n\nNama: ${member.nama}\nTelefon: ${member.telefon}\nNRIC: ${member.nric}\nID: ${member.memberId}\nSponsor: ${member.sponsorId}`;
  document.getElementById('success-wa-admin-btn').href = `https://wa.me/${CONFIG.adminWhatsApp}?text=${encodeURIComponent(adminMsg)}`;

  showToast(`Pendaftaran berjaya! ID: ${member.memberId}`);
  switchTab('success');
  refreshDashboard();
}

// 4. Salin ID
function copySuccessId() {
  const id = document.getElementById('success-member-id').innerText;
  navigator.clipboard.writeText(id);
  const btn = document.getElementById('btn-copy-id');
  btn.innerText = 'DISALIN! ✓';
  setTimeout(() => btn.innerText = 'SALIN ID', 2000);
}

// 5. Paparan Dashboard & Metrik
function refreshDashboard() {
  const activeMembers = members.filter(m => m.status === 'ACTIVE');
  const now = new Date();
  const thisMonth = members.filter(m => {
    const d = new Date(m.tarikhDaftar);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const sponsors = new Set(members.map(m => m.sponsorId).filter(s => s && s !== '-'));

  document.getElementById('stat-total').innerText = members.length;
  document.getElementById('stat-active').innerText = activeMembers.length;
  document.getElementById('stat-month').innerText = thisMonth.length;
  document.getElementById('stat-sponsors').innerText = sponsors.size;
  document.getElementById('badge-total-members').innerText = members.length;

  // Trend bar pertumbuhan
  const trendContainer = document.getElementById('dashboard-trend-bars');
  const months = ['APR', 'MEI', 'JUN', 'JUL', 'OGOS', 'SEP'];
  trendContainer.innerHTML = months.map((m, i) => {
    const height = Math.min(100, Math.max(15, (i + 1) * 16 + (members.length * 2)));
    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%;">
        <div style="width: 100%; max-width: 34px; background: var(--primary-500); height: ${height}%; border-radius: 6px 6px 0 0;"></div>
        <span style="font-size: 10px; color: var(--slate-400); margin-top: 4px; font-weight: 700;">${m}</span>
      </div>
    `;
  }).join('');

  // 5 pendaftaran terkini
  const recentContainer = document.getElementById('dashboard-recent-members');
  if (members.length === 0) {
    recentContainer.innerHTML = '<p style="font-size: 12px; color: var(--slate-400); text-align: center; padding: 16px;">Belum ada pendaftaran ahli.</p>';
  } else {
    recentContainer.innerHTML = members.slice(0, 5).map(m => `
      <div onclick="openMemberDetail('${m.id}')" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--slate-100); cursor: pointer;">
        <div>
          <span class="font-mono" style="font-size: 13px;">${m.memberId}</span> - <strong>${m.nama}</strong>
          <div style="font-size: 11px; color: var(--slate-400);">${m.telefon} • Sponsor: ${m.sponsorId}</div>
        </div>
        <span class="badge ${m.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}">${m.status}</span>
      </div>
    `).join('');
  }
}

// 6. Paparan Senarai Ahli (Table)
function renderMembers() {
  const query = (document.getElementById('input-search')?.value || '').toLowerCase();
  const filtered = members.filter(m => 
    m.nama.toLowerCase().includes(query) ||
    m.telefon.includes(query) ||
    m.memberId.toLowerCase().includes(query) ||
    m.nric.includes(query)
  );

  const tbody = document.getElementById('members-table-body');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--slate-400); padding: 24px;">Tiada ahli dijumpai.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(m => `
    <tr>
      <td class="font-mono">${m.memberId}</td>
      <td><strong>${m.nama}</strong></td>
      <td>${m.telefon}</td>
      <td class="font-mono">******-${m.nric.slice(-4)}</td>
      <td>${m.sponsorId || '-'}</td>
      <td style="color: var(--slate-400);">${m.tarikhDaftar ? m.tarikhDaftar.slice(0, 10) : '-'}</td>
      <td style="text-align: center;">
        <span class="badge ${m.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}">${m.status}</span>
      </td>
      <td style="text-align: right;">
        <button onclick="openMemberDetail('${m.id}')" class="btn btn-secondary btn-sm">Detail</button>
      </td>
    </tr>
  `).join('');

  // Update Report Preview Table as well
  const rbody = document.getElementById('report-preview-body');
  if (rbody) {
    rbody.innerHTML = filtered.slice(0, 10).map((m, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td class="font-mono">${m.memberId}</td>
        <td><strong>${m.nama}</strong></td>
        <td>${m.telefon}</td>
        <td>${m.sponsorId}</td>
        <td>${m.tarikhDaftar ? m.tarikhDaftar.slice(0, 10) : '-'}</td>
        <td style="text-align: center;"><span class="badge ${m.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}">${m.status}</span></td>
      </tr>
    `).join('');
  }
}

function handleSearchDebounced() {
  renderMembers();
}

// 7. Eksport Laporan Excel & CSV
function exportToExcelDirect() {
  showToast('Menjana fail Excel (.xlsx)...');
  const exportData = members.map((m, i) => ({
    'No': i + 1,
    'Member ID': m.memberId,
    'Nama Penuh': m.nama,
    'No Telefon': m.telefon,
    'NRIC': m.nric,
    'Email': m.email,
    'Alamat': m.alamat,
    'Sponsor': m.sponsorId,
    'Tarikh': m.tarikhDaftar,
    'Status': m.status
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Senarai Ahli');
  XLSX.writeFile(wb, `Member_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  showToast('Fail Excel berjaya dimuat turun!');
}

function exportToCSVDirect() {
  let csv = '\uFEFFNo,Member ID,Nama Penuh,Telefon,NRIC,Email,Alamat,Sponsor,Tarikh,Status\n';
  members.forEach((m, i) => {
    csv += `"${i + 1}","${m.memberId}","${m.nama}","${m.telefon}","'${m.nric}","${m.email}","${m.alamat.replace(/"/g, '""')}","${m.sponsorId}","${m.tarikhDaftar}","${m.status}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Member_Report_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  showToast('Fail CSV berjaya dimuat turun!');
}

// 8. Navigasi Tab
function switchTab(tab) {
  currentTab = tab;
  const views = ['dashboard', 'members', 'register', 'success', 'report', 'whatsapp', 'logs', 'settings'];
  views.forEach(v => {
    const el = document.getElementById('view-' + v);
    if (el) el.classList.add('hidden');

    const sbtn = document.getElementById('nav-btn-' + v);
    if (sbtn) sbtn.classList.toggle('active', v === tab);
  });

  const target = document.getElementById('view-' + tab);
  if (target) target.classList.remove('hidden');

  const titles = {
    dashboard: ['Dashboard Pentadbir', 'Sistem Pengurusan Keahlian'],
    members: ['Senarai Ahli', 'Pangkalan Data Ahli'],
    register: ['Daftar Ahli Baru', 'Borang Pendaftaran Rasmi'],
    success: ['Pendaftaran Berjaya', 'Member ID Dijana'],
    report: ['Laporan & Analisis', 'Eksport Data Keahlian'],
    whatsapp: ['WhatsApp Gateway', 'Log Notifikasi'],
    logs: ['Audit Trail', 'Jejak Aktiviti Sistem'],
    settings: ['Tetapan Sistem', 'Konfigurasi Sistem']
  };

  if (titles[tab]) {
    document.getElementById('header-title').innerText = titles[tab][0];
    document.getElementById('header-subtitle').innerText = titles[tab][1];
  }

  if (tab === 'dashboard') refreshDashboard();
  if (tab === 'members') renderMembers();
}

// 9. Modal Detail
function openMemberDetail(id) {
  const m = members.find(x => x.id === id);
  if (!m) return;
  document.getElementById('modal-detail-id').innerText = m.memberId;
  document.getElementById('modal-detail-content').innerHTML = `
    <div style="background: var(--slate-50); padding: 16px; border-radius: var(--radius-md); line-height: 1.8;">
      <div>Nama: <strong>${m.nama}</strong></div>
      <div>Telefon: <strong>${m.telefon}</strong></div>
      <div>NRIC: <strong class="font-mono">${m.nric}</strong></div>
      <div>Sponsor: <strong>${m.sponsorId}</strong></div>
      <div>Status: <span class="badge ${m.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}">${m.status}</span></div>
      <div>Alamat: ${m.alamat}</div>
    </div>
  `;
  document.getElementById('modal-detail').classList.remove('hidden');
}

function closeDetailModal() {
  document.getElementById('modal-detail').classList.add('hidden');
}

// 10. Toast Notification
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.style.padding = '12px 18px';
  toast.style.borderRadius = '12px';
  toast.style.fontSize = '12px';
  toast.style.fontWeight = '700';
  toast.style.color = '#ffffff';
  toast.style.backgroundColor = type === 'success' ? 'var(--primary-800)' : 'var(--danger-700)';
  toast.style.boxShadow = 'var(--shadow-lg)';
  toast.innerText = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// Data Demo Awal
function seedInitialDemoData() {
  members = [
    { id: 'mbr_1', memberId: 'MBR-000001', nama: 'Ahmad bin Zulkifli', telefon: '012-3456789', nric: '880101015678', email: 'ahmad@example.com', sponsorId: 'SP-0001', alamat: 'No 12, Jalan Melati 3, 50000 Kuala Lumpur', tarikhDaftar: new Date().toISOString(), status: 'ACTIVE' },
    { id: 'mbr_2', memberId: 'MBR-000002', nama: 'Siti Nurhaliza binti Bakar', telefon: '013-9876543', nric: '920202021234', email: 'siti@example.com', sponsorId: 'SP-0002', alamat: 'No 45, Lorong Dahlia, 13700 Perai, Pulau Pinang', tarikhDaftar: new Date().toISOString(), status: 'ACTIVE' },
    { id: 'mbr_3', memberId: 'MBR-000003', nama: 'Mohd Faiz bin Ibrahim', telefon: '017-8899001', nric: '850505089012', email: 'faiz@example.com', sponsorId: 'SP-0001', alamat: 'Lot 203, Kampung Baru, 40000 Shah Alam, Selangor', tarikhDaftar: new Date().toISOString(), status: 'ACTIVE' },
    { id: 'mbr_4', memberId: 'MBR-000004', nama: 'Nurul Aini binti Razak', telefon: '019-3322114', nric: '960808103456', email: 'nurul@example.com', sponsorId: 'SP-0003', alamat: 'No 7, Taman Bunga Raya, 80000 Johor Bahru, Johor', tarikhDaftar: new Date().toISOString(), status: 'ACTIVE' },
    { id: 'mbr_5', memberId: 'MBR-000005', nama: 'Muhammad Hafiz bin Omar', telefon: '011-2345678', nric: '910303037890', email: 'hafiz@example.com', sponsorId: 'SP-0001', alamat: 'Blok B-12-04, Residensi Impian, 68000 Ampang, Selangor', tarikhDaftar: new Date().toISOString(), status: 'ACTIVE' },
    { id: 'mbr_6', memberId: 'MBR-000006', nama: 'Norazlina binti Ismail', telefon: '018-7766554', nric: '891111142345', email: 'norazlina@example.com', sponsorId: 'SP-0002', alamat: 'No 88, Jalan Nilam 2, 75450 Ayer Keroh, Melaka', tarikhDaftar: new Date().toISOString(), status: 'ACTIVE' }
  ];
  saveLocalMembers();
}

function seedDemoData() {
  seedInitialDemoData();
  refreshDashboard();
  renderMembers();
  showToast('6 rekod demo berjaya dimuatkan!');
}

function clearAllDataPrompt() {
  if (confirm('Kosongkan semua rekod data keahlian?')) {
    members = [];
    saveLocalMembers();
    refreshDashboard();
    renderMembers();
    showToast('Data telah dikosongkan.');
  }
}

function addActivityLog(action, details) {
  activityLogs.unshift({
    id: 'act_' + Date.now(),
    action,
    details,
    time: new Date().toLocaleTimeString()
  });
}
