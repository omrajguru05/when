import { Resend } from 'resend';

let cached: Resend | null = null;

export function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!cached) cached = new Resend(process.env.RESEND_API_KEY);
  return cached;
}

export function resendFromAddress() {
  return process.env.RESEND_FROM_EMAIL ?? 'WHEN <onboarding@resend.dev>';
}
