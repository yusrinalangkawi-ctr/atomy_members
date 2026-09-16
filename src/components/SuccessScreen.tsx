import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  MessageSquare,
  UserPlus,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { RegistrationResult } from '../types';
import { buildMemberWhatsAppUrl } from '../utils/formatters';

interface SuccessScreenProps {
  result: RegistrationResult;
  onRegisterAnother: () => void;
  onViewMemberList: () => void;
  onRetryWhatsApp: (logId: string) => Promise<void>;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  result,
  onRegisterAnother,
  onViewMemberList,
  onRetryWhatsApp,
}) => {
  const [copied, setCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentWaStatus, setCurrentWaStatus] = useState(result.whatsappNotification.status);

  const { member, whatsappNotification } = result;

  const handleCopyId = () => {
    navigator.clipboard.writeText(member.memberId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRetry = async () => {
    if (whatsappNotification.logId) {
      try {
        setIsRetrying(true);
        await onRetryWhatsApp(whatsappNotification.logId);
        setCurrentWaStatus('SENT');
      } catch (e) {
        console.error(e);
      } finally {
        setIsRetrying(false);
      }
    }
  };

  return (
    <div
      id="registration-success-screen"
      className="p-4 sm:p-6 lg:p-8 max-w-xl mx-auto animate-in zoom-in-95 duration-200"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl text-center relative overflow-hidden">
        {/* Success Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.2]" />
        </div>

        {/* Title */}
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          PENDAFTARAN BERJAYA
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
          Ahli Berjaya Didaftarkan
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Rekod ahli telah disimpan dengan selamat ke dalam pangkalan data.
        </p>

        {/* Generated Member ID Card */}
        <div className="my-6 p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400 block mb-1">
            MEMBER ID (JANAAN AUTOMATIK)
          </span>
          <div className="font-mono text-3xl sm:text-4xl font-extrabold tracking-wider text-white">
            {member.memberId}
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            {member.nama} • {member.telefon}
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              id="btn-success-copy-id"
              type="button"
              onClick={handleCopyId}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-emerald-300 font-semibold text-xs rounded-xl border border-slate-700 transition-all min-h-[40px]"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ID DISALIN!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>SALIN ID</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* WhatsApp to Member */}
        <div className="space-y-3 mb-6">
          <a
            id="btn-success-wa-member"
            href={buildMemberWhatsAppUrl(member)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all min-h-[48px] active:scale-[0.99]"
          >
            <MessageSquare className="w-5 h-5 fill-white" />
            <span>HANTAR WHATSAPP KEPADA AHLI</span>
          </a>
        </div>

        {/* Admin Notification Status Card */}
        <div className="mb-6 p-4 rounded-2xl border text-left text-xs bg-slate-50 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 uppercase tracking-wide">
              Notifikasi Admin WhatsApp:
            </span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                currentWaStatus === 'SENT'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {currentWaStatus === 'SENT' ? 'BERJAYA' : 'MANUAL / PERLU DIHANTAR'}
            </span>
          </div>

          <p className="text-slate-600 mt-1.5 leading-relaxed">
            {currentWaStatus === 'SENT'
              ? `Notifikasi pendaftaran automatik telah dihantar ke nombor admin (${whatsappNotification.adminNumber}).`
              : `Pendaftaran disimpan dalam pangkalan data. Anda boleh menghantar ringkasan pendaftaran ke WhatsApp admin (${whatsappNotification.adminNumber}).`}
          </p>

          {currentWaStatus !== 'SENT' && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <a
                id="btn-success-wa-admin"
                href={whatsappNotification.waDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold rounded-lg transition-colors min-h-[38px]"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Buka WhatsApp Admin</span>
              </a>

              {whatsappNotification.logId && (
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-lg transition-colors min-h-[38px]"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                  <span>{isRetrying ? 'Mencuba...' : 'Cuba Semula'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Secondary Actions */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
          <button
            id="btn-success-register-another"
            type="button"
            onClick={onRegisterAnother}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white font-semibold text-sm rounded-xl transition-all min-h-[44px]"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ DAFTAR AHLI BARU</span>
          </button>

          <button
            id="btn-success-view-list"
            type="button"
            onClick={onViewMemberList}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold text-sm rounded-xl transition-colors min-h-[44px]"
          >
            <span>Lihat Senarai Ahli</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
