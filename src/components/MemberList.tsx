import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileSpreadsheet,
  FileText,
  Printer,
  X,
  SlidersHorizontal,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Member, MemberFilterParams } from '../types';
import { MemberCard } from './MemberCard';
import { exportToExcel, exportToCSV, printReport } from '../utils/export';
import { formatDate, maskNRIC } from '../utils/formatters';

interface MemberListProps {
  members: Member[];
  totalMembersCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  filters: MemberFilterParams;
  onFilterChange: (newFilters: MemberFilterParams) => void;
  onOpenFilterDrawer: () => void;
  onViewMember: (member: Member) => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (member: Member) => void;
  onRestoreMember?: (member: Member) => void;
  onNavigateToRegister: () => void;
  onExportAllFiltered: () => Promise<Member[]>;
}

export const MemberList: React.FC<MemberListProps> = ({
  members,
  totalMembersCount,
  totalPages,
  currentPage,
  pageSize,
  isLoading,
  filters,
  onFilterChange,
  onOpenFilterDrawer,
  onViewMember,
  onEditMember,
  onDeleteMember,
  onRestoreMember,
  onNavigateToRegister,
  onExportAllFiltered,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Debounced or on-submit search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchInput, page: 1 });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onFilterChange({ ...filters, search: '', page: 1 });
  };

  const handleSortChange = (sortBy: 'tarikhDaftar' | 'nama' | 'memberId') => {
    const isCurrent = filters.sortBy === sortBy;
    const nextOrder = isCurrent && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    onFilterChange({ ...filters, sortBy, sortOrder: nextOrder, page: 1 });
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value, 10);
    onFilterChange({ ...filters, limit: newLimit, page: 1 });
  };

  // Trigger export for the EXACT filtered records
  const handleExport = async (format: 'excel' | 'csv' | 'print') => {
    try {
      setIsExporting(true);
      setShowExportMenu(false);
      // Fetch full filtered list from backend
      const filteredMembers = await onExportAllFiltered();

      if (format === 'excel') {
        exportToExcel({
          members: filteredMembers,
          filters,
          reportTitle: `Senarai Ahli (${filteredMembers.length} Rekod)`,
        });
      } else if (format === 'csv') {
        exportToCSV({
          members: filteredMembers,
          filters,
          reportTitle: `Senarai Ahli (${filteredMembers.length} Rekod)`,
        });
      } else if (format === 'print') {
        printReport({
          members: filteredMembers,
          filters,
          reportTitle: `Senarai Ahli (${filteredMembers.length} Rekod)`,
        });
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const hasActiveFilters =
    (filters.status && filters.status !== 'ALL') ||
    (filters.sponsorId && filters.sponsorId !== 'ALL') ||
    (filters.datePreset && filters.datePreset !== 'ALL') ||
    !!filters.search;

  return (
    <div id="member-list-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      {/* Top Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Senarai Ahli
            </h2>
            <span className="text-xs font-bold text-slate-600 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
              {totalMembersCount} Rekod
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cari, tapis, eksport, dan uruskan maklumat ahli berdaftar.
          </p>
        </div>

        {/* Action Buttons: Export & Register */}
        <div className="flex items-center gap-2 relative">
          {/* Export Dropdown Trigger */}
          <div className="relative">
            <button
              id="btn-export-dropdown"
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting || totalMembersCount === 0}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 shadow-xs transition-colors min-h-[44px]"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>{isExporting ? 'Mengeksport...' : 'Eksport'}</span>
            </button>

            {/* Export Menu Dropdown */}
            {showExportMenu && (
              <div
                id="export-dropdown-menu"
                className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-30 animate-in fade-in zoom-in-95 text-xs font-medium"
              >
                <div className="px-3 py-2 border-b border-slate-100 text-[11px] text-slate-400 font-semibold uppercase">
                  Eksport ({totalMembersCount} Rekod Difilter)
                </div>
                <button
                  type="button"
                  onClick={() => handleExport('excel')}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl transition-colors text-left"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Microsoft Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('csv')}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span>Fail CSV (.csv)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('print')}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl transition-colors text-left"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Cetak / PDF (Print-Ready)</span>
                </button>
              </div>
            )}
          </div>

          {/* New Member Register button */}
          <button
            id="btn-list-register"
            type="button"
            onClick={onNavigateToRegister}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Daftar Ahli</span>
            <span className="sm:hidden">Daftar</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Filter Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          {/* Search input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="search-members-input"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nama, telefon, ID, NRIC..."
              className="w-full h-11 pl-10 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search submit button */}
          <button
            type="submit"
            className="px-4 h-11 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors min-h-[44px]"
          >
            Cari
          </button>

          {/* Filter Modal Trigger */}
          <button
            id="btn-open-filters"
            type="button"
            onClick={onOpenFilterDrawer}
            className={`inline-flex items-center gap-1.5 px-3.5 h-11 rounded-xl text-xs sm:text-sm font-semibold border transition-all min-h-[44px] ${
              hasActiveFilters
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Filter</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-emerald-600 ml-0.5" />
            )}
          </button>
        </form>

        {/* Filter Pills / Indicators */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Aktif:</span>
            {filters.status && filters.status !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium">
                Status: {filters.status}
              </span>
            )}
            {filters.sponsorId && filters.sponsorId !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 rounded-full font-medium">
                Sponsor: {filters.sponsorId}
              </span>
            )}
            {filters.datePreset && filters.datePreset !== 'ALL' && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium">
                Tarikh: {filters.datePreset}
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-full font-medium">
                Carian: "{filters.search}"
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                onFilterChange({
                  search: '',
                  status: 'ALL',
                  sponsorId: undefined,
                  datePreset: 'ALL',
                  page: 1,
                });
              }}
              className="text-[11px] text-rose-600 hover:underline font-semibold ml-auto"
            >
              Reset Semua
            </button>
          </div>
        )}
      </div>

      {/* Sort & Pagination Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div className="flex items-center gap-1">
          <span>Susun mengikut:</span>
          <button
            type="button"
            onClick={() => handleSortChange('tarikhDaftar')}
            className={`font-semibold px-2 py-1 rounded transition-colors ${
              filters.sortBy === 'tarikhDaftar'
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Tarikh {filters.sortBy === 'tarikhDaftar' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            type="button"
            onClick={() => handleSortChange('nama')}
            className={`font-semibold px-2 py-1 rounded transition-colors ${
              filters.sortBy === 'nama'
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Nama {filters.sortBy === 'nama' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>

        {/* Rows per page selector */}
        <div className="flex items-center gap-1.5">
          <span>Papar:</span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-semibold focus:outline-none"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="py-12 text-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Memuatkan senarai ahli...</p>
        </div>
      )}

      {/* Empty States */}
      {!isLoading && members.length === 0 && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/90 shadow-sm max-w-md mx-auto my-6">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            {hasActiveFilters ? <Search className="w-8 h-8" /> : <Users className="w-8 h-8" />}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            {hasActiveFilters ? 'TIADA REKOD DIJUMPAI' : 'BELUM ADA AHLI'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {hasActiveFilters
              ? 'Cuba ubah kata carian atau tetapan filter untuk melihat rekod ahli lain.'
              : 'Belum ada rekod ahli didaftarkan di dalam sistem ini.'}
          </p>
          <div className="mt-5">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  onFilterChange({
                    search: '',
                    status: 'ALL',
                    sponsorId: undefined,
                    datePreset: 'ALL',
                    page: 1,
                  });
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
              >
                Kosongkan Filter
              </button>
            ) : (
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                + DAFTAR AHLI
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile View: Card-based Member List (STRICT REQUIREMENT #14) */}
      {!isLoading && members.length > 0 && (
        <div className="md:hidden space-y-3">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onView={onViewMember}
              onEdit={onEditMember}
              onDelete={onDeleteMember}
              onRestore={onRestoreMember}
              isDeletedView={member.status === 'DELETED'}
            />
          ))}
        </div>
      )}

      {/* Desktop View: Full Responsive Table (>=768px) */}
      {!isLoading && members.length > 0 && (
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Member ID</th>
                  <th className="py-3.5 px-4">Nama Penuh</th>
                  <th className="py-3.5 px-4">No Telefon</th>
                  <th className="py-3.5 px-4">NRIC</th>
                  <th className="py-3.5 px-4">Sponsor</th>
                  <th className="py-3.5 px-4">Tarikh Daftar</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {members.map((member) => (
                  <tr
                    key={member.id}
                    onClick={() => onViewMember(member)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {member.memberId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-[200px] truncate">
                      {member.nama}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{member.telefon}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {maskNRIC(member.nric)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {member.sponsorId || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatDate(member.tarikhDaftar)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          member.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : member.status === 'INACTIVE'
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewMember(member)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Detail
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditMember(member)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 pb-6">
          <div className="text-xs text-slate-500 font-medium">
            Halaman {currentPage} daripada {totalPages}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onFilterChange({ ...filters, page: currentPage - 1 })}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 text-slate-700 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onFilterChange({ ...filters, page: currentPage + 1 })}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 text-slate-700 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Halaman Seterusnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
