'use client';

import Link from 'next/link';
import type { Profile } from '@/lib/types';

export function Topbar({ profile }: { profile: Profile }) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Link
          href={`/${profile.username}`}
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 lg:inline-flex"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6" />
            <path d="m10 14 11-11" />
            <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
          </svg>
          View public page
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900">{profile.name ?? profile.username}</p>
          <p className="text-xs text-slate-500">{profile.email}</p>
        </div>
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt=""
            className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
          />
        ) : (
          <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
            {(profile.name ?? profile.username).slice(0, 1).toUpperCase()}
          </div>
        )}
        <form action="/auth/sign-out" method="post">
          <button
            type="submit"
            className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
