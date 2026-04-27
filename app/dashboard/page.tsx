import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/dashboard/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { BookingRow } from './bookings/booking-row';
import { prettyDate } from '@/lib/timezone';
import type { Booking, EventType, Profile } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Bookings' };

type BookingWithEvent = Booking & { event_types: Pick<EventType, 'title' | 'color'> | null };

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<Profile>();
  if (!profile) redirect('/login');

  const nowISO = new Date().toISOString();

  const [{ data: upcoming }, { data: past }] = await Promise.all([
    supabase
      .from('bookings')
      .select('*, event_types(title, color)')
      .gte('start_at', nowISO)
      .order('start_at', { ascending: true })
      .limit(50),
    supabase
      .from('bookings')
      .select('*, event_types(title, color)')
      .lt('start_at', nowISO)
      .order('start_at', { ascending: false })
      .limit(20),
  ]);

  const upcomingTyped = (upcoming ?? []) as BookingWithEvent[];
  const pastTyped = (past ?? []) as BookingWithEvent[];
  const confirmedUpcoming = upcomingTyped.filter(b => b.status === 'confirmed');

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={`Hi, ${(profile.name ?? profile.username).split(' ')[0]} 👋`}
        description="Your bookings, at a glance."
        actions={
          <Link href={`/${profile.username}`} target="_blank" rel="noreferrer">
            <Button variant="secondary" size="sm">
              Share booking link
            </Button>
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Upcoming" value={confirmedUpcoming.length} />
        <Stat
          label="This week"
          value={
            confirmedUpcoming.filter(
              b =>
                Date.parse(b.start_at) <
                Date.now() + 7 * 24 * 60 * 60 * 1000,
            ).length
          }
        />
        <Stat label="Cancelled" value={upcomingTyped.filter(b => b.status === 'cancelled').length} />
      </div>

      <section className="mb-12">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-slate-900">Upcoming</h2>
          <Badge tone="accent">{confirmedUpcoming.length}</Badge>
        </div>
        {upcomingTyped.length === 0 ? (
          <EmptyState
            title="No upcoming bookings"
            description="Once people book time with you, they'll show up here."
            action={
              <Link href="/dashboard/event-types">
                <Button>Manage event types</Button>
              </Link>
            }
          />
        ) : (
          <GroupedList bookings={upcomingTyped} timezone={profile.timezone} />
        )}
      </section>

      {pastTyped.length > 0 ? (
        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-slate-900">Past</h2>
          <GroupedList bookings={pastTyped} timezone={profile.timezone} muted />
        </section>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

function GroupedList({
  bookings,
  timezone,
  muted,
}: {
  bookings: BookingWithEvent[];
  timezone: string;
  muted?: boolean;
}) {
  const groups = new Map<string, BookingWithEvent[]>();
  for (const b of bookings) {
    const date = prettyDate(b.start_at, timezone);
    const list = groups.get(date) ?? [];
    list.push(b);
    groups.set(date, list);
  }
  return (
    <div className="space-y-6">
      {[...groups.entries()].map(([date, list]) => (
        <div key={date}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {date}
          </p>
          <ul className="space-y-2">
            {list.map(b => (
              <BookingRow key={b.id} booking={b} timezone={timezone} muted={muted} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
