'use client';

import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type CardVariant = 'elevated' | 'filled' | 'outlined';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  elevated: 'bg-surface-container-low shadow-elevation-1 hover:shadow-elevation-2',
  filled: 'bg-surface-container-highest',
  outlined: 'bg-surface border border-outline-variant',
};

export function Card({ variant = 'elevated', className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-4 transition-all duration-[var(--md-sys-motion-duration-medium)]',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
