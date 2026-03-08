'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface SnackbarProps {
  open: boolean;
  message: string;
  action?: { label: string; onClick: () => void };
  onClose: () => void;
  duration?: number;
  variant?: 'default' | 'error';
}

export function Snackbar({ open, message, action, onClose, duration = 4000, variant = 'default' }: SnackbarProps) {
  useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          className={cn(
            'fixed bottom-6 left-1/2 z-50 -translate-x-1/2',
            'flex items-center gap-3 rounded-xs px-4 py-3',
            'text-sm shadow-elevation-3',
            variant === 'error'
              ? 'bg-error-container text-on-error-container'
              : 'bg-inverse-surface text-inverse-on-surface'
          )}
        >
          <span className="flex-1">{message}</span>
          {action && (
            <button
              onClick={action.onClick}
              className="font-medium text-inverse-primary hover:opacity-80"
            >
              {action.label}
            </button>
          )}
          <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100">
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
