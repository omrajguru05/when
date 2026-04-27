'use client';

import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { prettyDate, prettyTimeRange } from '@/lib/timezone';
import type { BlockedSlot } from '@/lib/types';

type Props = { initial: BlockedSlot[]; timezone: string };

export function BlockedSlotManager({ initial, timezone }: Props) {
  const [items, setItems] = useState<BlockedSlot[]>(initial);
  const [date, setDate] = useState('');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('17:00');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch('/api/blocked-slots', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ date, start_time: start, end_time: end, reason: reason || null }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data?.error ?? 'Could not add.');
      return;
    }
    setItems(prev =>
      [...prev, data.blocked].sort((a, b) => a.start_at.localeCompare(b.start_at)),
    );
    setReason('');
  };

  const onRemove = async (id: string) => {
    const res = await fetch(`/api/blocked-slots?id=${id}`, { method: 'DELETE' });
    if (res.ok) setItems(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-4">
      <Card>
        <form onSubmit={onAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr,1fr,1fr,auto]">
          <div>
            <Label className="mb-1.5">Date</Label>
            <Input type="date" required value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5">From</Label>
            <Input type="time" required value={start} onChange={e => setStart(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5">To</Label>
            <Input type="time" required value={end} onChange={e => setEnd(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button type="submit" isLoading={submitting} className="w-full">
              Block
            </Button>
          </div>
          <div className="sm:col-span-4">
            <Label className="mb-1.5">Reason (optional)</Label>
            <Input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Holiday, focus time, …"
            />
          </div>
        </form>
        {error ? (
          <div className="mt-3">
            <Alert tone="error">{error}</Alert>
          </div>
        ) : null}
      </Card>

      {items.length === 0 ? (
        <EmptyState title="No blocked dates" description="Add ad-hoc blocks for time off." />
      ) : (
        <ul className="space-y-2">
          {items.map(item => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-card border border-slate-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-slate-900">{prettyDate(item.start_at, timezone)}</p>
                <p className="text-xs text-slate-500">
                  {prettyTimeRange(item.start_at, item.end_at, timezone)}
                  {item.reason ? ` · ${item.reason}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-error-light hover:text-error-dark"
                aria-label="Remove block"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
