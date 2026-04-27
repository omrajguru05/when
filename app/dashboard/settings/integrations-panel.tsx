'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Integration } from '@/lib/types';

type Props = {
  integration: Integration | null;
  googleConfigured: boolean;
};

export function IntegrationsPanel({ integration, googleConfigured }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [disconnecting, setDisconnecting] = useState(false);

  const onDisconnect = async () => {
    if (!confirm('Disconnect Google Calendar? Future bookings will no longer block existing events.')) return;
    setDisconnecting(true);
    const res = await fetch('/api/google/disconnect', { method: 'POST' });
    setDisconnecting(false);
    if (res.ok) startTransition(() => router.refresh());
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-slate-100">
            <GoogleCalendarIcon />
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold text-slate-900">Google Calendar</h2>
            <p className="text-sm text-slate-500">
              Read busy events to prevent conflicts. New bookings appear in your primary calendar.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!googleConfigured ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Not configured
            </span>
          ) : integration ? (
            <>
              <span className="rounded-full bg-success-light px-3 py-1 text-xs font-semibold uppercase tracking-wider text-success-dark">
                Connected
              </span>
              <Button variant="ghost" size="sm" onClick={onDisconnect} isLoading={disconnecting}>
                Disconnect
              </Button>
            </>
          ) : (
            <a href="/api/google/connect">
              <Button size="sm">Connect Google</Button>
            </a>
          )}
        </div>
      </div>
      {!googleConfigured ? (
        <div className="mt-4">
          <Alert tone="info" title="Google credentials missing">
            Set <code className="font-mono text-xs">GOOGLE_CLIENT_ID</code> and{' '}
            <code className="font-mono text-xs">GOOGLE_CLIENT_SECRET</code> in your environment to enable
            Google Calendar sync. See the README for setup steps.
          </Alert>
        </div>
      ) : null}
    </Card>
  );
}

function GoogleCalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="17" rx="2" stroke="#475569" strokeWidth="1.5" />
      <line x1="3" y1="10" x2="21" y2="10" stroke="#475569" strokeWidth="1.5" />
      <line x1="8" y1="2" x2="8" y2="6" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="2" x2="16" y2="6" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="15" r="2" fill="#3b82f6" />
    </svg>
  );
}
