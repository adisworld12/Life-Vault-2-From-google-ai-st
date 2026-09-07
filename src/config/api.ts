/**
 * API Configuration for LifeVault
 * Supports configurable backend URLs for mobile (Capacitor/iOS/Android) and web.
 */

// In production mobile apps (Capacitor), specify VITE_API_BASE_URL (e.g. https://api.lifevault.app)
// In web development/preview, defaults to relative URL ('')
export const API_BASE_URL: string = (((import.meta as any).env?.VITE_API_BASE_URL as string) || '').replace(/\/+$/, '');

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) {
    return cleanPath;
  }
  return `${API_BASE_URL}${cleanPath}`;
}
