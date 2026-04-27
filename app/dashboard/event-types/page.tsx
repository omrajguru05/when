import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/dashboard/page-header';
import { EventTypesManager } from './event-types-manager';
import type { EventType, Profile } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Event types' };

export default async function EventTypesPage() {
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

  const { data: eventTypes } = await supabase
    .from('event_types')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Event types"
        description="Each event type is a bookable link with its own duration, color, and rules."
      />
      <EventTypesManager
        initial={(eventTypes ?? []) as EventType[]}
        username={profile.username}
      />
    </div>
  );
}
