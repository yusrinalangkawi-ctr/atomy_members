import React, { useState, useEffect } from 'react';
import { X, Filter, RotateCcw, Calendar, Check, Layers } from 'lucide-react';
import { MemberFilterParams, MemberStatus } from '../types';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MemberFilterParams;
  onApplyFilters: (newFilters: MemberFilterParams) => void;
  onResetFilters: () => void;
  availableSponsors: string[];
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
  availableSponsors,
}) => {
  const [localStatus, setLocalStatus] = useState<'ALL' | MemberStatus>(filters.status || 'ALL');
  const [localSponsor, setLocalSponsor] = useState<string>(filters.sponsorId || 'ALL');
  const [datePreset, setDatePreset] = useState<
    'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM'
  >(filters.datePreset || 'ALL');
  const [startDate, setStartDate] = useState<string>(filters.startDate || '');
  const [endDate, setEndDate] = useState<string>(filters.endDate || '');

  useEffect(() => {
    if (isOpen) {
      setLocalStatus(filters.status || 'ALL');
      setLocalSponsor(filters.sponsorId || 'ALL');
      setDatePreset(filters.datePreset || 'ALL');
      setStartDate(filters.startDate || '');
      setEndDate(filters.endDate || '');
    }
  }, [isOpen, filters]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters({
      ...filters,
      status: localStatus,
      sponsorId: localSponsor === 'ALL' ? undefined : localSponsor,
      datePreset,
      startDate: datePreset === 'CUSTOM' ? startDate : undefined,
      endDate: datePreset === 'CUSTOM' ? endDate : undefined,
      page: 1, // Reset to first page
    });
    onClose();
  };

  const handleReset = () => {
    setLocalStatus('ALL');
    setLocalSponsor('ALL');
    setDatePreset('ALL');
    setStartDate('');
    setEndDate('');
    onResetFilters();
    onClose();
  };

  const datePresets = [
    { id: 'ALL', label: 'Semua Masa' },
    { id: 'TODAY', label: 'Hari Ini' },
    { id: 'THIS_WEEK', label: 'Minggu Ini' },
    { id: 'THIS_MONTH', label: 'Bulan Ini' },
    { id: 'THIS_YEAR', label: 'Tahun Ini' },
    { id: 'CUSTOM', label: 'Julat Tarikh' },
  ];

  return (
    <div
      id="filter-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="filter-drawer-container"
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Filter className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-900">FILTER AHLI</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Status Keahlian
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ALL', label: 'Semua' },
                { id: 'ACTIVE', label: 'Active' },
                { id: 'INACTIVE', label: 'Inactive' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setLocalStatus(s.id as any)}
                  className={`py-2.5 px-3 rounded-xl font-semibold text-xs border transition-all ${
                    localStatus === s.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sponsor Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Sponsor ID
            </label>
            <select
              value={localSponsor}
              onChange={(e) => setLocalSponsor(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="ALL">Semua Sponsor (ALL)</option>
              {availableSponsors.map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Tarikh Pendaftaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              {datePresets.map((dp) => (
                <button
                  key={dp.id}
                  type="button"
                  onClick={() => setDatePreset(dp.id as any)}
                  className={`py-2 px-2 rounded-xl font-medium text-xs border text-center transition-all ${
                    datePreset === dp.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {dp.label}
                </button>
              ))}
            </div>

            {/* Custom Date Inputs if CUSTOM selected */}
            {datePreset === 'CUSTOM' && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <span className="text-xs font-medium text-slate-500">Tarikh Mula:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full mt-1 h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500">Tarikh Akhir:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full mt-1 h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button
            id="btn-filter-reset"
            type="button"
            onClick={handleReset}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 transition-colors min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET</span>
          </button>

          <button
            id="btn-filter-apply"
            type="button"
            onClick={handleApply}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-all min-h-[44px]"
          >
            <Check className="w-4 h-4" />
            <span>APPLY FILTER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
