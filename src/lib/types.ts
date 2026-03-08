// ─── Cell & Grid Types ───────────────────────────────────────────────────────

export interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  textColor?: string;
  bgColor?: string;
  align?: 'left' | 'center' | 'right';
}

export interface CellData {
  value: string;
  formula?: string;
  format?: CellFormat;
  updatedBy?: string;
  updatedAt?: number;
}

export type CellMap = Record<string, CellData>;

export interface CellPosition {
  row: number;
  col: number;
}

export interface CellRange {
  start: CellPosition;
  end: CellPosition;
}

// ─── Document Types ─────────────────────────────────────────────────────────

export interface SpreadsheetDocument {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  sharedWith: string[];
  createdAt: number;
  updatedAt: number;
  rowCount: number;
  colCount: number;
  columnWidths?: Record<number, number>;
  rowHeights?: Record<number, number>;
  columnOrder?: number[];
  mergedCells?: MergedRegion[];
}

// ─── User Types ─────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  color: string;
  createdAt: number;
}

// ─── Presence Types ─────────────────────────────────────────────────────────

export interface UserPresence {
  uid: string;
  displayName: string;
  color: string;
  photoURL: string | null;
  activeCell: string | null;
  online: boolean;
  lastSeen: number;
}

// ─── Auth Types ─────────────────────────────────────────────────────────────

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// ─── Write State ────────────────────────────────────────────────────────────

// ─── Merge Types ────────────────────────────────────────────────────────────

export interface MergedRegion {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export type WriteState = 'synced' | 'pending' | 'error';

// ─── Formula Types ──────────────────────────────────────────────────────────

export type TokenType =
  | 'NUMBER'
  | 'STRING'
  | 'CELL_REF'
  | 'RANGE'
  | 'FUNCTION'
  | 'OPERATOR'
  | 'PAREN_OPEN'
  | 'PAREN_CLOSE'
  | 'COMMA';

export interface Token {
  type: TokenType;
  value: string;
}

export type ASTNode =
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'cell_ref'; ref: string }
  | { type: 'range'; start: string; end: string }
  | { type: 'function'; name: string; args: ASTNode[] }
  | { type: 'binary'; operator: string; left: ASTNode; right: ASTNode }
  | { type: 'unary'; operator: string; operand: ASTNode };
