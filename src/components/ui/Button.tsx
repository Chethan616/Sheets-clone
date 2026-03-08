'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  filled:
    'bg-primary text-on-primary hover:shadow-elevation-1 active:shadow-elevation-0',
  tonal:
    'bg-secondary-container text-on-secondary-container hover:shadow-elevation-1 active:shadow-elevation-0',
  outlined:
    'border border-outline text-primary hover:bg-primary/8 active:bg-primary/12',
  text:
    'text-primary hover:bg-primary/8 active:bg-primary/12',
  elevated:
    'bg-surface-container-low text-primary shadow-elevation-1 hover:shadow-elevation-2',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'filled', icon, loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'ripple inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5',
          'text-sm font-medium leading-5 tracking-wide',
          'transition-all duration-[var(--md-sys-motion-duration-medium)]',
          'disabled:opacity-38 disabled:pointer-events-none',
          'select-none cursor-pointer',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : icon ? (
          <span className="text-lg">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
