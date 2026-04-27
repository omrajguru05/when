import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/dashboard/page-header';
import { AvailabilityEditor } from './availability-editor';
import { BlockedSlotManager } from './blocked-slot-manager';
import type { Availability, BlockedSlot, Profile } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Availability' };

export default async function AvailabilityPage() {
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

  const [{ data: availability }, { data: blocked }] = await Promise.all([
    supabase.from('availability').select('*').order('day_of_week', { ascending: true }),
    supabase
      .from('blocked_slots')
      .select('*')
      .gte('end_at', new Date().toISOString())
      .order('start_at', { ascending: true }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Availability"
        description={`Times shown in ${profile.timezone}. Change your timezone in Settings.`}
      />
      <div className="space-y-10">
        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-slate-900">Weekly hours</h2>
          <AvailabilityEditor initial={(availability ?? []) as Availability[]} />
        </section>
        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-slate-900">Blocked dates</h2>
          <BlockedSlotManager
            initial={(blocked ?? []) as BlockedSlot[]}
            timezone={profile.timezone}
          />
        </section>
      </div>
    </div>
  );
}
