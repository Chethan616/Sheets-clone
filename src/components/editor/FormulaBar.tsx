'use client';

import { cn } from '@/lib/utils';
import type { CellFormat } from '@/lib/types';

interface FormulaBarProps {
  cellRef: string;
  value: string;
  onChange: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}

export function FormulaBar({ cellRef, value, onChange, onCommit, onCancel }: FormulaBarProps) {
  return (
    <div className="flex h-9 items-center border-b border-outline-variant/40 bg-surface-container-low px-1">
      {/* Cell Reference Label */}
      <div className="flex h-7 w-16 shrink-0 items-center justify-center rounded-xs border border-outline-variant/60 bg-surface text-xs font-medium text-on-surface">
        {cellRef || '—'}
      </div>

      {/* Separator */}
      <div className="mx-2 h-5 w-px bg-outline-variant/40" />

      {/* fx label */}
      <span className="mr-2 text-xs font-medium italic text-on-surface-variant">fx</span>

      {/* Formula Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onCommit();
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
          }
        }}
        className={cn(
          'h-7 flex-1 rounded-xs border border-transparent bg-transparent px-2 text-sm text-on-surface',
          'focus:border-primary focus:bg-surface focus:outline-none',
          'transition-colors duration-150'
        )}
        placeholder="Enter value or formula (e.g., =SUM(A1:A5))"
      />
    </div>
  );
}
