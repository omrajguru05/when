import { google } from 'googleapis';
import { siteUrl } from '@/lib/utils';

export const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
];

export function googleOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    siteUrl('/api/google/callback'),
  );
}

export function googleAuthUrl(state: string) {
  const client = googleOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: GOOGLE_SCOPES,
    state,
  });
}

export async function exchangeCode(code: string) {
  const client = googleOAuthClient();
  const { tokens } = await client.getToken(code);
  return tokens;
}
