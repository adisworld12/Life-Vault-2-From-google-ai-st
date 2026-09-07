export type VaultItemType = 'document' | 'subscription' | 'warranty' | 'bill' | 'reminder';

export interface ReminderStep {
  id: string;
  daysBefore: number;
  dateStr: string;
  label: string;
  description?: string;
  status: 'completed' | 'active' | 'upcoming';
}

export interface BillingRecord {
  id: string;
  dateStr: string;
  paymentMethod: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
}

export interface VaultItem {
  id: string;
  type: VaultItemType;
  title: string;
  subtitle: string;
  category: string;
  maskedNumber?: string;
  fullNumber?: string;
  fullName?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  warrantyDuration?: string;
  status: 'active' | 'attention' | 'vaulted' | 'expired';
  urgencyDays?: number;
  urgencyText?: string;
  urgencyLabel?: string;
  issueDate?: string;
  expiryDate?: string;
  cost?: number;
  currency?: string;
  billingCycle?: string;
  nextRenewalText?: string;
  notes?: string;
  scanImageUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: string;
  iconName: string;
  smartReminderEnabled?: boolean;
  tags?: string[];
  reminders?: ReminderStep[];
  billingHistory?: BillingRecord[];
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  phoneNumber: string;
  dateOfBirth?: string;
  country: string;
  currency: string;
  language: string;
  timeZone: string;
}

export interface NotificationPreferences {
  expiryReminders: boolean;
  subscriptionReminders: boolean;
  warrantyReminders: boolean;
  customReminders: boolean;
}

export interface SecurityPreferences {
  appLockEnabled: boolean;
  biometricEnabled: boolean;
  pinCode: string;
  autoLockTimer: string;
  hideSensitiveInfo: boolean;
  cloudSyncEnabled: boolean;
  lastBackupTime: string;
  lastSyncTime: string;
  encryptionProtocol: string;
  notifications: NotificationPreferences;
}

export type ActiveTab = 'home' | 'vault' | 'scanner' | 'alerts' | 'profile';
export type ActiveView = ActiveTab | 'document-detail' | 'subscription-detail' | 'item-detail';

