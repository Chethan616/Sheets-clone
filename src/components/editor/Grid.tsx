'use client';

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  colToLetter,
  cellId,
  cn,
  DEFAULT_COL_WIDTH,
  DEFAULT_ROW_HEIGHT,
  HEADER_WIDTH,
  HEADER_HEIGHT,
} from '@/lib/utils';
import { evaluateFormula, isFormula } from '@/lib/formula/evaluator';
import type { CellMap, CellFormat, CellPosition, CellRange, UserPresence, MergedRegion } from '@/lib/types';

interface GridProps {
  rowCount: number;
  colCount: number;
  cells: CellMap;
  activeCell: CellPosition | null;
  selectionRange: CellRange | null;
  editingCell: CellPosition | null;
  editValue: string;
  columnWidths?: Record<number, number>;
  rowHeights?: Record<number, number>;
  presenceUsers: UserPresence[];
  onCellSelect: (pos: CellPosition) => void;
  onSelectionChange: (range: CellRange | null) => void;
  onCellDoubleClick: (pos: CellPosition) => void;
  onEditChange: (value: string | ((prev: string) => string)) => void;
  onEditCommit: () => void;
  onEditCancel: () => void;
  onColumnResize: (col: number, width: number) => void;
  onRowResize: (row: number, height: number) => void;
  columnOrder?: number[];
  onColumnReorder?: (from: number, to: number) => void;
  mergedCells?: MergedRegion[];
}

export function Grid({
  rowCount,
  colCount,
  cells,
  activeCell,
  selectionRange,
  editingCell,
  editValue,
  columnWidths = {},
  rowHeights = {},
  columnOrder,
  presenceUsers,
  onCellSelect,
  onSelectionChange,
  onCellDoubleClick,
  onEditChange,
  onEditCommit,
  onEditCancel,
  onColumnResize,
  onRowResize,
  onColumnReorder,
  mergedCells = [],
}: GridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const isSelectingRef = useRef(false);

  // Ref to track that editing was initiated but React hasn't re-rendered yet (stale closure fix)
  const pendingEditRef = useRef(false);
  useEffect(() => {
    pendingEditRef.current = false;
  }, [editingCell]);

  const [resizingCol, setResizingCol] = useState<number | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);

  const [resizingRow, setResizingRow] = useState<number | null>(null);
  const resizeStartY = useRef(0);
  const resizeStartHeight = useRef(0);

  // Drag and drop state for column reorder
  const [draggedCol, setDraggedCol] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<number | null>(null);

  const getLogicalCol = useCallback(
    (visualIndex: number) => {
      if (!columnOrder) return visualIndex;
      const logical = columnOrder[visualIndex];
      return logical !== undefined ? logical : visualIndex;
    },
    [columnOrder]
  );

  const getVisualIndex = useCallback(
    (logicalCol: number) => {
      if (!columnOrder) return logicalCol;
      const idx = columnOrder.indexOf(logicalCol);
      return idx === -1 ? logicalCol : idx;
    },
    [columnOrder]
  );

  const getColWidth = useCallback(
    (visualIndex: number) => {
      const logicalCol = getLogicalCol(visualIndex);
      return columnWidths[logicalCol] || DEFAULT_COL_WIDTH;
    },
    [columnWidths, getLogicalCol]
  );
  const getRowHeight = useCallback(
    (row: number) => rowHeights[row] || DEFAULT_ROW_HEIGHT,
    [rowHeights]
  );

  // Build a mapping of presence user active cells
  const presenceCellMap = useMemo(() => {
    const map: Record<string, UserPresence> = {};
    for (const u of presenceUsers) {
      if (u.activeCell) {
        map[u.activeCell] = u;
      }
    }
    return map;
  }, [presenceUsers]);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => getRowHeight(i),
    overscan: 10,
  });

  const colVirtualizer = useVirtualizer({
    horizontal: true,
    count: colCount,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => getColWidth(i),
    overscan: 5,
  });

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingCell]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!activeCell) return;

      const visualCol = getVisualIndex(activeCell.col);

      // Use ref to detect editing before React re-renders (stale closure fix)
      const isCurrentlyEditing = editingCell || pendingEditRef.current;

      if (isCurrentlyEditing) {
        const inputEl = editInputRef.current;
        const inputFocused = inputEl && document.activeElement === inputEl;

        // Buffer printable keys when input is not focused yet
        if (!inputFocused && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onEditChange((prev: string) => prev + e.key);
          return;
        }

        if (!inputFocused && e.key === 'Backspace') {
          e.preventDefault();
          onEditChange((prev: string) => prev.slice(0, -1));
          return;
        }

        if (e.key === 'Enter') {
          e.preventDefault();
          onEditCommit();
          if (activeCell.row + 1 < rowCount) {
            onCellSelect({ row: activeCell.row + 1, col: activeCell.col });
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onEditCancel();
        } else if (e.key === 'Tab') {
          e.preventDefault();
          onEditCommit();
          const nextVisual = e.shiftKey ? Math.max(0, visualCol - 1) : Math.min(colCount - 1, visualCol + 1);
          const nextLogical = getLogicalCol(nextVisual);
          onCellSelect({ row: activeCell.row, col: nextLogical });
        }
        return;
      }

      // Navigation mode
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (activeCell.row > 0) {
            onCellSelect({ row: activeCell.row - 1, col: activeCell.col });
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (activeCell.row + 1 < rowCount) {
            onCellSelect({ row: activeCell.row + 1, col: activeCell.col });
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (visualCol > 0) {
            const logical = getLogicalCol(visualCol - 1);
            onCellSelect({ row: activeCell.row, col: logical });
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (visualCol + 1 < colCount) {
            const logical = getLogicalCol(visualCol + 1);
            onCellSelect({ row: activeCell.row, col: logical });
          }
          break;
        case 'Tab':
          e.preventDefault();
          const nextVisual = e.shiftKey ? Math.max(0, visualCol - 1) : Math.min(colCount - 1, visualCol + 1);
          const nextLogical = getLogicalCol(nextVisual);
          onCellSelect({ row: activeCell.row, col: nextLogical });
          break;
        case 'Enter':
          e.preventDefault();
          onCellDoubleClick(activeCell);
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          onEditChange('');
          onEditCommit();
          break;
        case 'Home':
          e.preventDefault();
          onCellSelect({ row: activeCell.row, col: getLogicalCol(0) });
          break;
        case 'End':
          e.preventDefault();
          onCellSelect({ row: activeCell.row, col: getLogicalCol(colCount - 1) });
          break;
        default:
          // Start typing to edit
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            pendingEditRef.current = true;
            onCellDoubleClick(activeCell);
            onEditChange(e.key);
          }
          break;
      }
    },
    [activeCell, editingCell, rowCount, colCount, onCellSelect, onCellDoubleClick, onEditChange, onEditCommit, onEditCancel, getVisualIndex, getLogicalCol]
  );

  // Column resize handlers
  const handleResizeMouseDown = useCallback(
    (col: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setResizingCol(col);
      resizeStartX.current = e.clientX;
      resizeStartWidth.current = getColWidth(col);
    },
    [getColWidth]
  );

  useEffect(() => {
    if (resizingCol === null) return;

    const logicalCol = getLogicalCol(resizingCol);

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizeStartX.current;
      const newWidth = Math.max(40, resizeStartWidth.current + diff);
      onColumnResize(logicalCol, newWidth);
    };

    const handleMouseUp = () => {
      setResizingCol(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingCol, onColumnResize, getLogicalCol]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, visualCol: number) => {
    setDraggedCol(visualCol);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', visualCol.toString());
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, visualCol: number) => {
    e.preventDefault();
    if (draggedCol !== null && draggedCol !== visualCol) {
      setDragOverCol(visualCol);
    }
  }, [draggedCol]);

  const handleDragLeave = useCallback(() => {
    setDragOverCol(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, visualCol: number) => {
    e.preventDefault();
    setDragOverCol(null);
    if (draggedCol !== null && draggedCol !== visualCol && onColumnReorder) {
      onColumnReorder(draggedCol, visualCol);
    }
    setDraggedCol(null);
  }, [draggedCol, onColumnReorder]);

  const handleDragEnd = useCallback(() => {
    setDraggedCol(null);
    setDragOverCol(null);
  }, []);

  // Selection handlers
  const handleCellMouseDown = useCallback((row: number, col: number) => {
    isSelectingRef.current = true;
    onCellSelect({ row, col });
    onSelectionChange({ start: { row, col }, end: { row, col } });
  }, [onCellSelect, onSelectionChange]);

  const handleCellMouseOver = useCallback((row: number, col: number) => {
    if (isSelectingRef.current && activeCell) {
      onSelectionChange({ start: activeCell, end: { row, col } });
    }
  }, [activeCell, onSelectionChange]);

  useEffect(() => {
    const handleMouseUp = () => {
      isSelectingRef.current = false;
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Row resize handlers
  const handleRowResizeMouseDown = useCallback(
    (row: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setResizingRow(row);
      resizeStartY.current = e.clientY;
      resizeStartHeight.current = getRowHeight(row);
    },
    [getRowHeight]
  );

  useEffect(() => {
    if (resizingRow === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientY - resizeStartY.current;
      const newHeight = Math.max(24, resizeStartHeight.current + diff);
      onRowResize(resizingRow, newHeight);
    };

    const handleMouseUp = () => {
      setResizingRow(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingRow, onRowResize]);

  const getCellDisplayValue = useCallback(
    (id: string): string => {
      const cell = cells[id];
      if (!cell) return '';
      if (cell.formula && isFormula(cell.formula)) {
        return evaluateFormula(cell.formula, cells);
      }
      return cell.value || '';
    },
    [cells]
  );

  const getCellFormat = useCallback(
    (id: string): CellFormat => {
      return cells[id]?.format || {};
    },
    [cells]
  );

  // ─── Merge cell helpers ──────────────────────────────────────────────
  const getMergeForCell = useCallback(
    (row: number, col: number): MergedRegion | null => {
      return mergedCells.find(
        (m) =>
          row >= m.startRow &&
          row <= m.endRow &&
          col >= m.startCol &&
          col <= m.endCol
      ) || null;
    },
    [mergedCells]
  );

  const getMergedWidth = useCallback(
    (region: MergedRegion): number => {
      let w = 0;
      for (let c = region.startCol; c <= region.endCol; c++) {
        const vi = getVisualIndex(c);
        w += getColWidth(vi);
      }
      return w;
    },
    [getVisualIndex, getColWidth]
  );

  const getMergedHeight = useCallback(
    (region: MergedRegion): number => {
      let h = 0;
      for (let r = region.startRow; r <= region.endRow; r++) {
        h += getRowHeight(r);
      }
      return h;
    },
    [getRowHeight]
  );

  return (
    <div
      ref={parentRef}
      className="relative flex-1 overflow-auto bg-surface outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        style={{
          width: colVirtualizer.getTotalSize() + HEADER_WIDTH,
          height: rowVirtualizer.getTotalSize() + HEADER_HEIGHT,
          position: 'relative',
        }}
      >
        {/* Corner header cell */}
        <div
          className="sticky left-0 top-0 z-20 flex items-center justify-center border-b border-r border-outline-variant/40 bg-surface-container"
          style={{ width: HEADER_WIDTH, height: HEADER_HEIGHT }}
        />

        {/* Column headers */}
        {colVirtualizer.getVirtualItems().map((virtualCol) => {
          const logicalCol = getLogicalCol(virtualCol.index);
          const isDragging = draggedCol === virtualCol.index;
          const isOver = dragOverCol === virtualCol.index;

          return (
            <div
              key={`header-${virtualCol.index}`}
              className={cn(
                'absolute top-0 z-10 flex items-center justify-center border-b border-r border-outline-variant/40 bg-surface-container text-xs font-medium text-on-surface-variant transition-colors',
                isDragging && 'opacity-50',
                isOver && 'bg-primary-container/30 ring-2 ring-primary ring-inset z-20'
              )}
              style={{
                left: virtualCol.start + HEADER_WIDTH,
                width: virtualCol.size,
                height: HEADER_HEIGHT,
              }}
              draggable={!!onColumnReorder}
              onDragStart={(e) => handleDragStart(e, virtualCol.index)}
              onDragOver={(e) => handleDragOver(e, virtualCol.index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, virtualCol.index)}
              onDragEnd={handleDragEnd}
            >
              {colToLetter(logicalCol)}
              {/* Resize handle */}
              <div
                className="absolute right-0 top-0 z-20 h-full w-1 cursor-col-resize hover:bg-primary/40"
                onMouseDown={(e) => handleResizeMouseDown(virtualCol.index, e)}
                draggable={false}
              />
            </div>
          );
        })}

        {/* Row headers + Cells */}
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div key={`row-${virtualRow.index}`}>
            {/* Row header */}
            <div
              className="sticky left-0 z-10 flex items-center justify-center border-b border-r border-outline-variant/40 bg-surface-container text-xs text-on-surface-variant group"
              style={{
                position: 'absolute',
                top: virtualRow.start + HEADER_HEIGHT,
                width: HEADER_WIDTH,
                height: virtualRow.size,
              }}
            >
              {virtualRow.index + 1}
              {/* Row resize handle */}
              <div
                className="absolute index-20 bottom-0 left-0 h-1 w-full cursor-row-resize hover:bg-primary/40"
                onMouseDown={(e) => handleRowResizeMouseDown(virtualRow.index, e)}
              />
            </div>

            {/* Cells */}
            {colVirtualizer.getVirtualItems().map((virtualCol) => {
              const row = virtualRow.index;
              const col = getLogicalCol(virtualCol.index);
              const id = cellId(row, col);

              // ── Merge cell logic ──────────────────────────────
              const merge = getMergeForCell(row, col);
              // If this cell is hidden by a merge (not the anchor), skip
              if (merge && !(merge.startRow === row && merge.startCol === col)) {
                return null;
              }
              const cellWidth = merge ? getMergedWidth(merge) : virtualCol.size;
              const cellHeight = merge ? getMergedHeight(merge) : virtualRow.size;

              const isActive = activeCell?.row === row && activeCell?.col === col;
              const isEditing = editingCell?.row === row && editingCell?.col === col;
              const presenceUser = presenceCellMap[id];
              const format = getCellFormat(id);
              const displayValue = getCellDisplayValue(id);

              const isSelected = selectionRange && 
                  row >= Math.min(selectionRange.start.row, selectionRange.end.row) &&
                  row <= Math.max(selectionRange.start.row, selectionRange.end.row) &&
                  col >= Math.min(selectionRange.start.col, selectionRange.end.col) &&
                  col <= Math.max(selectionRange.start.col, selectionRange.end.col);

              return (
                <div
                  key={id}
                  className={cn(
                    'absolute border-b border-r border-outline-variant/20 text-xs leading-none',
                    'transition-[border-color,box-shadow] duration-75',
                    isActive && !isEditing && 'ring-2 ring-primary ring-inset z-[5]',
                    isEditing && 'ring-2 ring-primary ring-inset z-[6]',
                    presenceUser && !isActive && 'ring-2 ring-inset z-[4]',
                    isSelected && !isActive && !isEditing && 'bg-primary/20'
                  )}
                  style={{
                    left: virtualCol.start + HEADER_WIDTH,
                    top: virtualRow.start + HEADER_HEIGHT,
                    width: cellWidth,
                    height: cellHeight,
                    backgroundColor: isSelected && !isActive && !isEditing ? undefined : (format.bgColor || undefined),
                    ...(merge ? { zIndex: 3 } : {}),
                    ...(presenceUser && !isActive
                      ? { '--tw-ring-color': presenceUser.color } as React.CSSProperties
                      : {}),
                  }}
                  onMouseDown={(e) => {
                    if (e.button === 0) handleCellMouseDown(row, col);
                  }}
                  onMouseEnter={() => handleCellMouseOver(row, col)}
                  onDoubleClick={() => onCellDoubleClick({ row, col })}
                >
                  {isEditing ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editValue}
                      onMouseDown={(e) => e.stopPropagation()}
                      onChange={(e) => onEditChange(e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          onEditCommit();
                          if (row + 1 < rowCount) {
                            onCellSelect({ row: row + 1, col });
                          }
                        }
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          onEditCancel();
                        }
                        if (e.key === 'Tab') {
                          e.preventDefault();
                          onEditCommit();
                          const nextCol = e.shiftKey ? Math.max(0, col - 1) : Math.min(colCount - 1, col + 1);
                          onCellSelect({ row, col: nextCol });
                        }
                      }}
                      className="h-full w-full bg-surface px-1 text-xs text-on-surface outline-none"
                    />
                  ) : (
                    <div
                      className={cn(
                        'flex h-full items-center overflow-hidden px-1',
                        format.bold && 'font-bold',
                        format.italic && 'italic',
                        format.align === 'center' && 'justify-center',
                        format.align === 'right' && 'justify-end'
                      )}
                      style={{ color: format.textColor || undefined }}
                    >
                      <span className="truncate">{displayValue}</span>
                    </div>
                  )}

                  {presenceUser && !isActive && (
                    <div
                      className="absolute -top-5 left-0 z-10 whitespace-nowrap rounded-sm px-1.5 py-0.5 text-[10px] font-medium text-white"
                      style={{ backgroundColor: presenceUser.color }}
                    >
                      {presenceUser.displayName}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
