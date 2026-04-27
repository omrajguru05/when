import { escapeHtml } from '@/lib/utils';
import { prettyDate, prettyTimeRange } from '@/lib/timezone';

type CommonArgs = {
  hostName: string;
  hostEmail: string;
  eventTitle: string;
  inviteeName: string;
  inviteeEmail: string;
  inviteeNote?: string | null;
  startUtcISO: string;
  endUtcISO: string;
  inviteeTimezone: string;
  hostTimezone: string;
  cancellationUrl: string;
  bookingUrl: string;
  accentColor?: string;
};

function shell(content: string, accent = '#3b82f6') {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>WHEN</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1e293b;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="display:inline-flex;align-items:center;gap:8px;font-family:ui-monospace,'SFMono-Regular',Menlo,monospace;font-weight:700;color:#0f172a;font-size:18px;margin-bottom:24px;">
      <span style="display:inline-block;width:24px;height:24px;border-radius:6px;background:${accent};"></span>
      when
    </div>
    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
      ${content}
    </div>
    <p style="margin-top:24px;text-align:center;font-size:12px;color:#94a3b8;">
      Sent by WHEN — open-source scheduling.
    </p>
  </div>
</body>
</html>`;
}

function detailsBlock(args: CommonArgs, audience: 'invitee' | 'host') {
  const tz = audience === 'invitee' ? args.inviteeTimezone : args.hostTimezone;
  const date = prettyDate(args.startUtcISO, tz);
  const range = prettyTimeRange(args.startUtcISO, args.endUtcISO, tz);
  return `
    <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:20px;">
      <tr>
        <td style="padding:8px 0;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;width:30%;vertical-align:top;">Event</td>
        <td style="padding:8px 0;font-size:14px;color:#0f172a;font-weight:500;">${escapeHtml(args.eventTitle)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">When</td>
        <td style="padding:8px 0;font-size:14px;color:#0f172a;">${date}<br/><span style="color:#475569;">${range} (${tz})</span></td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">${audience === 'host' ? 'Invitee' : 'Host'}</td>
        <td style="padding:8px 0;font-size:14px;color:#0f172a;">
          ${audience === 'host' ? escapeHtml(args.inviteeName) : escapeHtml(args.hostName)}
          <br/>
          <span style="color:#475569;">${audience === 'host' ? escapeHtml(args.inviteeEmail) : escapeHtml(args.hostEmail)}</span>
        </td>
      </tr>
      ${
        args.inviteeNote
          ? `<tr>
        <td style="padding:8px 0;font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">Note</td>
        <td style="padding:8px 0;font-size:14px;color:#0f172a;white-space:pre-wrap;">${escapeHtml(args.inviteeNote)}</td>
      </tr>`
          : ''
      }
    </table>
  `;
}

function cta(href: string, label: string, accent: string, secondary = false) {
  if (secondary) {
    return `<a href="${href}" style="display:inline-block;padding:10px 20px;border-radius:8px;border:1px solid #cbd5e1;color:${accent};font-weight:600;font-size:14px;text-decoration:none;">${label}</a>`;
  }
  return `<a href="${href}" style="display:inline-block;padding:10px 20px;border-radius:8px;background:${accent};color:#ffffff;font-weight:600;font-size:14px;text-decoration:none;">${label}</a>`;
}

export function bookingConfirmationHtml(args: CommonArgs) {
  const accent = args.accentColor ?? '#3b82f6';
  const body = `
    <h1 style="margin:0;font-size:28px;font-weight:700;color:#0f172a;letter-spacing:-0.01em;font-family:ui-monospace,'SFMono-Regular',Menlo,monospace;">You're booked. ✓</h1>
    <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#475569;">
      Hi ${escapeHtml(args.inviteeName)}, your meeting with <strong>${escapeHtml(args.hostName)}</strong> is confirmed.
    </p>
    ${detailsBlock(args, 'invitee')}
    <div style="margin-top:28px;display:flex;gap:12px;flex-wrap:wrap;">
      ${cta(args.cancellationUrl, 'Cancel booking', accent, true)}
    </div>
    <p style="margin-top:24px;font-size:12px;color:#94a3b8;line-height:1.5;">
      If you can no longer make it, please use the cancel link above so the slot can be reopened.
    </p>
  `;
  return shell(body, accent);
}

export function hostNotificationHtml(args: CommonArgs) {
  const accent = args.accentColor ?? '#3b82f6';
  const body = `
    <h1 style="margin:0;font-size:24px;font-weight:700;color:#0f172a;letter-spacing:-0.01em;font-family:ui-monospace,'SFMono-Regular',Menlo,monospace;">New booking</h1>
    <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#475569;">
      ${escapeHtml(args.inviteeName)} just booked time with you.
    </p>
    ${detailsBlock(args, 'host')}
    <div style="margin-top:28px;">
      ${cta(args.bookingUrl, 'Open dashboard', accent)}
    </div>
  `;
  return shell(body, accent);
}

export function cancellationHtml(args: CommonArgs & { audience: 'invitee' | 'host' }) {
  const accent = args.accentColor ?? '#3b82f6';
  const greeting =
    args.audience === 'invitee'
      ? `Hi ${escapeHtml(args.inviteeName)}, your meeting with ${escapeHtml(args.hostName)} has been cancelled.`
      : `${escapeHtml(args.inviteeName)} cancelled their booking.`;
  const body = `
    <h1 style="margin:0;font-size:24px;font-weight:700;color:#0f172a;letter-spacing:-0.01em;font-family:ui-monospace,'SFMono-Regular',Menlo,monospace;">Booking cancelled</h1>
    <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#475569;">${greeting}</p>
    ${detailsBlock(args, args.audience)}
  `;
  return shell(body, accent);
}

export type { CommonArgs };
