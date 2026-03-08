'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface IconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  className?: string;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
  variant?: 'standard' | 'filled' | 'tonal' | 'outlined';
}

export function IconButton({
  icon,
  onClick,
  className,
  title,
  active,
  disabled,
  size = 'md',
  variant = 'standard',
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'ripple inline-flex items-center justify-center rounded-full',
        'transition-all duration-200 select-none cursor-pointer',
        'disabled:opacity-38 disabled:pointer-events-none',
        size === 'sm' ? 'h-8 w-8 text-base' : 'h-10 w-10 text-xl',
        variant === 'standard' && 'text-on-surface-variant hover:bg-on-surface/8',
        variant === 'standard' && active && 'text-primary bg-primary/12',
        variant === 'filled' && 'bg-primary text-on-primary',
        variant === 'filled' && active && 'bg-primary',
        variant === 'tonal' && 'bg-secondary-container text-on-secondary-container',
        variant === 'tonal' && active && 'bg-primary text-on-primary',
        variant === 'outlined' && 'border border-outline text-on-surface-variant',
        variant === 'outlined' && active && 'bg-inverse-surface text-inverse-on-surface border-transparent',
        className
      )}
    >
      {icon}
    </button>
  );
}
