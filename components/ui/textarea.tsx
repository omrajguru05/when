'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, rows = 4, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5',
        'text-base text-slate-800 placeholder:text-slate-400',
        'transition focus:border-accent-primary focus:outline-none focus:ring-[3px] focus:ring-accent-light',
        'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
        'resize-y leading-relaxed',
        className,
      )}
      {...rest}
    />
  );
});
