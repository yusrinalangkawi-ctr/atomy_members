import React from 'react';
import { History, ShieldCheck, UserCheck, Trash2, Edit2, Download, LogIn, Sparkles } from 'lucide-react';
import { ActivityLog } from '../types';
import { formatDate } from '../utils/formatters';

interface ActivityLogViewProps {
  logs: ActivityLog[];
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ logs }) => {
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE_MEMBER':
        return { label: 'DAFTAR AHLI', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'UPDATE_MEMBER':
        return { label: 'KEMASKINI', color: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'DELETE_MEMBER':
        return { label: 'PADAM (SOFT)', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'RESTORE_MEMBER':
        return { label: 'PULIHKAN', color: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'EXPORT_REPORT':
        return { label: 'EKSPORT', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'LOGIN':
        return { label: 'LOG MASUK', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'SEED_DEMO':
        return { label: 'DEMO DATA', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: action, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div id="activity-log-page" className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          AUDIT TRAIL
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
          Activity & Audit Log
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Rekod jejak audit semua operasi pendaftaran, kemas kini, pemadaman, dan eksport data.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            Sejarah Tindakan Sistem
          </h3>
          <span className="text-xs font-semibold text-slate-500">{logs.length} Rekod</span>
        </div>

        {logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Belum ada rekod log aktiviti.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 mt-2">
            {logs.map((log) => {
              const badge = getActionBadge(log.action);
              return (
                <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="font-semibold text-slate-900">{log.details}</span>
                    </div>
                    <div className="text-slate-400 mt-1 flex items-center gap-2">
                      <span>Pengguna: <strong>{log.user}</strong></span>
                      {log.memberId && (
                        <>
                          <span>•</span>
                          <span className="font-mono">ID: {log.memberId}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-slate-400 text-[11px] shrink-0 font-medium">
                    {formatDate(log.timestamp, true)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
