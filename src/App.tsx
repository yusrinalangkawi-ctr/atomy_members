import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import {
  Member,
  MemberFormData,
  MemberFilterParams,
  DashboardStats,
  WhatsAppLog,
  ActivityLog,
  AppSettings,
  AdminUser,
  RegistrationResult,
} from './types';

// Components
import { BottomNav, NavTab } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { MemberList } from './components/MemberList';
import { MemberForm } from './components/MemberForm';
import { MemberDetailModal } from './components/MemberDetailModal';
import { MemberEditModal } from './components/MemberEditModal';
import { SuccessScreen } from './components/SuccessScreen';
import { FilterDrawer } from './components/FilterDrawer';
import { ReportView } from './components/ReportView';
import { WhatsAppView } from './components/WhatsAppView';
import { ActivityLogView } from './components/ActivityLogView';
import { SettingsView } from './components/SettingsView';
import { LoginModal } from './components/LoginModal';

// Lucide Icons for More menu
import {
  MessageSquare,
  History,
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem('mms_admin_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Navigation Tab
  const [currentTab, setCurrentTab] = useState<
    NavTab | 'whatsapp' | 'logs' | 'settings'
  >('dashboard');

  // Core Data States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null);

  // WhatsApp & System Logs & Settings
  const [whatsAppLogs, setWhatsAppLogs] = useState<WhatsAppLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Filter & Search State
  const [filters, setFilters] = useState<MemberFilterParams>({
    search: '',
    status: 'ALL',
    sponsorId: undefined,
    datePreset: 'ALL',
    sortBy: 'tarikhDaftar',
    sortOrder: 'desc',
    page: 1,
    limit: 25,
  });

  // Filter Drawer & Modals
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Report Specific: all records matching current filter
  const [reportMembers, setReportMembers] = useState<Member[]>([]);

  // Unique Sponsors list for filter options
  const [availableSponsors, setAvailableSponsors] = useState<string[]>([]);

  // 1. Fetch System Settings & Initial Stats
  const loadInitialData = useCallback(async () => {
    try {
      const [statsData, settingsData, waData, actData] = await Promise.all([
        api.getStats().catch(() => null),
        api.getSettings().catch(() => null),
        api.getWhatsAppLogs().catch(() => ({ logs: [] })),
        api.getActivityLogs().catch(() => ({ logs: [] })),
      ]);

      if (statsData) setStats(statsData);
      if (settingsData) setSettings(settingsData.settings);
      if (waData) setWhatsAppLogs(waData.logs);
      if (actData) setActivityLogs(actData.logs);
    } catch (e) {
      console.error('Failed to load initial data:', e);
    }
  }, []);

  // 2. Fetch Members according to filters & pagination
  const loadMembers = useCallback(async () => {
    setIsLoadingMembers(true);
    try {
      const data = await api.getMembers(filters);
      setMembers(data.members);
      setTotalMembers(data.pagination.total);
      setTotalPages(data.pagination.totalPages);

      // Collect available sponsors from active members
      const sponsors = new Set<string>();
      data.members.forEach((m) => {
        if (m.sponsorId && m.sponsorId.trim() !== '') {
          sponsors.add(m.sponsorId.trim().toUpperCase());
        }
      });
      setAvailableSponsors(Array.from(sponsors));
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [filters]);

  // 3. Load full filtered dataset for Report View
  const loadReportData = useCallback(async () => {
    try {
      const res = await api.getAllFilteredMembersForExport(filters);
      setReportMembers(res.members);
    } catch (e) {
      console.error('Error fetching report members:', e);
    }
  }, [filters]);

  // Effects
  useEffect(() => {
    if (currentUser) {
      loadInitialData();
    }
  }, [currentUser, loadInitialData]);

  useEffect(() => {
    if (currentUser) {
      loadMembers();
    }
  }, [currentUser, loadMembers]);

  useEffect(() => {
    if (currentUser && currentTab === 'report') {
      loadReportData();
    }
  }, [currentUser, currentTab, loadReportData]);

  // Login Handler
  const handleLogin = async (pass: string, user: string) => {
    setIsLoggingIn(true);
    try {
      const res = await api.login(pass, user);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        localStorage.setItem('mms_admin_session', JSON.stringify(res.user));
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mms_admin_session');
    setCurrentTab('dashboard');
  };

  // Member Registration Submit
  const handleRegisterMember = async (formData: MemberFormData) => {
    setIsRegistering(true);
    try {
      const result = await api.createMember(formData);
      setRegistrationResult(result);
      // Refresh list and stats
      loadMembers();
      loadInitialData();
    } finally {
      setIsRegistering(false);
    }
  };

  // Member Edit Save
  const handleSaveMember = async (id: string, updatedData: Partial<MemberFormData>) => {
    const res = await api.updateMember(id, updatedData);
    if (res.success) {
      // Update local members list
      setMembers((prev) => prev.map((m) => (m.id === id ? res.member : m)));
      if (selectedMember && selectedMember.id === id) {
        setSelectedMember(res.member);
      }
      loadInitialData();
    }
  };

  // Member Soft Delete
  const handleDeleteMember = async (member: Member) => {
    if (window.confirm(`Adakah anda pasti mahu memadam ahli ${member.nama} (${member.memberId})?`)) {
      try {
        await api.deleteMember(member.id);
        loadMembers();
        loadInitialData();
        setSelectedMember(null);
      } catch (err: any) {
        alert(err.message || 'Gagal memadam ahli.');
      }
    }
  };

  // Member Restore
  const handleRestoreMember = async (member: Member) => {
    try {
      await api.restoreMember(member.id);
      loadMembers();
      loadInitialData();
      setSelectedMember(null);
    } catch (err: any) {
      alert(err.message || 'Gagal memulihkan ahli.');
    }
  };

  // WhatsApp Retry
  const handleRetryWhatsApp = async (logId: string) => {
    const res = await api.retryWhatsApp(logId);
    if (res.success) {
      // Update logs in state
      setWhatsAppLogs((prev) => prev.map((l) => (l.id === logId ? res.log : l)));
    }
  };

  // Fetch full filtered list for export
  const handleExportAllFiltered = async (): Promise<Member[]> => {
    const res = await api.getAllFilteredMembersForExport(filters);
    return res.members;
  };

  // Settings Save
  const handleSaveSettings = async (newSettings: Partial<AppSettings>) => {
    const res = await api.updateSettings(newSettings);
    if (res.success) {
      setSettings(res.settings);
    }
  };

  // Demo seed and clear
  const handleSeedDemo = async () => {
    await api.seedDemo();
    await loadInitialData();
    await loadMembers();
  };

  const handleClearData = async () => {
    await api.clearData();
    await loadInitialData();
    await loadMembers();
  };

  // If not logged in, display Login Screen
  if (!currentUser) {
    return <LoginModal onLogin={handleLogin} isLoading={isLoggingIn} />;
  }

  // Derive active header title
  const getHeaderTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Dashboard Pentadbir';
      case 'members':
        return 'Senarai Ahli';
      case 'register':
        return registrationResult ? 'Status Pendaftaran' : 'Pendaftaran Ahli Baru';
      case 'report':
        return 'Laporan Keahlian';
      case 'whatsapp':
        return 'Integrasi WhatsApp';
      case 'logs':
        return 'Audit & Activity Log';
      case 'settings':
        return 'Tetapan Sistem';
      case 'more':
        return 'Menu Tambahan';
      default:
        return 'Member Management System';
    }
  };

  return (
    <div id="mms-app-root" className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased">
      {/* Desktop Sidebar (>=768px) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setRegistrationResult(null); // reset result if navigating away
          setCurrentTab(tab);
        }}
        adminName={currentUser.nama}
        onLogout={handleLogout}
        activeCount={stats?.activeMembers}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        {/* App Header */}
        <Header
          title={getHeaderTitle()}
          subtitle="Sistem Pengurusan Keahlian"
          adminName={currentUser.nama}
          onLogout={handleLogout}
          onOpenWhatsApp={() => setCurrentTab('whatsapp')}
          whatsappEnabled={settings?.whatsappEnabled}
        />

        {/* Dynamic View Rendering */}
        <main className="flex-1">
          {/* 1. Dashboard View */}
          {currentTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              recentMembers={members}
              isLoading={isLoadingMembers}
              onNavigateToRegister={() => {
                setRegistrationResult(null);
                setCurrentTab('register');
              }}
              onNavigateToMembers={() => setCurrentTab('members')}
              onNavigateToReport={() => setCurrentTab('report')}
              onSelectMember={(m) => setSelectedMember(m)}
            />
          )}

          {/* 2. Member List View */}
          {currentTab === 'members' && (
            <MemberList
              members={members}
              totalMembersCount={totalMembers}
              totalPages={totalPages}
              currentPage={filters.page || 1}
              pageSize={filters.limit || 25}
              isLoading={isLoadingMembers}
              filters={filters}
              onFilterChange={(newFilters) => setFilters(newFilters)}
              onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
              onViewMember={(m) => setSelectedMember(m)}
              onEditMember={(m) => setEditingMember(m)}
              onDeleteMember={handleDeleteMember}
              onRestoreMember={handleRestoreMember}
              onNavigateToRegister={() => {
                setRegistrationResult(null);
                setCurrentTab('register');
              }}
              onExportAllFiltered={handleExportAllFiltered}
            />
          )}

          {/* 3. Member Registration View / Success Screen */}
          {currentTab === 'register' && (
            <>
              {registrationResult ? (
                <SuccessScreen
                  result={registrationResult}
                  onRegisterAnother={() => setRegistrationResult(null)}
                  onViewMemberList={() => {
                    setRegistrationResult(null);
                    setCurrentTab('members');
                  }}
                  onRetryWhatsApp={handleRetryWhatsApp}
                />
              ) : (
                <MemberForm
                  onSubmit={handleRegisterMember}
                  onCancel={() => setCurrentTab('dashboard')}
                  isSubmitting={isRegistering}
                />
              )}
            </>
          )}

          {/* 4. Report View */}
          {currentTab === 'report' && (
            <ReportView
              members={members}
              allFilteredMembers={reportMembers.length > 0 ? reportMembers : members}
              filters={filters}
              onFilterChange={(newFilters) => setFilters(newFilters)}
              onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
              availableSponsors={availableSponsors}
            />
          )}

          {/* 5. WhatsApp View */}
          {currentTab === 'whatsapp' && (
            <WhatsAppView
              logs={whatsAppLogs}
              settings={settings}
              onRetry={handleRetryWhatsApp}
              onRefreshLogs={loadInitialData}
            />
          )}

          {/* 6. Activity / Audit Logs View */}
          {currentTab === 'logs' && <ActivityLogView logs={activityLogs} />}

          {/* 7. Settings View */}
          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onSeedDemo={handleSeedDemo}
              onClearData={handleClearData}
            />
          )}

          {/* 8. More Menu (Mobile View for additional screens) */}
          {currentTab === 'more' && (
            <div id="more-menu-view" className="p-4 sm:p-6 max-w-lg mx-auto space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-base shadow-sm">
                    AD
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{currentUser.nama}</h3>
                    <p className="text-xs text-slate-500">Super Administrator</p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 mt-2">
                  <button
                    onClick={() => setCurrentTab('whatsapp')}
                    className="w-full py-3.5 flex items-center justify-between hover:bg-slate-50 -mx-2 px-2 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-800 block">WhatsApp Gateway</span>
                        <span className="text-[11px] text-slate-400">Log & notifikasi admin</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => setCurrentTab('logs')}
                    className="w-full py-3.5 flex items-center justify-between hover:bg-slate-50 -mx-2 px-2 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                        <History className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-800 block">Audit & Activity Log</span>
                        <span className="text-[11px] text-slate-400">Jejak tindakan sistem</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => setCurrentTab('settings')}
                    className="w-full py-3.5 flex items-center justify-between hover:bg-slate-50 -mx-2 px-2 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                        <SettingsIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-800 block">Tetapan Sistem</span>
                        <span className="text-[11px] text-slate-400">Prefix ID, zon masa & demo</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Logout button in More Menu */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-4 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 font-bold text-sm rounded-2xl border border-rose-200 transition-colors min-h-[48px]"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Keluar Dari Sistem</span>
              </button>
            </div>
          )}
        </main>

        {/* Mobile Bottom Navigation (Strict Mobile First - Section 4) */}
        <BottomNav
          currentTab={currentTab as NavTab}
          onSelectTab={(tab) => {
            setRegistrationResult(null);
            setCurrentTab(tab);
          }}
        />

        {/* Global Filter Drawer (Bottom Sheet on Mobile / Modal on Desktop) */}
        <FilterDrawer
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          filters={filters}
          onApplyFilters={(newFilters) => setFilters(newFilters)}
          onResetFilters={() =>
            setFilters({
              search: '',
              status: 'ALL',
              sponsorId: undefined,
              datePreset: 'ALL',
              sortBy: 'tarikhDaftar',
              sortOrder: 'desc',
              page: 1,
              limit: 25,
            })
          }
          availableSponsors={availableSponsors}
        />

        {/* Member Detail Modal */}
        <MemberDetailModal
          member={selectedMember}
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          onEdit={(m) => {
            setSelectedMember(null);
            setEditingMember(m);
          }}
          onDelete={handleDeleteMember}
        />

        {/* Member Edit Modal */}
        <MemberEditModal
          member={editingMember}
          isOpen={!!editingMember}
          onClose={() => setEditingMember(null)}
          onSave={handleSaveMember}
        />
      </div>
    </div>
  );
};

export default App;
