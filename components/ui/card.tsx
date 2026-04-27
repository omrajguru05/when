import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  selected?: boolean;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, interactive = false, selected = false, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-card bg-white p-6 shadow-card transition',
        interactive
          ? 'cursor-pointer border-2 border-slate-200 hover:border-slate-300 hover:shadow-card-hover'
          : 'border border-slate-200',
        selected && 'border-accent-primary bg-accent-light/40',
        className,
      )}
      {...rest}
    />
  );
});

export function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 flex items-start justify-between gap-4', className)} {...rest} />;
}

export function CardTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('font-heading text-xl font-semibold text-slate-900', className)}
      {...rest}
    />
  );
}

export function CardDescription({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-slate-500', className)} {...rest} />;
}
