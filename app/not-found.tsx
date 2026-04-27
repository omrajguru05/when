import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Logo } from '@/components/ui/logo';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <Container width="sm">
        <div className="text-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="mt-8 rounded-card border border-slate-200 bg-white p-8 text-center shadow-card">
          <p className="font-mono text-xs uppercase tracking-wider text-accent-primary">404</p>
          <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Nothing here.
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            The link may be wrong, or the booking page is no longer available.
          </p>
          <div className="mt-6">
            <Link href="/">
              <Button>Back to home</Button>
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
