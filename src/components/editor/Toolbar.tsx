'use client';

import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/utils';
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

// ─── Inline SVG icons ────────────────────────────────────────────────────────

const BoldIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.6 11.79A4 4 0 0 0 13 5H7v14h6.5a4.5 4.5 0 0 0 2.1-8.21ZM9 7h3.5a2 2 0 1 1 0 4H9V7Zm4 10H9v-4h4a2.5 2.5 0 0 1 0 5Z"/>
  </svg>
);

const ItalicIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 4v3h2.21l-3.42 10H6v3h8v-3h-2.21l3.42-10H18V4h-8Z"/>
  </svg>
);

const AlignLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3h18v2H3V3Zm0 4h12v2H3V7Zm0 4h18v2H3v-2Zm0 4h12v2H3v-2Zm0 4h18v2H3v-2Z"/>
  </svg>
);

const AlignCenterIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3h18v2H3V3Zm3 4h12v2H6V7Zm-3 4h18v2H3v-2Zm3 4h12v2H6v-2Zm-3 4h18v2H3v-2Z"/>
  </svg>
);

const AlignRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3h18v2H3V3Zm6 4h12v2H9V7Zm-6 4h18v2H3v-2Zm6 4h12v2H9v-2Zm-6 4h18v2H3v-2Z"/>
  </svg>
);

const DedupeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 6h18v2H3V6Zm2 4h14v2H5v-2Zm2 4h10v2H7v-2ZM5 3a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm10 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0ZM6 20l3-3-3-3v2H3v2h3v2Zm9-3 3 3-3 3v-2h-3v-2h3v-2Z"/>
  </svg>
);

const SearchReplaceIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="m15.5 14 5 5-1.5 1.5-5-5v-.79l-.27-.28A6.47 6.47 0 0 1 9.5 16 6.5 6.5 0 1 1 16 9.5c0 1.61-.59 3.09-1.57 4.23l.28.27h.79Zm-6 0C12.43 14 14 12.43 14 10.5S12.43 7 10.5 7 7 8.57 7 10.5 8.57 14 10.5 14Zm2.5 2-1-1H9l3 3v-2Zm-4 1v-3L6 17l3 3v-3H7v-0Z"/>
  </svg>
);

const MergeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3h8v2H5v14h6v2H3V3Zm10 0h8v18h-8v-2h6V5h-6V3ZM9 11h6v2H9v-2Z"/>
  </svg>
);

const CsvIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm-1 7V3.5L18.5 9H13ZM8 12h2v2H8v-2Zm0 3h2v2H8v-2Zm3-3h2v2h-2v-2Zm0 3h2v2h-2v-2Zm3-3h2v2h-2v-2Zm0 3h2v2h-2v-2Z"/>
  </svg>
);

const XlsxIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm-1 7V3.5L18.5 9H13Zm-3.5 4 1.5 2.2 1.5-2.2H14l-2 3 2 3h-1.5L11 14.8 9.5 17H8l2-3-2-3h1.5Z"/>
  </svg>
);

export function Toolbar({ format, onFormatChange, onExport, onFindAndReplace, onRemoveDuplicates, onMergeCells, canMerge }: ToolbarProps) {
  return (
    <div className="flex h-10 items-center gap-0.5 overflow-x-auto border-b border-outline-variant/40 bg-surface-container-low px-2">

      {/* Bold */}
      <IconButton size="sm" icon={<BoldIcon />} title="Bold (Ctrl+B)" active={format.bold} onClick={() => onFormatChange({ bold: !format.bold })} />

      {/* Italic */}
      <IconButton size="sm" icon={<ItalicIcon />} title="Italic (Ctrl+I)" active={format.italic} onClick={() => onFormatChange({ italic: !format.italic })} />

      <div className="mx-1 h-5 w-px bg-outline-variant/40" />

      {/* Text Color – "A" with a colored underbar */}
      <IconButton
        size="sm"
        title="Text color"
        onClick={() => {
          const color = prompt('Enter text color (hex):', format.textColor || '#000000');
          if (color) onFormatChange({ textColor: color });
        }}
        icon={
          <span className="flex flex-col items-center leading-none gap-[2px]">
            <span className="text-[13px] font-bold">A</span>
            <span className="h-[3px] w-3.5 rounded-full" style={{ backgroundColor: format.textColor || 'currentColor' }} />
          </span>
        }
      />

      {/* Fill Color – paint-bucket SVG with a rainbow border ring */}
      <button
        title="Fill color"
        onClick={() => {
          const color = prompt('Enter fill color (hex):', format.bgColor || '#ffffff');
          if (color) onFormatChange({ bgColor: color });
        }}
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150 hover:scale-105 cursor-pointer"
        style={{
          background: 'conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
          padding: 2,
        }}
      >
        {/* inner disc shows current fill colour */}
        <span
          className="flex h-full w-full items-center justify-center rounded-full"
          style={{ backgroundColor: format.bgColor || 'var(--md-sys-color-surface-container-low)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={format.bgColor ? 'var(--md-sys-color-on-surface)' : 'currentColor'}>
            <path d="M16.56 8.94 7.62 0 6.21 1.41l2.38 2.38-5.15 5.15a1.49 1.49 0 0 0 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12ZM5.21 10 10 5.21 14.79 10H5.21ZM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5ZM2 20h20v2H2v-2Z"/>
          </svg>
        </span>
      </button>

      <div className="mx-1 h-5 w-px bg-outline-variant/40" />

      {/* Alignment */}
      <IconButton size="sm" icon={<AlignLeftIcon />}   title="Align left"   active={format.align === 'left'}   onClick={() => onFormatChange({ align: 'left' })} />
      <IconButton size="sm" icon={<AlignCenterIcon />} title="Align center" active={format.align === 'center'} onClick={() => onFormatChange({ align: 'center' })} />
      <IconButton size="sm" icon={<AlignRightIcon />}  title="Align right"  active={format.align === 'right'}  onClick={() => onFormatChange({ align: 'right' })} />

      <div className="mx-1 h-5 w-px bg-outline-variant/40" />

      {/* Remove Duplicates */}
      <IconButton size="sm" icon={<DedupeIcon />}        title="Remove Duplicates"   onClick={onRemoveDuplicates} />

      {/* Find / Replace */}
      <IconButton size="sm" icon={<SearchReplaceIcon />} title="Find and Replace"     onClick={onFindAndReplace} />

      {/* Merge Cells */}
      <IconButton
        size="sm"
        icon={<MergeIcon />}
        title={canMerge ? 'Merge / Unmerge Cells' : 'Select multiple cells to merge'}
        onClick={onMergeCells}
        disabled={!canMerge}
      />

      <div className="flex-1" />

      {/* Export CSV */}
      <button
        title="Export as CSV"
        onClick={() => onExport('csv')}
        className={cn(
          'inline-flex h-7 items-center gap-1.5 rounded-full border border-outline-variant',
          'bg-surface-container px-3 text-[11px] font-medium text-on-surface-variant',
          'transition-all duration-150 hover:bg-primary/10 hover:text-primary hover:border-primary/40',
          'cursor-pointer select-none'
        )}
      >
        <CsvIcon />
        CSV
      </button>

      {/* Export XLSX */}
      <button
        title="Export as Excel (XLSX)"
        onClick={() => onExport('xlsx')}
        className={cn(
          'ml-1 inline-flex h-7 items-center gap-1.5 rounded-full border border-outline-variant',
          'bg-surface-container px-3 text-[11px] font-medium text-on-surface-variant',
          'transition-all duration-150 hover:bg-primary/10 hover:text-primary hover:border-primary/40',
          'cursor-pointer select-none'
        )}
      >
        <XlsxIcon />
        XLSX
      </button>
    </div>
  );
}
