import { Capacitor } from '@capacitor/core';
import { LocalNotifications, ScheduleOptions, Channel } from '@capacitor/local-notifications';
import { VaultItem, NotificationPreferences } from '../types';

export interface LocalNotificationAlert {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  itemId?: string;
  icon?: string;
}

// Notification Channel ID for Android 8.0+
const REMINDER_CHANNEL_ID = 'lifevault_reminders';

/**
 * Deterministically generates a 32-bit positive integer ID for Capacitor Local Notifications from a string key.
 */
function generateNotificationId(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Initializes notification channels on Android.
 */
export async function initializeNotificationChannel(): Promise<void> {
  if (!Capacitor.isPluginAvailable('LocalNotifications')) return;

  try {
    const channel: Channel = {
      id: REMINDER_CHANNEL_ID,
      name: 'LifeVault Expiry & Renewal Alerts',
      description: 'Critical notifications for passport, license, warranty, and subscription renewals',
      importance: 5, // High / Heads-up notification
      visibility: 1, // Public on lockscreen
      sound: 'beep.wav',
      vibration: true,
      lights: true,
      lightColor: '#6366f1',
    };

    await LocalNotifications.createChannel(channel);
  } catch (error) {
    console.warn('Could not initialize Android notification channel:', error);
  }
}

/**
 * Check if notifications are supported on current platform (Native Capacitor or Web).
 */
export function isNotificationSupported(): boolean {
  if (Capacitor.isNativePlatform() || Capacitor.isPluginAvailable('LocalNotifications')) {
    return true;
  }
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Checks current notification permission.
 */
export async function checkNotificationPermission(): Promise<boolean> {
  if (Capacitor.isPluginAvailable('LocalNotifications')) {
    try {
      const status = await LocalNotifications.checkPermissions();
      return status.display === 'granted';
    } catch (e) {
      console.warn('Error checking Capacitor notification permission:', e);
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission === 'granted';
  }

  return false;
}

/**
 * Requests notification permissions from OS (Android/iOS) or Browser.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  // 1. Try Native Capacitor Local Notifications first
  if (Capacitor.isPluginAvailable('LocalNotifications')) {
    try {
      await initializeNotificationChannel();
      const status = await LocalNotifications.requestPermissions();
      if (status.display === 'granted') {
        return true;
      }
    } catch (error) {
      console.warn('Capacitor LocalNotifications permission request failed:', error);
    }
  }

  // 2. Fallback to standard web notification API
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.warn('Web notification permission request failed:', error);
    }
  }

  return false;
}

/**
 * Parses any date string (ISO, "Oct 15, 2026", "2026-10-15") to Date object.
 */
export function parseDateSafe(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return null;
  return parsed;
}

/**
 * Schedules native OS notifications for a single VaultItem on Android / iOS.
 * Works even when app is closed.
 * Standard intervals: 180, 90, 30, 14, 7, 1 days before expiry, plus custom dates.
 */
export async function scheduleItemNotifications(item: VaultItem): Promise<number> {
  if (!item.expiryDate) return 0;
  const expiry = parseDateSafe(item.expiryDate);
  if (!expiry) return 0;

  const now = Date.now();
  const schedulesToMake: { id: number; title: string; body: string; date: Date }[] = [];

  // Determine standard intervals to schedule based on item type
  const defaultIntervals = [180, 90, 30, 14, 7, 1];
  const customIntervals = item.reminders
    ? item.reminders.map((r) => r.daysBefore).filter((d): d is number => typeof d === 'number')
    : defaultIntervals;

  const uniqueDays = Array.from(new Set([...defaultIntervals, ...customIntervals]));

  for (const daysBefore of uniqueDays) {
    const notifyTimestamp = expiry.getTime() - daysBefore * 24 * 60 * 60 * 1000;
    // Set alert for 9:00 AM local time on the target day
    const notifyDate = new Date(notifyTimestamp);
    notifyDate.setHours(9, 0, 0, 0);

    // Only schedule future dates
    if (notifyDate.getTime() > now) {
      const notifId = generateNotificationId(`${item.id}_${daysBefore}`);
      let title = `Renewal Reminder: ${item.title}`;
      let body = `${item.title} expires in ${daysBefore} day${daysBefore > 1 ? 's' : ''} on ${item.expiryDate}.`;

      if (item.type === 'subscription') {
        const costStr = item.cost ? ` ($${item.cost.toFixed(2)})` : '';
        title = `Subscription Renewal: ${item.title}`;
        body = `Your ${item.title} subscription renews in ${daysBefore} day${daysBefore > 1 ? 's' : ''}${costStr}.`;
      } else if (item.type === 'warranty') {
        title = `Warranty Expiring: ${item.title}`;
        body = `Hardware warranty for ${item.title} expires in ${daysBefore} day${daysBefore > 1 ? 's' : ''}.`;
      }

      schedulesToMake.push({
        id: notifId,
        title,
        body,
        date: notifyDate,
      });
    }
  }

  // Handle custom reminder dates explicitly saved on item
  if (item.reminders) {
    for (const reminder of item.reminders) {
      if (reminder.dateStr && reminder.daysBefore === undefined) {
        const customDate = parseDateSafe(reminder.dateStr);
        if (customDate && customDate.getTime() > now) {
          const customId = generateNotificationId(`${item.id}_custom_${reminder.id}`);
          schedulesToMake.push({
            id: customId,
            title: `LifeVault Reminder: ${item.title}`,
            body: reminder.label || `Reminder for ${item.title}`,
            date: customDate,
          });
        }
      }
    }
  }

  if (schedulesToMake.length === 0) return 0;

  // Native Capacitor Local Notifications
  if (Capacitor.isPluginAvailable('LocalNotifications')) {
    try {
      const notifications = schedulesToMake.map((s) => ({
        id: s.id,
        title: s.title,
        body: s.body,
        schedule: {
          at: s.date,
          allowWhileIdle: true,
        },
        sound: 'beep.wav',
        channelId: REMINDER_CHANNEL_ID,
        extra: {
          itemId: item.id,
          itemType: item.type,
        },
      }));

      await LocalNotifications.schedule({ notifications });
      return notifications.length;
    } catch (e) {
      console.warn('Error scheduling native LocalNotifications:', e);
    }
  }

  return schedulesToMake.length;
}

/**
 * Cancels all scheduled native notifications for a specific item.
 */
export async function cancelItemNotifications(itemId: string): Promise<void> {
  if (!Capacitor.isPluginAvailable('LocalNotifications')) return;

  try {
    const days = [180, 90, 30, 14, 7, 1];
    const idsToCancel = days.map((d) => ({
      id: generateNotificationId(`${itemId}_${d}`),
    }));

    await LocalNotifications.cancel({ notifications: idsToCancel });
  } catch (error) {
    console.warn('Error cancelling local notifications for item:', itemId, error);
  }
}

/**
 * Reschedules all active notifications for all vault items according to user preferences.
 */
export async function syncAllVaultNotifications(
  items: VaultItem[],
  preferences: NotificationPreferences
): Promise<void> {
  if (Capacitor.isPluginAvailable('LocalNotifications')) {
    try {
      // Clear previous pending notifications to avoid stale duplicates
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
    } catch (e) {
      console.warn('Could not reset pending notifications:', e);
    }
  }

  for (const item of items) {
    const shouldSchedule =
      (item.type === 'document' && preferences.expiryReminders) ||
      (item.type === 'subscription' && preferences.subscriptionReminders) ||
      (item.type === 'warranty' && preferences.warrantyReminders) ||
      (item.type === 'reminder' && preferences.customReminders) ||
      preferences.expiryReminders;

    if (shouldSchedule) {
      await scheduleItemNotifications(item);
    }
  }
}

/**
 * Sends an instant local notification or test notification.
 */
export async function sendInstantNotification(title: string, body: string): Promise<boolean> {
  if (Capacitor.isPluginAvailable('LocalNotifications')) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: generateNotificationId(`instant_${Date.now()}`),
            title,
            body,
            schedule: { at: new Date(Date.now() + 500) },
            sound: 'beep.wav',
            channelId: REMINDER_CHANNEL_ID,
          },
        ],
      });
      return true;
    } catch (e) {
      console.warn('Native instant notification failed, falling back:', e);
    }
  }

  // Browser fallback
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, { body, icon: '/icon.png' });
      return true;
    } catch (e) {
      console.warn('Browser Notification failed:', e);
    }
  }

  return false;
}

/**
 * Scans active vault items and evaluates impending deadlines against notification preferences
 * for the in-app Alerts tab.
 */
export function generateActiveAlerts(
  items: VaultItem[],
  preferences: NotificationPreferences = {
    expiryReminders: true,
    subscriptionReminders: true,
    warrantyReminders: true,
    customReminders: true,
  }
): LocalNotificationAlert[] {
  const alerts: LocalNotificationAlert[] = [];

  for (const item of items) {
    const days = item.urgencyDays;

    if (item.type === 'document' && preferences.expiryReminders) {
      if (days !== undefined && days <= 30 && days >= 0) {
        alerts.push({
          id: `alert-doc-${item.id}`,
          title: `${item.title} Expiration Alert`,
          body: `Your ${item.title} expires in ${days === 0 ? 'today' : `${days} day${days > 1 ? 's' : ''}`}. ${item.expiryDate ? `(${item.expiryDate})` : ''}`,
          timestamp: new Date().toISOString(),
          itemId: item.id,
          icon: 'description',
        });
      }
    } else if (item.type === 'subscription' && preferences.subscriptionReminders) {
      if (days !== undefined && days <= 7 && days >= 0) {
        const costStr = item.cost ? ` — $${item.cost.toFixed(2)}` : '';
        alerts.push({
          id: `alert-sub-${item.id}`,
          title: `${item.title} Renewal Alert`,
          body: `Your ${item.title} renews in ${days === 0 ? 'today' : `${days} day${days > 1 ? 's' : ''}`}${costStr}. Check your payment method.`,
          timestamp: new Date().toISOString(),
          itemId: item.id,
          icon: 'subscriptions',
        });
      }
    } else if (item.type === 'warranty' && preferences.warrantyReminders) {
      if (days !== undefined && days <= 30 && days >= 0) {
        alerts.push({
          id: `alert-war-${item.id}`,
          title: `${item.title} Warranty Expiring`,
          body: `Hardware warranty for ${item.title} ends in ${days} days. File any claims before ${item.expiryDate || 'expiry'}.`,
          timestamp: new Date().toISOString(),
          itemId: item.id,
          icon: 'verified_user',
        });
      }
    } else if (item.type === 'reminder' && preferences.customReminders) {
      if (days !== undefined && days <= 7 && days >= 0) {
        alerts.push({
          id: `alert-rem-${item.id}`,
          title: `Reminder: ${item.title}`,
          body: item.notes || `Scheduled reminder for ${item.subtitle}`,
          timestamp: new Date().toISOString(),
          itemId: item.id,
          icon: 'notifications_active',
        });
      }
    }
  }

  return alerts;
}
