'use client';

import { createContext, useContext, useCallback, useRef, useEffect, type ReactNode } from 'react';

type HapticPreset = 'success' | 'nudge' | 'error' | 'buzz' | 'tap';

interface HapticsContextType {
  trigger: (preset?: HapticPreset) => void;
  isSupported: boolean;
}

const HapticsContext = createContext<HapticsContextType>({
  trigger: () => {},
  isSupported: false,
});

export function useHaptics() {
  return useContext(HapticsContext);
}

const PATTERNS: Record<HapticPreset, number | number[]> = {
  tap: 10,
  success: [10, 50, 10],
  nudge: [30, 20, 10],
  error: [20, 30, 20, 30, 20],
  buzz: 200,
};

export function HapticsProvider({ children }: { children: ReactNode }) {
  const supported = useRef(false);

  useEffect(() => {
    supported.current = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }, []);

  const trigger = useCallback((preset: HapticPreset = 'tap') => {
    if (!supported.current) return;
    try {
      const pattern = PATTERNS[preset];
      navigator.vibrate(pattern);
    } catch {
      // Silently fail on unsupported devices
    }
  }, []);

  return (
    <HapticsContext value={{ trigger, isSupported: supported.current }}>
      {children}
    </HapticsContext>
  );
}
