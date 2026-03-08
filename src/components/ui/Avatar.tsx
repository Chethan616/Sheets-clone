'use client';

import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
};

export function Avatar({ src, name, color, size = 'md', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover ring-2 ring-surface',
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium text-white',
        sizes[size],
        className
      )}
      style={{ backgroundColor: color || '#6750A4' }}
      title={name}
    >
      {initials}
    </div>
  );
}
