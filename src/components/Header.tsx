import React from 'react';
import { Building2, ShieldCheck, LogOut, MessageSquare } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  adminName: string;
  onLogout: () => void;
  onOpenWhatsApp?: () => void;
  whatsappEnabled?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  adminName,
  onLogout,
  onOpenWhatsApp,
  whatsappEnabled,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 sm:px-6 safe-area-top"
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Title area */}
        <div className="flex items-center gap-3">
          <div className="md:hidden w-8 h-8 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 font-normal leading-none mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action icons / Status */}
        <div className="flex items-center gap-2">
          {/* WhatsApp status button */}
          {onOpenWhatsApp && (
            <button
              id="header-btn-whatsapp"
              onClick={onOpenWhatsApp}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200/60"
              title="WhatsApp Gateway"
            >
              <span className={`w-2 h-2 rounded-full ${whatsappEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          )}

          {/* Admin badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate max-w-[120px]">{adminName}</span>
          </div>

          {/* Logout button (Mobile) */}
          <button
            id="header-btn-logout"
            onClick={onLogout}
            className="md:hidden p-2 text-slate-500 hover:text-rose-600 active:bg-slate-100 rounded-lg transition-colors"
            aria-label="Log Keluar"
            title="Log Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
