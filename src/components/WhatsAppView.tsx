import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { WhatsAppLog, AppSettings } from '../types';
import { formatDate } from '../utils/formatters';

interface WhatsAppViewProps {
  logs: WhatsAppLog[];
  settings: AppSettings | null;
  onRetry: (logId: string) => Promise<void>;
  onRefreshLogs: () => void;
}

export const WhatsAppView: React.FC<WhatsAppViewProps> = ({
  logs,
  settings,
  onRetry,
  onRefreshLogs,
}) => {
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const adminPhone = settings?.adminWhatsAppNumber || '601120798015';
  const isEnabled = settings?.whatsappEnabled || false;

  const handleRetry = async (logId: string) => {
    try {
      setRetryingId(logId);
      await onRetry(logId);
    } catch (e) {
      console.error('Retry failed:', e);
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div id="whatsapp-view-page" className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            INTEGRASI MESEJ
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
            WhatsApp Gateway & Logs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pengurusan penghantaran notifikasi pendaftaran dan mesej alu-aluan ahli.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefreshLogs}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-xs transition-colors self-start sm:self-auto min-h-[40px]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Muat Semula Log</span>
        </button>
      </div>

      {/* Admin Gateway Status Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6 fill-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Notifikasi Automatik Admin
              </h3>
              <p className="text-xs text-slate-500">
                Penerima:{' '}
                <strong className="text-slate-800 font-semibold">
                  +{adminPhone.startsWith('60') ? adminPhone : `60${adminPhone}`}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                isEnabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {isEnabled ? 'CLOUD API AKTIF' : 'MOD MANUAL / LINK DIRECT'}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong>Keselamatan API:</strong> Kredensial WhatsApp Business Cloud API (Access Token & Phone Number ID)
              dilindungi sepenuhnya pada lapisan backend pelayan dan tidak sekali-kali didedahkan kepada pelayar pengguna.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong>Ketahanan Pangkalan Data:</strong> Jika sambungan WhatsApp gagal, data ahli tetap berjaya disimpan
              dan tidak dibatalkan (non-rollback). Admin boleh mencuba semula (retry) atau membuka pautan WhatsApp secara manual.
            </p>
          </div>
        </div>
      </div>

      {/* WhatsApp Logs Table / Cards */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Rekod Log Penghantaran (WhatsApp Logs)
            </h3>
            <p className="text-xs text-slate-500">
              Menjejaki status setiap mesej notifikasi yang dihantar.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">{logs.length} Log</span>
        </div>

        {logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Belum ada rekod penghantaran WhatsApp direkodkan.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 mt-2">
            {logs.map((log) => {
              const cleanRecipient = log.recipient.replace(/\D/g, '');
              const directWaUrl = `https://wa.me/${cleanRecipient}?text=${encodeURIComponent(
                log.content
              )}`;

              return (
                <div key={log.id} className="py-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {log.memberId}
                      </span>
                      <span className="font-semibold text-slate-900">{log.nama}</span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        log.status === 'SENT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : log.status === 'FAILED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-slate-500">
                    <div className="flex items-center gap-3">
                      <span>Penerima: +{cleanRecipient}</span>
                      <span>•</span>
                      <span>Jenis: {log.messageType}</span>
                      <span>•</span>
                      <span>{formatDate(log.sentAt, true)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {log.status !== 'SENT' && (
                        <button
                          type="button"
                          onClick={() => handleRetry(log.id)}
                          disabled={retryingId === log.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                        >
                          <RotateCcw
                            className={`w-3 h-3 ${retryingId === log.id ? 'animate-spin' : ''}`}
                          />
                          <span>{retryingId === log.id ? 'Mencuba...' : 'Retry'}</span>
                        </button>
                      )}

                      <a
                        href={directWaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg transition-colors border border-emerald-200/60"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Buka WA</span>
                      </a>
                    </div>
                  </div>

                  {log.error && (
                    <div className="p-2 bg-rose-50 text-rose-700 rounded-lg text-[11px] font-mono">
                      Ralat: {log.error}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
