import { notFound } from 'next/navigation';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { Container } from '@/components/ui/container';
import { Logo } from '@/components/ui/logo';
import { prettyDate, prettyTimeRange } from '@/lib/timezone';
import type { Booking, EventType, Profile } from '@/lib/types';
import { CancelForm } from './cancel-form';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return { title: 'Cancel booking' };
}

export default async function CancelPage({ params }: { params: { token: string } }) {
  const admin = createSupabaseAdminClient();
  const { data: booking } = await admin
    .from('bookings')
    .select('*')
    .eq('cancellation_token', params.token)
    .maybeSingle<Booking>();
  if (!booking) notFound();

  const [{ data: profile }, { data: eventType }] = await Promise.all([
    admin.from('profiles').select('*').eq('id', booking.user_id).maybeSingle<Profile>(),
    admin.from('event_types').select('*').eq('id', booking.event_type_id).maybeSingle<EventType>(),
  ]);
  if (!profile || !eventType) notFound();

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 py-16">
      <Container width="sm">
        <div className="text-center">
          <Logo />
        </div>
        <div className="mt-8 rounded-card border border-slate-200 bg-white p-8 shadow-card">
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Cancel this booking?
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            We'll let {profile.name ?? profile.username} know and free up the slot.
          </p>

          <div className="mt-6 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
            <p className="font-semibold text-slate-900">{eventType.title}</p>
            <p className="text-slate-600">{prettyDate(booking.start_at, profile.timezone)}</p>
            <p className="text-slate-600">
              {prettyTimeRange(booking.start_at, booking.end_at, profile.timezone)} ({profile.timezone})
            </p>
          </div>

          <CancelForm
            token={params.token}
            alreadyCancelled={booking.status === 'cancelled'}
            hostUsername={profile.username}
          />
        </div>
      </Container>
    </main>
  );
}
