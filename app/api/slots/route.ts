import { NextResponse, type NextRequest } from 'next/server';
import { fromZonedTime } from 'date-fns-tz';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { computeAvailableSlots } from '@/lib/slots';
import { fetchGoogleBusy } from '@/lib/google/calendar';
import type {
  Availability,
  BlockedSlot,
  Booking,
  EventType,
  Integration,
  Profile,
} from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const eventSlug = searchParams.get('event');
  const date = searchParams.get('date');

  if (!username || !eventSlug || !date) {
    return NextResponse.json({ error: 'username, event, and date are required' }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'date must be YYYY-MM-DD' }, { status: 400 });
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
    .eq('slug', eventSlug)
    .eq('is_active', true)
    .maybeSingle<EventType>();
  if (!eventType) return NextResponse.json({ error: 'Event type not found' }, { status: 404 });

  const dayStartUtc = fromZonedTime(`${date}T00:00:00`, profile.timezone);
  const dayEndUtc = new Date(dayStartUtc.getTime() + 24 * 60 * 60 * 1000);

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

  const slots = computeAvailableSlots({
    date,
    hostTimezone: profile.timezone,
    eventType,
    availability: (availability ?? []) as Availability[],
    blocked: (blocked ?? []) as BlockedSlot[],
    bookings: (bookings ?? []) as Booking[],
    externalBusy,
  });

  return NextResponse.json({
    timezone: profile.timezone,
    date,
    duration_mins: eventType.duration_mins,
    slots,
  });
}
