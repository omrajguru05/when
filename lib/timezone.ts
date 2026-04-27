import { format as fmt, addMinutes, parse } from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

export function nowUtc() {
  return new Date();
}

export function formatInTz(d: Date | string, tz: string, pattern: string) {
  return formatInTimeZone(typeof d === 'string' ? new Date(d) : d, tz, pattern);
}

export function utcDateForZonedDay(localDateISO: string, tz: string) {
  return fromZonedTime(`${localDateISO}T00:00:00`, tz);
}

export function combineZonedDateTime(localDateISO: string, hhmm: string, tz: string) {
  return fromZonedTime(`${localDateISO}T${hhmm}:00`, tz);
}

export function dayOfWeekInTz(d: Date, tz: string) {
  return Number(formatInTimeZone(d, tz, 'i')) % 7;
}

export function localDateInTz(d: Date, tz: string) {
  return formatInTimeZone(d, tz, 'yyyy-MM-dd');
}

export function localTimeInTz(d: Date, tz: string) {
  return formatInTimeZone(d, tz, 'HH:mm');
}

export function prettyDate(d: Date | string, tz: string) {
  return formatInTimeZone(typeof d === 'string' ? new Date(d) : d, tz, 'EEEE, MMMM d, yyyy');
}

export function prettyTime(d: Date | string, tz: string) {
  return formatInTimeZone(typeof d === 'string' ? new Date(d) : d, tz, 'h:mm a');
}

export function prettyTimeRange(start: Date | string, end: Date | string, tz: string) {
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;
  return `${formatInTimeZone(s, tz, 'h:mm a')} – ${formatInTimeZone(e, tz, 'h:mm a')}`;
}

export function addMins(d: Date, mins: number) {
  return addMinutes(d, mins);
}

export function parseHhmm(hhmm: string, base: Date) {
  return parse(hhmm, 'HH:mm', base);
}

export function format(d: Date | string, pattern: string) {
  return fmt(typeof d === 'string' ? new Date(d) : d, pattern);
}

export const TIMEZONE_OPTIONS = [
  'UTC',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Europe/Athens',
  'Africa/Cairo',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export function detectBrowserTimezone(fallback = 'UTC') {
  if (typeof Intl === 'undefined') return fallback;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || fallback;
  } catch {
    return fallback;
  }
}

export { toZonedTime };
