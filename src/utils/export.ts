import * as XLSX from 'xlsx';
import { Member, MemberFilterParams } from '../types';
import { formatDate, getFilenameDate, maskNRIC } from './formatters';

interface ExportOptions {
  members: Member[];
  filters?: MemberFilterParams;
  reportTitle?: string;
  maskNricInExport?: boolean;
}

/**
 * Export filtered members to Microsoft Excel (.xlsx) format
 * Includes summary block of active filters at the top if applicable
 */
export function exportToExcel({
  members,
  filters,
  reportTitle = 'Laporan Senarai Ahli',
  maskNricInExport = false,
}: ExportOptions) {
  const filename = `Member_Report_${getFilenameDate()}.xlsx`;

  // Build header summary rows
  const summaryRows: (string | number)[][] = [
    ['SISTEM PENGURUSAN KEAHLIAN (MEMBER MANAGEMENT SYSTEM)'],
    [`LAPORAN: ${reportTitle}`],
    [`TARIKH LAPORAN: ${formatDate(new Date(), true)}`],
    [
      `STATUS: ${filters?.status ? filters.status : 'ALL'}`,
      `SPONSOR: ${filters?.sponsorId ? filters.sponsorId : 'ALL'}`,
      `CARIAN: ${filters?.search ? `"${filters.search}"` : 'TIADA'}`,
    ],
    [
      `JULAT TARIKH: ${
        filters?.startDate && filters?.endDate
          ? `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`
          : filters?.datePreset || 'SEMUA'
      }`,
      `JUMLAH REKOD: ${members.length}`,
    ],
    [], // Blank row divider
  ];

  // Data headers
  const tableHeaders = [
    'No',
    'Member ID',
    'Nama Penuh',
    'No Telefon',
    'NRIC',
    'Email',
    'Alamat',
    'ID Sponsor',
    'Tarikh Daftar',
    'Status',
  ];

  // Map rows
  const dataRows = members.map((m, index) => [
    index + 1,
    m.memberId,
    m.nama,
    m.telefon,
    maskNricInExport ? maskNRIC(m.nric) : m.nric,
    m.email || '-',
    // Clean multiline address for excel cell
    m.alamat ? m.alamat.replace(/\r\n|\r|\n/g, ', ') : '-',
    m.sponsorId || '-',
    formatDate(m.tarikhDaftar),
    m.status,
  ]);

  const allRows = [...summaryRows, tableHeaders, ...dataRows];

  // Create workbook and worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(allRows);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 14 }, // Member ID
    { wch: 28 }, // Nama
    { wch: 16 }, // Telefon
    { wch: 18 }, // NRIC
    { wch: 26 }, // Email
    { wch: 40 }, // Alamat
    { wch: 14 }, // Sponsor
    { wch: 14 }, // Tarikh
    { wch: 12 }, // Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Senarai Ahli');

  // Trigger download
  XLSX.writeFile(workbook, filename);
}

/**
 * Escape string for RFC 4180 CSV
 */
function escapeCsvValue(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  // Always wrap in quotes to preserve formatting and commas
  return `"${str}"`;
}

/**
 * Export filtered members to comma-separated values (.csv)
 * UTF-8 with BOM (\uFEFF) to guarantee Excel/Numbers displays Malay characters properly
 */
export function exportToCSV({
  members,
  filters,
  reportTitle = 'Laporan Senarai Ahli',
  maskNricInExport = false,
}: ExportOptions) {
  const filename = `Member_Report_${getFilenameDate()}.csv`;

  const lines: string[] = [];

  // Summary header
  lines.push(escapeCsvValue('SISTEM PENGURUSAN KEAHLIAN'));
  lines.push(`${escapeCsvValue('LAPORAN')},${escapeCsvValue(reportTitle)}`);
  lines.push(`${escapeCsvValue('TARIKH DIJANA')},${escapeCsvValue(formatDate(new Date(), true))}`);
  lines.push(
    `${escapeCsvValue('FILTER STATUS')},${escapeCsvValue(filters?.status || 'ALL')},${escapeCsvValue('FILTER SPONSOR')},${escapeCsvValue(filters?.sponsorId || 'ALL')}`
  );
  lines.push(
    `${escapeCsvValue('JULAT TARIKH')},${escapeCsvValue(
      filters?.startDate && filters?.endDate
        ? `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`
        : filters?.datePreset || 'SEMUA'
    )},${escapeCsvValue('JUMLAH REKOD')},${escapeCsvValue(members.length)}`
  );
  lines.push(''); // Blank separator

  // Table header
  const headers = [
    'No',
    'Member ID',
    'Nama Penuh',
    'No Telefon',
    'NRIC',
    'Email',
    'Alamat',
    'ID Sponsor',
    'Tarikh Daftar',
    'Status',
  ];
  lines.push(headers.map(escapeCsvValue).join(','));

  // Member rows
  members.forEach((m, idx) => {
    const row = [
      idx + 1,
      m.memberId,
      m.nama,
      m.telefon,
      maskNricInExport ? maskNRIC(m.nric) : m.nric,
      m.email || '-',
      m.alamat ? m.alamat.replace(/\r\n|\r|\n/g, ' ') : '-',
      m.sponsorId || '-',
      formatDate(m.tarikhDaftar),
      m.status,
    ];
    lines.push(row.map(escapeCsvValue).join(','));
  });

  // UTF-8 BOM
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Print-friendly report generator
 * Opens print preview for filtered records without app navigation UI
 */
export function printReport({
  members,
  filters,
  reportTitle = 'MEMBER REPORT',
}: ExportOptions) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  const tableRows = members
    .map(
      (m, idx) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${idx + 1}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 600;">${m.memberId}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">${m.nama}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">${m.telefon}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">${maskNRIC(m.nric)}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">${m.sponsorId || '-'}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1;">${formatDate(m.tarikhDaftar)}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: ${
          m.status === 'ACTIVE' ? '#dcfce7; color: #166534' : '#fee2e2; color: #991b1b'
        };">
          ${m.status}
        </span>
      </td>
    </tr>
  `
    )
    .join('');

  const filterSummary = `
    <div style="margin-bottom: 20px; padding: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px;">
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
        <div><strong>Status:</strong> ${filters?.status || 'SEMUA'}</div>
        <div><strong>Sponsor:</strong> ${filters?.sponsorId || 'SEMUA'}</div>
        <div><strong>Carian:</strong> ${filters?.search || 'TIADA'}</div>
        <div><strong>Jumlah Rekod:</strong> ${members.length}</div>
      </div>
    </div>
  `;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${reportTitle} - ${getFilenameDate()}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 24px; color: #0f172a; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
          h1 { margin: 0 0 4px 0; font-size: 22px; text-transform: uppercase; letter-spacing: 0.5px; }
          h2 { margin: 0 0 8px 0; font-size: 16px; color: #475569; font-weight: normal; }
          .meta { font-size: 12px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
          th { background-color: #f1f5f9; padding: 8px; border: 1px solid #cbd5e1; text-align: left; }
          @media print {
            body { margin: 10mm; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MEMBER MANAGEMENT SYSTEM</h1>
          <h2>${reportTitle}</h2>
          <div class="meta">Tarikh Laporan: ${formatDate(new Date(), true)} | Dicetak oleh: Administrator</div>
        </div>
        ${filterSummary}
        <table>
          <thead>
            <tr>
              <th style="width: 30px; text-align: center;">No</th>
              <th>Member ID</th>
              <th>Nama Penuh</th>
              <th>No Telefon</th>
              <th>NRIC</th>
              <th>Sponsor</th>
              <th>Tarikh Daftar</th>
              <th style="text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="8" style="text-align: center; padding: 20px;">Tiada rekod ahli dijumpai.</td></tr>'}
          </tbody>
        </table>
        <div style="margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          Dokumen rasmi dijana secara automatik oleh Member Management System.
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
