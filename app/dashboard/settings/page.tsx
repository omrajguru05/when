import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/dashboard/page-header';
import { ProfileForm } from './profile-form';
import { IntegrationsPanel } from './integrations-panel';
import type { Integration, Profile } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings' };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { google?: string; error?: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: integration }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle<Profile>(),
    supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .maybeSingle<Integration>(),
  ]);
  if (!profile) redirect('/login');

  const googleConfigured =
    typeof process.env.GOOGLE_CLIENT_ID === 'string' && typeof process.env.GOOGLE_CLIENT_SECRET === 'string';

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" description="Profile, timezone, and integrations." />
      <div className="space-y-10">
        <ProfileForm
          profile={profile}
          flash={
            searchParams.google === 'connected'
              ? { tone: 'success', text: 'Google Calendar connected.' }
              : searchParams.error
                ? { tone: 'error', text: `Google: ${searchParams.error}` }
                : null
          }
        />
        <IntegrationsPanel
          integration={integration ?? null}
          googleConfigured={googleConfigured}
        />
      </div>
    </div>
  );
}
