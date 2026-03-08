'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useHaptics } from '@/components/providers/HapticsProvider';
import { useCells } from '@/hooks/useCells';
import { usePresence } from '@/hooks/usePresence';
import { Grid } from '@/components/editor/Grid';
import { FormulaBar } from '@/components/editor/FormulaBar';
import { Toolbar } from '@/components/editor/Toolbar';
import { WriteStateIndicator } from '@/components/editor/WriteStateIndicator';
import { PresenceAvatars } from '@/components/editor/PresenceAvatars';
import { IconButton } from '@/components/ui/IconButton';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';
import { cellId, colToLetter, letterToCol } from '@/lib/utils';
import { isFormula } from '@/lib/formula/evaluator';
import { updateDocument } from '@/lib/firestore';
import { updateCell as fbUpdateCell } from '@/lib/firestore';
import { exportToCSV, exportToXLSX, downloadCSV } from '@/lib/export';
import type { SpreadsheetDocument, CellPosition, CellFormat, CellRange, CellData, MergedRegion } from '@/lib/types';

interface SpreadsheetEditorProps {
  document: SpreadsheetDocument;
}

export function SpreadsheetEditor({ document: doc }: SpreadsheetEditorProps) {
  const { user } = useAuth();
  const { trigger } = useHaptics();

  const { cells, writeState, updateCell, updateCellFormat, updateMultipleCells } = useCells(doc.id, user?.uid);
  const { users: presenceUsers, setActiveCell } = usePresence(
    doc.id,
    user ? { uid: user.uid, displayName: user.displayName, color: user.color, photoURL: user.photoURL } : null
  );

  const [activeCell, setActiveCellState] = useState<CellPosition | null>({ row: 0, col: 0 });
  const [selectionRange, setSelectionRange] = useState<CellRange | null>(null);
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);
  const [editValue, setEditValue] = useState('');
  const [title, setTitle] = useState(doc.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>(doc.columnWidths || {});
  const [rowHeights, setRowHeights] = useState<Record<number, number>>(doc.rowHeights || {});
  const [columnOrder, setColumnOrder] = useState<number[]>(
    doc.columnOrder || Array.from({ length: doc.colCount }, (_, i) => i)
  );
  const [mergedCells, setMergedCells] = useState<MergedRegion[]>([]);

  // Current active cell reference string (e.g., "A1")
  const activeCellRef = activeCell ? cellId(activeCell.row, activeCell.col) : '';
  const activeCellData = activeCellRef ? cells[activeCellRef] : undefined;
  const activeCellFormat: CellFormat = activeCellData?.format || {};

  // Formula bar value: show formula if cell has one, otherwise show value
  const formulaBarValue = editingCell
    ? editValue
    : activeCellData?.formula && isFormula(activeCellData.formula)
      ? activeCellData.formula
      : activeCellData?.value || '';

  // ─── Cell Selection ─────────────────────────────────────────────────────
  const handleCellSelect = useCallback(
    (pos: CellPosition) => {
      // Commit current edit if we have one
      if (editingCell) {
        commitEdit();
      }
      setActiveCellState(pos);
      // Reset selection when simply clicking a cell (Grid will handle drag-selection)
      // Actually, Grid sets selection range on MouseDown, so we don't clear it here if it's part of that flow
      // But if we navigate with keyboard, we should reset it to just the cell
      setSelectionRange({ start: pos, end: pos });
      
      setEditingCell(null);
      const id = cellId(pos.row, pos.col);
      setActiveCell(id);
      trigger('tap');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editingCell, trigger]
  );
  
  // Handled by Grid now
  const handleSelectionChange = useCallback((range: CellRange | null) => {
    setSelectionRange(range);
  }, []);

  // ─── Cell Editing ───────────────────────────────────────────────────────
  const handleCellDoubleClick = useCallback(
    (pos: CellPosition) => {
      setEditingCell(pos);
      const id = cellId(pos.row, pos.col);
      const cell = cells[id];
      // Show formula text when editing, otherwise show value
      if (cell?.formula && isFormula(cell.formula)) {
        setEditValue(cell.formula);
      } else {
        setEditValue(cell?.value || '');
      }
    },
    [cells]
  );

  const commitEdit = useCallback(() => {
    if (!editingCell || !user) return;
    const id = cellId(editingCell.row, editingCell.col);

    let valueToCommit = editValue;
    // Auto-detect formula patterns (e.g. SUM(A1:A5) → =SUM(A1:A5))
    if (valueToCommit && !valueToCommit.startsWith('=')) {
      const formulaPattern = /^(SUM|AVERAGE|AVG|COUNT|MIN|MAX|ABS|ROUND|IF|TRIM|UPPER|LOWER)\s*\(/i;
      if (formulaPattern.test(valueToCommit)) {
        valueToCommit = '=' + valueToCommit;
      }
    }

    updateCell(id, valueToCommit);
    setEditingCell(null);
    trigger('success');
  }, [editingCell, editValue, updateCell, user, trigger]);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  // ─── Formula Bar ───────────────────────────────────────────────────────
  const handleFormulaBarChange = useCallback(
    (value: string) => {
      if (editingCell) {
        setEditValue(value);
      } else if (activeCell) {
        // Start editing via formula bar
        setEditingCell(activeCell);
        setEditValue(value);
      }
    },
    [editingCell, activeCell]
  );

  // ─── Format Changes ────────────────────────────────────────────────────
  const handleFormatChange = useCallback(
    (format: Partial<CellFormat>) => {
      if (!activeCell) return;
      const id = cellId(activeCell.row, activeCell.col);
      updateCellFormat(id, format);
      trigger('tap');
    },
    [activeCell, updateCellFormat, trigger]
  );

  // ─── Column Resize ─────────────────────────────────────────────────────
  const handleColumnResize = useCallback(
    (col: number, width: number) => {
      setColumnWidths((prev) => ({ ...prev, [col]: width }));
      // Debounced save could go here
    },
    []
  );

  const handleRowResize = useCallback(
    (row: number, height: number) => {
      setRowHeights((prev) => ({ ...prev, [row]: height }));
    },
    []
  );

  const handleColumnReorder = useCallback((fromIndex: number, toIndex: number) => {
    setColumnOrder((prev) => {
      const newOrder = [...prev];
      const [moved] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, moved);
      return newOrder;
    });
  }, []);

  // ─── Bonus Features ─────────────────────────────────────────────────────
  const handleRemoveDuplicates = useCallback(() => {
    const colStr = prompt('Enter column letter to check for duplicates (e.g. A):');
    if (!colStr) return;

    const colIndex = letterToCol(colStr.toUpperCase());
    if (colIndex < 0 || colIndex >= doc.colCount) {
      alert('Invalid column');
      return;
    }

    const seen = new Set<string>();
    const rowsToClear: number[] = [];

    // Identify duplicates logic: iterate rows, check specific column value
    for (let r = 0; r < doc.rowCount; r++) {
      const id = cellId(r, colIndex);
      const val = cells[id]?.value;
      if (val) {
        if (seen.has(val)) {
          rowsToClear.push(r);
        } else {
          seen.add(val);
        }
      }
    }

    if (rowsToClear.length === 0) {
      alert('No duplicates found.');
      return;
    }

    if (confirm(`Found ${rowsToClear.length} duplicate rows. Clear them?`)) {
      const updates: Record<string, Partial<CellData>> = {};
      rowsToClear.forEach((r) => {
        for (let c = 0; c < doc.colCount; c++) {
          const id = cellId(r, c);
          // Only clear if cell exists (optimization)
          if (cells[id]) {
            updates[id] = { value: '', formula: '' };
          }
        }
      });
      updateMultipleCells(updates);
    }
  }, [cells, doc.colCount, doc.rowCount, updateMultipleCells]);

  // ─── Merge Cells ──────────────────────────────────────────────────────
  const handleMergeCells = useCallback(() => {
    if (!selectionRange) return;
    const startRow = Math.min(selectionRange.start.row, selectionRange.end.row);
    const endRow = Math.max(selectionRange.start.row, selectionRange.end.row);
    const startCol = Math.min(selectionRange.start.col, selectionRange.end.col);
    const endCol = Math.max(selectionRange.start.col, selectionRange.end.col);

    if (startRow === endRow && startCol === endCol) return; // single cell, nothing to merge

    // Check if this region is already merged → unmerge
    const existingIdx = mergedCells.findIndex(
      (m) => m.startRow === startRow && m.endRow === endRow && m.startCol === startCol && m.endCol === endCol
    );
    if (existingIdx >= 0) {
      setMergedCells((prev) => prev.filter((_, i) => i !== existingIdx));
      return;
    }

    // Remove any existing merges that overlap with the new region
    const filtered = mergedCells.filter(
      (m) => m.endRow < startRow || m.startRow > endRow || m.endCol < startCol || m.startCol > endCol
    );

    // Move non-anchor cell values into anchor cell if anchor is empty
    const anchorId = cellId(startRow, startCol);
    if (!cells[anchorId]?.value) {
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          if (r === startRow && c === startCol) continue;
          const id = cellId(r, c);
          if (cells[id]?.value) {
            updateCell(anchorId, cells[id].value);
            break;
          }
        }
      }
    }

    filtered.push({ startRow, startCol, endRow, endCol });
    setMergedCells(filtered);
    trigger('success');
  }, [selectionRange, mergedCells, cells, updateCell, trigger]);

  const canMerge = !!(selectionRange && (
    selectionRange.start.row !== selectionRange.end.row ||
    selectionRange.start.col !== selectionRange.end.col
  ));

  const handleFindAndReplace = useCallback(() => {
    const findStr = prompt('Find what?');
    if (!findStr) return;
    const replaceStr = prompt('Replace with?') || '';

    const updates: Record<string, Partial<CellData>> = {};
    let count = 0;

    Object.entries(cells).forEach(([id, cell]) => {
      if (cell.value && String(cell.value).includes(findStr)) {
        const newValue = String(cell.value).replaceAll(findStr, replaceStr);
        const newFormula = cell.formula && isFormula(cell.formula)
            ? cell.formula.replaceAll(findStr, replaceStr)
            : '';
            
        updates[id] = { value: newValue, formula: newFormula };
        count++;
      }
    });

    if (count === 0) {
      alert('No matches found.');
      return;
    }

    if (confirm(`Replace all ${count} occurrences?`)) {
      updateMultipleCells(updates);
    }
  }, [cells, updateMultipleCells]);

  // ─── Title Editing ─────────────────────────────────────────────────────
  const handleTitleBlur = useCallback(() => {
    setEditingTitle(false);
    if (title.trim() && title !== doc.title) {
      updateDocument(doc.id, { title: title.trim() });
    }
  }, [title, doc.id, doc.title]);

  // ─── Export ─────────────────────────────────────────────────────────────
  const handleExport = useCallback(
    (type: 'csv' | 'xlsx') => {
      if (type === 'csv') {
        const csv = exportToCSV(cells, doc.rowCount, doc.colCount);
        downloadCSV(csv, doc.title);
      } else {
        exportToXLSX(cells, doc.rowCount, doc.colCount, doc.title);
      }
      trigger('success');
    },
    [cells, doc, trigger]
  );

  // ─── Keyboard shortcuts (Ctrl+B, Ctrl+I) ──────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        handleFormatChange({ bold: !activeCellFormat.bold });
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        handleFormatChange({ italic: !activeCellFormat.italic });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeCellFormat, handleFormatChange]);

  // ─── Real-time Sync & Persistence ───────────────────────────────────────
  
  // Sync local state with document updates from firestore
  useEffect(() => {
    if (doc.columnWidths) {
      setColumnWidths(prev => {
        // avoid update if identical or if user is interacting (simple heuristic: don't overwrite)
        // For now, simple override. In production, check dragging state?
        if (JSON.stringify(prev) === JSON.stringify(doc.columnWidths)) return prev;
        return doc.columnWidths!;
      });
    }
    if (doc.rowHeights) {
      setRowHeights(prev => {
        if (JSON.stringify(prev) === JSON.stringify(doc.rowHeights)) return prev;
        return doc.rowHeights!;
      });
    }
    if (doc.columnOrder) {
      setColumnOrder(prev => {
        if (JSON.stringify(prev) === JSON.stringify(doc.columnOrder)) return prev;
        return doc.columnOrder!;
      });
    }
  }, [doc.columnWidths, doc.rowHeights, doc.columnOrder]);

  // Debounced save for layout changes
  useEffect(() => {
    const handler = setTimeout(() => {
      const updates: Partial<SpreadsheetDocument> = {};
      let changed = false;

      // Only save if different from doc prop (base truth)
      if (JSON.stringify(columnWidths) !== JSON.stringify(doc.columnWidths || {})) {
        updates.columnWidths = columnWidths;
        changed = true;
      }
      if (JSON.stringify(rowHeights) !== JSON.stringify(doc.rowHeights || {})) {
        updates.rowHeights = rowHeights;
        changed = true;
      }
      if (columnOrder && JSON.stringify(columnOrder) !== JSON.stringify(doc.columnOrder)) {
        updates.columnOrder = columnOrder;
        changed = true;
      }

      if (changed) {
        updateDocument(doc.id, updates);
      }
    }, 2000);

    return () => clearTimeout(handler);
  }, [columnWidths, rowHeights, columnOrder, doc.columnWidths, doc.rowHeights, doc.columnOrder, doc.id]);

  return (
    <div className="flex h-screen flex-col bg-surface">
      {/* Top Bar */}
      <header className="flex h-12 items-center justify-between border-b border-outline-variant/40 bg-surface px-2 md:px-4">
        <div className="flex items-center gap-2">
          <IconButton
            icon={<span className="text-base">←</span>}
            title="Back to dashboard"
            onClick={() => window.history.back()}
            size="sm"
          />
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container">
            <span className="text-base">📊</span>
          </div>
          {editingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
              autoFocus
              className="h-7 rounded-xs border border-primary bg-surface px-2 text-sm font-medium text-on-surface outline-none"
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="text-sm font-medium text-on-surface hover:text-primary"
            >
              {title}
            </button>
          )}
          <WriteStateIndicator state={writeState} />
        </div>

        <div className="flex items-center gap-2">
          <PresenceAvatars users={presenceUsers} />
          <ThemeToggle />
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar
        format={activeCellFormat}
        onFormatChange={handleFormatChange}
        onExport={handleExport}
        onFindAndReplace={handleFindAndReplace}
        onRemoveDuplicates={handleRemoveDuplicates}
        onMergeCells={handleMergeCells}
        canMerge={canMerge}
      />

      {/* Formula Bar */}
      <FormulaBar
        cellRef={activeCellRef}
        value={formulaBarValue}
        onChange={handleFormulaBarChange}
        onCommit={commitEdit}
        onCancel={cancelEdit}
      />

      {/* Grid */}
      <Grid
        rowCount={doc.rowCount}
        colCount={doc.colCount}
        cells={cells}
        activeCell={activeCell}
        selectionRange={selectionRange}
        editingCell={editingCell}
        editValue={editValue}
        columnWidths={columnWidths}
        rowHeights={rowHeights}
        columnOrder={columnOrder}
        presenceUsers={presenceUsers}
        onCellSelect={handleCellSelect}
        onSelectionChange={handleSelectionChange}
        onCellDoubleClick={handleCellDoubleClick}
        onEditChange={setEditValue}
        onEditCommit={commitEdit}
        onEditCancel={cancelEdit}
        onColumnResize={handleColumnResize}
        onRowResize={handleRowResize}
        onColumnReorder={handleColumnReorder}
        mergedCells={mergedCells}
      />

      {/* Status Bar */}
      <div className="flex h-7 items-center justify-between border-t border-outline-variant/40 bg-surface-container-low px-4 text-xs text-on-surface-variant">
        <span>
          {doc.rowCount} rows × {doc.colCount} cols
        </span>
        <span>
          {activeCellRef && cells[activeCellRef]
            ? `Value: ${cells[activeCellRef].value || '(empty)'}`
            : 'Ready'}
        </span>
      </div>
    </div>
  );
}
