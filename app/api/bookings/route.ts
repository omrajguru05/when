import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase/server';
import { computeAvailableSlots } from '@/lib/slots';
import {
  sendBookingConfirmation,
  sendCancellation,
  sendHostNotification,
} from '@/lib/email/send';
import { createGoogleEvent, deleteGoogleEvent, fetchGoogleBusy } from '@/lib/google/calendar';
import { isValidEmail, siteUrl } from '@/lib/utils';
import { formatInTz } from '@/lib/timezone';
import type {
  Availability,
  BlockedSlot,
  Booking,
  EventType,
  Integration,
  Profile,
  CustomQuestion,
} from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type CreatePayload = {
  username?: string;
  event_slug?: string;
  start_at?: string;
  end_at?: string;
  invitee_name?: string;
  invitee_email?: string;
  invitee_note?: string;
  custom_answers?: Record<string, string>;
  invitee_timezone?: string;
};

export async function POST(request: NextRequest) {
  let body: CreatePayload;
  try {
    body = (await request.json()) as CreatePayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    username,
    event_slug,
    start_at,
    end_at,
    invitee_name,
    invitee_email,
    invitee_note,
    custom_answers = {},
    invitee_timezone,
  } = body;

  if (!username || !event_slug || !start_at || !end_at || !invitee_name || !invitee_email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!isValidEmail(invitee_email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  if (invitee_name.length > 200 || (invitee_note ?? '').length > 2000) {
    return NextResponse.json({ error: 'Field too long' }, { status: 400 });
  }

  const startMs = Date.parse(start_at);
  const endMs = Date.parse(end_at);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs >= endMs) {
    return NextResponse.json({ error: 'Invalid time range' }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle<Profile>();
  if (!profile) return NextResponse.json({ error: 'Host not found' }, { status: 404 });

  const { data: eventType } = await admin
    .from('event_types')
    .select('*')
    .eq('user_id', profile.id)
    .eq('slug', event_slug)
    .eq('is_active', true)
    .maybeSingle<EventType>();
  if (!eventType) return NextResponse.json({ error: 'Event type not found' }, { status: 404 });

  if (endMs - startMs !== eventType.duration_mins * 60_000) {
    return NextResponse.json({ error: 'Slot duration mismatch' }, { status: 400 });
  }

  const required = (eventType.custom_questions as CustomQuestion[]).filter(q => q.required);
  for (const q of required) {
    if (!custom_answers[q.id] || custom_answers[q.id].trim().length === 0) {
      return NextResponse.json({ error: `Missing answer: ${q.label}` }, { status: 400 });
    }
  }

  const dayStartUtc = new Date(startMs - 24 * 60 * 60 * 1000);
  const dayEndUtc = new Date(endMs + 24 * 60 * 60 * 1000);

  const [{ data: availability }, { data: blocked }, { data: bookings }, { data: integration }] =
    await Promise.all([
      admin.from('availability').select('*').eq('user_id', profile.id),
      admin
        .from('blocked_slots')
        .select('*')
        .eq('user_id', profile.id)
        .gte('end_at', dayStartUtc.toISOString())
        .lte('start_at', dayEndUtc.toISOString()),
      admin
        .from('bookings')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'confirmed')
        .gte('end_at', dayStartUtc.toISOString())
        .lte('start_at', dayEndUtc.toISOString()),
      admin
        .from('integrations')
        .select('*')
        .eq('user_id', profile.id)
        .eq('provider', 'google')
        .maybeSingle<Integration>(),
    ]);

  const externalBusy = integration
    ? await fetchGoogleBusy(integration, dayStartUtc, dayEndUtc)
    : [];

  const date = formatInTz(new Date(startMs), profile.timezone, 'yyyy-MM-dd');
  const slots = computeAvailableSlots({
    date,
    hostTimezone: profile.timezone,
    eventType,
    availability: (availability ?? []) as Availability[],
    blocked: (blocked ?? []) as BlockedSlot[],
    bookings: (bookings ?? []) as Booking[],
    externalBusy,
  });
  const matched = slots.find(
    s => Date.parse(s.start) === startMs && Date.parse(s.end) === endMs,
  );
  if (!matched) {
    return NextResponse.json({ error: 'Slot is no longer available' }, { status: 409 });
  }

  const { data: created, error: insertErr } = await admin
    .from('bookings')
    .insert({
      event_type_id: eventType.id,
      user_id: profile.id,
      invitee_name: invitee_name.trim(),
      invitee_email: invitee_email.trim().toLowerCase(),
      invitee_note: invitee_note?.trim() || null,
      custom_answers,
      start_at: new Date(startMs).toISOString(),
      end_at: new Date(endMs).toISOString(),
      status: 'confirmed',
    })
    .select('*')
    .single<Booking>();

  if (insertErr || !created) {
    return NextResponse.json({ error: 'Could not create booking' }, { status: 500 });
  }

  let googleEventId: string | null = null;
  if (integration) {
    googleEventId = await createGoogleEvent({
      integration,
      summary: `${eventType.title} with ${invitee_name}`,
      description: invitee_note ?? undefined,
      startUtcISO: created.start_at,
      endUtcISO: created.end_at,
      inviteeEmail: created.invitee_email,
      inviteeName: created.invitee_name,
      hostEmail: profile.email,
      hostTimezone: profile.timezone,
    });
    if (googleEventId) {
      await admin
        .from('bookings')
        .update({ google_event_id: googleEventId })
        .eq('id', created.id);
    }
  }

  const cancellationUrl = siteUrl(`/booking/cancel/${created.cancellation_token}`);
  const bookingUrl = siteUrl('/dashboard');
  const emailArgs = {
    hostName: profile.name ?? profile.username,
    hostEmail: profile.email,
    eventTitle: eventType.title,
    inviteeName: created.invitee_name,
    inviteeEmail: created.invitee_email,
    inviteeNote: created.invitee_note,
    startUtcISO: created.start_at,
    endUtcISO: created.end_at,
    inviteeTimezone: invitee_timezone || profile.timezone,
    hostTimezone: profile.timezone,
    cancellationUrl,
    bookingUrl,
    accentColor: eventType.color || profile.accent_color,
  };

  await Promise.all([
    sendBookingConfirmation(emailArgs),
    sendHostNotification(emailArgs),
  ]);

  return NextResponse.json({
    booking: {
      id: created.id,
      cancellation_token: created.cancellation_token,
      start_at: created.start_at,
      end_at: created.end_at,
      event_title: eventType.title,
      host_name: profile.name ?? profile.username,
      host_username: profile.username,
      host_timezone: profile.timezone,
    },
  });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const id = searchParams.get('id');

  const admin = createSupabaseAdminClient();
  let booking: Booking | null = null;

  if (token) {
    const { data } = await admin
      .from('bookings')
      .select('*')
      .eq('cancellation_token', token)
      .maybeSingle<Booking>();
    booking = data ?? null;
  } else if (id) {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const { data } = await admin
      .from('bookings')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle<Booking>();
    booking = data ?? null;
  } else {
    return NextResponse.json({ error: 'Missing token or id' }, { status: 400 });
  }

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  if (booking.status === 'cancelled') {
    return NextResponse.json({ ok: true, alreadyCancelled: true });
  }

  await admin.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);

  const [{ data: profile }, { data: eventType }, { data: integration }] = await Promise.all([
    admin.from('profiles').select('*').eq('id', booking.user_id).maybeSingle<Profile>(),
    admin
      .from('event_types')
      .select('*')
      .eq('id', booking.event_type_id)
      .maybeSingle<EventType>(),
    admin
      .from('integrations')
      .select('*')
      .eq('user_id', booking.user_id)
      .eq('provider', 'google')
      .maybeSingle<Integration>(),
  ]);

  if (integration && booking.google_event_id) {
    await deleteGoogleEvent(integration, booking.google_event_id);
  }

  if (profile && eventType) {
    const args = {
      hostName: profile.name ?? profile.username,
      hostEmail: profile.email,
      eventTitle: eventType.title,
      inviteeName: booking.invitee_name,
      inviteeEmail: booking.invitee_email,
      inviteeNote: booking.invitee_note,
      startUtcISO: booking.start_at,
      endUtcISO: booking.end_at,
      inviteeTimezone: profile.timezone,
      hostTimezone: profile.timezone,
      cancellationUrl: siteUrl(`/booking/cancel/${booking.cancellation_token}`),
      bookingUrl: siteUrl('/dashboard'),
      accentColor: eventType.color,
    };
    await Promise.all([sendCancellation(args, 'invitee'), sendCancellation(args, 'host')]);
  }

  return NextResponse.json({ ok: true });
}
