'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EVENT_COLOR_PALETTE, cn, slugify } from '@/lib/utils';
import type { CustomQuestion, EventType } from '@/lib/types';

type Props = { initial: EventType[]; username: string };

export function EventTypesManager({ initial, username }: Props) {
  const [items, setItems] = useState<EventType[]>(initial);
  const [editing, setEditing] = useState<EventType | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={() => setCreating(true)} size="md">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New event type
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No event types yet"
          description="Create your first event type to start receiving bookings."
          action={<Button onClick={() => setCreating(true)}>Create event type</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 stagger-children">
          {items.map(et => (
            <Card key={et.id} className="relative overflow-hidden">
              <span
                aria-hidden
                className="absolute left-0 top-0 h-full w-1"
                style={{ backgroundColor: et.color }}
              />
              <div className="pl-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{et.title}</CardTitle>
                  {!et.is_active ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Hidden
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-slate-500">
                  {et.duration_mins} min · /{et.slug}
                </p>
                {et.description ? <CardDescription className="mt-3">{et.description}</CardDescription> : null}
                <div className="mt-5 flex items-center gap-2 text-sm">
                  <Link
                    href={`/${username}/${et.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-accent-primary hover:underline"
                  >
                    Preview
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17 17 7" />
                      <path d="M7 7h10v10" />
                    </svg>
                  </Link>
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={() => setEditing(et)}
                    className="font-medium text-slate-600 hover:text-slate-900"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <EventTypeForm
          initial={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={updated => {
            setItems(prev => {
              const existing = prev.find(p => p.id === updated.id);
              if (existing) return prev.map(p => (p.id === updated.id ? updated : p));
              return [updated, ...prev];
            });
            setCreating(false);
            setEditing(null);
          }}
          onDeleted={id => {
            setItems(prev => prev.filter(p => p.id !== id));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

type FormProps = {
  initial: EventType | null;
  onClose: () => void;
  onSaved: (et: EventType) => void;
  onDeleted: (id: string) => void;
};

function EventTypeForm({ initial, onClose, onSaved, onDeleted }: FormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [duration, setDuration] = useState(String(initial?.duration_mins ?? 30));
  const [buffer, setBuffer] = useState(String(initial?.buffer_mins ?? 0));
  const [minNotice, setMinNotice] = useState(String(initial?.min_notice_mins ?? 120));
  const [description, setDescription] = useState(initial?.description ?? '');
  const [color, setColor] = useState(initial?.color ?? EVENT_COLOR_PALETTE[0].value);
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [questions, setQuestions] = useState<CustomQuestion[]>(initial?.custom_questions ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onTitleChange = (v: string) => {
    setTitle(v);
    if (!initial) setSlug(slugify(v));
  };

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      { id: crypto.randomUUID(), label: '', type: 'text', required: false },
    ]);
  };

  const updateQuestion = (id: string, patch: Partial<CustomQuestion>) => {
    setQuestions(prev => prev.map(q => (q.id === id ? { ...q, ...patch } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload = {
      ...(initial ? { id: initial.id } : {}),
      title,
      slug,
      duration_mins: Number(duration),
      buffer_mins: Number(buffer),
      min_notice_mins: Number(minNotice),
      description: description || null,
      color,
      is_active: isActive,
      custom_questions: questions.filter(q => q.label.trim().length > 0),
    };
    const res = await fetch('/api/event-types', {
      method: initial ? 'PATCH' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data?.error ?? 'Could not save.');
      return;
    }
    onSaved(data.event_type);
  };

  const onDelete = async () => {
    if (!initial) return;
    if (!confirm(`Delete "${initial.title}"? This will cancel all upcoming bookings on it.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/event-types?id=${initial.id}`, { method: 'DELETE' });
    setDeleting(false);
    if (res.ok) onDeleted(initial.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={e => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-card border border-slate-200 bg-white p-6 shadow-xl animate-slide-in-up"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-slate-900">
            {initial ? 'Edit event type' : 'New event type'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="title" className="mb-1.5">
              Title
            </Label>
            <Input
              id="title"
              required
              value={title}
              onChange={e => onTitleChange(e.target.value)}
              placeholder="30 minute meeting"
            />
          </div>
          <div>
            <Label htmlFor="slug" className="mb-1.5">
              URL slug
            </Label>
            <Input
              id="slug"
              required
              value={slug}
              onChange={e => setSlug(slugify(e.target.value))}
              placeholder="30min"
            />
            <p className="mt-1 font-mono text-xs text-slate-400">/{slug}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="duration" className="mb-1.5">
                Duration
              </Label>
              <Select id="duration" value={duration} onChange={e => setDuration(e.target.value)}>
                {[15, 20, 30, 45, 60, 90, 120].map(d => (
                  <option key={d} value={d}>
                    {d} min
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="buffer" className="mb-1.5">
                Buffer
              </Label>
              <Select id="buffer" value={buffer} onChange={e => setBuffer(e.target.value)}>
                {[0, 5, 10, 15, 30].map(d => (
                  <option key={d} value={d}>
                    {d} min
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="notice" className="mb-1.5">
                Min notice
              </Label>
              <Select
                id="notice"
                value={minNotice}
                onChange={e => setMinNotice(e.target.value)}
              >
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={240}>4 hours</option>
                <option value={1440}>1 day</option>
                <option value={2880}>2 days</option>
              </Select>
            </div>
          </div>
          <div>
            <Label className="mb-1.5">Color</Label>
            <div className="flex flex-wrap gap-2">
              {EVENT_COLOR_PALETTE.map(c => (
                <button
                  key={c.value}
                  type="button"
                  aria-label={c.name}
                  onClick={() => setColor(c.value)}
                  className={cn(
                    'h-8 w-8 rounded-full ring-offset-2 transition',
                    color === c.value
                      ? 'ring-2 ring-slate-900'
                      : 'ring-1 ring-slate-200 hover:scale-110',
                  )}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="description" className="mb-1.5">
              Description <span className="font-normal text-slate-400">(optional)</span>
            </Label>
            <Textarea
              id="description"
              rows={3}
              value={description ?? ''}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's this meeting about?"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-900">Custom questions</p>
              <button
                type="button"
                onClick={addQuestion}
                className="text-xs font-semibold text-accent-primary hover:underline"
              >
                + Add question
              </button>
            </div>
            {questions.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">
                Ask invitees for additional info beyond name and email.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {questions.map(q => (
                  <li key={q.id} className="flex flex-wrap items-center gap-2">
                    <Input
                      value={q.label}
                      onChange={e => updateQuestion(q.id, { label: e.target.value })}
                      placeholder="Question label"
                      className="flex-1 min-w-[180px]"
                    />
                    <Select
                      value={q.type}
                      onChange={e => updateQuestion(q.id, { type: e.target.value as 'text' | 'textarea' })}
                      className="w-32"
                    >
                      <option value="text">Short text</option>
                      <option value="textarea">Long text</option>
                    </Select>
                    <label className="inline-flex items-center gap-1 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        className="accent-accent-primary"
                        checked={q.required}
                        onChange={e => updateQuestion(q.id, { required: e.target.checked })}
                      />
                      required
                    </label>
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                      aria-label="Remove"
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

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 accent-accent-primary"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
            />
            Active (visible on your booking page)
          </label>

          {error ? <Alert tone="error">{error}</Alert> : null}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          {initial ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="text-sm font-medium text-error hover:underline disabled:opacity-60"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              {initial ? 'Save changes' : 'Create event type'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
