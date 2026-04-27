import { notFound } from 'next/navigation';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { PublicHostHeader, PublicShell } from '@/components/booking/public-shell';
import { BookingFlow } from '@/components/booking/booking-flow';
import type { EventType, Profile } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { username: string; slug: string };
}) {
  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('id, name, username')
    .eq('username', params.username)
    .maybeSingle();
  if (!profile) return { title: 'Not found' };
  const { data: event } = await admin
    .from('event_types')
    .select('title, description')
    .eq('user_id', (profile as { id: string }).id)
    .eq('slug', params.slug)
    .maybeSingle();
  return {
    title: `${(event as { title?: string } | null)?.title ?? 'Book'} · ${(profile as { name?: string; username: string }).name ?? params.username}`,
    description: (event as { description?: string } | null)?.description ?? undefined,
  };
}

export default async function EventTypePage({
  params,
}: {
  params: { username: string; slug: string };
}) {
  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .maybeSingle<Profile>();
  if (!profile) notFound();

  const { data: eventType } = await admin
    .from('event_types')
    .select('*')
    .eq('user_id', profile.id)
    .eq('slug', params.slug)
    .eq('is_active', true)
    .maybeSingle<EventType>();
  if (!eventType) notFound();

  return (
    <PublicShell profile={profile} accentColor={eventType.color}>
      <PublicHostHeader profile={profile} />
      <BookingFlow profile={profile} eventType={eventType} />
    </PublicShell>
  );
}
