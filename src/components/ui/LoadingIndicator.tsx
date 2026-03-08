'use client';

import { cn } from '@/lib/utils';

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** M3 Expressive Circular Loading Indicator with contained animation */
export function CircularLoading({ size = 'md', className }: LoadingIndicatorProps) {
  const sizes = { sm: 24, md: 40, lg: 56 };
  const s = sizes[size];
  const strokeWidth = size === 'sm' ? 3 : 4;

  return (
    <div className={cn('inline-flex', className)} role="progressbar">
      <svg
        width={s}
        height={s}
        viewBox="0 0 48 48"
        style={{ animation: 'm3-spin 1.4s linear infinite' }}
      >
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-primary"
          style={{
            animation: 'm3-dash 1.4s ease-in-out infinite',
            strokeLinecap: 'round',
          }}
        />
      </svg>
    </div>
  );
}

/** M3 Expressive Linear Loading Indicator */
export function LinearLoading({ className }: { className?: string }) {
  return (
    <div
      className={cn('relative h-1 w-full overflow-hidden rounded-full bg-surface-container-highest', className)}
      role="progressbar"
    >
      <div
        className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-primary"
        style={{ animation: 'm3-linear-progress 1.5s ease-in-out infinite' }}
      />
    </div>
  );
}

/** Skeleton shimmer for loading states */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-md bg-surface-container-highest',
        className
      )}
      style={{
        backgroundImage:
          'linear-gradient(90deg, transparent, var(--md-sys-color-surface-container-high), transparent)',
        backgroundSize: '200% 100%',
        animation: 'm3-shimmer 1.5s ease-in-out infinite',
      }}
    />
  );
}
