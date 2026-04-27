'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from './calendar';
import { TimeSlots } from './time-slots';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { detectBrowserTimezone, prettyDate, prettyTimeRange, TIMEZONE_OPTIONS } from '@/lib/timezone';
import { isValidEmail } from '@/lib/utils';
import type { CustomQuestion, EventType, Profile, Slot } from '@/lib/types';

type BookingFlowProps = {
  profile: Pick<Profile, 'username' | 'name' | 'timezone' | 'accent_color'>;
  eventType: Pick<
    EventType,
    'title' | 'slug' | 'description' | 'duration_mins' | 'color' | 'custom_questions'
  >;
};

type Step = 'date' | 'form';

function isoToday() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

export function BookingFlow({ profile, eventType }: BookingFlowProps) {
  const [tz, setTz] = useState(profile.timezone);
  const [monthDate, setMonthDate] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [step, setStep] = useState<Step>('date');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setTz(detectBrowserTimezone(profile.timezone));
  }, [profile.timezone]);

  const customQuestions = (eventType.custom_questions ?? []) as CustomQuestion[];

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    const url = `/api/slots?username=${encodeURIComponent(profile.username)}&event=${encodeURIComponent(eventType.slug)}&date=${encodeURIComponent(selectedDate)}`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        setSlots(Array.isArray(data?.slots) ? data.slots : []);
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, profile.username, eventType.slug]);

  const handleSelectDate = (iso: string) => {
    setSelectedDate(iso);
  };

  const handleChangeMonth = (delta: number) => {
    setMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const onContinue = () => {
    if (!selectedSlot) return;
    setStep('form');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedSlot) return;
    if (!name.trim() || !isValidEmail(email)) {
      setError('Please enter your name and a valid email.');
      return;
    }
    for (const q of customQuestions) {
      if (q.required && !(answers[q.id] ?? '').trim()) {
        setError(`Please answer: ${q.label}`);
        return;
      }
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          username: profile.username,
          event_slug: eventType.slug,
          start_at: selectedSlot.start,
          end_at: selectedSlot.end,
          invitee_name: name.trim(),
          invitee_email: email.trim(),
          invitee_note: note.trim() || undefined,
          custom_answers: answers,
          invitee_timezone: tz,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? 'Could not create booking.');
        setSubmitting(false);
        return;
      }
      const params = new URLSearchParams({
        token: data.booking.cancellation_token,
        host: profile.username,
      });
      router.push(`/booking/confirmed?${params.toString()}`);
    } catch (err: any) {
      setError(err?.message ?? 'Network error.');
      setSubmitting(false);
    }
  };

  const headerColor = eventType.color ?? '#3b82f6';

  return (
    <div
      className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,1.2fr]"
      style={{ ['--color-accent-primary' as string]: headerColor }}
    >
      <aside className="rounded-card border border-slate-200 bg-white p-6">
        <span
          aria-hidden
          className="mb-3 inline-block h-1.5 w-12 rounded-full"
          style={{ backgroundColor: headerColor }}
        />
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          {eventType.title}
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-500">{eventType.duration_mins} minutes</p>
        {eventType.description ? (
          <p className="mt-4 text-sm leading-relaxed text-slate-600">{eventType.description}</p>
        ) : null}

        {selectedSlot ? (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Selected</p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {prettyDate(selectedSlot.start, tz)}
            </p>
            <p className="text-sm text-slate-600">
              {prettyTimeRange(selectedSlot.start, selectedSlot.end, tz)}
            </p>
          </div>
        ) : null}

        <div className="mt-6">
          <Label htmlFor="tz" className="mb-1.5 text-xs uppercase tracking-wider">
            Your timezone
          </Label>
          <Select id="tz" value={tz} onChange={e => setTz(e.target.value)}>
            {[tz, ...TIMEZONE_OPTIONS.filter(t => t !== tz)].map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
      </aside>

      <section>
        {step === 'date' ? (
          <div className="space-y-6">
            <Calendar
              monthDate={monthDate}
              selectedDateISO={selectedDate}
              onSelectDate={handleSelectDate}
              onChangeMonth={handleChangeMonth}
            />
            {selectedDate ? (
              <div className="rounded-card border border-slate-200 bg-white p-6">
                <p className="mb-4 text-sm font-medium text-slate-700">
                  {prettyDate(`${selectedDate}T12:00:00Z`, tz).replace(' UTC', '')}
                </p>
                <TimeSlots
                  slots={slots}
                  selected={selectedSlot}
                  onSelect={setSelectedSlot}
                  loading={loadingSlots}
                  inviteeTimezone={tz}
                />
              </div>
            ) : (
              <p className="rounded-lg bg-white p-8 text-center text-sm text-slate-500 shadow-card">
                Pick a date to see available times.
              </p>
            )}
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={!selectedSlot}
              onClick={onContinue}
            >
              Continue
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5 rounded-card border border-slate-200 bg-white p-6">
            <button
              type="button"
              onClick={() => setStep('date')}
              className="-ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Pick another time
            </button>
            <div>
              <Label htmlFor="name" className="mb-1.5">
                Your name
              </Label>
              <Input
                id="name"
                required
                autoComplete="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ada Lovelace"
              />
            </div>
            <div>
              <Label htmlFor="email" className="mb-1.5">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ada@example.com"
              />
            </div>
            <div>
              <Label htmlFor="note" className="mb-1.5">
                Anything you'd like to share? <span className="font-normal text-slate-400">(optional)</span>
              </Label>
              <Textarea
                id="note"
                rows={3}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="What would you like to discuss?"
              />
            </div>
            {customQuestions.map(q => (
              <div key={q.id}>
                <Label htmlFor={`q-${q.id}`} className="mb-1.5">
                  {q.label}
                  {q.required ? <span className="ml-1 text-error">*</span> : null}
                </Label>
                {q.type === 'textarea' ? (
                  <Textarea
                    id={`q-${q.id}`}
                    rows={3}
                    required={q.required}
                    value={answers[q.id] ?? ''}
                    onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  />
                ) : (
                  <Input
                    id={`q-${q.id}`}
                    required={q.required}
                    value={answers[q.id] ?? ''}
                    onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  />
                )}
              </div>
            ))}

            {error ? (
              <Alert tone="error" title="Couldn't book">
                {error}
              </Alert>
            ) : null}

            <Button type="submit" size="lg" className="w-full" isLoading={submitting}>
              Confirm booking
            </Button>
            <p className="text-center text-xs text-slate-400">
              By booking you agree to receive emails about this meeting.
            </p>
          </form>
        )}
      </section>
    </div>
  );
}

export { isoToday };
