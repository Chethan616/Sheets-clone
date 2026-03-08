'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { subscribeToDocument } from '@/lib/firestore';
import { SpreadsheetEditor } from '@/components/editor/SpreadsheetEditor';
import { CircularLoading } from '@/components/ui/LoadingIndicator';
import type { SpreadsheetDocument } from '@/lib/types';

export default function DocumentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const docId = params.id as string;

  const [doc, setDoc] = useState<SpreadsheetDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!docId) return;

    const unsubscribe = subscribeToDocument(docId, (d) => {
      setDoc(d);
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
