import { getResend, resendFromAddress } from './client';
import {
  bookingConfirmationHtml,
  cancellationHtml,
  hostNotificationHtml,
  type CommonArgs,
} from './templates';

async function safeSend(to: string, subject: string, html: string) {
  const resend = getResend();
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set; skipping send to', to);
    return;
  }
  try {
    await resend.emails.send({ from: resendFromAddress(), to, subject, html });
  } catch (err) {
    console.error('[email] send failed', err);
  }
}

export async function sendBookingConfirmation(args: CommonArgs) {
  await safeSend(
    args.inviteeEmail,
    `Confirmed: ${args.eventTitle} with ${args.hostName}`,
    bookingConfirmationHtml(args),
  );
}

export async function sendHostNotification(args: CommonArgs) {
  await safeSend(
    args.hostEmail,
    `New booking: ${args.inviteeName} — ${args.eventTitle}`,
    hostNotificationHtml(args),
  );
}

export async function sendCancellation(args: CommonArgs, audience: 'invitee' | 'host') {
  const to = audience === 'invitee' ? args.inviteeEmail : args.hostEmail;
  await safeSend(
    to,
    `Cancelled: ${args.eventTitle}`,
    cancellationHtml({ ...args, audience }),
  );
}
