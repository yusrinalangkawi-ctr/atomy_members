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
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || `Ralat pelayan: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  // Authentication
  login: async (password: string, username = 'admin'): Promise<{ success: boolean; user: AdminUser }> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, username }),
    });
    return handleResponse(res);
  },

  // Members
  getMembers: async (
    params: MemberFilterParams = {}
  ): Promise<{
    members: Member[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status', params.status);
    if (params.sponsorId) searchParams.append('sponsorId', params.sponsorId);
    if (params.datePreset) searchParams.append('datePreset', params.datePreset);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
    if (params.page) searchParams.append('page', String(params.page));
    if (params.limit) searchParams.append('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/members?${searchParams.toString()}`);
    return handleResponse(res);
  },

  getAllFilteredMembersForExport: async (params: MemberFilterParams = {}): Promise<{ members: Member[]; total: number }> => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status', params.status);
    if (params.sponsorId) searchParams.append('sponsorId', params.sponsorId);
    if (params.datePreset) searchParams.append('datePreset', params.datePreset);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
    searchParams.append('exportAll', 'true');

    const res = await fetch(`${API_BASE}/members?${searchParams.toString()}`);
    return handleResponse(res);
  },

  getMemberById: async (id: string): Promise<{ member: Member }> => {
    const res = await fetch(`${API_BASE}/members/${id}`);
    return handleResponse(res);
  },

  createMember: async (data: MemberFormData): Promise<RegistrationResult> => {
    const res = await fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateMember: async (id: string, data: Partial<MemberFormData>): Promise<{ success: boolean; member: Member }> => {
    const res = await fetch(`${API_BASE}/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  deleteMember: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/members/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  restoreMember: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/members/${id}/restore`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  // Dashboard Stats
  getStats: async (): Promise<DashboardStats> => {
    const res = await fetch(`${API_BASE}/stats`);
    return handleResponse(res);
  },

  // WhatsApp
  getWhatsAppLogs: async (): Promise<{ logs: WhatsAppLog[] }> => {
    const res = await fetch(`${API_BASE}/whatsapp/logs`);
    return handleResponse(res);
  },

  retryWhatsApp: async (
    logId: string
  ): Promise<{ success: boolean; log: WhatsAppLog; waDirectUrl: string }> => {
    const res = await fetch(`${API_BASE}/whatsapp/retry/${logId}`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  // Activity Logs
  getActivityLogs: async (): Promise<{ logs: ActivityLog[] }> => {
    const res = await fetch(`${API_BASE}/logs`);
    return handleResponse(res);
  },

  // Settings
  getSettings: async (): Promise<{ settings: AppSettings }> => {
    const res = await fetch(`${API_BASE}/settings`);
    return handleResponse(res);
  },

  updateSettings: async (settings: Partial<AppSettings>): Promise<{ success: boolean; settings: AppSettings }> => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return handleResponse(res);
  },

  // Demo helpers
  seedDemo: async (): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/demo/seed`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  clearData: async (): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/demo/clear`, {
      method: 'POST',
    });
    return handleResponse(res);
  },
};
