'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        'h-5 w-5 cursor-pointer rounded border-slate-300 text-accent-primary',
        'accent-[var(--color-accent-primary)]',
        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-primary',
        className,
      )}
      {...rest}
    />
  );
});
