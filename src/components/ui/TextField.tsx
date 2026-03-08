'use client';

import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'filled' | 'outlined';
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, variant = 'filled', leadingIcon, trailingIcon, className, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {label && (
          <label className="mb-1 block text-xs font-medium text-on-surface-variant">
            {label}
          </label>
        )}
        <div className="relative">
          {leadingIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full rounded-xs px-4 py-3 text-sm text-on-surface',
              'transition-all duration-200',
              'placeholder:text-on-surface-variant/60',
              'focus:outline-none',
              variant === 'filled' && 'bg-surface-container-highest border-b-2 border-on-surface-variant/40 rounded-b-none focus:border-primary',
              variant === 'outlined' && 'bg-transparent border border-outline rounded-xs focus:border-primary focus:border-2',
              error && 'border-error focus:border-error',
              !!leadingIcon && 'pl-10',
              !!trailingIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {trailingIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              {trailingIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-error">{error}</p>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
