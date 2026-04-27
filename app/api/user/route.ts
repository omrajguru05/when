import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isValidHexColor, slugify } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const update: Record<string, unknown> = {};

  if (typeof body.name === 'string') update.name = body.name.trim().slice(0, 120);
  if (typeof body.bio === 'string' || body.bio === null) {
    update.bio = body.bio ? String(body.bio).slice(0, 500) : null;
  }
  if (typeof body.timezone === 'string') update.timezone = body.timezone.slice(0, 64);
  if (typeof body.avatar_url === 'string' || body.avatar_url === null) {
    update.avatar_url = body.avatar_url || null;
  }
  if (typeof body.accent_color === 'string' && isValidHexColor(body.accent_color)) {
    update.accent_color = body.accent_color;
  }

  if (typeof body.username === 'string') {
    const desired = slugify(body.username);
    if (!desired || desired.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
    }
    if (['login', 'dashboard', 'auth', 'api', 'booking', 'admin', 'settings'].includes(desired)) {
      return NextResponse.json({ error: 'Username is reserved' }, { status: 400 });
    }
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', desired)
      .maybeSingle<{ id: string }>();
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }
    update.username = desired;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', user.id)
    .select('*')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}
