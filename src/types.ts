export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';

export interface Member {
  id: string; // Internal unique ID / UUID
  memberId: string; // e.g. MBR-000001
  nama: string;
  telefon: string;
  nric: string; // 12 digits, unformatted or standard format
  email?: string;
  alamat: string;
  sponsorId?: string;
  tarikhDaftar: string; // ISO 8601 string
  status: MemberStatus;
  updatedAt: string;
}

export interface MemberFormData {
  nama: string;
  telefon: string;
  nric: string;
  email?: string;
  alamat: string;
  sponsorId?: string;
  status?: MemberStatus;
}

export interface MemberFilterParams {
  search?: string;
  status?: 'ALL' | MemberStatus;
  sponsorId?: string;
  datePreset?: 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM';
  startDate?: string;
  endDate?: string;
  sortBy?: 'tarikhDaftar' | 'nama' | 'memberId';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  deletedMembers: number;
  newThisMonth: number;
  newThisWeek: number;
  activeSponsorsCount: number;
  monthlyTrend: {
    month: string; // e.g. 'JAN', 'FEB' or '2026-09'
    count: number;
  }[];
}

export interface WhatsAppLog {
  id: string;
  memberId: string;
  nama: string;
  recipient: string;
  messageType: 'ADMIN_NOTIFY' | 'WELCOME_MEMBER' | 'CUSTOM';
  content: string;
  status: 'SENT' | 'FAILED' | 'PENDING' | 'MANUAL';
  sentAt: string;
  error?: string;
}

export type ActivityAction =
  | 'CREATE_MEMBER'
  | 'UPDATE_MEMBER'
  | 'DELETE_MEMBER'
  | 'RESTORE_MEMBER'
  | 'EXPORT_REPORT'
  | 'SEND_WHATSAPP'
  | 'RETRY_WHATSAPP'
  | 'LOGIN'
  | 'LOGOUT'
  | 'RESET_DATA'
  | 'SEED_DEMO';

export interface ActivityLog {
  id: string;
  user: string;
  action: ActivityAction;
  memberId?: string;
  timestamp: string;
  details: string;
}

export interface AppSettings {
  appName: string;
  memberPrefix: string;
  memberDigits: number;
  timezone: string;
  whatsappEnabled: boolean;
  adminWhatsAppNumber: string;
  welcomeTemplate: string;
  adminNotifyTemplate: string;
}

export interface AdminUser {
  id: string;
  username: string;
  nama: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  token: string;
}

export interface RegistrationResult {
  member: Member;
  whatsappNotification: {
    status: 'SENT' | 'FAILED' | 'PENDING' | 'MANUAL';
    message: string;
    adminNumber: string;
    waDirectUrl: string;
    error?: string;
  };
}
