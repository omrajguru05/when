'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-accent-primary text-white border border-transparent hover:bg-accent-dark active:scale-[0.98] disabled:bg-slate-300 disabled:hover:bg-slate-300',
  secondary:
    'bg-transparent text-accent-primary border border-slate-300 hover:bg-slate-50 hover:border-accent-primary active:scale-[0.98] disabled:opacity-50',
  tertiary:
    'bg-transparent text-accent-primary border border-transparent underline decoration-accent-light underline-offset-4 hover:decoration-accent-primary disabled:opacity-50',
  ghost:
    'bg-transparent text-slate-700 border border-transparent hover:bg-slate-100 active:scale-[0.98] disabled:opacity-50',
  danger:
    'bg-error text-white border border-transparent hover:bg-error-dark active:scale-[0.98] disabled:opacity-50',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-6 text-base',
  lg: 'h-12 px-8 text-base',
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold',
        'transition-all duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {isLoading ? (
        <span
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  );
});
