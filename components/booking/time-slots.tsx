'use client';

import { Skeleton } from 'boneyard-js/react';
import { cn } from '@/lib/utils';
import type { Slot } from '@/lib/types';

type TimeSlotsProps = {
  slots: Slot[];
  selected: Slot | null;
  onSelect: (slot: Slot) => void;
  loading: boolean;
  inviteeTimezone: string;
};

function formatTime(iso: string, tz: string) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: tz,
  }).format(date);
}

const FIXTURE_SLOTS: Slot[] = Array.from({ length: 9 }).map((_, i) => {
  const start = new Date(`2026-05-01T${String(9 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}:00Z`);
  const end = new Date(start.getTime() + 30 * 60_000);
  return { start: start.toISOString(), end: end.toISOString() };
});

function SlotGrid({
  slots,
  selected,
  onSelect,
  inviteeTimezone,
  isFixture = false,
}: {
  slots: Slot[];
  selected?: Slot | null;
  onSelect?: (slot: Slot) => void;
  inviteeTimezone: string;
  isFixture?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 stagger-children">
      {slots.map(slot => {
        const isSelected = !isFixture && selected?.start === slot.start;
        return (
          <button
            key={slot.start}
            type="button"
            onClick={isFixture ? undefined : () => onSelect?.(slot)}
            aria-pressed={isSelected}
            disabled={isFixture}
            className={cn(
              'rounded-lg border px-3 py-2.5 text-sm font-medium transition',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-primary',
              isSelected
                ? 'border-accent-dark bg-accent-primary text-white shadow-slot-hover ring-[3px] ring-accent-light'
                : 'border-accent-primary bg-accent-light text-accent-dark hover:-translate-y-0.5 hover:bg-accent-primary hover:text-white hover:shadow-slot-hover',
            )}
          >
            {formatTime(slot.start, inviteeTimezone)}
          </button>
        );
      })}
    </div>
  );
}

function FallbackGrid() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="skeleton h-11" />
      ))}
    </div>
  );
}

export function TimeSlots({ slots, selected, onSelect, loading, inviteeTimezone }: TimeSlotsProps) {
  if (!loading && slots.length === 0) {
    return (
      <p className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
        No times available for this day. Try another date.
      </p>
    );
  }

  return (
    <Skeleton
      name="booking-time-slots"
      loading={loading}
      animate="shimmer"
      fallback={<FallbackGrid />}
      fixture={
        <SlotGrid
          slots={FIXTURE_SLOTS}
          inviteeTimezone={inviteeTimezone}
          isFixture
        />
      }
    >
      <SlotGrid
        slots={slots}
        selected={selected}
        onSelect={onSelect}
        inviteeTimezone={inviteeTimezone}
      />
    </Skeleton>
  );
}
