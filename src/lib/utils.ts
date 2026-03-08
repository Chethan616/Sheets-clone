// ─── Column / Cell Reference Utilities ───────────────────────────────────────

/** Convert 0-based column index to letter(s): 0→A, 25→Z, 26→AA */
export function colToLetter(col: number): string {
  let result = '';
  let c = col;
  while (c >= 0) {
    result = String.fromCharCode((c % 26) + 65) + result;
    c = Math.floor(c / 26) - 1;
  }
  return result;
}

/** Convert column letter(s) to 0-based index: A→0, Z→25, AA→26 */
export function letterToCol(letter: string): number {
  let result = 0;
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + (letter.charCodeAt(i) - 64);
  }
  return result - 1;
}

/** Create a cell ID from row/col: (0,0) → "A1" */
export function cellId(row: number, col: number): string {
  return `${colToLetter(col)}${row + 1}`;
}

/** Parse a cell ID into row/col: "A1" → {row:0, col:0} */
export function parseCellId(id: string): { row: number; col: number } | null {
  const match = id.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return null;
  return {
    col: letterToCol(match[1].toUpperCase()),
    row: parseInt(match[2], 10) - 1,
  };
}

/** Expand a range "A1:C3" into an array of cell IDs */
export function expandRange(startRef: string, endRef: string): string[] {
  const start = parseCellId(startRef);
  const end = parseCellId(endRef);
  if (!start || !end) return [];

  const ids: string[] = [];
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);
  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      ids.push(cellId(r, c));
    }
  }
  return ids;
}

// ─── Color Utilities ────────────────────────────────────────────────────────

const USER_COLORS = [
  '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
  '#2196F3', '#00BCD4', '#009688', '#4CAF50',
  '#FF9800', '#FF5722', '#795548', '#607D8B',
];

export function getRandomColor(): string {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

export function getColorForUser(uid: string): string {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

// ─── Time Utilities ─────────────────────────────────────────────────────────

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

// ─── Misc ───────────────────────────────────────────────────────────────────

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

export const DEFAULT_ROW_COUNT = 100;
export const DEFAULT_COL_COUNT = 26;
export const DEFAULT_COL_WIDTH = 100;
export const DEFAULT_ROW_HEIGHT = 28;
export const HEADER_WIDTH = 46;
export const HEADER_HEIGHT = 28;
