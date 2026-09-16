/**
 * ==============================================================================
 * SISTEM PENGURUSAN KEAHLIAN (MEMBER MANAGEMENT SYSTEM) - GOOGLE APPS SCRIPT
 * File: Code.gs
 * Penerangan: Backend pelayan Google Apps Script menggunakan Google Sheets
 *             sebagai pangkalan data. Menyokong janaan Member ID atomik (LockService),
 *             pemeriksaan duplikasi telefon & NRIC, integrasi pautan WhatsApp,
 *             penapisan carian, eksport, dan pengurusan audit.
 * ==============================================================================
 */

// Konfigurasi Nama Tab Google Sheet
var SHEETS = {
  MEMBERS: 'Members',
  WHATSAPP_LOGS: 'WhatsAppLogs',
  ACTIVITY_LOGS: 'ActivityLogs',
  SETTINGS: 'Settings'
};

// Akses Admin Lalai
var ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

/**
 * 1. Entry Point Aplikasi Web (Web App)
 */
function doGet(e) {
  // Pastikan struktur tab pangkalan data telah siap diwujudkan
  initDatabase();

  var template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle('Member Management System')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * 2. Inisialisasi Pangkalan Data Google Sheets (Auto Create Tabs & Headers)
 */
function initDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;

  // 1. Tab Members
  getOrCreateSheet(ss, SHEETS.MEMBERS, [
    'id', 'memberId', 'nama', 'telefon', 'nric',
    'email', 'alamat', 'sponsorId', 'tarikhDaftar',
    'status', 'updatedAt'
  ]);

  // 2. Tab WhatsAppLogs
  getOrCreateSheet(ss, SHEETS.WHATSAPP_LOGS, [
    'id', 'memberId', 'nama', 'recipient', 'messageType',
    'content', 'status', 'sentAt', 'error'
  ]);

  // 3. Tab ActivityLogs
  getOrCreateSheet(ss, SHEETS.ACTIVITY_LOGS, [
    'id', 'action', 'details', 'user', 'timestamp', 'memberId'
  ]);

  // 4. Tab Settings
  var settingsSheet = getOrCreateSheet(ss, SHEETS.SETTINGS, ['key', 'value']);
  if (settingsSheet && settingsSheet.getLastRow() <= 1) {
    var defaultSettings = [
      ['appName', 'Member Management System'],
      ['memberPrefix', 'MBR-'],
      ['memberDigits', '6'],
      ['timezone', 'Asia/Kuala_Lumpur'],
      ['whatsappEnabled', 'false'],
      ['adminWhatsAppNumber', '601120798015'],
      ['welcomeTemplate', 'Assalamualaikum {{Nama}}.\n\nTerima kasih kerana telah mendaftar sebagai ahli.\n\nMember ID anda:\n{{MemberID}}\n\nTerima kasih.'],
      ['adminNotifyTemplate', '🔔 PENDAFTARAN AHLI BARU\n\nNama: {{Nama}}\nTelefon: {{Telefon}}\nNRIC: {{NRIC}}\nMember ID: {{MemberID}}\nSponsor: {{Sponsor}}\nTarikh: {{Tarikh}}']
    ];

    try {
      defaultSettings.forEach(function(row) {
        settingsSheet.appendRow(row);
      });
    } catch (e) {}
  }
}

/**
 * Mencari tab sheet secara toleran (case-insensitive & abaikan ruang kosong)
 */
function getSheet(sheetName, ss) {
  if (!ss) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  if (!ss) return null;

  // 1. Semakan nama tepat
  var sheet = ss.getSheetByName(sheetName);
  if (sheet) return sheet;

  // 2. Semakan bertoleransi (huruf kecil, tiada ruang)
  var sheets = ss.getSheets();
  var normalizedTarget = String(sheetName).toLowerCase().replace(/[\s_-]+/g, '');
  for (var i = 0; i < sheets.length; i++) {
    var s = sheets[i];
    var normName = s.getName().toLowerCase().replace(/[\s_-]+/g, '');
    if (normName === normalizedTarget) {
      return s;
    }
  }

  return null;
}

/**
 * Dapatkan atau bina sheet secara selamat tanpa ralat duplicate name
 */
function getOrCreateSheet(ss, targetName, headers) {
  var sheet = getSheet(targetName, ss);

  if (!sheet) {
    try {
      sheet = ss.insertSheet(targetName);
    } catch (err) {
      // Jika telah wujud di peringkat Google Sheet (cth isu case atau ruang), cari semula
      sheet = getSheet(targetName, ss);
      if (!sheet) {
        var all = ss.getSheets();
        for (var k = 0; k < all.length; k++) {
          if (all[k].getName().toLowerCase().trim() === String(targetName).toLowerCase().trim()) {
            sheet = all[k];
            break;
          }
        }
      }
    }
  }

  if (sheet && headers && sheet.getLastRow() === 0) {
    try {
      sheet.appendRow(headers);
      formatHeaderRow(sheet);
    } catch (e) {}
  }

  return sheet;
}

function formatHeaderRow(sheet) {
  try {
    var lastCol = sheet.getLastColumn();
    if (lastCol > 0) {
      var range = sheet.getRange(1, 1, 1, lastCol);
      range.setFontWeight('bold');
      range.setBackground('#10B981');
      range.setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }
  } catch (e) {}
}

/**
 * 3. Log Masuk Pentadbir (Authentication)
 */
function loginAdmin(username, password) {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    logActivity('LOGIN', 'Pentadbir berjaya log masuk ke dalam portal', 'admin', null);
    return {
      success: true,
      user: {
        id: 'usr_admin',
        username: 'admin',
        nama: 'Super Administrator',
        role: 'SUPER_ADMIN'
      }
    };
  }
  throw new Error('Kata laluan atau nama pengguna tidak tepat. (Lalai: admin / admin123)');
}

/**
 * 4. Pendaftaran Ahli Baru (Atomic ID & Duplicate Check)
 */
function createMember(formData) {
  // Guna Script Lock untuk elak race condition semasa janaan ID beratur
  var lock = LockService.getScriptLock();
  try {
    // Tunggu sehingga 30 saat untuk lock
    lock.waitLock(30000);
  } catch (e) {
    throw new Error('Pelayan sedang sibuk memproses pendaftaran lain. Sila cuba sebentar lagi.');
  }

  try {
    initDatabase();
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getSheet(SHEETS.MEMBERS, ss);
    var settings = getSettingsObject();

    var nama = (formData.nama || '').trim();
    var rawTelefon = (formData.telefon || '').trim();
    var rawNric = (formData.nric || '').trim();
    var email = (formData.email || '').trim();
    var alamat = (formData.alamat || '').trim();
    var sponsorId = (formData.sponsorId || '').trim().toUpperCase();

    // Validasi Asas
    if (!nama || nama.length < 3) {
      throw new Error('Nama penuh wajib diisi (minimum 3 karakter).');
    }
    if (!rawTelefon) {
      throw new Error('Nombor telefon wajib diisi.');
    }
    if (!rawNric) {
      throw new Error('No. Kad Pengenalan (NRIC) wajib diisi.');
    }
    if (!alamat || alamat.length < 5) {
      throw new Error('Alamat penuh kediaman wajib diisi.');
    }

    var cleanPhone = cleanPhoneDigits(rawTelefon);
    var cleanNric = cleanNricDigits(rawNric);

    // Semak format NRIC 12 digit
    if (cleanNric.length !== 12 || !/^\d{12}$/.test(cleanNric)) {
      throw new Error('NRIC mestilah 12 digit nombor.');
    }

    // Baca rekod sedia ada untuk semak duplikasi
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var maxNumber = 0;
    var prefix = settings.memberPrefix || 'MBR-';
    var digits = parseInt(settings.memberDigits, 10) || 6;

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rowMemberId = String(row[1] || '');
      var rowNama = String(row[2] || '');
      var rowTelefon = String(row[3] || '');
      var rowNric = String(row[4] || '');
      var rowStatus = String(row[9] || '');

      // Abaikan ahli yang telah dipadam secara kekal
      if (rowStatus !== 'DELETED') {
        // Semak duplikasi nombor telefon
        if (cleanPhoneDigits(rowTelefon) === cleanPhone) {
          throw new Error('⚠️ NO TELEFON SUDAH DIDAFTARKAN: Nombor ' + rawTelefon + ' telah digunakan oleh ahli ' + rowNama + ' (' + rowMemberId + ').');
        }

        // Semak duplikasi NRIC
        if (cleanNricDigits(rowNric) === cleanNric) {
          throw new Error('⚠️ NRIC SUDAH DIDAFTARKAN: No. Kad Pengenalan ini telah didaftarkan sebelum ini di bawah ahli ' + rowNama + ' (' + rowMemberId + ').');
        }
      }

      // Cari nombor turutan tertinggi bagi prefix
      if (rowMemberId.indexOf(prefix) === 0) {
        var numPart = parseInt(rowMemberId.substring(prefix.length), 10);
        if (!isNaN(numPart) && numPart > maxNumber) {
          maxNumber = numPart;
        }
      }
    }

    // Jana Member ID seterusnya
    var nextNumber = maxNumber + 1;
    var padded = String(nextNumber);
    while (padded.length < digits) {
      padded = '0' + padded;
    }
    var newMemberId = prefix + padded;
    var newUuid = 'mbr_' + new Date().getTime() + '_' + Math.random().toString(36).substring(2, 7);
    var nowIso = new Date().toISOString();

    // Simpan ke Google Sheet
    sheet.appendRow([
      newUuid,
      newMemberId,
      nama,
      rawTelefon,
      cleanNric,
      email,
      alamat,
      sponsorId,
      nowIso,
      'ACTIVE',
      nowIso
    ]);

    var newMember = {
      id: newUuid,
      memberId: newMemberId,
      nama: nama,
      telefon: rawTelefon,
      nric: cleanNric,
      email: email,
      alamat: alamat,
      sponsorId: sponsorId,
      tarikhDaftar: nowIso,
      status: 'ACTIVE',
      updatedAt: nowIso
    };

    // Bina mesej WhatsApp
    var adminPhone = settings.adminWhatsAppNumber || '601120798015';
    var formattedDate = Utilities.formatDate(new Date(), 'Asia/Kuala_Lumpur', 'dd/MM/yyyy');
    var maskedNric = '******-**-' + cleanNric.slice(-4);

    var adminMsg = '🔔 PENDAFTARAN AHLI BARU\n\n' +
      'Nama: ' + nama + '\n' +
      'Telefon: ' + rawTelefon + '\n' +
      'NRIC: ' + maskedNric + '\n' +
      'Member ID: ' + newMemberId + '\n' +
      'Sponsor: ' + (sponsorId || '-') + '\n' +
      'Tarikh: ' + formattedDate + '\n' +
      'Status: ✅ BERJAYA DIDAFTARKAN';

    var waDirectUrl = 'https://wa.me/' + cleanPhoneDigits(adminPhone) + '?text=' + encodeURIComponent(adminMsg);

    // Rekod log WhatsApp & Activity Log
    var logId = logWhatsAppMessage(newMemberId, nama, adminPhone, 'ADMIN_NOTIFICATION', adminMsg, 'MANUAL');
    logActivity('CREATE_MEMBER', 'Mendaftar ahli baru: ' + nama + ' (' + newMemberId + ')', 'admin', newMemberId);

    return {
      success: true,
      member: newMember,
      whatsappNotification: {
        status: 'MANUAL',
        message: 'Notifikasi pendaftaran sedia dihantar ke WhatsApp admin.',
        adminNumber: adminPhone,
        waDirectUrl: waDirectUrl,
        logId: logId
      }
    };
  } finally {
    // Sentiasa lepaskan lock
    lock.releaseLock();
  }
}

/**
 * 5. Dapatkan Senarai Ahli dengan Penapisan & Carian
 */
function getMembers(params) {
  initDatabase();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheet(SHEETS.MEMBERS, ss);
  var data = sheet.getDataRange().getValues();

  params = params || {};
  var search = (params.search || '').toLowerCase().trim();
  var statusFilter = params.status || 'ALL';
  var sponsorFilter = (params.sponsorId || '').toUpperCase().trim();
  var datePreset = params.datePreset || 'ALL';
  var sortBy = params.sortBy || 'tarikhDaftar';
  var sortOrder = params.sortOrder || 'desc';
  var page = parseInt(params.page, 10) || 1;
  var limit = parseInt(params.limit, 10) || 25;

  var allMembers = [];

  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    if (!r[0]) continue;

    var m = {
      id: String(r[0]),
      memberId: String(r[1] || ''),
      nama: String(r[2] || ''),
      telefon: String(r[3] || ''),
      nric: String(r[4] || ''),
      email: String(r[5] || ''),
      alamat: String(r[6] || ''),
      sponsorId: String(r[7] || ''),
      tarikhDaftar: String(r[8] || ''),
      status: String(r[9] || 'ACTIVE'),
      updatedAt: String(r[10] || '')
    };

    // Filter status
    if (statusFilter !== 'ALL' && m.status !== statusFilter) {
      continue;
    }
    // Jika 'ALL' tapi bukan carian spesifik, abaikan DELETED
    if (statusFilter === 'ALL' && m.status === 'DELETED') {
      continue;
    }

    // Filter sponsor
    if (sponsorFilter && sponsorFilter !== 'ALL') {
      if (m.sponsorId.toUpperCase() !== sponsorFilter) {
        continue;
      }
    }

    // Filter tarikh
    if (datePreset !== 'ALL' && !matchesDatePreset(m.tarikhDaftar, datePreset, params.startDate, params.endDate)) {
      continue;
    }

    // Filter carian
    if (search) {
      var matchNama = m.nama.toLowerCase().indexOf(search) !== -1;
      var matchId = m.memberId.toLowerCase().indexOf(search) !== -1;
      var matchPhone = m.telefon.toLowerCase().indexOf(search) !== -1;
      var matchNric = m.nric.toLowerCase().indexOf(search) !== -1;
      var matchSponsor = m.sponsorId.toLowerCase().indexOf(search) !== -1;

      if (!matchNama && !matchId && !matchPhone && !matchNric && !matchSponsor) {
        continue;
      }
    }

    allMembers.push(m);
  }

  // Susunan (Sort)
  allMembers.sort(function(a, b) {
    var valA = a[sortBy] || '';
    var valB = b[sortBy] || '';
    if (sortBy === 'tarikhDaftar') {
      var dateA = new Date(valA).getTime() || 0;
      var dateB = new Date(valB).getTime() || 0;
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
    return sortOrder === 'asc'
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  var total = allMembers.length;
  var totalPages = Math.ceil(total / limit) || 1;
  var startIndex = (page - 1) * limit;
  var pagedMembers = allMembers.slice(startIndex, startIndex + limit);

  return {
    members: pagedMembers,
    pagination: {
      total: total,
      page: page,
      limit: limit,
      totalPages: totalPages
    }
  };
}

/**
 * 6. Dapatkan Semua Rekod Terpilih Untuk Eksport (Excel / CSV / Cetak)
 */
function getAllFilteredMembersForExport(params) {
  var copy = Object.assign({}, params);
  copy.page = 1;
  copy.limit = 10000; // Ambil semua rekod yang memenuhi penapis
  var result = getMembers(copy);
  logActivity('EXPORT_REPORT', 'Mengeksport ' + result.members.length + ' rekod laporan keahlian', 'admin', null);
  return { members: result.members };
}

/**
 * 7. Kemas Kini Ahli (Update Member)
 */
function updateMember(id, updatedData) {
  initDatabase();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheet(SHEETS.MEMBERS, ss);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      var row = i + 1;
      var nowIso = new Date().toISOString();

      if (updatedData.nama !== undefined) sheet.getRange(row, 3).setValue(updatedData.nama);
      if (updatedData.telefon !== undefined) sheet.getRange(row, 4).setValue(updatedData.telefon);
      if (updatedData.nric !== undefined) sheet.getRange(row, 5).setValue(cleanNricDigits(updatedData.nric));
      if (updatedData.email !== undefined) sheet.getRange(row, 6).setValue(updatedData.email);
      if (updatedData.alamat !== undefined) sheet.getRange(row, 7).setValue(updatedData.alamat);
      if (updatedData.sponsorId !== undefined) sheet.getRange(row, 8).setValue((updatedData.sponsorId || '').toUpperCase());
      if (updatedData.status !== undefined) sheet.getRange(row, 10).setValue(updatedData.status);
      sheet.getRange(row, 11).setValue(nowIso);

      logActivity('UPDATE_MEMBER', 'Mengemaskini data ahli: ' + data[i][1], 'admin', String(data[i][1]));

      return {
        success: true,
        member: {
          id: id,
          memberId: String(data[i][1]),
          nama: updatedData.nama !== undefined ? updatedData.nama : data[i][2],
          telefon: updatedData.telefon !== undefined ? updatedData.telefon : data[i][3],
          nric: updatedData.nric !== undefined ? cleanNricDigits(updatedData.nric) : data[i][4],
          email: updatedData.email !== undefined ? updatedData.email : data[i][5],
          alamat: updatedData.alamat !== undefined ? updatedData.alamat : data[i][6],
          sponsorId: updatedData.sponsorId !== undefined ? (updatedData.sponsorId || '').toUpperCase() : data[i][7],
          tarikhDaftar: String(data[i][8]),
          status: updatedData.status !== undefined ? updatedData.status : data[i][9],
          updatedAt: nowIso
        }
      };
    }
  }

  throw new Error('Ahli tidak ditemui.');
}

/**
 * 8. Soft Delete Ahli
 */
function deleteMember(id) {
  var res = updateMember(id, { status: 'DELETED' });
  logActivity('DELETE_MEMBER', 'Memadam ahli (Soft Delete): ' + res.member.memberId, 'admin', res.member.memberId);
  return { success: true };
}

/**
 * 9. Pulihkan Ahli (Restore)
 */
function restoreMember(id) {
  var res = updateMember(id, { status: 'ACTIVE' });
  logActivity('RESTORE_MEMBER', 'Memulihkan semula status ahli: ' + res.member.memberId, 'admin', res.member.memberId);
  return { success: true };
}

/**
 * 10. Dapatkan Statistik Dashboard Pentadbir
 */
function getDashboardStats() {
  initDatabase();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheet(SHEETS.MEMBERS, ss);
  var data = sheet.getDataRange().getValues();

  var total = 0;
  var active = 0;
  var inactive = 0;
  var deleted = 0;
  var newThisMonth = 0;
  var newThisWeek = 0;
  var sponsors = {};

  var now = new Date();
  var currentYear = now.getFullYear();
  var currentMonth = now.getMonth();
  var startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Inisialisasi trend bulanan 6 bulan ke belakang
  var monthlyTrendMap = {};
  var monthNames = ['JAN', 'FEB', 'MAC', 'APR', 'MEI', 'JUN', 'JUL', 'OGOS', 'SEP', 'OKT', 'NOV', 'DIS'];

  for (var m = 5; m >= 0; m--) {
    var d = new Date(currentYear, currentMonth - m, 1);
    var key = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
    monthlyTrendMap[key] = {
      month: monthNames[d.getMonth()],
      count: 0
    };
  }

  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    if (!r[0]) continue;

    var status = String(r[9] || 'ACTIVE');
    var rawDate = r[8];
    var joinDate = new Date(rawDate);
    var sponsor = String(r[7] || '').trim().toUpperCase();

    if (status === 'DELETED') {
      deleted++;
      continue;
    }

    total++;
    if (status === 'ACTIVE') active++;
    if (status === 'INACTIVE') inactive++;
    if (sponsor) sponsors[sponsor] = true;

    if (!isNaN(joinDate.getTime())) {
      if (joinDate.getFullYear() === currentYear && joinDate.getMonth() === currentMonth) {
        newThisMonth++;
      }
      if (joinDate >= startOfWeek) {
        newThisWeek++;
      }

      var monthKey = joinDate.getFullYear() + '-' + ('0' + (joinDate.getMonth() + 1)).slice(-2);
      if (monthlyTrendMap[monthKey]) {
        monthlyTrendMap[monthKey].count++;
      }
    }
  }

  var monthlyTrend = [];
  for (var k in monthlyTrendMap) {
    monthlyTrend.push(monthlyTrendMap[k]);
  }

  return {
    totalMembers: total,
    activeMembers: active,
    inactiveMembers: inactive,
    deletedMembers: deleted,
    newThisMonth: newThisMonth,
    newThisWeek: newThisWeek,
    activeSponsorsCount: Object.keys(sponsors).length,
    monthlyTrend: monthlyTrend
  };
}

/**
 * 11. Dapatkan & Kemas Kini Tetapan Sistem
 */
function getSettings() {
  initDatabase();
  return { settings: getSettingsObject() };
}

function getSettingsObject() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheet(SHEETS.SETTINGS, ss);
  var data = sheet.getDataRange().getValues();
  var settings = {};
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) {
      settings[String(data[i][0])] = data[i][1];
    }
  }
  return settings;
}

function updateSettings(newSettings) {
  initDatabase();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheet(SHEETS.SETTINGS, ss);
  var data = sheet.getDataRange().getValues();

  for (var key in newSettings) {
    var found = false;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === key) {
        sheet.getRange(i + 1, 2).setValue(newSettings[key]);
        found = true;
        break;
      }
    }
    if (!found) {
      sheet.appendRow([key, newSettings[key]]);
    }
  }

  logActivity('UPDATE_SETTINGS', 'Mengemaskini tetapan sistem', 'admin', null);
  return { success: true, settings: getSettingsObject() };
}

/**
 * 12. Dapatkan Log WhatsApp & Cuba Semula (Retry)
 */
function getWhatsAppLogs() {
  initDatabase();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheet(SHEETS.WHATSAPP_LOGS, ss);
  var data = sheet.getDataRange().getValues();
  var logs = [];

  for (var i = data.length - 1; i >= 1; i--) {
    var r = data[i];
    if (!r[0]) continue;
    logs.push({
      id: String(r[0]),
      memberId: String(r[1] || ''),
      nama: String(r[2] || ''),
      recipient: String(r[3] || ''),
      messageType: String(r[4] || ''),
      content: String(r[5] || ''),
      status: String(r[6] || 'MANUAL'),
      sentAt: String(r[7] || ''),
      error: r[8] ? String(r[8]) : null
    });
  }

  return { logs: logs.slice(0, 100) };
}

function retryWhatsApp(logId) {
  initDatabase();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheet(SHEETS.WHATSAPP_LOGS, ss);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(logId)) {
      var row = i + 1;
      var nowIso = new Date().toISOString();
      // Tandakan sebagai SENT selepas pengguna klik hantar
      sheet.getRange(row, 7).setValue('SENT');
      sheet.getRange(row, 8).setValue(nowIso);
      sheet.getRange(row, 9).setValue('');

      return {
        success: true,
        log: {
          id: logId,
          memberId: String(data[i][1]),
          nama: String(data[i][2]),
          recipient: String(data[i][3]),
          messageType: String(data[i][4]),
          content: String(data[i][5]),
          status: 'SENT',
          sentAt: nowIso
        }
      };
    }
  }
  throw new Error('Log WhatsApp tidak ditemui.');
}

/**
 * 13. Dapatkan Log Aktiviti / Audit
 */
function getActivityLogs() {
  initDatabase();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheet(SHEETS.ACTIVITY_LOGS, ss);
  var data = sheet.getDataRange().getValues();
  var logs = [];

  for (var i = data.length - 1; i >= 1; i--) {
    var r = data[i];
    if (!r[0]) continue;
    logs.push({
      id: String(r[0]),
      action: String(r[1] || ''),
      details: String(r[2] || ''),
      user: String(r[3] || 'admin'),
      timestamp: String(r[4] || ''),
      memberId: r[5] ? String(r[5]) : undefined
    });
  }

  return { logs: logs.slice(0, 100) };
}

/**
 * 14. Muat Data Ujian Demo (Seed) & Kosongkan Data (Clear)
 */
function seedDemoData() {
  initDatabase();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getSheet(SHEETS.MEMBERS, ss);

  var demoRecords = [
    { nama: 'Ahmad bin Zulkifli', telefon: '012-3456789', nric: '880101-01-5678', alamat: 'No 12, Jalan Melati 3, 50000 Kuala Lumpur', sponsorId: 'SP-0001' },
    { nama: 'Siti Nurhaliza binti Bakar', telefon: '013-9876543', nric: '920202-02-1234', alamat: 'No 45, Lorong Dahlia, 13700 Perai, Pulau Pinang', sponsorId: 'SP-0002' },
    { nama: 'Mohd Faiz bin Ibrahim', telefon: '017-8899001', nric: '850505-08-9012', alamat: 'Lot 203, Kampung Baru, 40000 Shah Alam, Selangor', sponsorId: 'SP-0001' },
    { nama: 'Nurul Aini binti Razak', telefon: '019-3322114', nric: '960808-10-3456', alamat: 'No 7, Taman Bunga Raya, 80000 Johor Bahru, Johor', sponsorId: 'SP-0003' },
    { nama: 'Muhammad Hafiz bin Omar', telefon: '011-2345678', nric: '910303-03-7890', alamat: 'Blok B-12-04, Residensi Impian, 68000 Ampang, Selangor', sponsorId: 'SP-0001' },
    { nama: 'Norazlina binti Ismail', telefon: '018-7766554', nric: '891111-14-2345', alamat: 'No 88, Jalan Nilam 2, 75450 Ayer Keroh, Melaka', sponsorId: 'SP-0002' }
  ];

  for (var i = 0; i < demoRecords.length; i++) {
    try {
      createMember(demoRecords[i]);
    } catch (e) {
      // Abaikan jika sudah wujud
    }
  }

  logActivity('SEED_DEMO', 'Memuatkan rekod data demo ke dalam sistem', 'admin', null);
  return { success: true };
}

function clearAllData() {
  initDatabase();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var mSheet = getSheet(SHEETS.MEMBERS, ss);
  var wSheet = getSheet(SHEETS.WHATSAPP_LOGS, ss);
  var aSheet = getSheet(SHEETS.ACTIVITY_LOGS, ss);

  if (mSheet && mSheet.getLastRow() > 1) {
    mSheet.deleteRows(2, mSheet.getLastRow() - 1);
  }
  if (wSheet && wSheet.getLastRow() > 1) {
    wSheet.deleteRows(2, wSheet.getLastRow() - 1);
  }
  if (aSheet && aSheet.getLastRow() > 1) {
    aSheet.deleteRows(2, aSheet.getLastRow() - 1);
  }

  logActivity('CLEAR_DATA', 'Mengosongkan semua data sistem', 'admin', null);
  return { success: true };
}

/**
 * 15. Fungsi Pembantu (Helpers)
 */
function cleanPhoneDigits(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function cleanNricDigits(nric) {
  return String(nric || '').replace(/\D/g, '');
}

function logActivity(action, details, user, memberId) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getSheet(SHEETS.ACTIVITY_LOGS, ss);
    if (!sheet) return;

    var logUuid = 'act_' + new Date().getTime() + '_' + Math.random().toString(36).substring(2, 6);
    sheet.appendRow([
      logUuid,
      action,
      details,
      user || 'admin',
      new Date().toISOString(),
      memberId || ''
    ]);
  } catch (e) {
    console.error('Gagal merekod log aktiviti:', e);
  }
}

function logWhatsAppMessage(memberId, nama, recipient, messageType, content, status) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getSheet(SHEETS.WHATSAPP_LOGS, ss);
    if (!sheet) return null;

    var logUuid = 'wlog_' + new Date().getTime() + '_' + Math.random().toString(36).substring(2, 6);
    sheet.appendRow([
      logUuid,
      memberId,
      nama,
      recipient,
      messageType,
      content,
      status || 'MANUAL',
      new Date().toISOString(),
      ''
    ]);
    return logUuid;
  } catch (e) {
    console.error('Gagal merekod log WhatsApp:', e);
    return null;
  }
}

function matchesDatePreset(dateStr, preset, startDate, endDate) {
  var d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;

  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (preset === 'TODAY') {
    return d >= today;
  }
  if (preset === 'WEEK') {
    var startWeek = new Date(today);
    startWeek.setDate(today.getDate() - today.getDay());
    return d >= startWeek;
  }
  if (preset === 'MONTH') {
    var startMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return d >= startMonth;
  }
  if (preset === 'YEAR') {
    var startYear = new Date(today.getFullYear(), 0, 1);
    return d >= startYear;
  }
  if (preset === 'CUSTOM' && startDate && endDate) {
    var s = new Date(startDate);
    var e = new Date(endDate);
    e.setHours(23, 59, 59, 999);
    return d >= s && d <= e;
  }
  return true;
}
