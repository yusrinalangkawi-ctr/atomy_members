import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileBarChart,
  MessageSquare,
  Settings,
  ShieldCheck,
  History,
  LogOut,
  Building2,
} from 'lucide-react';
import { NavTab } from './BottomNav';

interface SidebarProps {
  currentTab: NavTab | 'whatsapp' | 'logs' | 'settings';
  onSelectTab: (tab: any) => void;
  adminName: string;
  onLogout: () => void;
  activeCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  adminName,
  onLogout,
  activeCount,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Senarai Ahli', icon: Users, badge: activeCount },
    { id: 'register', label: 'Daftar Ahli', icon: UserPlus },
    { id: 'report', label: 'Report & Eksport', icon: FileBarChart },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'logs', label: 'Audit Log', icon: History },
    { id: 'settings', label: 'Tetapan', icon: Settings },
  ];

  return (
    <aside
      id="desktop-sidebar"
      className="hidden md:flex flex-col w-64 lg:w-72 bg-slate-900 text-slate-200 border-r border-slate-800 min-h-screen select-none shrink-0"
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white leading-tight">
              MEMBER SYSTEM
            </h1>
            <p className="text-[11px] text-emerald-400 font-medium tracking-wide">
              PENGURUSAN KEAHLIAN
            </p>
          </div>
        </div>
      </div>

      {/* Admin Profile Chip */}
      <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-950/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-semibold text-xs">
            AD
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white truncate">{adminName}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </div>
            <p className="text-[11px] text-slate-400 truncate">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              id={`sidebar-link-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/40 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-emerald-700/80 text-white'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info & Logout */}
      <div className="p-4 border-t border-slate-800/80">
        <button
          id="btn-sidebar-logout"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-900/30"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Keluar</span>
        </button>
        <p className="text-[10px] text-center text-slate-500 mt-3">
          Sistem Pengurusan Keahlian v1.2
        </p>
      </div>
    </aside>
  );
};
