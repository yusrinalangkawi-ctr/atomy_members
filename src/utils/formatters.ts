/**
 * Malaysian formatters and validation utilities
 * Timezone: Asia/Kuala_Lumpur
 */

// Clean NRIC string to digits only
export function cleanNRIC(nric: string): string {
  return nric.replace(/\D/g, '');
}

// Format 12-digit NRIC as YYMMDD-PB-###G (e.g. 900101-02-1234)
export function formatNRIC(nric: string): string {
  const digits = cleanNRIC(nric);
  if (digits.length !== 12) return nric;
  return `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 12)}`;
}

// Mask NRIC for privacy (e.g. ****** - ** - 1234)
export function maskNRIC(nric: string): string {
  const digits = cleanNRIC(nric);
  if (digits.length >= 4) {
    const last4 = digits.slice(-4);
    return `******-**-${last4}`;
  }
  return '******-**-****';
}

// Validate Malaysian NRIC (12 digits, valid birth date check optional)
export function validateNRIC(nric: string): { isValid: boolean; message?: string } {
  const digits = cleanNRIC(nric);
  if (!digits) {
    return { isValid: false, message: 'NRIC wajib diisi.' };
  }
  if (digits.length !== 12) {
    return { isValid: false, message: 'NRIC mestilah mengandungi 12 digit nombor.' };
  }

  // Basic sanity check for birth year / month / day
  const month = parseInt(digits.slice(2, 4), 10);
  const day = parseInt(digits.slice(4, 6), 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { isValid: false, message: 'Format tarikh lahir dalam NRIC tidak sah.' };
  }

  return { isValid: true };
}

// Clean phone number: digits only
export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

// Convert Malaysian phone to WhatsApp wa.me format (e.g. 601120798015)
export function toWhatsAppPhone(phone: string): string {
  let digits = cleanPhone(phone);
  if (digits.startsWith('0')) {
    digits = '6' + digits;
  } else if (!digits.startsWith('60') && digits.length >= 9) {
    digits = '60' + digits;
  }
  return digits;
}

// Format Malaysian phone for display (e.g. 011-8888 7777 or 012-345 6789)
export function formatPhone(phone: string): string {
  const clean = cleanPhone(phone);
  if (clean.startsWith('60')) {
    const local = '0' + clean.slice(2);
    return formatLocalPhone(local);
  }
  return formatLocalPhone(clean);
}

function formatLocalPhone(clean: string): string {
  if (clean.startsWith('011') && clean.length >= 11) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 7)} ${clean.slice(7, 11)}`;
  } else if (clean.startsWith('01') && clean.length >= 10) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)} ${clean.slice(6, 10)}`;
  }
  return clean;
}

// Validate Malaysian Phone Number
export function validatePhone(phone: string): { isValid: boolean; message?: string } {
  const clean = cleanPhone(phone);
  if (!clean) {
    return { isValid: false, message: 'No telefon wajib diisi.' };
  }
  // Must start with 01 or 601 and be 10-12 digits
  let standard = clean;
  if (standard.startsWith('60')) {
    standard = '0' + standard.slice(2);
  }
  if (!standard.startsWith('01')) {
    return { isValid: false, message: 'No telefon mestilah nombor telefon bimbit Malaysia yang sah (cth: 011-88887777).' };
  }
  if (standard.length < 10 || standard.length > 11) {
    return { isValid: false, message: 'Panjang no telefon mestilah 10 atau 11 digit.' };
  }
  return { isValid: true };
}

// Validate Email
export function validateEmail(email?: string): { isValid: boolean; message?: string } {
  if (!email || email.trim() === '') {
    return { isValid: true }; // optional
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, message: 'Format emel tidak sah.' };
  }
  return { isValid: true };
}

// Date formatting in Asia/Kuala_Lumpur
export function formatDate(dateStr: string | Date, includeTime = false): string {
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(date.getTime())) return '-';
    
    // Format DD/MM/YYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    if (includeTime) {
      const hours = String(date.getHours()).padStart(2, '0');
      const mins = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${mins}`;
    }
    return `${day}/${month}/${year}`;
  } catch {
    return '-';
  }
}

// Format date for filename (YYYY-MM-DD)
export function getFilenameDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Build prefilled WhatsApp URL for welcome message
export function buildMemberWhatsAppUrl(member: { nama: string; memberId: string; telefon: string }, template?: string): string {
  const phone = toWhatsAppPhone(member.telefon);
  const defaultTemplate = `Assalamualaikum {{Nama}}.

Terima kasih kerana telah mendaftar sebagai ahli.

Member ID anda:
{{MemberID}}

Terima kasih.`;

  const rawTemplate = template || defaultTemplate;
  const message = rawTemplate
    .replace(/\{\{Nama\}\}/g, member.nama)
    .replace(/\{\{MemberID\}\}/g, member.memberId);

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// Build prefilled WhatsApp URL for admin notification
export function buildAdminWhatsAppUrl(member: { nama: string; memberId: string; telefon: string; nric: string; sponsorId?: string; tarikhDaftar: string }, adminNumber: string): string {
  const phone = toWhatsAppPhone(adminNumber);
  const formattedDate = formatDate(member.tarikhDaftar);
  const maskedNric = maskNRIC(member.nric);
  const sponsor = member.sponsorId ? member.sponsorId : '-';

  const message = `🔔 PENDAFTARAN AHLI BARU

Nama:
${member.nama}

Telefon:
${member.telefon}

NRIC:
${maskedNric}

Member ID:
${member.memberId}

Sponsor:
${sponsor}

Tarikh:
${formattedDate}

Status:
✅ BERJAYA DIDAFTARKAN`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
