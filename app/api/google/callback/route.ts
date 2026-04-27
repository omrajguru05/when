import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server';
import { exchangeCode } from '@/lib/google/auth';
import { siteUrl } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(siteUrl(`/dashboard/settings?error=${encodeURIComponent(error)}`));
  }
  if (!code || !state) {
    return NextResponse.redirect(siteUrl('/dashboard/settings?error=missing_code'));
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== state) {
    return NextResponse.redirect(siteUrl('/login'));
  }

  try {
    const tokens = await exchangeCode(code);
    if (!tokens.access_token) {
      return NextResponse.redirect(siteUrl('/dashboard/settings?error=no_token'));
    }
    const admin = createSupabaseAdminClient();
    await admin
      .from('integrations')
      .upsert(
        {
          user_id: user.id,
          provider: 'google',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token ?? null,
          expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
          scope: tokens.scope ?? null,
          calendar_id: 'primary',
        },
        { onConflict: 'user_id,provider' },
      );
    return NextResponse.redirect(siteUrl('/dashboard/settings?google=connected'));
  } catch (err) {
    console.error('[google/callback]', err);
    return NextResponse.redirect(siteUrl('/dashboard/settings?error=oauth_failed'));
  }
}
