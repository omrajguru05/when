import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';
import type { Profile } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
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

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar profile={profile} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar profile={profile} />
        <div className="flex-1 px-4 py-8 sm:px-6 lg:px-10 animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
