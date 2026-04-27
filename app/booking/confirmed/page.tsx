import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Logo } from '@/components/ui/logo';
import { prettyDate, prettyTimeRange } from '@/lib/timezone';
import type { Booking, EventType, Profile } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return { title: 'Booking confirmed' };
}

export default async function ConfirmedPage({
  searchParams,
}: {
  searchParams: { token?: string; host?: string };
}) {
  const token = searchParams.token;
  if (!token) notFound();

  const admin = createSupabaseAdminClient();
  const { data: booking } = await admin
    .from('bookings')
    .select('*')
    .eq('cancellation_token', token)
    .maybeSingle<Booking>();
  if (!booking) notFound();

  const [{ data: profile }, { data: eventType }] = await Promise.all([
    admin.from('profiles').select('*').eq('id', booking.user_id).maybeSingle<Profile>(),
    admin.from('event_types').select('*').eq('id', booking.event_type_id).maybeSingle<EventType>(),
  ]);
  if (!profile || !eventType) notFound();

  const tz = profile.timezone;
  const cancelled = booking.status === 'cancelled';

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 py-16">
      <Container width="sm">
        <div className="text-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="mt-8 rounded-card border border-slate-200 bg-white p-8 shadow-card animate-slide-in-up">
          {cancelled ? (
            <>
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-error-light text-error-dark">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </svg>
              </div>
              <h1 className="font-display mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
                Booking cancelled
              </h1>
              <p className="mt-2 text-center text-sm text-slate-500">
                We've notified everyone. Feel free to book another time.
              </p>
            </>
          ) : (
            <>
              <div
                className="mx-auto grid h-12 w-12 place-items-center rounded-full"
                style={{ backgroundColor: eventType.color, color: 'white' }}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="font-display mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
                You're booked.
              </h1>
              <p className="mt-2 text-center text-sm text-slate-500">
                A confirmation is on its way to <strong>{booking.invitee_email}</strong>.
              </p>
            </>
          )}

          <div className="mt-8 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
            <Row label="Event" value={eventType.title} />
            <Row label="With" value={profile.name ?? profile.username} />
            <Row label="Date" value={prettyDate(booking.start_at, tz)} />
            <Row label="Time" value={`${prettyTimeRange(booking.start_at, booking.end_at, tz)} (${tz})`} />
            {booking.invitee_note ? <Row label="Note" value={booking.invitee_note} /> : null}
          </div>

          {!cancelled ? (
            <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Link href={`/booking/cancel/${booking.cancellation_token}`}>
                <Button variant="secondary" size="md" className="w-full">
                  Cancel booking
                </Button>
              </Link>
              <Link href={`/${profile.username}`}>
                <Button variant="ghost" size="md" className="w-full">
                  Book another time
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </Container>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      <span className="text-right text-sm text-slate-900">{value}</span>
    </div>
  );
}
