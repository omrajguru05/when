import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Width = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const widths: Record<Width, string> = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-[1200px]',
};

type ContainerProps = HTMLAttributes<HTMLDivElement> & { width?: Width };

export function Container({ className, width = 'full', ...rest }: ContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', widths[width], className)}
      {...rest}
    />
  );
}
