import { Suspense } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Logo } from '@/components/ui/logo';
import { LoginForm } from './login-form';

export const metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 py-12">
      <Container width="sm">
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex">
            <Logo />
          </Link>
        </div>
        <div className="rounded-card border border-slate-200 bg-white p-8 shadow-card animate-fade-in">
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Sign in to WHEN
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            We'll email you a magic link, or you can continue with Google.
          </p>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          New here? Just sign in. Your account is created automatically.
        </p>
      </Container>
    </main>
  );
}
