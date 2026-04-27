# Security policy

## Reporting a vulnerability

If you discover a security issue in WHEN, please do not open a public issue.
Instead, email **omrajguru077@gmail.com** with:

- A short description of the issue
- Steps to reproduce
- The affected commit hash or deployed URL (if applicable)

We will respond within 72 hours and aim to ship a fix within 14 days for any
issue that meaningfully impacts host or invitee data.

## Threat model and self-hosting notes

WHEN is designed to be self-hosted on Vercel's free tier with a Supabase
backend. Each deployment is a single-tenant install that you fully own.

The following hardening steps are the operator's responsibility:

1. **Service role key.** `SUPABASE_SERVICE_ROLE_KEY` must only ever be set as a
   server-side environment variable. The codebase never imports it into client
   components, but if you fork and add new server actions or route handlers,
   keep it that way. Never prefix this variable with `NEXT_PUBLIC_`.
2. **Row-Level Security.** All host data lives behind Supabase RLS policies
   that scope rows to `auth.uid()`. Public reads (the booking page, slot
   lookup) explicitly use the service-role key on the server with
   request-derived inputs (username, event slug). Do not loosen these policies.
3. **OAuth redirect URIs.** Only add the exact origins you control. A wildcard
   redirect on the Google OAuth client would let an attacker steal Google
   tokens via a redirect in another app you also configured.
4. **Resend domain verification.** Use a verified domain so cancellation and
   confirmation emails do not get spoofed. The default `onboarding@resend.dev`
   sender is fine for development only.
5. **Rate limiting.** The MVP intentionally omits per-IP rate limiting so it
   stays inside the free tier. If you expose your booking page to an
   unauthenticated public, consider Vercel's edge config or Cloudflare in
   front to protect `POST /api/bookings` from abuse.
6. **Cancellation tokens.** Each booking is given a `gen_random_uuid()`
   cancellation token. The token is the only credential needed to cancel from
   the email link. If a booker forwards their confirmation email, the
   recipient can cancel. This is the same trade-off Calendly and Cal.com make.
7. **Custom questions.** Invitee-supplied answers are stored as JSONB and
   rendered as text in emails (HTML-escaped) and on the host dashboard (via
   React's default escaping). Do not render them with `dangerouslySetInnerHTML`.

## What we do not yet do

- No automated dependency scanning is configured. We recommend turning on
  Dependabot in your fork.
- No CSRF protection beyond Supabase's `SameSite=Lax` session cookie. All
  mutating routes are JSON-only and require the same-origin browser context.
- No structured audit log. Booking creation and cancellation are tracked via
  the `bookings.status` column and `created_at` / `updated_at` timestamps
  only.

These are all reasonable v2 additions; PRs welcome.
