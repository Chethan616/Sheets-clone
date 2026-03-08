'use client';

import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type FABSize = 'small' | 'medium' | 'large';
type FABVariant = 'surface' | 'primary' | 'secondary' | 'tertiary';

interface FABProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label?: string;
  size?: FABSize;
  variant?: FABVariant;
}

const sizeClasses: Record<FABSize, string> = {
  small: 'h-10 w-10 rounded-xl text-lg',
  medium: 'h-14 w-14 rounded-2xl text-2xl',
  large: 'h-24 w-24 rounded-[28px] text-4xl',
};

const variantClasses: Record<FABVariant, string> = {
  surface: 'bg-surface-container-high text-primary shadow-elevation-3 hover:shadow-elevation-4',
  primary: 'bg-primary-container text-on-primary-container shadow-elevation-3 hover:shadow-elevation-4',
  secondary: 'bg-secondary-container text-on-secondary-container shadow-elevation-3 hover:shadow-elevation-4',
  tertiary: 'bg-tertiary-container text-on-tertiary-container shadow-elevation-3 hover:shadow-elevation-4',
};

export function FAB({ icon, label, size = 'medium', variant = 'primary', className, ...props }: FABProps) {
  return (
    <button
      className={cn(
        'ripple inline-flex items-center justify-center gap-3',
        'transition-all duration-[var(--md-sys-motion-duration-medium)]',
        'active:scale-95 select-none cursor-pointer',
        sizeClasses[size],
        variantClasses[variant],
        label && 'px-4 w-auto',
        className
      )}
      {...props}
    >
      {icon}
      {label && <span className="text-sm font-medium pr-1">{label}</span>}
    </button>
  );
}
