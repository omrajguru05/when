import { NextResponse, type NextRequest } from 'next/server';
import { fromZonedTime } from 'date-fns-tz';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const date = String(body.date ?? '');
  const start_time = String(body.start_time ?? '');
  const end_time = String(body.end_time ?? '');
  const reason = body.reason ? String(body.reason).slice(0, 200) : null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(start_time) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(end_time)) {
    return NextResponse.json({ error: 'Invalid time' }, { status: 400 });
  }
  if (start_time >= end_time) {
    return NextResponse.json({ error: 'start_time must be before end_time' }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<Profile>();
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const startUtc = fromZonedTime(`${date}T${start_time}:00`, profile.timezone);
  const endUtc = fromZonedTime(`${date}T${end_time}:00`, profile.timezone);

  const { data, error } = await supabase
    .from('blocked_slots')
    .insert({
      user_id: user.id,
      start_at: startUtc.toISOString(),
      end_at: endUtc.toISOString(),
      reason,
    })
    .select('*')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ blocked: data });
}

export async function DELETE(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  const { error } = await supabase
    .from('blocked_slots')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
