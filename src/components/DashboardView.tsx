import React from 'react';
import {
  Users,
  UserCheck,
  Sparkles,
  Award,
  UserPlus,
  ArrowRight,
  TrendingUp,
  FileBarChart,
  MessageSquare,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { DashboardStats, Member } from '../types';
import { formatDate, buildMemberWhatsAppUrl } from '../utils/formatters';

interface DashboardViewProps {
  stats: DashboardStats | null;
  recentMembers: Member[];
  isLoading: boolean;
  onNavigateToRegister: () => void;
  onNavigateToMembers: () => void;
  onNavigateToReport: () => void;
  onSelectMember: (member: Member) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  recentMembers,
  isLoading,
  onNavigateToRegister,
  onNavigateToMembers,
  onNavigateToReport,
  onSelectMember,
}) => {
  const total = stats?.totalMembers ?? 0;
  const active = stats?.activeMembers ?? 0;
  const newThisMonth = stats?.newThisMonth ?? 0;
  const activeSponsors = stats?.activeSponsorsCount ?? 0;

  return (
    <div id="dashboard-view" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Mobile Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            SISTEM PENGURUSAN
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">
            Selamat datang, Admin
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Ringkasan status keahlian terkini dan aktiviti pendaftaran sistem.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          id="btn-dashboard-register-main"
          onClick={onNavigateToRegister}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.99] min-h-[44px]"
        >
          <UserPlus className="w-4 h-4 stroke-[2.2]" />
          <span>+ DAFTAR AHLI</span>
        </button>
      </div>

      {/* 4 Core Statistic Cards (Mobile-first stack -> 2 cols -> 4 cols on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Jumlah Ahli */}
        <div
          id="stat-card-total-members"
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden transition-all hover:border-slate-300"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-400">Semua Rekod</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isLoading ? (
                <div className="h-8 w-20 bg-slate-200 animate-pulse rounded" />
              ) : (
                total.toLocaleString()
              )}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Jumlah Ahli
            </div>
          </div>
        </div>

        {/* Card 2: Ahli Aktif */}
        <div
          id="stat-card-active-members"
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden transition-all hover:border-slate-300"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              ✓ Aktif
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-emerald-700 tracking-tight">
              {isLoading ? (
                <div className="h-8 w-20 bg-slate-200 animate-pulse rounded" />
              ) : (
                active.toLocaleString()
              )}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Ahli Aktif
            </div>
          </div>
        </div>

        {/* Card 3: Ahli Baru Bulan Ini */}
        <div
          id="stat-card-new-this-month"
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden transition-all hover:border-slate-300"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
              🆕 Bulan Ini
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isLoading ? (
                <div className="h-8 w-20 bg-slate-200 animate-pulse rounded" />
              ) : (
                newThisMonth.toLocaleString()
              )}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Ahli Baru Bulan Ini
            </div>
          </div>
        </div>

        {/* Card 4: Sponsor Aktif */}
        <div
          id="stat-card-active-sponsors"
          className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden transition-all hover:border-slate-300"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              Rangkaian
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isLoading ? (
                <div className="h-8 w-20 bg-slate-200 animate-pulse rounded" />
              ) : (
                activeSponsors.toLocaleString()
              )}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Sponsor Aktif
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Hub (Mobile Friendly) */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
          Tindakan Pantas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
          <button
            id="quick-btn-members"
            onClick={onNavigateToMembers}
            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 active:bg-slate-700 transition-colors border border-slate-700/60 text-left min-h-[48px]"
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-sm font-medium text-white">Lihat Senarai Ahli</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            id="quick-btn-report"
            onClick={onNavigateToReport}
            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 active:bg-slate-700 transition-colors border border-slate-700/60 text-left min-h-[48px]"
          >
            <div className="flex items-center gap-3">
              <FileBarChart className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-sm font-medium text-white">Jana Report & Eksport</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            id="quick-btn-register"
            onClick={onNavigateToRegister}
            className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition-colors text-white font-medium text-left min-h-[48px]"
          >
            <div className="flex items-center gap-3">
              <UserPlus className="w-4 h-4 shrink-0" />
              <span className="text-sm font-semibold">Daftar Ahli Baru</span>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-100" />
          </button>
        </div>
      </div>

      {/* Registration Trend Chart & Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Visual */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Keahlian Mengikut Bulan</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">6 Bulan Lepas</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Statistik pendaftaran ahli baharu sepanjang tahun ini.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {stats?.monthlyTrend && stats.monthlyTrend.length > 0 ? (
              stats.monthlyTrend.map((m, i) => {
                const maxVal = Math.max(...stats.monthlyTrend.map((t) => t.count), 1);
                const percent = Math.min(100, Math.max(8, Math.round((m.count / maxVal) * 100)));

                return (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className="w-10 font-semibold text-slate-500">{m.month}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden p-0.5">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-bold text-slate-800">{m.count}</span>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-400 text-center py-6">
                Tiada rekod statistik bulanan lagi.
              </div>
            )}
          </div>
          <div className="text-[11px] text-slate-400 text-center pt-4 border-t border-slate-100 mt-4">
            Dikemas kini secara automatik mengikut zon waktu Asia/Kuala_Lumpur
          </div>
        </div>

        {/* Recent Members List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Pendaftaran Ahli Terkini</span>
              </h3>
              <p className="text-xs text-slate-500">
                Ahli yang baru didaftarkan ke dalam sistem.
              </p>
            </div>
            <button
              onClick={onNavigateToMembers}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 p-1.5"
            >
              <span>Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {recentMembers.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-slate-400">Belum ada ahli didaftarkan.</p>
                <button
                  onClick={onNavigateToRegister}
                  className="mt-2 text-xs font-semibold text-emerald-600 underline"
                >
                  Daftar ahli sekarang
                </button>
              </div>
            ) : (
              recentMembers.slice(0, 5).map((m) => (
                <div
                  key={m.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition-colors cursor-pointer"
                  onClick={() => onSelectMember(m)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {m.memberId}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {m.nama}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>{m.telefon}</span>
                      <span>•</span>
                      <span>{formatDate(m.tarikhDaftar)}</span>
                      {m.sponsorId && (
                        <>
                          <span>•</span>
                          <span className="text-slate-600 font-medium">Sp: {m.sponsorId}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={buildMemberWhatsAppUrl(m)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 active:scale-95 rounded-lg transition-all"
                      title="Hantar WhatsApp"
                      aria-label={`WhatsApp kepada ${m.nama}`}
                    >
                      <MessageSquare className="w-4 h-4 fill-emerald-600" />
                    </a>
                    <button
                      onClick={() => onSelectMember(m)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                      title="Lihat Detail"
                      aria-label="Lihat Profil Ahli"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
