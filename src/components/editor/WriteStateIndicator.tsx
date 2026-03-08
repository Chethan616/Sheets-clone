'use client';

import { cn } from '@/lib/utils';
import type { WriteState } from '@/lib/types';

interface WriteStateIndicatorProps {
  state: WriteState;
}

export function WriteStateIndicator({ state }: WriteStateIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          'h-2 w-2 rounded-full transition-colors duration-300',
          state === 'synced' && 'bg-green-500',
          state === 'pending' && 'bg-amber-500 animate-pulse',
          state === 'error' && 'bg-red-500'
        )}
      />
      <span className="text-xs text-on-surface-variant">
        {state === 'synced' && 'Saved'}
        {state === 'pending' && 'Saving...'}
        {state === 'error' && 'Error saving'}
      </span>
    </div>
  );
}
