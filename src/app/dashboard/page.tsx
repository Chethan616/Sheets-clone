'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useDocuments } from '@/hooks/useDocuments';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { FilePlus, FileSpreadsheet, Plus } from 'lucide-react';
import { DocumentCard } from '@/components/dashboard/DocumentCard';
import { FAB } from '@/components/ui/FAB';
import { Skeleton } from '@/components/ui/LoadingIndicator';
import { useHaptics } from '@/components/providers/HapticsProvider';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { user } = useAuth();
  const { documents, loading, create, rename, remove } = useDocuments(user?.uid);
  const router = useRouter();
  const { trigger } = useHaptics();

  const handleCreate = async () => {
    trigger('nudge');
    const id = await create();
    if (id) {
      router.push(`/doc?id=${encodeURIComponent(id)}`);
    }
  };

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-8 md:px-6">
      {/* Section Title */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-medium text-on-surface">Recent Documents</h2>
        <div className="text-sm font-medium text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">
          {documents.length} document{documents.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-surface-container-low p-4 animate-pulse">
              <Skeleton className="mb-3 h-32 w-full rounded-lg" />
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="mt-2 h-4 w-1/2 rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && documents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-primary-container text-on-primary-container shadow-elevation-1">
            <FileSpreadsheet size={48} />
          </div>
          <h3 className="text-2xl font-medium text-on-surface">No documents yet</h3>
          <p className="mt-2 max-w-sm text-base text-on-surface-variant">
            Create your first spreadsheet to start organizing your data and collaborating with others.
          </p>
          <div className="mt-8">
            <Button
              variant="filled"
              onClick={handleCreate}
              icon={<Plus size={20} />}
              className="px-6 py-3 text-base h-12 rounded-full"
            >
              Create Document
            </Button>
          </div>
        </motion.div>
      )}

      {/* Document Grid */}
      {!loading && documents.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pb-20">
          <AnimatePresence mode="popLayout">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onClick={() => router.push(`/doc?id=${encodeURIComponent(doc.id)}`)}
                onRename={(title) => rename(doc.id, title)}
                onDelete={() => remove(doc.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* FAB */}
      {documents.length > 0 && (
        <div className="fixed bottom-8 right-8 z-40">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
          >
            <FAB
              icon={<Plus size={24} />}
              label="New"
              variant="primary"
              onClick={handleCreate}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
