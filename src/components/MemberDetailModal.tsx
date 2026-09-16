import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Edit2,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  User,
  Phone,
  CreditCard,
  Mail,
  MapPin,
  Calendar,
  Link as LinkIcon,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { Member } from '../types';
import {
  formatDate,
  formatPhone,
  formatNRIC,
  maskNRIC,
  buildMemberWhatsAppUrl,
} from '../utils/formatters';

interface MemberDetailModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [showFullNric, setShowFullNric] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen || !member) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(member.memberId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const isInactive = member.status === 'INACTIVE';
  const isDeleted = member.status === 'DELETED';

  return (
    <div
      id="member-detail-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="member-detail-modal"
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-xs">
              {member.memberId}
            </span>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                isDeleted
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : isInactive
                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {member.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/50 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Profile Details */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Name & Quick Copy */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Nama Penuh
              </p>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                {member.nama}
              </h3>
            </div>
            <button
              onClick={handleCopyId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              {copiedId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Disalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin ID</span>
                </>
              )}
            </button>
          </div>

          {/* Details Grid */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3.5">
            {/* Phone */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                <Phone className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  No Telefon
                </span>
                <span className="font-semibold text-slate-900 text-sm">{member.telefon}</span>
              </div>
            </div>

            {/* NRIC (with privacy masking) */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                <CreditCard className="w-4 h-4 text-slate-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    No. Kad Pengenalan (NRIC)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFullNric(!showFullNric)}
                    className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 p-0.5"
                  >
                    {showFullNric ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Sembunyi</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Papar Penuh</span>
                      </>
                    )}
                  </button>
                </div>
                <span className="font-mono font-semibold text-slate-900 text-sm">
                  {showFullNric ? formatNRIC(member.nric) : maskNRIC(member.nric)}
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                <Mail className="w-4 h-4 text-slate-600" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Emel
                </span>
                <span className="text-slate-800 text-sm">{member.email || 'Tidak dinyatakan'}</span>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                <MapPin className="w-4 h-4 text-slate-600" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Alamat Penuh
                </span>
                <p className="text-slate-800 text-sm whitespace-pre-line leading-relaxed">
                  {member.alamat}
                </p>
              </div>
            </div>

            {/* Sponsor */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                <LinkIcon className="w-4 h-4 text-slate-600" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  ID Sponsor
                </span>
                <span className="font-semibold text-slate-900 text-sm">
                  {member.sponsorId || 'Tiada Penaja (Direct)'}
                </span>
              </div>
            </div>

            {/* Registered Date */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                <Calendar className="w-4 h-4 text-slate-600" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Tarikh Pendaftaran
                </span>
                <span className="text-slate-800 text-sm">
                  {formatDate(member.tarikhDaftar, true)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions (Easy to tap on mobile) */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
          {!isDeleted && (
            <a
              id="btn-detail-wa"
              href={buildMemberWhatsAppUrl(member)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all min-h-[44px]"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>WhatsApp</span>
            </a>
          )}

          {!isDeleted && (
            <button
              id="btn-detail-edit"
              onClick={() => {
                onClose();
                onEdit(member);
              }}
              className="inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-semibold text-sm rounded-xl border border-slate-200 transition-colors min-h-[44px]"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}

          {!isDeleted && (
            <button
              id="btn-detail-delete"
              onClick={() => {
                onClose();
                onDelete(member);
              }}
              className="inline-flex items-center justify-center p-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50 active:bg-rose-100 rounded-xl transition-colors min-h-[44px] min-w-[44px]"
              title="Padam Ahli"
              aria-label="Padam Ahli"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
