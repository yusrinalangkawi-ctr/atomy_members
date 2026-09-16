import React from 'react';
import {
  MessageSquare,
  Eye,
  Edit2,
  Trash2,
  RotateCcw,
  Phone,
  Link as LinkIcon,
  Calendar,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
} from 'lucide-react';
import { Member } from '../types';
import { formatDate, buildMemberWhatsAppUrl } from '../utils/formatters';

interface MemberCardProps {
  member: Member;
  onView: (member: Member) => void;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  onRestore?: (member: Member) => void;
  isDeletedView?: boolean;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onView,
  onEdit,
  onDelete,
  onRestore,
  isDeletedView = false,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(member.memberId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isInactive = member.status === 'INACTIVE';
  const isDeleted = member.status === 'DELETED';

  return (
    <div
      id={`member-card-${member.memberId}`}
      onClick={() => onView(member)}
      className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-150 cursor-pointer shadow-sm relative overflow-hidden select-none active:scale-[0.99] ${
        isDeleted
          ? 'border-rose-200 bg-rose-50/20 opacity-80'
          : isInactive
          ? 'border-slate-200 bg-slate-50/60'
          : 'border-slate-200/90 hover:border-emerald-300 hover:shadow-md'
      }`}
    >
      {/* Top Bar: Member ID & Status Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80">
            {member.memberId}
          </span>
          <button
            onClick={handleCopyId}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
            title="Salin Member ID"
            aria-label="Salin ID"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Status Badge */}
        <div>
          {isDeleted ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              <XCircle className="w-3 h-3" />
              DELETED
            </span>
          ) : isInactive ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              INACTIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* Member Main Info */}
      <div className="mt-3">
        <h4 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
          {member.nama}
        </h4>

        {/* Details row */}
        <div className="mt-2.5 space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-800">{member.telefon}</span>
          </div>

          <div className="flex items-center justify-between text-slate-500">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                Sponsor:{' '}
                <strong className="text-slate-700 font-semibold">
                  {member.sponsorId || 'Tiada'}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(member.tarikhDaftar)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer Buttons (min 44px touch targets) */}
      <div
        className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* WhatsApp Button (WhatsApp Direct) */}
        {!isDeleted && (
          <a
            id={`btn-wa-${member.memberId}`}
            href={buildMemberWhatsAppUrl(member)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all min-h-[40px] touch-manipulation"
            aria-label={`Buka WhatsApp untuk ${member.nama}`}
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>WA</span>
          </a>
        )}

        {/* View Details */}
        <button
          id={`btn-view-${member.memberId}`}
          onClick={() => onView(member)}
          className="flex items-center justify-center p-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl transition-colors min-h-[40px] min-w-[40px]"
          title="Lihat Butiran Ahli"
          aria-label="Lihat Ahli"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Edit Button */}
        {!isDeleted && (
          <button
            id={`btn-edit-${member.memberId}`}
            onClick={() => onEdit(member)}
            className="flex items-center justify-center p-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl transition-colors min-h-[40px] min-w-[40px]"
            title="Kemaskini Maklumat"
            aria-label="Edit Ahli"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}

        {/* Delete or Restore */}
        {isDeleted ? (
          onRestore && (
            <button
              id={`btn-restore-${member.memberId}`}
              onClick={() => onRestore(member)}
              className="flex items-center gap-1 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold transition-colors min-h-[40px]"
              title="Pulihkan Ahli"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Pulihkan</span>
            </button>
          )
        ) : (
          <button
            id={`btn-delete-${member.memberId}`}
            onClick={() => onDelete(member)}
            className="flex items-center justify-center p-2.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 active:bg-rose-100 rounded-xl transition-colors min-h-[40px] min-w-[40px]"
            title="Padam Ahli (Soft Delete)"
            aria-label="Padam Ahli"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
