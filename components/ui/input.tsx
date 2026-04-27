'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = 'text', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5',
        'text-base text-slate-800 placeholder:text-slate-400',
        'transition focus:border-accent-primary focus:outline-none focus:ring-[3px] focus:ring-accent-light',
        'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
        className,
      )}
      {...rest}
    />
  );
});
