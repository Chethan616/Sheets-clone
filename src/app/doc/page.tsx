'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { subscribeToDocument } from '@/lib/firestore';
import { SpreadsheetEditor } from '@/components/editor/SpreadsheetEditor';
import { CircularLoading } from '@/components/ui/LoadingIndicator';
import type { SpreadsheetDocument } from '@/lib/types';

export default function DocumentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const docId = searchParams.get('id') ?? '';

  const [doc, setDoc] = useState<SpreadsheetDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!docId) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToDocument(docId, (nextDoc) => {
      setDoc(nextDoc);
      setLoading(false);
    });

    return unsubscribe;
  }, [docId]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <CircularLoading size="lg" />
      </div>
    );
  }

  if (!docId) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-surface">
        <div className="text-6xl">📄</div>
        <h1 className="text-xl font-medium text-on-surface">Missing document id</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-on-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-surface">
        <div className="text-6xl">📄</div>
        <h1 className="text-xl font-medium text-on-surface">Document not found</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-on-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return <SpreadsheetEditor document={doc} />;
}