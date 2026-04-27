import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { googleAuthUrl } from '@/lib/google/auth';
import { siteUrl } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(siteUrl('/login'));
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(siteUrl('/dashboard/settings?error=google_not_configured'));
  }
  const url = googleAuthUrl(user.id);
  return NextResponse.redirect(url);
}
