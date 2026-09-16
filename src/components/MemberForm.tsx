import React, { useState } from 'react';
import {
  User,
  Phone,
  CreditCard,
  Mail,
  MapPin,
  Link as LinkIcon,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { MemberFormData } from '../types';
import {
  validatePhone,
  validateNRIC,
  validateEmail,
  cleanNRIC,
  cleanPhone,
} from '../utils/formatters';

interface MemberFormProps {
  onSubmit: (data: MemberFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting: boolean;
}

export const MemberForm: React.FC<MemberFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<MemberFormData>({
    nama: '',
    telefon: '',
    nric: '',
    email: '',
    alamat: '',
    sponsorId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Live input handlers
  const handleNricChange = (val: string) => {
    // Automatically allow user to type numbers or dashed format
    setFormData((prev) => ({ ...prev, nric: val }));
    if (errors.nric) {
      setErrors((prev) => ({ ...prev, nric: '' }));
    }
  };

  const handlePhoneChange = (val: string) => {
    setFormData((prev) => ({ ...prev, telefon: val }));
    if (errors.telefon) {
      setErrors((prev) => ({ ...prev, telefon: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Nama validation: min 3 chars
    if (!formData.nama || formData.nama.trim().length < 3) {
      newErrors.nama = 'Nama penuh wajib diisi (minimum 3 karakter).';
    }

    // Telefon validation: Malaysian phone format
    const phoneCheck = validatePhone(formData.telefon);
    if (!phoneCheck.isValid) {
      newErrors.telefon = phoneCheck.message || 'No telefon tidak sah.';
    }

    // NRIC validation: 12 digits
    const nricCheck = validateNRIC(formData.nric);
    if (!nricCheck.isValid) {
      newErrors.nric = nricCheck.message || 'NRIC mestilah 12 digit nombor.';
    }

    // Email validation: optional but valid if provided
    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.isValid) {
      newErrors.email = emailCheck.message || 'Format emel tidak sah.';
    }

    // Alamat validation: required
    if (!formData.alamat || formData.alamat.trim().length < 5) {
      newErrors.alamat = 'Alamat penuh wajib diisi.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    try {
      await onSubmit({
        ...formData,
        nric: cleanNRIC(formData.nric),
        telefon: formData.telefon.trim(),
        sponsorId: formData.sponsorId?.trim().toUpperCase(),
      });
    } catch (err: any) {
      setServerError(err.message || 'Ralat berlaku semasa pendaftaran ahli.');
    }
  };

  return (
    <div id="member-registration-page" className="p-4 sm:p-6 lg:p-8 max-w-xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors p-1 -ml-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
        )}
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 ml-auto">
          BORANG RASMI
        </span>
      </div>

      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm relative">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Daftar Ahli Baru
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Member ID akan dijana secara automatik secara unik.
          </p>
        </div>

        {/* Server Error Alert (e.g. Duplicate Phone or NRIC) */}
        {serverError && (
          <div
            id="registration-server-error"
            className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 animate-in shake duration-200"
          >
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-rose-800">
                Pendaftaran Tidak Berjaya
              </h4>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
          {/* NAMA PENUH */}
          <div>
            <label
              htmlFor="input-nama"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              NAMA PENUH *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="input-nama"
                type="text"
                autoComplete="name"
                value={formData.nama}
                onChange={(e) => {
                  setFormData({ ...formData, nama: e.target.value });
                  if (errors.nama) setErrors({ ...errors, nama: '' });
                }}
                className={`w-full h-12 pl-10 pr-3.5 bg-slate-50 border rounded-xl text-sm text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                  errors.nama
                    ? 'border-rose-300 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
                placeholder="Ahmad bin Ali"
              />
            </div>
            {errors.nama && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.nama}</p>}
          </div>

          {/* NO TELEFON */}
          <div>
            <label
              htmlFor="input-telefon"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              NO TELEFON *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="input-telefon"
                type="tel"
                autoComplete="tel"
                value={formData.telefon}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`w-full h-12 pl-10 pr-3.5 bg-slate-50 border rounded-xl text-sm text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                  errors.telefon
                    ? 'border-rose-300 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
                placeholder="011-88887777"
              />
            </div>
            {errors.telefon ? (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.telefon}</p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">Contoh: 011-88887777 atau 0123456789</p>
            )}
          </div>

          {/* NRIC */}
          <div>
            <label
              htmlFor="input-nric"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              NRIC *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <input
                id="input-nric"
                type="text"
                value={formData.nric}
                onChange={(e) => handleNricChange(e.target.value)}
                maxLength={14}
                className={`w-full h-12 pl-10 pr-3.5 bg-slate-50 border rounded-xl text-sm text-slate-900 font-mono transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                  errors.nric
                    ? 'border-rose-300 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
                placeholder="900101-02-1234"
              />
            </div>
            {errors.nric ? (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.nric}</p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">12 digit nombor kad pengenalan (sokong dengan/tanpa sengkang)</p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <label
              htmlFor="input-email"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              EMAIL (PILIHAN)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="input-email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                className={`w-full h-12 pl-10 pr-3.5 bg-slate-50 border rounded-xl text-sm text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-rose-300 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
                placeholder="nama@email.com"
              />
            </div>
            {errors.email && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email}</p>}
          </div>

          {/* ID SPONSOR */}
          <div>
            <label
              htmlFor="input-sponsor"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              ID SPONSOR (PILIHAN)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                id="input-sponsor"
                type="text"
                value={formData.sponsorId}
                onChange={(e) => setFormData({ ...formData, sponsorId: e.target.value })}
                className="w-full h-12 pl-10 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 uppercase font-mono transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="SP-0001 / MBR-000001"
              />
            </div>
          </div>

          {/* ALAMAT */}
          <div>
            <label
              htmlFor="input-alamat"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              ALAMAT *
            </label>
            <div className="relative">
              <div className="absolute top-3.5 left-3.5 pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <textarea
                id="input-alamat"
                rows={3}
                value={formData.alamat}
                onChange={(e) => {
                  setFormData({ ...formData, alamat: e.target.value });
                  if (errors.alamat) setErrors({ ...errors, alamat: '' });
                }}
                className={`w-full pl-10 pr-3.5 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                  errors.alamat
                    ? 'border-rose-300 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
                placeholder="Masukkan alamat penuh kediaman atau pos..."
              />
            </div>
            {errors.alamat && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.alamat}</p>}
          </div>

          {/* Submit Button (Full width on mobile, 44px+ touch target) */}
          <div className="pt-3">
            <button
              id="btn-submit-member"
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-base rounded-2xl shadow-md hover:shadow-lg transition-all min-h-[50px] touch-manipulation active:scale-[0.99]"
            >
              <CheckCircle className="w-5 h-5 stroke-[2.3]" />
              <span>{isSubmitting ? 'MENDAFTAR AHLI...' : '✓ DAFTAR AHLI'}</span>
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2.5">
              * Member ID dijana automatik oleh sistem dan dilindungi daripada duplikasi.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
