'use client';

import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { DAYS_OF_WEEK } from '@/lib/utils';
import type { Availability } from '@/lib/types';

type Window = { day_of_week: number; start_time: string; end_time: string };

const defaultWindow = (day: number): Window => ({
  day_of_week: day,
  start_time: '09:00',
  end_time: '17:00',
});

function trimSeconds(t: string) {
  return t.length > 5 ? t.slice(0, 5) : t;
}

function groupByDay(items: Availability[]): Record<number, Window[]> {
  const out: Record<number, Window[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  for (const a of items) {
    out[a.day_of_week].push({
      day_of_week: a.day_of_week,
      start_time: trimSeconds(a.start_time),
      end_time: trimSeconds(a.end_time),
    });
  }
  return out;
}

export function AvailabilityEditor({ initial }: { initial: Availability[] }) {
  const [days, setDays] = useState<Record<number, Window[]>>(groupByDay(initial));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const toggleDay = (day: number, enable: boolean) => {
    setDays(prev => ({ ...prev, [day]: enable ? [defaultWindow(day)] : [] }));
  };

  const addWindow = (day: number) => {
    setDays(prev => ({
      ...prev,
      [day]: [...prev[day], defaultWindow(day)],
    }));
  };

  const updateWindow = (day: number, idx: number, patch: Partial<Window>) => {
    setDays(prev => ({
      ...prev,
      [day]: prev[day].map((w, i) => (i === idx ? { ...w, ...patch } : w)),
    }));
  };

  const removeWindow = (day: number, idx: number) => {
    setDays(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== idx),
    }));
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const windows: Window[] = Object.values(days).flat();
    const res = await fetch('/api/availability', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ windows }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage({ tone: 'success', text: 'Saved.' });
    } else {
      const data = await res.json().catch(() => ({}));
      setMessage({ tone: 'error', text: data?.error ?? 'Could not save.' });
    }
  };

  return (
    <Card>
      <div className="space-y-3">
        {DAYS_OF_WEEK.map((label, day) => {
          const windows = days[day];
          const enabled = windows.length > 0;
          return (
            <div
              key={day}
              className="flex flex-wrap items-start gap-3 border-b border-slate-100 py-3 last:border-0"
            >
              <label className="flex w-32 shrink-0 items-center gap-2 text-sm font-medium text-slate-900">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-accent-primary"
                  checked={enabled}
                  onChange={e => toggleDay(day, e.target.checked)}
                />
                {label}
              </label>
              {!enabled ? (
                <span className="text-sm text-slate-400">Unavailable</span>
              ) : (
                <div className="flex-1 space-y-2">
                  {windows.map((w, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={w.start_time}
                        onChange={e => updateWindow(day, idx, { start_time: e.target.value })}
                        className="w-28"
                      />
                      <span className="text-slate-400">–</span>
                      <Input
                        type="time"
                        value={w.end_time}
                        onChange={e => updateWindow(day, idx, { end_time: e.target.value })}
                        className="w-28"
                      />
                      <button
                        type="button"
                        onClick={() => removeWindow(day, idx)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Remove window"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="6" y1="6" x2="18" y2="18" />
                          <line x1="6" y1="18" x2="18" y2="6" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addWindow(day)}
                    className="text-xs font-semibold text-accent-primary hover:underline"
                  >
                    + Add another window
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {message ? (
        <div className="mt-4">
          <Alert tone={message.tone}>{message.text}</Alert>
        </div>
      ) : null}
      <div className="mt-6 flex justify-end">
        <Button onClick={save} isLoading={saving}>
          Save availability
        </Button>
      </div>
    </Card>
  );
}
