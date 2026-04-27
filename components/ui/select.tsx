'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

const chevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        'block w-full appearance-none rounded-lg border border-slate-300 bg-white pl-4 pr-10 py-2.5',
        'text-base text-slate-800',
        'transition focus:border-accent-primary focus:outline-none focus:ring-[3px] focus:ring-accent-light',
        'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
        className,
      )}
      style={{
        backgroundImage: chevron,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 1rem center',
      }}
      {...rest}
    >
      {children}
    </select>
  );
});
