import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, User, Phone, CreditCard, Mail, MapPin, Link as LinkIcon } from 'lucide-react';
import { Member, MemberFormData, MemberStatus } from '../types';
import { validatePhone, validateNRIC, validateEmail, cleanNRIC } from '../utils/formatters';

interface MemberEditModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<MemberFormData>) => Promise<void>;
}

export const MemberEditModal: React.FC<MemberEditModalProps> = ({
  member,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<MemberFormData>({
    nama: '',
    telefon: '',
    nric: '',
    email: '',
    alamat: '',
    sponsorId: '',
    status: 'ACTIVE',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (member && isOpen) {
      setFormData({
        nama: member.nama,
        telefon: member.telefon,
        nric: member.nric,
        email: member.email || '',
        alamat: member.alamat,
        sponsorId: member.sponsorId || '',
        status: member.status,
      });
      setErrors({});
      setServerError(null);
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama || formData.nama.trim().length < 3) {
      newErrors.nama = 'Nama penuh wajib diisi (minimum 3 aksara).';
    }

    const phoneCheck = validatePhone(formData.telefon);
    if (!phoneCheck.isValid) {
      newErrors.telefon = phoneCheck.message || 'No telefon tidak sah.';
    }

    const nricCheck = validateNRIC(formData.nric);
    if (!nricCheck.isValid) {
      newErrors.nric = nricCheck.message || 'NRIC tidak sah.';
    }

    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.isValid) {
      newErrors.email = emailCheck.message || 'Emel tidak sah.';
    }

    if (!formData.alamat || formData.alamat.trim().length < 5) {
      newErrors.alamat = 'Alamat penuh wajib diisi.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSave(member.id, {
        ...formData,
        nric: cleanNRIC(formData.nric),
      });
      onClose();
    } catch (err: any) {
      setServerError(err.message || 'Gagal mengemaskini maklumat ahli.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="member-edit-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="member-edit-modal"
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="font-bold text-base text-slate-900">Kemaskini Ahli</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{member.memberId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/50 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {serverError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Nama Penuh */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Nama Penuh *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full h-11 pl-10 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Nama Penuh"
              />
            </div>
            {errors.nama && <p className="text-xs text-rose-600 mt-1">{errors.nama}</p>}
          </div>

          {/* No Telefon */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              No Telefon *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={formData.telefon}
                onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                className="w-full h-11 pl-10 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="011-88887777"
              />
            </div>
            {errors.telefon && <p className="text-xs text-rose-600 mt-1">{errors.telefon}</p>}
          </div>

          {/* NRIC */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              NRIC *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={formData.nric}
                onChange={(e) => setFormData({ ...formData, nric: e.target.value })}
                className="w-full h-11 pl-10 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                placeholder="900101-02-1234"
              />
            </div>
            {errors.nric && <p className="text-xs text-rose-600 mt-1">{errors.nric}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Status Keahlian
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as MemberStatus })}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email (Pilihan)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-11 pl-10 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="nama@email.com"
              />
            </div>
            {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
          </div>

          {/* ID Sponsor */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              ID Sponsor (Pilihan)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={formData.sponsorId}
                onChange={(e) => setFormData({ ...formData, sponsorId: e.target.value })}
                className="w-full h-11 pl-10 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-mono"
                placeholder="SP-0001"
              />
            </div>
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Alamat *
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <textarea
                rows={3}
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Masukkan alamat..."
              />
            </div>
            {errors.alamat && <p className="text-xs text-rose-600 mt-1">{errors.alamat}</p>}
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 text-white font-semibold text-sm rounded-xl shadow-sm transition-all min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
