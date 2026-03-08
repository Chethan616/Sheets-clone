'use client';

import { useState, useEffect, useCallback } from 'react';
import { subscribeToUserDocuments, createDocument, updateDocument, deleteDocument } from '@/lib/firestore';
import type { SpreadsheetDocument } from '@/lib/types';

export function useDocuments(userId: string | undefined) {
  const [documents, setDocuments] = useState<SpreadsheetDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToUserDocuments(userId, (docs) => {
      setDocuments(docs);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const create = useCallback(
    async (title?: string) => {
      if (!userId) return '';
      return createDocument(userId, '', title);
    },
    [userId]
  );

  const rename = useCallback(async (id: string, title: string) => {
    await updateDocument(id, { title });
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteDocument(id);
  }, []);

  return { documents, loading, create, rename, remove };
}
