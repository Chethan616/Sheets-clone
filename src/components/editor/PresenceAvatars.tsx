'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import type { UserPresence } from '@/lib/types';

interface PresenceAvatarsProps {
  users: UserPresence[];
}

export function PresenceAvatars({ users }: PresenceAvatarsProps) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <AnimatePresence mode="popLayout">
        {users.map((u) => (
          <motion.div
            key={u.uid}
            initial={{ opacity: 0, scale: 0, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0, x: -10 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Chip color={u.color} icon={<Avatar src={u.photoURL} name={u.displayName} color={u.color} size="sm" />}>
              {u.displayName}
            </Chip>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
