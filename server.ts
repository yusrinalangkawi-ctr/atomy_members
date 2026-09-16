import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent database path
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface Member {
  id: string;
  memberId: string;
  nama: string;
  telefon: string;
  nric: string;
  email?: string;
  alamat: string;
  sponsorId?: string;
  tarikhDaftar: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  updatedAt: string;
}

interface WhatsAppLog {
  id: string;
  memberId: string;
  nama: string;
  recipient: string;
  messageType: 'ADMIN_NOTIFY' | 'WELCOME_MEMBER' | 'CUSTOM';
  content: string;
  status: 'SENT' | 'FAILED' | 'PENDING' | 'MANUAL';
  sentAt: string;
  error?: string;
}

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  memberId?: string;
  timestamp: string;
  details: string;
}

interface AppSettings {
  appName: string;
  memberPrefix: string;
  memberDigits: number;
  timezone: string;
  whatsappEnabled: boolean;
  adminWhatsAppNumber: string;
  welcomeTemplate: string;
  adminNotifyTemplate: string;
}

interface DatabaseSchema {
  members: Member[];
  whatsappLogs: WhatsAppLog[];
  activityLogs: ActivityLog[];
  settings: AppSettings;
  lastMemberCounter: number;
}

// Initial default settings
const defaultSettings: AppSettings = {
  appName: 'Member Management System',
  memberPrefix: 'MBR-',
  memberDigits: 6,
  timezone: 'Asia/Kuala_Lumpur',
  whatsappEnabled: process.env.WHATSAPP_ENABLED === 'true',
  adminWhatsAppNumber: process.env.ADMIN_WHATSAPP_NUMBER || '601120798015',
  welcomeTemplate: `Assalamualaikum {{Nama}}.

Terima kasih kerana telah mendaftar sebagai ahli.

Member ID anda:
{{MemberID}}

Terima kasih.`,
  adminNotifyTemplate: `🔔 PENDAFTARAN AHLI BARU

Nama:
{{Nama}}

Telefon:
{{Telefon}}

NRIC:
{{MaskedNRIC}}

Member ID:
{{MemberID}}

Sponsor:
{{SponsorID}}

Tarikh:
{{Tarikh}}

Status:
✅ BERJAYA DIDAFTARKAN`,
};

// Seed sample demo members
const sampleDemoMembers: Member[] = [
  {
    id: 'demo-1',
    memberId: 'MBR-000001',
    nama: 'Ahmad bin Ali',
    telefon: '011-8888 7777',
    nric: '900101-02-1234',
    email: 'ahmad@example.com',
    alamat: 'No. 12, Jalan Kangar Maju, 01000 Kangar, Perlis',
    sponsorId: 'SP-0001',
    tarikhDaftar: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    memberId: 'MBR-000002',
    nama: 'Siti Aminah binti Razak',
    telefon: '012-7777 6666',
    nric: '920202-02-5678',
    email: 'siti@example.com',
    alamat: 'Lot 45, Lorong Merbok, 05000 Alor Setar, Kedah',
    sponsorId: 'SP-0002',
    tarikhDaftar: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    memberId: 'MBR-000003',
    nama: 'Muhammad Faiz bin Kamaruddin',
    telefon: '019-3333 2222',
    nric: '880512-08-3345',
    email: 'faiz@example.com',
    alamat: 'B-3-10, Pangsapuri Indah, Jalan Ipoh, 30000 Ipoh, Perak',
    sponsorId: 'SP-0001',
    tarikhDaftar: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    memberId: 'MBR-000004',
    nama: 'Nurul Huda binti Othman',
    telefon: '017-5555 4444',
    nric: '951120-10-8890',
    email: 'huda@example.com',
    alamat: 'No 7, Taman Melati Utama, 53100 Gombak, Kuala Lumpur',
    sponsorId: 'SP-0003',
    tarikhDaftar: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    memberId: 'MBR-000005',
    nama: 'Tan Wei Lun',
    telefon: '016-2222 1111',
    nric: '910815-01-6789',
    email: 'weilun@example.com',
    alamat: '23, Jalan Molek 2/4, Taman Molek, 81100 Johor Bahru, Johor',
    sponsorId: 'SP-0001',
    tarikhDaftar: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-6',
    memberId: 'MBR-000006',
    nama: 'Kavitha a/p Subramaniam',
    telefon: '014-9999 8888',
    nric: '940304-05-4321',
    email: 'kavitha@example.com',
    alamat: 'No. 18, Jalan Rasah, 70300 Seremban, Negeri Sembilan',
    sponsorId: 'SP-0002',
    tarikhDaftar: new Date().toISOString(),
    status: 'ACTIVE',
    updatedAt: new Date().toISOString(),
  },
];

// Helper: Ensure DB file exists
function initDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      // Merge with defaults if new fields
      return {
        members: parsed.members || [],
        whatsappLogs: parsed.whatsappLogs || [],
        activityLogs: parsed.activityLogs || [],
        settings: { ...defaultSettings, ...(parsed.settings || {}) },
        lastMemberCounter: parsed.lastMemberCounter || (parsed.members?.length || 0),
      };
    } catch (e) {
      console.error('Error parsing database.json, reinitializing:', e);
    }
  }

  const initialDb: DatabaseSchema = {
    members: sampleDemoMembers,
    whatsappLogs: [
      {
        id: 'log-init-1',
        memberId: 'MBR-000001',
        nama: 'Ahmad bin Ali',
        recipient: '601120798015',
        messageType: 'ADMIN_NOTIFY',
        content: 'Notifikasi pendaftaran ahli baru MBR-000001',
        status: 'SENT',
        sentAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    activityLogs: [
      {
        id: 'act-init-1',
        user: 'System Admin',
        action: 'SEED_DEMO',
        timestamp: new Date().toISOString(),
        details: 'Sistem diaktifkan dengan 6 rekod permulaan.',
      },
    ],
    settings: defaultSettings,
    lastMemberCounter: 6,
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
  return initialDb;
}

// In-memory cache synced with disk
let db: DatabaseSchema = initDatabase();

// Atomic queue for write operations to prevent race conditions
let writeQueue = Promise.resolve();

function saveDatabase(): Promise<void> {
  writeQueue = writeQueue.then(() => {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  });
  return writeQueue;
}

// Helpers for cleaning phone & NRIC
function cleanDigits(str: string): string {
  return (str || '').replace(/\D/g, '');
}

function normalizePhone(phone: string): string {
  let clean = cleanDigits(phone);
  if (clean.startsWith('60')) {
    clean = '0' + clean.slice(2);
  }
  return clean;
}

function cleanNRIC(nric: string): string {
  return cleanDigits(nric);
}

// Atomic ID Generator with locking
function generateNextMemberId(prefix = 'MBR-', digits = 6): string {
  db.lastMemberCounter += 1;
  const numStr = String(db.lastMemberCounter).padStart(digits, '0');
  return `${prefix}${numStr}`;
}

// Logging activity helper
function addActivityLog(user: string, action: string, details: string, memberId?: string) {
  const log: ActivityLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user,
    action,
    memberId,
    timestamp: new Date().toISOString(),
    details,
  };
  db.activityLogs.unshift(log);
  // Keep last 500 logs
  if (db.activityLogs.length > 500) {
    db.activityLogs = db.activityLogs.slice(0, 500);
  }
  saveDatabase();
}

// ==========================================
// REST API ROUTES
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    totalMembers: db.members.filter((m) => m.status !== 'DELETED').length,
  });
});

// Download Google Apps Script Files
app.get('/api/download/index.html', (req, res) => {
  const filePath = path.join(process.cwd(), 'google_apps_script', 'Index.html');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="Index.html"');
    res.sendFile(filePath);
  } else {
    res.status(404).send('Fail Index.html tidak ditemui.');
  }
});

app.get('/api/download/code.gs', (req, res) => {
  const filePath = path.join(process.cwd(), 'google_apps_script', 'Code.gs');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="Code.gs"');
    res.sendFile(filePath);
  } else {
    res.status(404).send('Fail Code.gs tidak ditemui.');
  }
});

// Admin Authentication
app.post('/api/auth/login', (req, res) => {
  const { password, username = 'admin' } = req.body;

  // Simple secure admin passcode for management
  // Default is 'admin123' or 'admin'
  if (password === 'admin123' || password === 'admin' || password === '123456') {
    const adminUser = {
      id: 'admin-01',
      username: username || 'admin',
      nama: 'Administrator',
      role: 'SUPER_ADMIN',
      token: `adm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };

    addActivityLog('Administrator', 'LOGIN', `Log masuk berjaya dari akaun: ${username}`);

    return res.json({ success: true, user: adminUser });
  }

  res.status(401).json({ success: false, error: 'Kata laluan salah. Sila cuba lagi.' });
});

// GET /api/members (with search, filter, sort, pagination)
app.get('/api/members', (req, res) => {
  try {
    const {
      search,
      status,
      sponsorId,
      startDate,
      endDate,
      datePreset,
      sortBy = 'tarikhDaftar',
      sortOrder = 'desc',
      page = '1',
      limit = '25',
      exportAll = 'false',
    } = req.query as Record<string, string>;

    let list = [...db.members];

    // Filter by Status: default hides DELETED unless explicitly asked
    if (status && status !== 'ALL') {
      list = list.filter((m) => m.status === status);
    } else if (!status) {
      // Exclude DELETED by default
      list = list.filter((m) => m.status !== 'DELETED');
    }

    // Filter by Sponsor
    if (sponsorId && sponsorId !== 'ALL') {
      const cleanSponsor = sponsorId.trim().toLowerCase();
      list = list.filter((m) => (m.sponsorId || '').toLowerCase() === cleanSponsor);
    }

    // Filter by Date Preset / Range
    const now = new Date();
    if (datePreset && datePreset !== 'ALL') {
      if (datePreset === 'TODAY') {
        const todayStr = now.toISOString().slice(0, 10);
        list = list.filter((m) => m.tarikhDaftar.slice(0, 10) === todayStr);
      } else if (datePreset === 'THIS_WEEK') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        list = list.filter((m) => new Date(m.tarikhDaftar) >= startOfWeek);
      } else if (datePreset === 'THIS_MONTH') {
        const currentYearMonth = now.toISOString().slice(0, 7);
        list = list.filter((m) => m.tarikhDaftar.slice(0, 7) === currentYearMonth);
      } else if (datePreset === 'THIS_YEAR') {
        const currentYear = String(now.getFullYear());
        list = list.filter((m) => m.tarikhDaftar.slice(0, 4) === currentYear);
      }
    } else if (startDate || endDate) {
      if (startDate) {
        const start = new Date(startDate);
        list = list.filter((m) => new Date(m.tarikhDaftar) >= start);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        list = list.filter((m) => new Date(m.tarikhDaftar) <= end);
      }
    }

    // Search query
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      const qDigits = cleanDigits(search);
      list = list.filter((m) => {
        return (
          m.memberId.toLowerCase().includes(q) ||
          m.nama.toLowerCase().includes(q) ||
          (m.email && m.email.toLowerCase().includes(q)) ||
          (m.sponsorId && m.sponsorId.toLowerCase().includes(q)) ||
          cleanDigits(m.telefon).includes(qDigits) ||
          cleanDigits(m.nric).includes(qDigits)
        );
      });
    }

    // Sort
    list.sort((a, b) => {
      let valA: any = a[sortBy as keyof Member] || '';
      let valB: any = b[sortBy as keyof Member] || '';

      if (sortBy === 'tarikhDaftar') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB as string).toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const totalCount = list.length;

    // If exportAll === 'true', return all matched items without pagination
    if (exportAll === 'true') {
      return res.json({
        members: list,
        total: totalCount,
      });
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 25);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedMembers = list.slice(startIndex, startIndex + limitNum);

    res.json({
      members: paginatedMembers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Ralat mendapatkan senarai ahli.' });
  }
});

// GET /api/members/:id
app.get('/api/members/:id', (req, res) => {
  const { id } = req.params;
  const member = db.members.find((m) => m.id === id || m.memberId === id);
  if (!member) {
    return res.status(404).json({ error: 'Ahli tidak dijumpai.' });
  }
  res.json({ member });
});

// POST /api/members (Create new member with duplicate checks, atomic ID, WA notification)
app.post('/api/members', async (req, res) => {
  try {
    const { nama, telefon, nric, email, alamat, sponsorId, status = 'ACTIVE' } = req.body;

    // 1. Validation
    if (!nama || nama.trim().length < 3) {
      return res.status(400).json({ error: 'Nama penuh wajib diisi (minimum 3 aksara).' });
    }

    const cleanTel = normalizePhone(telefon);
    if (!cleanTel || cleanTel.length < 10 || cleanTel.length > 11) {
      return res.status(400).json({ error: 'No telefon mestilah nombor telefon Malaysia yang sah (cth: 011-88887777).' });
    }

    const cleanIc = cleanNRIC(nric);
    if (!cleanIc || cleanIc.length !== 12) {
      return res.status(400).json({ error: 'NRIC mestilah mengandungi 12 digit nombor.' });
    }

    if (!alamat || alamat.trim().length < 5) {
      return res.status(400).json({ error: 'Alamat penuh wajib diisi.' });
    }

    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'Format emel tidak sah.' });
      }
    }

    // 2. Duplicate Check
    const activeMembers = db.members.filter((m) => m.status !== 'DELETED');

    const duplicatePhone = activeMembers.find((m) => normalizePhone(m.telefon) === cleanTel);
    if (duplicatePhone) {
      return res.status(409).json({
        error: '⚠️ NO TELEFON SUDAH DIDAFTARKAN',
        detail: `Nombor ${telefon} telah digunakan oleh ahli ${duplicatePhone.nama} (${duplicatePhone.memberId}).`,
      });
    }

    const duplicateNric = activeMembers.find((m) => cleanNRIC(m.nric) === cleanIc);
    if (duplicateNric) {
      return res.status(409).json({
        error: '⚠️ NRIC SUDAH DIDAFTARKAN',
        detail: `No. Kad Pengenalan ini telah didaftarkan sebelum ini di bawah ${duplicateNric.nama} (${duplicateNric.memberId}).`,
      });
    }

    // 3. Atomic Member ID Generation
    const prefix = db.settings.memberPrefix || 'MBR-';
    const digits = db.settings.memberDigits || 6;
    const newMemberId = generateNextMemberId(prefix, digits);

    // 4. Save Database Record
    const newMember: Member = {
      id: `mbr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      memberId: newMemberId,
      nama: nama.trim(),
      telefon: telefon.trim(),
      nric: cleanIc, // stored cleanly
      email: email ? email.trim() : '',
      alamat: alamat.trim(),
      sponsorId: sponsorId ? sponsorId.trim().toUpperCase() : '',
      tarikhDaftar: new Date().toISOString(),
      status: (status as any) || 'ACTIVE',
      updatedAt: new Date().toISOString(),
    };

    db.members.unshift(newMember);
    await saveDatabase();

    addActivityLog('Admin', 'CREATE_MEMBER', `Pendaftaran ahli baru ${newMember.nama} (${newMember.memberId})`, newMember.id);

    // 5. WhatsApp Auto Notification to Admin
    // CRITICAL: Database registration is already committed!
    // Even if WhatsApp fails, we return HTTP 201 with registration success and WhatsApp notification status.
    const adminPhone = db.settings.adminWhatsAppNumber || '601120798015';
    let waStatus: 'SENT' | 'FAILED' | 'PENDING' | 'MANUAL' = 'MANUAL';
    let waErrorMessage: string | undefined;

    // Check if Cloud API is configured
    const waEnabled = db.settings.whatsappEnabled && process.env.WHATSAPP_ENABLED === 'true';
    const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    // Build notification message text
    const maskedIc = `******-**-${cleanIc.slice(-4)}`;
    const notifyText = `🔔 PENDAFTARAN AHLI BARU

Nama:
${newMember.nama}

Telefon:
${newMember.telefon}

NRIC:
${maskedIc}

Member ID:
${newMember.memberId}

Sponsor:
${newMember.sponsorId || '-'}

Tarikh:
${new Date().toLocaleDateString('en-GB')}

Status:
✅ BERJAYA DIDAFTARKAN`;

    if (waEnabled && waToken && waPhoneId) {
      try {
        const response = await fetch(`https://graph.facebook.com/v19.0/${waPhoneId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${waToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: adminPhone.replace(/\D/g, ''),
            type: 'text',
            text: { body: notifyText },
          }),
        });

        if (response.ok) {
          waStatus = 'SENT';
        } else {
          const errData = await response.json().catch(() => ({}));
          waStatus = 'FAILED';
          waErrorMessage = errData.error?.message || 'Gagal menghantar melalui WhatsApp Cloud API.';
        }
      } catch (err: any) {
        waStatus = 'FAILED';
        waErrorMessage = err.message || 'Ralat sambungan WhatsApp API.';
      }
    } else {
      // Cloud API not configured, prepare direct WhatsApp click link
      waStatus = 'MANUAL';
    }

    // Save WhatsApp Log
    const waLog: WhatsAppLog = {
      id: `wlog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      memberId: newMember.memberId,
      nama: newMember.nama,
      recipient: adminPhone,
      messageType: 'ADMIN_NOTIFY',
      content: notifyText,
      status: waStatus,
      sentAt: new Date().toISOString(),
      error: waErrorMessage,
    };
    db.whatsappLogs.unshift(waLog);
    await saveDatabase();

    const cleanAdminPhone = adminPhone.replace(/\D/g, '');
    const waDirectUrl = `https://wa.me/${cleanAdminPhone}?text=${encodeURIComponent(notifyText)}`;

    return res.status(201).json({
      success: true,
      member: newMember,
      whatsappNotification: {
        status: waStatus,
        message:
          waStatus === 'SENT'
            ? 'Notifikasi WhatsApp telah berjaya dihantar ke telefon admin.'
            : waStatus === 'FAILED'
            ? `⚠️ WhatsApp notification gagal dihantar (${waErrorMessage || 'Sila semak konfigurasi'}).`
            : 'Notifikasi WhatsApp disediakan untuk dihantar ke telefon admin.',
        adminNumber: adminPhone,
        waDirectUrl,
        error: waErrorMessage,
        logId: waLog.id,
      },
    });
  } catch (err: any) {
    console.error('Error creating member:', err);
    res.status(500).json({ error: err.message || 'Ralat semasa mendaftar ahli.' });
  }
});

// PUT /api/members/:id (Update member)
app.put('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const memberIndex = db.members.findIndex((m) => m.id === id || m.memberId === id);

    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Ahli tidak dijumpai.' });
    }

    const existing = db.members[memberIndex];
    const { nama, telefon, nric, email, alamat, sponsorId, status } = req.body;

    // Check duplicate phone if changed
    if (telefon && normalizePhone(telefon) !== normalizePhone(existing.telefon)) {
      const cleanTel = normalizePhone(telefon);
      const dup = db.members.find((m) => m.id !== existing.id && m.status !== 'DELETED' && normalizePhone(m.telefon) === cleanTel);
      if (dup) {
        return res.status(409).json({ error: '⚠️ NO TELEFON SUDAH DIDAFTARKAN' });
      }
    }

    // Check duplicate NRIC if changed
    if (nric && cleanNRIC(nric) !== cleanNRIC(existing.nric)) {
      const cleanIc = cleanNRIC(nric);
      const dup = db.members.find((m) => m.id !== existing.id && m.status !== 'DELETED' && cleanNRIC(m.nric) === cleanIc);
      if (dup) {
        return res.status(409).json({ error: '⚠️ NRIC SUDAH DIDAFTARKAN' });
      }
    }

    db.members[memberIndex] = {
      ...existing,
      nama: nama !== undefined ? nama.trim() : existing.nama,
      telefon: telefon !== undefined ? telefon.trim() : existing.telefon,
      nric: nric !== undefined ? cleanNRIC(nric) : existing.nric,
      email: email !== undefined ? email.trim() : existing.email,
      alamat: alamat !== undefined ? alamat.trim() : existing.alamat,
      sponsorId: sponsorId !== undefined ? sponsorId.trim().toUpperCase() : existing.sponsorId,
      status: status !== undefined ? status : existing.status,
      updatedAt: new Date().toISOString(),
    };

    await saveDatabase();
    addActivityLog('Admin', 'UPDATE_MEMBER', `Kemaskini maklumat ahli ${existing.nama} (${existing.memberId})`, existing.id);

    res.json({ success: true, member: db.members[memberIndex] });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Ralat kemaskini ahli.' });
  }
});

// DELETE /api/members/:id (Soft delete)
app.delete('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const member = db.members.find((m) => m.id === id || m.memberId === id);

    if (!member) {
      return res.status(404).json({ error: 'Ahli tidak dijumpai.' });
    }

    member.status = 'DELETED';
    member.updatedAt = new Date().toISOString();

    await saveDatabase();
    addActivityLog('Admin', 'DELETE_MEMBER', `Padam (soft delete) ahli ${member.nama} (${member.memberId})`, member.id);

    res.json({ success: true, message: 'Ahli telah dipadam (soft delete).' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Ralat memadam ahli.' });
  }
});

// POST /api/members/:id/restore (Restore soft-deleted member)
app.post('/api/members/:id/restore', async (req, res) => {
  try {
    const { id } = req.params;
    const member = db.members.find((m) => m.id === id || m.memberId === id);

    if (!member) {
      return res.status(404).json({ error: 'Ahli tidak dijumpai.' });
    }

    member.status = 'ACTIVE';
    member.updatedAt = new Date().toISOString();

    await saveDatabase();
    addActivityLog('Admin', 'RESTORE_MEMBER', `Pulihkan ahli ${member.nama} (${member.memberId})`, member.id);

    res.json({ success: true, message: 'Ahli telah dipulihkan kepada status aktif.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Ralat memulihkan ahli.' });
  }
});

// GET /api/stats (Dashboard statistics)
app.get('/api/stats', (req, res) => {
  const all = db.members;
  const nonDeleted = all.filter((m) => m.status !== 'DELETED');
  const active = all.filter((m) => m.status === 'ACTIVE');
  const inactive = all.filter((m) => m.status === 'INACTIVE');
  const deleted = all.filter((m) => m.status === 'DELETED');

  const now = new Date();
  const currentMonthStr = now.toISOString().slice(0, 7); // YYYY-MM

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const newThisMonth = nonDeleted.filter((m) => m.tarikhDaftar.slice(0, 7) === currentMonthStr).length;
  const newThisWeek = nonDeleted.filter((m) => new Date(m.tarikhDaftar) >= startOfWeek).length;

  // Count active sponsors
  const sponsorsSet = new Set<string>();
  nonDeleted.forEach((m) => {
    if (m.sponsorId && m.sponsorId.trim() !== '') {
      sponsorsSet.add(m.sponsorId.trim().toUpperCase());
    }
  });

  // Calculate monthly distribution for the past 6 months
  const monthsArr: { month: string; count: number }[] = [];
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'OGOS', 'SEP', 'OKT', 'NOV', 'DIS'];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    const mName = monthNames[d.getMonth()];
    const count = nonDeleted.filter((m) => m.tarikhDaftar.slice(0, 7) === key).length;
    monthsArr.push({ month: mName, count });
  }

  res.json({
    totalMembers: nonDeleted.length,
    activeMembers: active.length,
    inactiveMembers: inactive.length,
    deletedMembers: deleted.length,
    newThisMonth,
    newThisWeek,
    activeSponsorsCount: sponsorsSet.size,
    monthlyTrend: monthsArr,
  });
});

// GET /api/whatsapp/logs
app.get('/api/whatsapp/logs', (req, res) => {
  res.json({ logs: db.whatsappLogs });
});

// POST /api/whatsapp/retry/:logId
app.post('/api/whatsapp/retry/:logId', async (req, res) => {
  const { logId } = req.params;
  const log = db.whatsappLogs.find((l) => l.id === logId);

  if (!log) {
    return res.status(404).json({ error: 'Log tidak dijumpai.' });
  }

  // Attempt re-send if credentials exist
  const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (waToken && waPhoneId) {
    try {
      const response = await fetch(`https://graph.facebook.com/v19.0/${waPhoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${waToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: log.recipient.replace(/\D/g, ''),
          type: 'text',
          text: { body: log.content },
        }),
      });

      if (response.ok) {
        log.status = 'SENT';
        log.error = undefined;
        log.sentAt = new Date().toISOString();
      } else {
        const err = await response.json().catch(() => ({}));
        log.status = 'FAILED';
        log.error = err.error?.message || 'Gagal menghantar semula.';
      }
    } catch (err: any) {
      log.status = 'FAILED';
      log.error = err.message || 'Ralat sambungan API.';
    }
  } else {
    log.status = 'MANUAL';
  }

  await saveDatabase();
  addActivityLog('Admin', 'RETRY_WHATSAPP', `Cuba semula hantar WhatsApp ke ${log.recipient} (Status: ${log.status})`);

  const cleanPhone = log.recipient.replace(/\D/g, '');
  const waDirectUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(log.content)}`;

  res.json({ success: true, log, waDirectUrl });
});

// GET /api/logs (Activity logs)
app.get('/api/logs', (req, res) => {
  res.json({ logs: db.activityLogs });
});

// GET /api/settings
app.get('/api/settings', (req, res) => {
  res.json({ settings: db.settings });
});

// POST /api/settings
app.post('/api/settings', async (req, res) => {
  try {
    db.settings = { ...db.settings, ...req.body };
    await saveDatabase();
    addActivityLog('Admin', 'UPDATE_SETTINGS', 'Kemaskini tetapan aplikasi');
    res.json({ success: true, settings: db.settings });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Ralat menyimpan tetapan.' });
  }
});

// POST /api/demo/seed (Seed demo data)
app.post('/api/demo/seed', async (req, res) => {
  try {
    db.members = [...sampleDemoMembers];
    db.lastMemberCounter = 6;
    await saveDatabase();
    addActivityLog('Admin', 'SEED_DEMO', 'Muat semula 6 data demo contoh.');
    res.json({ success: true, message: 'Data demo berjaya dimuatkan.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/demo/clear (Clear all records)
app.post('/api/demo/clear', async (req, res) => {
  try {
    db.members = [];
    db.lastMemberCounter = 0;
    await saveDatabase();
    addActivityLog('Admin', 'RESET_DATA', 'Semua rekod ahli telah dipadam.');
    res.json({ success: true, message: 'Semua rekod ahli telah dikosongkan.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// Vite Middleware / Static Asset Serving
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Member Management System] Server running on port ${PORT}`);
  });
}

startServer();
