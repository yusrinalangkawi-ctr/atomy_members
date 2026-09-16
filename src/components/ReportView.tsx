import React, { useState } from 'react';
import {
  FileBarChart,
  FileSpreadsheet,
  FileText,
  Printer,
  Filter,
  CheckCircle2,
  Users,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Member, MemberFilterParams } from '../types';
import { exportToExcel, exportToCSV, printReport } from '../utils/export';
import { formatDate, maskNRIC } from '../utils/formatters';

interface ReportViewProps {
  members: Member[];
  allFilteredMembers: Member[];
  filters: MemberFilterParams;
  onFilterChange: (filters: MemberFilterParams) => void;
  onOpenFilterDrawer: () => void;
  availableSponsors: string[];
}

export const ReportView: React.FC<ReportViewProps> = ({
  allFilteredMembers,
  filters,
  onFilterChange,
  onOpenFilterDrawer,
  availableSponsors,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  // Compute live statistics on the filtered dataset
  const totalRecords = allFilteredMembers.length;
  const activeCount = allFilteredMembers.filter((m) => m.status === 'ACTIVE').length;
  const inactiveCount = allFilteredMembers.filter((m) => m.status === 'INACTIVE').length;
  const deletedCount = allFilteredMembers.filter((m) => m.status === 'DELETED').length;

  // New this month count in filtered dataset
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const newThisMonthCount = allFilteredMembers.filter(
    (m) => m.tarikhDaftar.slice(0, 7) === currentMonthKey
  ).length;

  // Unique sponsors in filtered dataset
  const sponsorsSet = new Set(
    allFilteredMembers
      .filter((m) => m.sponsorId && m.sponsorId.trim() !== '')
      .map((m) => m.sponsorId!.trim().toUpperCase())
  );

  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      exportToExcel({
        members: allFilteredMembers,
        filters,
        reportTitle: 'Laporan Analisis Keahlian (Member Report)',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      exportToCSV({
        members: allFilteredMembers,
        filters,
        reportTitle: 'Laporan Analisis Keahlian (Member Report)',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    printReport({
      members: allFilteredMembers,
      filters,
      reportTitle: 'LAPORAN KEAHLIAN RASMI',
    });
  };

  return (
    <div id="report-view-page" className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            MODUL LAPORAN
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
            Member Report
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Jana analisis data keahlian dan muat turun laporan rasmi.
          </p>
        </div>

        {/* Filter Trigger Button */}
        <button
          id="btn-report-open-filter"
          type="button"
          onClick={onOpenFilterDrawer}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 shadow-xs transition-colors min-h-[44px]"
        >
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Tetapan Filter Laporan</span>
        </button>
      </div>

      {/* Active Filter Summary Box (Section 17 & 31) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Parameter Filter Semasa
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Status</span>
            <strong className="text-slate-800 text-sm font-bold">
              {filters.status || 'SEMUA (ACTIVE & INACTIVE)'}
            </strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Sponsor</span>
            <strong className="text-slate-800 text-sm font-bold">
              {filters.sponsorId || 'SEMUA SPONSOR'}
            </strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Julat Tarikh</span>
            <strong className="text-slate-800 text-sm font-bold">
              {filters.startDate && filters.endDate
                ? `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`
                : filters.datePreset || 'SEMUA MASA'}
            </strong>
          </div>
        </div>
      </div>

      {/* Filtered Result Metrics (Sections 17 & 23) */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          HASIL RINGKASAN (RESULT)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Jumlah Ahli</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {totalRecords.toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-emerald-700 font-medium">Ahli Aktif</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
              {activeCount.toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Ahli Inactive</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-600 mt-1">
              {inactiveCount.toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-amber-700 font-medium">Baru Bulan Ini</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-800 mt-1">
              {newThisMonthCount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Export Action Buttons (Sections 19, 20, 21, 22) */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Muat Turun Laporan ({totalRecords} Rekod)
        </h3>
        <p className="text-xs text-slate-300 mt-1">
          Pilih format dokumen untuk memuat turun data yang telah ditapis di atas.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <button
            id="btn-report-export-excel"
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting || totalRecords === 0}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-all min-h-[46px]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>📥 EXPORT EXCEL (.xlsx)</span>
          </button>

          <button
            id="btn-report-export-csv"
            type="button"
            onClick={handleExportCSV}
            disabled={isExporting || totalRecords === 0}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all min-h-[46px]"
          >
            <FileText className="w-4 h-4 text-sky-400" />
            <span>📄 EXPORT CSV (.csv)</span>
          </button>

          <button
            id="btn-report-print"
            type="button"
            onClick={handlePrint}
            disabled={totalRecords === 0}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl border border-slate-700 transition-all min-h-[46px]"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>🖨 PRINT / PDF</span>
          </button>
        </div>
      </div>

      {/* Report Preview List (Mobile First - Section 31) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            Pratonton Laporan (Report Preview)
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Memaparkan sehingga 10 rekod pertama
          </span>
        </div>

        <div className="divide-y divide-slate-100 mt-2">
          {totalRecords === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Tiada data ditemui mengikut kriteria penapisan.
            </div>
          ) : (
            allFilteredMembers.slice(0, 10).map((m) => (
              <div key={m.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">{m.memberId}</span>
                    <span className="font-semibold text-slate-900 truncate">{m.nama}</span>
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    {m.telefon} • NRIC: {maskNRIC(m.nric)} • Daftar: {formatDate(m.tarikhDaftar)}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    m.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {m.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
