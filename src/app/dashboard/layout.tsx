'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { LogOut, Settings, Table } from 'lucide-react';
import { CircularLoading } from '@/components/ui/LoadingIndicator';
import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/IconButton';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <CircularLoading size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant/40 bg-surface px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
            <Table size={24} />
          </div>
          <h1 className="text-xl font-medium text-on-surface hidden sm:block">Sheets Clone</h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <IconButton
            icon={<Settings size={20} />}
            title="Settings"
            onClick={() => router.push('/settings')}
          />
          <div className="ml-2 flex items-center gap-2 pl-2 border-l border-outline-variant/40">
            <Avatar
              src={user.photoURL}
              name={user.displayName}
              color={user.color}
              size="sm"
            />
            <span className="hidden text-sm font-medium text-on-surface md:inline">
              {user.displayName}
            </span>
          </div>
          <IconButton
            icon={<LogOut size={20} />}
            title="Sign out"
            onClick={signOut}
            className="text-error"
          />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
