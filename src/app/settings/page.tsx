'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { IconButton } from '@/components/ui/IconButton';
import { CircularLoading } from '@/components/ui/LoadingIndicator';
import { Avatar } from '@/components/ui/Avatar';
import { updateUserProfile } from '@/lib/firestore';

export default function SettingsPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
    if (user) {
      setDisplayName(user.displayName);
    }
  }, [user, loading, router]);

  if (loading || !user || !mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <CircularLoading size="lg" />
      </div>
    );
  }

  const handleSave = async () => {
    if (!displayName.trim()) return;
    setSaving(true);
    await updateUserProfile(user.uid, { displayName: displayName.trim() });
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-outline-variant/40 bg-surface px-4 md:px-6">
        <IconButton
          icon={<span className="text-base">←</span>}
          title="Back"
          onClick={() => router.back()}
        />
        <h1 className="text-xl font-medium text-on-surface">Settings</h1>
      </header>

      <div className="mx-auto max-w-2xl space-y-6 p-6">
        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card variant="outlined">
            <h3 className="mb-4 text-base font-medium text-on-surface">Profile</h3>
            <div className="flex items-center gap-4">
              <Avatar
                src={user.photoURL}
                name={user.displayName}
                color={user.color}
                size="lg"
              />
              <div className="flex-1 space-y-3">
                <TextField
                  label="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  variant="outlined"
                />
                <p className="text-xs text-on-surface-variant">
                  {user.email || 'Guest account'}
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="tonal"
                onClick={handleSave}
                loading={saving}
                disabled={displayName.trim() === user.displayName}
              >
                Save
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Theme */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="outlined">
            <h3 className="mb-4 text-base font-medium text-on-surface">Appearance</h3>
            <div className="flex gap-3">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex flex-1 flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    theme === t
                      ? 'border-primary bg-primary-container/30'
                      : 'border-outline-variant/40 hover:bg-surface-container'
                  }`}
                >
                  <span className="text-2xl">
                    {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '💻'}
                  </span>
                  <span className="text-xs font-medium capitalize text-on-surface">
                    {t}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Account */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card variant="outlined">
            <h3 className="mb-4 text-base font-medium text-on-surface">Account</h3>
            <Button
              variant="outlined"
              onClick={async () => {
                await signOut();
                router.replace('/login');
              }}
            >
              Sign Out
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
