'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { IconButton } from '@/components/ui/IconButton';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <IconButton icon={<Moon size={20} />} title="Theme" />;
  }

  return (
    <IconButton
      icon={resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      variant="standard"
    />
  );
}
