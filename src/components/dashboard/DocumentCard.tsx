'use client';

import { motion } from 'motion/react';
import { Edit2, FileSpreadsheet, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { timeAgo } from '@/lib/utils';
import type { SpreadsheetDocument } from '@/lib/types';

interface DocumentCardProps {
  doc: SpreadsheetDocument;
  onClick: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}

export function DocumentCard({ doc, onClick, onRename, onDelete }: DocumentCardProps) {
  return (
    <motion.div
      layout
      className="group relative"
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div 
        onClick={onClick}
        className="block cursor-pointer overflow-hidden rounded-2xl bg-surface-container-low transition-colors hover:bg-surface-container"
      >
        {/* Preview Area */}
        <div className="flex h-32 items-center justify-center bg-surface-container-high/30 p-4">
          <div className="relative grid h-full w-full grid-cols-4 grid-rows-4 gap-px overflow-hidden rounded-lg border border-outline-variant/20 bg-surface opacity-60 shadow-sm">
             {/* Mini grid lines */}
             {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="bg-surface-container-highest/20" />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                 <FileSpreadsheet className="text-primary/20" size={32} />
              </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="line-clamp-1 text-sm font-medium text-on-surface">
                {doc.title}
              </h3>
              <p className="mt-1 text-xs text-on-surface-variant">
                Edited {timeAgo(doc.updatedAt)}
              </p>
            </div>
            
            {/* Action Buttons (visible on hover) */}
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newTitle = prompt('Rename document:', doc.title);
                  if (newTitle?.trim()) onRename(newTitle.trim());
                }}
                className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container-highest hover:text-primary transition-colors"
                title="Rename"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this document?')) onDelete();
                }}
                className="rounded-full p-1.5 text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
