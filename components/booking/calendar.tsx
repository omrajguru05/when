'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

const SHORT_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type CalendarProps = {
  monthDate: Date;
  selectedDateISO: string | null;
  onSelectDate: (iso: string) => void;
  onChangeMonth: (delta: number) => void;
  disablePast?: boolean;
  daysWithSlots?: Set<string>;
};

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function isoOf(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function todayLocal() {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}

export function Calendar({
  monthDate,
  selectedDateISO,
  onSelectDate,
  onChangeMonth,
  disablePast = true,
  daysWithSlots,
}: CalendarProps) {
  const cells = useMemo(() => {
    const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const startDow = firstOfMonth.getDay();
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const list: { date: Date | null }[] = [];
    for (let i = 0; i < startDow; i++) list.push({ date: null });
    for (let d = 1; d <= daysInMonth; d++) {
      list.push({ date: new Date(monthDate.getFullYear(), monthDate.getMonth(), d) });
    }
    while (list.length % 7 !== 0) list.push({ date: null });
    return list;
  }, [monthDate]);

  const today = todayLocal();

  return (
    <div className="rounded-card border border-slate-200 bg-white p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onChangeMonth(-1)}
          className="grid h-9 w-9 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-primary"
          aria-label="Previous month"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h3 className="font-heading text-base font-semibold text-slate-900">
          {MONTHS[monthDate.getMonth()]} {monthDate.getFullYear()}
        </h3>
        <button
          type="button"
          onClick={() => onChangeMonth(1)}
          className="grid h-9 w-9 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-primary"
          aria-label="Next month"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
        {SHORT_DAYS.map(d => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell.date) {
            return <div key={`empty-${i}`} className="h-10" />;
          }
          const iso = isoOf(cell.date);
          const isPast = disablePast && cell.date < today;
          const selected = iso === selectedDateISO;
          const hasSlots = daysWithSlots ? daysWithSlots.has(iso) : true;
          const disabled = isPast || (daysWithSlots ? !hasSlots : false);
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(iso)}
              aria-pressed={selected}
              aria-label={`Select ${iso}`}
              className={cn(
                'relative grid h-10 place-items-center rounded-md text-sm font-medium transition',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-primary',
                disabled && 'cursor-not-allowed text-slate-300',
                !disabled && !selected && 'text-slate-700 hover:bg-accent-light hover:text-accent-dark',
                selected && 'bg-accent-primary text-white shadow-slot-hover',
              )}
            >
              {cell.date.getDate()}
              {hasSlots && !selected && !disabled ? (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-accent-primary" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
