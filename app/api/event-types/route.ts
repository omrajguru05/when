import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isValidHexColor, slugify } from '@/lib/utils';
import type { CustomQuestion } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function sanitizeQuestions(input: unknown): CustomQuestion[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((q): q is Record<string, unknown> => Boolean(q) && typeof q === 'object')
    .map<CustomQuestion>(q => ({
      id: String(q.id ?? crypto.randomUUID()).slice(0, 64),
      label: String(q.label ?? '').slice(0, 200),
      type: q.type === 'textarea' ? 'textarea' : 'text',
      required: Boolean(q.required),
    }))
    .filter(q => q.label.length > 0)
    .slice(0, 10);
}

export async function GET() {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { data, error } = await supabase
    .from('event_types')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event_types: data });
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const title = String(body.title ?? '').trim().slice(0, 100);
  const description = body.description ? String(body.description).slice(0, 1000) : null;
  const duration_mins = Number(body.duration_mins);
  const buffer_mins = Number(body.buffer_mins ?? 0);
  const min_notice_mins = Number(body.min_notice_mins ?? 120);
  const color = isValidHexColor(String(body.color ?? '')) ? body.color : '#3b82f6';
  const is_active = body.is_active !== false;
  const requestedSlug = body.slug ? slugify(String(body.slug)) : slugify(title);
  const custom_questions = sanitizeQuestions(body.custom_questions);

  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  if (!Number.isFinite(duration_mins) || duration_mins < 5 || duration_mins > 480) {
    return NextResponse.json({ error: 'Duration must be 5–480 mins' }, { status: 400 });
  }
  if (buffer_mins < 0 || buffer_mins > 240) {
    return NextResponse.json({ error: 'Buffer must be 0–240 mins' }, { status: 400 });
  }
  if (min_notice_mins < 0) {
    return NextResponse.json({ error: 'Min notice must be ≥ 0' }, { status: 400 });
  }

  let slug = requestedSlug || 'event';
  for (let i = 0; i < 25; i++) {
    const { data: existing } = await supabase
      .from('event_types')
      .select('id')
      .eq('user_id', user.id)
      .eq('slug', slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${requestedSlug}-${i + 1}`;
  }

  const { data, error } = await supabase
    .from('event_types')
    .insert({
      user_id: user.id,
      title,
      slug,
      duration_mins,
      buffer_mins,
      min_notice_mins,
      color,
      description,
      is_active,
      custom_questions,
    })
    .select('*')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event_type: data });
}

export async function PATCH(request: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? '');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (typeof body.title === 'string') update.title = body.title.trim().slice(0, 100);
  if (typeof body.description === 'string' || body.description === null) {
    update.description = body.description ? String(body.description).slice(0, 1000) : null;
  }
  if (Number.isFinite(Number(body.duration_mins))) {
    const d = Number(body.duration_mins);
    if (d < 5 || d > 480) return NextResponse.json({ error: 'Duration must be 5–480 mins' }, { status: 400 });
    update.duration_mins = d;
  }
  if (Number.isFinite(Number(body.buffer_mins))) update.buffer_mins = Number(body.buffer_mins);
  if (Number.isFinite(Number(body.min_notice_mins))) update.min_notice_mins = Number(body.min_notice_mins);
  if (typeof body.color === 'string' && isValidHexColor(body.color)) update.color = body.color;
  if (typeof body.is_active === 'boolean') update.is_active = body.is_active;
  if (typeof body.slug === 'string') update.slug = slugify(body.slug);
  if (Array.isArray(body.custom_questions)) update.custom_questions = sanitizeQuestions(body.custom_questions);

  const { data, error } = await supabase
    .from('event_types')
    .update(update)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event_type: data });
}

export async function DELETE(request: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const { error } = await supabase
    .from('event_types')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
