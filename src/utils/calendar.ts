import { VaultItem } from '../types';

/**
 * Parses diverse date strings into a JavaScript Date object.
 */
export function parseDateString(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;

  // Try parsing DD/MM/YYYY or DD-MM-YYYY
  const parts = dateStr.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      const fullYear = year < 100 ? (year > 50 ? 1900 + year : 2000 + year) : year;
      const d = new Date(fullYear, month, day);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
}

/**
 * Formats a Date object into iCalendar UTC format (YYYYMMDDTHHMMSSZ).
 */
function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Generates an .ics iCalendar file string for a VaultItem expiry or renewal.
 */
export function generateICSContent(item: VaultItem): string {
  const eventDate = parseDateString(item.expiryDate) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const startDate = new Date(eventDate.setHours(9, 0, 0, 0));
  const endDate = new Date(eventDate.setHours(10, 0, 0, 0));

  const summary = `LifeVault: ${item.title} ${item.type === 'subscription' ? 'Renewal' : 'Expiry'}`;
  const description = `${item.subtitle}\\nCategory: ${item.category}\\nNotes: ${item.notes || 'Tracked in LifeVault'}\\nNumber: ${item.maskedNumber || item.fullNumber || 'N/A'}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LifeVault Digital Guardianship//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:lifevault-${item.id}-${Date.now()}@lifevault.app`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${summary}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Triggers standard download of .ics calendar event file.
 */
export function downloadCalendarEvent(item: VaultItem): void {
  const ics = generateICSContent(item);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}_LifeVault.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates a Google Calendar web intent URL.
 */
export function getGoogleCalendarUrl(item: VaultItem): string {
  const eventDate = parseDateString(item.expiryDate) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const startDate = new Date(eventDate.setHours(9, 0, 0, 0));
  const endDate = new Date(eventDate.setHours(10, 0, 0, 0));

  const startStr = formatICSDate(startDate);
  const endStr = formatICSDate(endDate);

  const title = encodeURIComponent(`LifeVault: ${item.title} ${item.type === 'subscription' ? 'Renewal' : 'Expiry'}`);
  const details = encodeURIComponent(
    `${item.subtitle}\nCategory: ${item.category}\nRecord: ${item.maskedNumber || item.fullNumber || ''}\n${item.notes || ''}`
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=LifeVault`;
}
