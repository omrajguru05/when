import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import type { Availability, BlockedSlot, Booking, BusyInterval, EventType, Slot } from './types';

const SLOT_GRANULARITY_MINS = 15;

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function overlaps(aStart: Date, aEnd: Date, busy: BusyInterval[]) {
  for (const b of busy) {
    if (aStart < b.end && aEnd > b.start) return true;
  }
  return false;
}

type ComputeArgs = {
  date: string;
  hostTimezone: string;
  eventType: Pick<EventType, 'duration_mins' | 'buffer_mins' | 'min_notice_mins'>;
  availability: Availability[];
  blocked: BlockedSlot[];
  bookings: Booking[];
  externalBusy?: BusyInterval[];
  now?: Date;
};

export function computeAvailableSlots(args: ComputeArgs): Slot[] {
  const {
    date,
    hostTimezone,
    eventType,
    availability,
    blocked,
    bookings,
    externalBusy = [],
    now = new Date(),
  } = args;

  const dowToken = formatInTimeZone(fromZonedTime(`${date}T12:00:00`, hostTimezone), hostTimezone, 'i');
  const dayOfWeek = Number(dowToken) % 7;

  const windows = availability.filter(a => a.day_of_week === dayOfWeek);
  if (windows.length === 0) return [];

  const minNoticeCutoff = new Date(now.getTime() + eventType.min_notice_mins * 60_000);

  const busy: BusyInterval[] = [
    ...blocked.map(b => ({ start: new Date(b.start_at), end: new Date(b.end_at) })),
    ...bookings
      .filter(b => b.status === 'confirmed')
      .map(b => {
        const start = new Date(b.start_at);
        const end = new Date(b.end_at);
        return {
          start: new Date(start.getTime() - eventType.buffer_mins * 60_000),
          end: new Date(end.getTime() + eventType.buffer_mins * 60_000),
        };
      }),
    ...externalBusy,
  ];

  const slots: Slot[] = [];

  for (const window of windows) {
    const startMin = toMinutes(window.start_time.slice(0, 5));
    const endMin = toMinutes(window.end_time.slice(0, 5));

    for (let m = startMin; m + eventType.duration_mins <= endMin; m += SLOT_GRANULARITY_MINS) {
      const hh = String(Math.floor(m / 60)).padStart(2, '0');
      const mm = String(m % 60).padStart(2, '0');

      const startUtc = fromZonedTime(`${date}T${hh}:${mm}:00`, hostTimezone);
      const endUtc = new Date(startUtc.getTime() + eventType.duration_mins * 60_000);

      if (startUtc < minNoticeCutoff) continue;

      const bufferStart = new Date(startUtc.getTime() - eventType.buffer_mins * 60_000);
      const bufferEnd = new Date(endUtc.getTime() + eventType.buffer_mins * 60_000);
      if (overlaps(bufferStart, bufferEnd, busy)) continue;

      slots.push({ start: startUtc.toISOString(), end: endUtc.toISOString() });
    }
  }

  slots.sort((a, b) => a.start.localeCompare(b.start));
  return slots;
}

export function isSlotStillValid(args: {
  start: string;
  end: string;
  hostTimezone: string;
  eventType: Pick<EventType, 'duration_mins' | 'buffer_mins' | 'min_notice_mins'>;
  availability: Availability[];
  blocked: BlockedSlot[];
  bookings: Booking[];
  externalBusy?: BusyInterval[];
  now?: Date;
}) {
  const date = formatInTimeZone(new Date(args.start), args.hostTimezone, 'yyyy-MM-dd');
  const slots = computeAvailableSlots({ ...args, date });
  return slots.some(s => s.start === args.start && s.end === args.end);
}
