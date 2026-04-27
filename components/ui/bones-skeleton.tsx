'use client';

import type { ReactNode } from 'react';
import { Skeleton } from 'boneyard-js/react';

type Props = {
  name: string;
  loading: boolean;
  children: ReactNode;
  fixture?: ReactNode;
  fallback?: ReactNode;
  className?: string;
};

/**
 * Thin wrapper around boneyard-js's <Skeleton> that hard-codes our shimmer
 * default. Use this for any list/grid where the skeleton's shape benefits from
 * matching the real DOM (event-type cards, booking rows, etc.).
 *
 * Run `npm run bones` (with the dev server running) to capture pixel-perfect
 * bones for every named Skeleton in the app.
 */
export function BonesSkeleton({
  name,
  loading,
  children,
  fixture,
  fallback,
  className,
}: Props) {
  return (
    <Skeleton
      name={name}
      loading={loading}
      animate="shimmer"
      fallback={fallback}
      fixture={fixture}
      className={className}
    >
      {children}
    </Skeleton>
  );
}
