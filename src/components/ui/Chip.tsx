'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface ChipProps {
  children: ReactNode;
  icon?: ReactNode;
  selected?: boolean;
  onClose?: () => void;
  onClick?: () => void;
  className?: string;
  color?: string;
}

export function Chip({ children, icon, selected, onClose, onClick, className, color }: ChipProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-xs px-3 py-1.5',
        'text-xs font-medium transition-all duration-200',
        'select-none',
        selected
          ? 'bg-secondary-container text-on-secondary-container'
          : 'border border-outline text-on-surface-variant',
        onClick && 'cursor-pointer hover:shadow-elevation-1',
        className
      )}
      style={color ? { borderColor: color, backgroundColor: `${color}20` } : undefined}
    >
      {icon && <span className="text-sm">{icon}</span>}
      {children}
      {onClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-on-surface/10"
        >
          ✕
        </button>
      )}
    </div>
  );
}
