import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Logo } from '@/components/ui/logo';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />

      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <SelfHostCTA />
      </main>

      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="border-b border-slate-100 bg-white/80 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" aria-label="WHEN home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="https://github.com/omrajguru05/when"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              GitHub
            </Link>
            <Link href="/login">
              <Button variant="primary" size="sm">
                Sign in
              </Button>
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 0%, rgba(59,130,246,0.08), transparent 60%)',
        }}
      />
      <Container width="lg">
        <div className="py-24 text-center sm:py-32">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wider text-slate-600 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Open source · Self-hostable on Vercel free tier
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl">
            Scheduling that respects
            <br />
            <span className="text-accent-primary">your time.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
            WHEN is a lightweight, open-source booking platform you fully own. Free of bloat, free of
            limits, free to deploy in five minutes.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login">
              <Button size="lg">Get started for free</Button>
            </Link>
            <Link
              href="https://github.com/omrajguru05/when"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="lg">
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.34c-2.22.48-2.69-1.07-2.69-1.07-.36-.92-.89-1.16-.89-1.16-.73-.5.05-.49.05-.49.81.06 1.24.83 1.24.83.72 1.23 1.88.88 2.34.67.07-.52.28-.88.51-1.08-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.13 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.11.16 1.93.08 2.13.51.56.82 1.27.82 2.15 0 3.07-1.87 3.74-3.65 3.94.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
                </svg>
                Star on GitHub
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-xs text-slate-400">
            No credit card. No paid tier. Just a clone-and-deploy button.
          </p>
        </div>
      </Container>
    </section>
  );
}

function Features() {
  const items = [
    {
      title: 'Magic-link auth',
      body: 'Sign in with email or Google. No passwords, no extra services.',
    },
    {
      title: 'Google Calendar sync',
      body: 'Read busy events automatically. New bookings land in your calendar.',
    },
    {
      title: 'Email notifications',
      body: 'Confirmations, reminders, and cancellations via Resend.',
    },
    {
      title: 'Custom event types',
      body: 'Per-link duration, buffer, color, custom questions.',
    },
    {
      title: 'Real availability rules',
      body: 'Weekly hours, blocked dates, buffer time, minimum notice.',
    },
    {
      title: 'Yours forever',
      body: 'MIT-licensed. Your booking page, your branding, your data.',
    },
  ];
  return (
    <section className="border-t border-slate-100 bg-slate-50 py-20">
      <Container width="lg">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-primary">
            What's inside
          </p>
          <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need. Nothing you don't.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <div
              key={item.title}
              className="rounded-card border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-card"
            >
              <h3 className="font-heading text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Sign up in seconds',
      body: 'Magic-link login. We auto-create your profile and a personal booking URL.',
    },
    {
      n: '02',
      title: 'Set your hours',
      body: 'Pick weekly availability, buffer time, and minimum notice. Block dates as needed.',
    },
    {
      n: '03',
      title: 'Share your link',
      body: 'Visitors pick a slot in their own timezone. Bookings hit your calendar instantly.',
    },
  ];
  return (
    <section className="py-24">
      <Container width="lg">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {steps.map(step => (
            <div key={step.n}>
              <p className="font-mono text-sm font-medium text-accent-primary">{step.n}</p>
              <h3 className="font-display mt-2 text-2xl font-bold tracking-tight text-slate-900">
                {step.title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function SelfHostCTA() {
  return (
    <section className="border-t border-slate-100 bg-slate-900 py-20 text-white">
      <Container width="md">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Self-host in 5 minutes.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-slate-300">
            Deploy your instance to Vercel with one click. Bring your Supabase project, Resend
            account, and Google credentials.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="https://vercel.com/new/clone?repository-url=https://github.com/omrajguru05/when"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                Deploy to Vercel
              </Button>
            </Link>
            <Link
              href="https://github.com/omrajguru05/when#self-hosting"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="secondary"
                size="lg"
                className="border-slate-700 bg-transparent text-white hover:border-slate-500 hover:bg-slate-800"
              >
                Read the docs
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-slate-100 py-10">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo />
            <span>· MIT-licensed open source</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-slate-900">
              Sign in
            </Link>
            <Link
              href="https://github.com/omrajguru05/when"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900"
            >
              GitHub
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
