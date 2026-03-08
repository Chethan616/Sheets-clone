import { CellMap } from '@/lib/types';
import { colToLetter } from '@/lib/utils';
import { evaluateFormula, isFormula } from '@/lib/formula/evaluator';

export function exportToCSV(cells: CellMap, rowCount: number, colCount: number): string {
  const rows: string[] = [];

  for (let r = 0; r < rowCount; r++) {
    const cols: string[] = [];
    for (let c = 0; c < colCount; c++) {
      const id = `${colToLetter(c)}${r + 1}`;
      const cell = cells[id];
      let value = '';
      if (cell) {
        if (cell.formula && isFormula(cell.formula)) {
          value = evaluateFormula(cell.formula, cells);
        } else {
          value = cell.value || '';
        }
      }
      // Escape CSV
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      cols.push(value);
    }
    // Only include rows that have data
    if (cols.some((c) => c !== '')) {
      rows.push(cols.join(','));
    }
  }

  return rows.join('\n');
}

export async function exportToXLSX(cells: CellMap, rowCount: number, colCount: number, title: string) {
  const XLSX = await import('xlsx');

  const data: string[][] = [];
  for (let r = 0; r < rowCount; r++) {
    const row: string[] = [];
    for (let c = 0; c < colCount; c++) {
      const id = `${colToLetter(c)}${r + 1}`;
      const cell = cells[id];
      let value = '';
      if (cell) {
        if (cell.formula && isFormula(cell.formula)) {
          value = evaluateFormula(cell.formula, cells);
        } else {
          value = cell.value || '';
        }
      }
      row.push(value);
    }
    data.push(row);
  }

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${title || 'spreadsheet'}.xlsx`);
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename || 'spreadsheet'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
