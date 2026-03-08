'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { subscribeToCells, updateCell as fbUpdateCell, updateCellsBatch } from '@/lib/firestore';
import { evaluateFormula, isFormula } from '@/lib/formula/evaluator';
import { extractCellRefs } from '@/lib/formula/references';
import type { CellMap, CellData, WriteState } from '@/lib/types';

export function useCells(docId: string | undefined, userId: string | undefined) {
  const [cells, setCells] = useState<CellMap>({});
  const [writeState, setWriteState] = useState<WriteState>('synced');
  const pendingRef = useRef(false);

  useEffect(() => {
    if (!docId) return;

    const unsubscribe = subscribeToCells(docId, (newCells, hasPendingWrites) => {
      setCells(newCells);
      if (hasPendingWrites) {
        setWriteState('pending');
        pendingRef.current = true;
      } else if (pendingRef.current) {
        setWriteState('synced');
        pendingRef.current = false;
      }
    });

    return unsubscribe;
  }, [docId]);

  const updateCell = useCallback(
    async (cellId: string, value: string) => {
      if (!docId || !userId) return;
      
      // Optimistic update
      setCells((prev) => ({
        ...prev,
        [cellId]: { ...prev[cellId], value, formula: isFormula(value) ? value : '' },
      }));

      setWriteState('pending');
      pendingRef.current = true;
      try {
        const cellData: Partial<CellData> = { value };
        if (isFormula(value)) {
          cellData.formula = value;
        } else {
          cellData.formula = '';
        }
        await fbUpdateCell(docId, cellId, cellData, userId);
      } catch {
        setWriteState('error');
      }
    },
    [docId, userId]
  );

  const updateCellFormat = useCallback(
    async (cellId: string, format: Partial<import('@/lib/types').CellFormat>) => {
      if (!docId || !userId) return;

      // Optimistic update
      setCells((prev) => {
        const currentCell = prev[cellId] || { value: '', formula: '' };
        const currentFormat = currentCell.format || {};
        return {
          ...prev,
          [cellId]: { 
            ...currentCell, 
            format: { ...currentFormat, ...format },
            // Ensure value exists if creating new cell
            value: currentCell.value || '',
          },
        };
      });

      setWriteState('pending');
      pendingRef.current = true;
      try {
        const currentFormat = cells[cellId]?.format || {};
        const newFormat = { ...currentFormat, ...format };
        await fbUpdateCell(docId, cellId, { format: newFormat }, userId);
      } catch {
        setWriteState('error');
      }
    },
    [docId, userId, cells]
  );

  const updateMultipleCells = useCallback(
    async (cellUpdates: Record<string, Partial<CellData>>) => {
      if (!docId || !userId) return;
      setWriteState('pending');
      pendingRef.current = true;
      try {
        await updateCellsBatch(docId, cellUpdates, userId);
      } catch {
        setWriteState('error');
      }
    },
    [docId, userId]
  );

  // Compute display values (evaluating formulas)
  const computedCells = useCallback((): Record<string, string> => {
    const result: Record<string, string> = {};
    for (const [id, cell] of Object.entries(cells)) {
      if (cell.formula && isFormula(cell.formula)) {
        result[id] = evaluateFormula(cell.formula, cells);
      } else {
        result[id] = cell.value || '';
      }
    }
    return result;
  }, [cells]);

  return {
    cells,
    computedCells,
    writeState,
    updateCell,
    updateCellFormat,
    updateMultipleCells,
  };
}
