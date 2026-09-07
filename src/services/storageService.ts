import { Preferences } from '@capacitor/preferences';

/**
 * Robust Cross-Platform Storage Engine
 * Uses Capacitor Preferences on Android & iOS, with localStorage fallback for Web.
 */

export async function setStorageItem(key: string, value: any): Promise<void> {
  const serialized = JSON.stringify(value);
  try {
    await Preferences.set({ key, value: serialized });
  } catch {
    // Fallback
    try {
      localStorage.setItem(key, serialized);
    } catch {
      // Storage full or unavailable
    }
  }
}

export async function getStorageItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const { value } = await Preferences.get({ key });
    if (value !== null && value !== undefined) {
      return JSON.parse(value) as T;
    }
  } catch {
    // Try localStorage fallback
  }

  try {
    const fallback = localStorage.getItem(key);
    if (fallback !== null && fallback !== undefined) {
      return JSON.parse(fallback) as T;
    }
  } catch {
    // ignore
  }

  return defaultValue;
}

export async function removeStorageItem(key: string): Promise<void> {
  try {
    await Preferences.remove({ key });
  } catch {
    // Fallback
  }
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export async function clearAllStorage(): Promise<void> {
  try {
    await Preferences.clear();
  } catch {
    // Fallback
  }
  try {
    localStorage.clear();
  } catch {
    // ignore
  }
}
