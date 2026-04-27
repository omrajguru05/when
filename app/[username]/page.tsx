import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { PublicHostHeader, PublicShell } from '@/components/booking/public-shell';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import type { EventType, Profile } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { username: string } }) {
  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('name, username, bio')
    .eq('username', params.username)
    .maybeSingle();
  const name = (profile as Profile | null)?.name ?? params.username;
  return {
    title: `Book time with ${name}`,
    description: (profile as Profile | null)?.bio ?? `Schedule a meeting with ${name}.`,
  };
}

export default async function HostPage({ params }: { params: { username: string } }) {
  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .maybeSingle<Profile>();
  if (!profile) notFound();

  const { data: eventTypes } = await admin
    .from('event_types')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('duration_mins', { ascending: true });

  return (
    <PublicShell profile={profile}>
      <PublicHostHeader profile={profile} />

      {eventTypes && eventTypes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 stagger-children">
          {(eventTypes as EventType[]).map(et => (
            <Link key={et.id} href={`/${profile.username}/${et.slug}`} className="group block">
              <Card interactive className="h-full">
                <span
                  aria-hidden
                  className="mb-3 inline-block h-1 w-10 rounded-full"
                  style={{ backgroundColor: et.color }}
                />
                <CardTitle className="group-hover:text-accent-primary transition-colors">
                  {et.title}
                </CardTitle>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                  {et.duration_mins} min
                </p>
                {et.description ? (
                  <CardDescription className="mt-3">{et.description}</CardDescription>
                ) : null}
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No event types yet"
          description={`${profile.name ?? profile.username} hasn't published any meeting types.`}
        />
      )}
    </PublicShell>
  );
}
