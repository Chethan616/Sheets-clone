import { parseCellId, expandRange } from '../utils';
import type { CellMap } from '../types';

/**
 * Resolves a cell reference to its value (number or string).
 * Returns 0 for empty cells.
 */
export function resolveCellValue(ref: string, cells: CellMap): string | number {
  const cell = cells[ref.toUpperCase()];
  if (!cell) return 0;

  const val = cell.value;
  if (val === '' || val === undefined || val === null) return 0;

  const num = Number(val);
  return isNaN(num) ? val : num;
}

/**
 * Resolves a range (e.g., "A1:B3") to an array of values.
 */
export function resolveRange(rangeStr: string, cells: CellMap): (string | number)[] {
  const [startRef, endRef] = rangeStr.split(':');
  const ids = expandRange(startRef, endRef);
  return ids.map((id) => resolveCellValue(id, cells));
}

/**
 * Extracts all cell references from a formula string.
 * Used for dependency tracking.
 */
export function extractCellRefs(formula: string): string[] {
  const refs: string[] = [];
  const rangePattern = /([A-Z]+\d+):([A-Z]+\d+)/gi;
  const cellPattern = /([A-Z]+\d+)/gi;

  // First extract ranges and expand them
  let match;
  const rangeRefs = new Set<string>();
  while ((match = rangePattern.exec(formula)) !== null) {
    const expanded = expandRange(match[1].toUpperCase(), match[2].toUpperCase());
    expanded.forEach((r) => rangeRefs.add(r));
  }

  if (rangeRefs.size > 0) {
    return Array.from(rangeRefs);
  }

  // Then extract individual cell refs
  while ((match = cellPattern.exec(formula)) !== null) {
    refs.push(match[1].toUpperCase());
  }

  return [...new Set(refs)];
}
