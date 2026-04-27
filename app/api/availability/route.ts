import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Window = { day_of_week: number; start_time: string; end_time: string };

function isHhmm(s: unknown) {
  return typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
}

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .order('day_of_week', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ availability: data });
}

export async function PUT(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const windows: Window[] = Array.isArray(body.windows) ? body.windows : [];

  const valid = windows.filter(w => {
    return (
      Number.isInteger(w.day_of_week) &&
      w.day_of_week >= 0 &&
      w.day_of_week <= 6 &&
      isHhmm(w.start_time) &&
      isHhmm(w.end_time) &&
      w.start_time < w.end_time
    );
  });

  if (valid.length !== windows.length) {
    return NextResponse.json({ error: 'Invalid window detected' }, { status: 400 });
  }

  await supabase.from('availability').delete().eq('user_id', user.id);
  if (valid.length > 0) {
    const rows = valid.map(w => ({ ...w, user_id: user.id }));
    const { error: insertErr } = await supabase.from('availability').insert(rows);
    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
