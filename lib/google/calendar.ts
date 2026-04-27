import { google, type calendar_v3 } from 'googleapis';
import { googleOAuthClient } from './auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import type { BusyInterval, Integration } from '@/lib/types';

function clientFor(integration: Integration) {
  const oauth = googleOAuthClient();
  oauth.setCredentials({
    access_token: integration.access_token,
    refresh_token: integration.refresh_token ?? undefined,
    expiry_date: integration.expires_at ? new Date(integration.expires_at).getTime() : undefined,
  });
  return oauth;
}

async function persistRefreshedTokens(
  userId: string,
  tokens: { access_token?: string | null; refresh_token?: string | null; expiry_date?: number | null },
) {
  if (!tokens.access_token) return;
  const admin = createSupabaseAdminClient();
  const update: Record<string, unknown> = { access_token: tokens.access_token };
  if (tokens.refresh_token) update.refresh_token = tokens.refresh_token;
  if (tokens.expiry_date) update.expires_at = new Date(tokens.expiry_date).toISOString();
  await admin.from('integrations').update(update).eq('user_id', userId).eq('provider', 'google');
}

async function calendarFor(integration: Integration) {
  const oauth = clientFor(integration);
  oauth.on('tokens', tokens => {
    void persistRefreshedTokens(integration.user_id, tokens);
  });
  return google.calendar({ version: 'v3', auth: oauth });
}

export async function fetchGoogleBusy(
  integration: Integration,
  rangeStart: Date,
  rangeEnd: Date,
): Promise<BusyInterval[]> {
  try {
    const cal = await calendarFor(integration);
    const calendarId = integration.calendar_id ?? 'primary';
    const res = await cal.freebusy.query({
      requestBody: {
        timeMin: rangeStart.toISOString(),
        timeMax: rangeEnd.toISOString(),
        items: [{ id: calendarId }],
      },
    });
    const busy = res.data.calendars?.[calendarId]?.busy ?? [];
    return busy
      .filter(b => b.start && b.end)
      .map(b => ({ start: new Date(b.start as string), end: new Date(b.end as string) }));
  } catch (err) {
    console.error('[google] freebusy failed', err);
    return [];
  }
}

type CreateEventArgs = {
  integration: Integration;
  summary: string;
  description?: string;
  startUtcISO: string;
  endUtcISO: string;
  inviteeEmail: string;
  inviteeName: string;
  hostEmail: string;
  hostTimezone: string;
};

export async function createGoogleEvent(args: CreateEventArgs): Promise<string | null> {
  try {
    const cal = await calendarFor(args.integration);
    const calendarId = args.integration.calendar_id ?? 'primary';
    const event: calendar_v3.Schema$Event = {
      summary: args.summary,
      description: args.description,
      start: { dateTime: args.startUtcISO, timeZone: args.hostTimezone },
      end: { dateTime: args.endUtcISO, timeZone: args.hostTimezone },
      attendees: [
        { email: args.hostEmail, organizer: true, responseStatus: 'accepted' },
        { email: args.inviteeEmail, displayName: args.inviteeName, responseStatus: 'accepted' },
      ],
    };
    const res = await cal.events.insert({
      calendarId,
      requestBody: event,
      sendUpdates: 'none',
    });
    return res.data.id ?? null;
  } catch (err) {
    console.error('[google] event create failed', err);
    return null;
  }
}

export async function deleteGoogleEvent(integration: Integration, eventId: string) {
  try {
    const cal = await calendarFor(integration);
    const calendarId = integration.calendar_id ?? 'primary';
    await cal.events.delete({ calendarId, eventId, sendUpdates: 'none' });
  } catch (err) {
    console.error('[google] event delete failed', err);
  }
}
