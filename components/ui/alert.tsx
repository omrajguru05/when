import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'info' | 'success' | 'warning' | 'error';

const tones: Record<Tone, string> = {
  info: 'bg-slate-50 border-slate-300 text-slate-700',
  success: 'bg-success-light border-success text-success-dark',
  warning: 'bg-warning-light border-warning text-warning-dark',
  error: 'bg-error-light border-error text-error-dark',
};

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  tone?: Tone;
  title?: string;
  icon?: ReactNode;
};

export function Alert({ className, tone = 'info', title, icon, children, ...rest }: AlertProps) {
  return (
    <div
      role="status"
      className={cn('flex items-start gap-3 rounded-lg border-l-4 p-4 text-sm', tones[tone], className)}
      {...rest}
    >
      {icon ? <span className="flex-shrink-0 leading-tight">{icon}</span> : null}
      <div className="flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn(title && 'mt-1', 'leading-relaxed')}>{children}</div> : null}
      </div>
    </div>
  );
}
