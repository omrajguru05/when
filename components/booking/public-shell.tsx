import type { ReactNode } from 'react';
import { Container } from '@/components/ui/container';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';
import type { Profile } from '@/lib/types';
import { cn } from '@/lib/utils';

type PublicShellProps = {
  profile: Pick<Profile, 'name' | 'username' | 'avatar_url' | 'bio' | 'accent_color'>;
  children: ReactNode;
  accentColor?: string;
};

export function PublicShell({ profile, children, accentColor }: PublicShellProps) {
  const accent = accentColor ?? profile.accent_color ?? '#3b82f6';
  return (
    <div
      className="flex min-h-screen flex-col bg-slate-50"
      style={{ ['--color-accent-primary' as string]: accent }}
    >
      <header className="border-b border-slate-200 bg-white">
        <Container>
          <div className="flex h-14 items-center justify-between">
            <Link href={`/${profile.username}`} className="text-sm font-medium text-slate-700 hover:text-slate-900">
              {profile.name ?? profile.username}
            </Link>
            <Link href="/" className="text-slate-500 hover:text-slate-700">
              <Logo />
            </Link>
          </div>
        </Container>
      </header>
      <main className="flex-1 py-10 sm:py-16 animate-fade-in">
        <Container width="md">{children}</Container>
      </main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        Powered by{' '}
        <Link href="/" className="font-medium text-slate-600 hover:text-slate-900">
          WHEN
        </Link>
      </footer>
    </div>
  );
}

export function PublicHostHeader({
  profile,
  className,
}: {
  profile: Pick<Profile, 'name' | 'username' | 'avatar_url' | 'bio'>;
  className?: string;
}) {
  return (
    <div className={cn('mb-10 flex items-center gap-4', className)}>
      {profile.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.avatar_url}
          alt=""
          className="h-14 w-14 rounded-full object-cover ring-1 ring-slate-200"
        />
      ) : (
        <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-200 font-display text-lg font-bold text-slate-700">
          {(profile.name ?? profile.username).slice(0, 1).toUpperCase()}
        </div>
      )}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          {profile.name ?? profile.username}
        </h1>
        {profile.bio ? (
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{profile.bio}</p>
        ) : (
          <p className="mt-1 text-sm text-slate-500">@{profile.username}</p>
        )}
      </div>
    </div>
  );
}
