'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { prettyTimeRange } from '@/lib/timezone';
import { cn } from '@/lib/utils';
import type { Booking, EventType } from '@/lib/types';

type Row = Booking & { event_types: Pick<EventType, 'title' | 'color'> | null };

type Props = {
  booking: Row;
  timezone: string;
  muted?: boolean;
};

export function BookingRow({ booking, timezone, muted }: Props) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();
  const cancelled = booking.status === 'cancelled';

  const onCancel = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    const res = await fetch(`/api/bookings?id=${booking.id}`, { method: 'DELETE' });
    if (res.ok) {
      startTransition(() => router.refresh());
    }
    setConfirming(false);
  };

  return (
    <li
      className={cn(
        'group flex items-center justify-between gap-4 rounded-card border border-slate-200 bg-white p-4 transition hover:border-slate-300',
        muted && 'opacity-70',
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        <span
          aria-hidden
          className="h-8 w-1 rounded-full"
          style={{ backgroundColor: booking.event_types?.color ?? '#3b82f6' }}
        />
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">
            {booking.event_types?.title ?? 'Booking'}
            <span className="ml-2 font-normal text-slate-500">· {booking.invitee_name}</span>
          </p>
          <p className="text-xs text-slate-500">
            {prettyTimeRange(booking.start_at, booking.end_at, timezone)} · {booking.invitee_email}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {cancelled ? (
          <Badge tone="error">Cancelled</Badge>
        ) : (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className={cn(
              'rounded-md border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline focus-visible:outline-accent-primary',
              confirming
                ? 'border-error bg-error text-white hover:bg-error-dark'
                : 'border-slate-200 text-slate-600 opacity-0 hover:border-error hover:text-error group-hover:opacity-100',
            )}
          >
            {confirming ? 'Confirm cancel' : 'Cancel'}
          </button>
        )}
      </div>
    </li>
  );
}
