import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Trash2,
  Database,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Globe,
  Sliders,
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsViewProps {
  settings: AppSettings | null;
  onSaveSettings: (settings: Partial<AppSettings>) => Promise<void>;
  onSeedDemo: () => Promise<void>;
  onClearData: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onSeedDemo,
  onClearData,
}) => {
  const [formData, setFormData] = useState<AppSettings>({
    appName: 'Member Management System',
    memberPrefix: 'MBR-',
    memberDigits: 6,
    timezone: 'Asia/Kuala_Lumpur',
    whatsappEnabled: false,
    adminWhatsAppNumber: '601120798015',
    welcomeTemplate: '',
    adminNotifyTemplate: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);
    try {
      await onSaveSettings(formData);
      setStatusMsg({ type: 'success', text: 'Tetapan sistem berjaya disimpan.' });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Gagal menyimpan tetapan.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeed = async () => {
    try {
      await onSeedDemo();
      setStatusMsg({ type: 'success', text: '6 rekod demo berjaya dimuatkan ke dalam pangkalan data.' });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  const handleClear = async () => {
    try {
      await onClearData();
      setShowClearConfirm(false);
      setStatusMsg({ type: 'success', text: 'Semua rekod ahli telah dipadam.' });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div id="settings-view-page" className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          KONFIGURASI
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
          Tetapan Sistem (Settings)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Uruskan format Member ID, zon masa, pautan WhatsApp, dan data ujian sistem.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in duration-150 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Tetapan Am & Penjanaan ID
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* App Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Nama Aplikasi
              </label>
              <input
                type="text"
                value={formData.appName}
                onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Zon Waktu
              </label>
              <input
                type="text"
                disabled
                value={formData.timezone}
                className="w-full h-11 px-3.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Zon waktu lalai ditetapkan ke Asia/Kuala_Lumpur
              </span>
            </div>

            {/* Member Prefix */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Awalan Member ID (Prefix)
              </label>
              <input
                type="text"
                value={formData.memberPrefix}
                onChange={(e) => setFormData({ ...formData, memberPrefix: e.target.value })}
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
                placeholder="MBR-"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Contoh format: MBR-000001</span>
            </div>

            {/* Member Digits */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Jumlah Digit Angka ID
              </label>
              <input
                type="number"
                min={4}
                max={10}
                value={formData.memberDigits}
                onChange={(e) => setFormData({ ...formData, memberDigits: parseInt(e.target.value, 10) || 6 })}
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Notification Settings */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Tetapan WhatsApp & Admin Notification
            </h3>
          </div>

          <div className="space-y-4">
            {/* Admin Phone Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Nombor WhatsApp Admin
              </label>
              <input
                type="text"
                value={formData.adminWhatsAppNumber}
                onChange={(e) => setFormData({ ...formData, adminWhatsAppNumber: e.target.value })}
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                placeholder="601120798015"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Nombor admin untuk menerima notifikasi pendaftaran automatik (cth: +60 11-2079 8015)
              </span>
            </div>

            {/* Welcome Template */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Templat Mesej Alu-aluan Ahli
              </label>
              <textarea
                rows={4}
                value={formData.welcomeTemplate}
                onChange={(e) => setFormData({ ...formData, welcomeTemplate: e.target.value })}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Pembolehubah tersedia: <code>&#123;&#123;Nama&#125;&#125;</code>, <code>&#123;&#123;MemberID&#125;&#125;</code>
              </span>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            id="btn-save-settings"
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-sm transition-all min-h-[46px]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Tetapan'}</span>
          </button>
        </div>
      </form>

      {/* Demo Data Management Card (Section 40) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            Pengurusan Data Demo (Sample Records)
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Sediakan rekod contoh untuk tujuan ujian atau kosongkan pangkalan data untuk memulakan sistem bersih.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            id="btn-settings-seed-demo"
            type="button"
            onClick={handleSeed}
            className="inline-flex items-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl transition-colors min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4 text-emerald-600" />
            <span>Muat Semula 6 Data Contoh</span>
          </button>

          {!showClearConfirm ? (
            <button
              id="btn-settings-clear-prompt"
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-2 py-2.5 px-4 text-rose-600 hover:bg-rose-50 font-semibold text-xs rounded-xl transition-colors border border-rose-200 min-h-[44px]"
            >
              <Trash2 className="w-4 h-4" />
              <span>Kosongkan Semua Rekod</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-xs font-bold text-rose-800">Pasti padam semua data?</span>
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg"
              >
                Ya, Padam
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1 bg-white text-slate-700 text-xs rounded-lg"
              >
                Batal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Google Apps Script Files Download Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Globe className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base">
              Muat Turun Fail Google Apps Script
            </h3>
            <p className="text-xs text-slate-400">
              Gunakan fail ini untuk melancarkan sistem di Google Sheets & Google Apps Script.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <a
            href="/api/download/index.html"
            download="Index.html"
            className="inline-flex items-center justify-center gap-2 p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition-all text-center"
          >
            <span>📥 Muat Turun Index.html</span>
          </a>
          <a
            href="/api/download/code.gs"
            download="Code.gs"
            className="inline-flex items-center justify-center gap-2 p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-2xl border border-slate-700 transition-all text-center"
          >
            <span>📥 Muat Turun Code.gs</span>
          </a>
        </div>
      </div>
    </div>
  );
};
