'use client';

import { IconButton } from '@/components/ui/IconButton';
import type { CellFormat } from '@/lib/types';

interface ToolbarProps {
  format: CellFormat;
  onFormatChange: (format: Partial<CellFormat>) => void;
  onExport: (type: 'csv' | 'xlsx') => void;
  onFindAndReplace: () => void;
  onRemoveDuplicates: () => void;
  onMergeCells: () => void;
  canMerge: boolean;
}

export function Toolbar({ format, onFormatChange, onExport, onFindAndReplace, onRemoveDuplicates, onMergeCells, canMerge }: ToolbarProps) {
  return (
    <div className="flex h-10 items-center gap-0.5 overflow-x-auto border-b border-outline-variant/40 bg-surface-container-low px-2">
      {/* Bold */}
      <IconButton
        size="sm"
        icon={<span className="font-bold">B</span>}
        title="Bold (Ctrl+B)"
        active={format.bold}
        onClick={() => onFormatChange({ bold: !format.bold })}
      />

      {/* Italic */}
      <IconButton
        size="sm"
        icon={<span className="italic">I</span>}
        title="Italic (Ctrl+I)"
        active={format.italic}
        onClick={() => onFormatChange({ italic: !format.italic })}
      />

      <div className="mx-1 h-5 w-px bg-outline-variant/40" />

      {/* Text Color */}
      <div className="relative">
        <IconButton
          size="sm"
          icon={
            <span className="relative">
              A
              <span
                className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full"
                style={{ backgroundColor: format.textColor || 'var(--md-sys-color-on-surface)' }}
              />
            </span>
          }
          title="Text color"
          onClick={() => {
            const color = prompt('Enter text color (hex):', format.textColor || '#000000');
            if (color) onFormatChange({ textColor: color });
          }}
        />
      </div>

      {/* Background Color */}
      <div className="relative">
        <IconButton
          size="sm"
          icon={
            <span
              className="inline-block h-4 w-4 rounded-sm border border-outline-variant"
              style={{ backgroundColor: format.bgColor || 'transparent' }}
            />
          }
          title="Fill color"
          onClick={() => {
            const color = prompt('Enter fill color (hex):', format.bgColor || '#ffffff');
            if (color) onFormatChange({ bgColor: color });
          }}
        />
      </div>

      <div className="mx-1 h-5 w-px bg-outline-variant/40" />

      {/* Alignment */}
      <IconButton
        size="sm"
        icon={<span className="text-xs">⫷</span>}
        title="Align left"
        active={format.align === 'left'}
        onClick={() => onFormatChange({ align: 'left' })}
      />
      <IconButton
        size="sm"
        icon={<span className="text-xs">☰</span>}
        title="Align center"
        active={format.align === 'center'}
        onClick={() => onFormatChange({ align: 'center' })}
      />
      <IconButton
        size="sm"
        icon={<span className="text-xs">⫸</span>}
        title="Align right"
        active={format.align === 'right'}
        onClick={() => onFormatChange({ align: 'right' })}
      />

      <div className="mx-1 h-5 w-px bg-outline-variant/40" />

      {/* Remove Duplicates */}
      <IconButton
        size="sm"
        icon={<span className="text-xs font-bold">≠</span>}
        title="Remove Duplicates"
        onClick={onRemoveDuplicates}
      />

      {/* Find/Replace */}
      <IconButton
        size="sm"
        icon={<span className="text-xs font-bold">🔍</span>}
        title="Find and Replace"
        onClick={onFindAndReplace}
      />

      {/* Merge Cells */}
      <IconButton
        size="sm"
        icon={<span className="text-xs font-bold">⦿</span>}
        title={canMerge ? 'Merge / Unmerge Cells' : 'Select multiple cells to merge'}
        onClick={onMergeCells}
        disabled={!canMerge}
      />

      <div className="flex-1" />

      {/* Export */}
      <IconButton
        size="sm"
        icon={<span className="text-xs">📥</span>}
        title="Export CSV"
        onClick={() => onExport('csv')}
      />
      <IconButton
        size="sm"
        icon={<span className="text-xs">📊</span>}
        title="Export XLSX"
        onClick={() => onExport('xlsx')}
      />
    </div>
  );
}
