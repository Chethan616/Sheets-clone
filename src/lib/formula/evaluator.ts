import { tokenize } from './parser';
import { resolveCellValue, resolveRange } from './references';
import type { Token, ASTNode, CellMap } from '../types';

// ─── AST Parser ─────────────────────────────────────────────────────────────

class FormulaParser {
  private tokens: Token[] = [];
  private pos = 0;

  parse(tokens: Token[]): ASTNode {
    this.tokens = tokens;
    this.pos = 0;
    return this.expression();
  }

  private peek(): Token | null {
    return this.pos < this.tokens.length ? this.tokens[this.pos] : null;
  }

  private consume(): Token {
    return this.tokens[this.pos++];
  }

  private expression(): ASTNode {
    return this.additive();
  }

  private additive(): ASTNode {
    let left = this.multiplicative();

    while (this.peek()?.type === 'OPERATOR' && (this.peek()!.value === '+' || this.peek()!.value === '-')) {
      const op = this.consume().value;
      const right = this.multiplicative();
      left = { type: 'binary', operator: op, left, right };
    }

    return left;
  }

  private multiplicative(): ASTNode {
    let left = this.unary();

    while (this.peek()?.type === 'OPERATOR' && (this.peek()!.value === '*' || this.peek()!.value === '/')) {
      const op = this.consume().value;
      const right = this.unary();
      left = { type: 'binary', operator: op, left, right };
    }

    return left;
  }

  private unary(): ASTNode {
    if (this.peek()?.type === 'OPERATOR' && this.peek()!.value === '-') {
      this.consume();
      const operand = this.primary();
      return { type: 'unary', operator: '-', operand };
    }
    return this.primary();
  }

  private primary(): ASTNode {
    const token = this.peek();

    if (!token) {
      return { type: 'number', value: 0 };
    }

    // Number
    if (token.type === 'NUMBER') {
      this.consume();
      return { type: 'number', value: parseFloat(token.value) };
    }

    // String
    if (token.type === 'STRING') {
      this.consume();
      return { type: 'string', value: token.value };
    }

    // Function call: FUNC(args...)
    if (token.type === 'FUNCTION') {
      this.consume(); // function name
      if (this.peek()?.type === 'PAREN_OPEN') {
        this.consume(); // (
        const args: ASTNode[] = [];

        if (this.peek()?.type !== 'PAREN_CLOSE') {
          args.push(this.expression());
          while (this.peek()?.type === 'COMMA') {
            this.consume(); // ,
            args.push(this.expression());
          }
        }

        if (this.peek()?.type === 'PAREN_CLOSE') {
          this.consume(); // )
        }

        return { type: 'function', name: token.value, args };
      }
      return { type: 'function', name: token.value, args: [] };
    }

    // Range: A1:B3
    if (token.type === 'RANGE') {
      this.consume();
      const [start, end] = token.value.split(':');
      return { type: 'range', start, end };
    }

    // Cell reference: A1
    if (token.type === 'CELL_REF') {
      this.consume();
      return { type: 'cell_ref', ref: token.value };
    }

    // Parenthesized expression
    if (token.type === 'PAREN_OPEN') {
      this.consume(); // (
      const expr = this.expression();
      if (this.peek()?.type === 'PAREN_CLOSE') {
        this.consume(); // )
      }
      return expr;
    }

    // Fallback
    this.consume();
    return { type: 'number', value: 0 };
  }
}

// ─── AST Evaluator ──────────────────────────────────────────────────────────

// ─── AST Evaluator ──────────────────────────────────────────────────────────

type FormulaResult = string | number;

function evaluateAST(node: ASTNode, cells: CellMap): FormulaResult {
  switch (node.type) {
    case 'number':
      return node.value;

    case 'string':
      return node.value;

    case 'cell_ref':
      return resolveCellValue(node.ref, cells);

    case 'range': {
      // When a range appears as a standalone node, return its sum (legacy behavior)
      const values = resolveRange(`${node.start}:${node.end}`, cells);
      return values.reduce<number>((a, b) => {
         const val = typeof b === 'number' ? b : Number(b);
         return a + (isNaN(val) ? 0 : val);
      }, 0);
    }

    case 'unary': {
      const result = evaluateAST(node.operand, cells);
      if (typeof result === 'string') return NaN;
      return node.operator === '-' ? -result : result;
    }

    case 'binary': {
      const left = evaluateAST(node.left, cells);
      const right = evaluateAST(node.right, cells);
      
      // String concatenation for +
      if (node.operator === '+' && (typeof left === 'string' || typeof right === 'string')) {
        return String(left) + String(right);
      }

      const lNum = typeof left === 'number' ? left : (Number(left) || 0); // simplistic coercion
      const rNum = typeof right === 'number' ? right : (Number(right) || 0);

      switch (node.operator) {
        case '+': return lNum + rNum;
        case '-': return lNum - rNum;
        case '*': return lNum * rNum;
        case '/': return rNum === 0 ? NaN : lNum / rNum;
        default: return 0;
      }
    }

    case 'function':
      return evaluateFunction(node.name, node.args, cells);

    default:
      return 0;
  }
}

function collectValues(args: ASTNode[], cells: CellMap): FormulaResult[] {
  const values: FormulaResult[] = [];
  for (const arg of args) {
    if (arg.type === 'range') {
      values.push(...resolveRange(`${arg.start}:${arg.end}`, cells));
    } else {
      values.push(evaluateAST(arg, cells));
    }
  }
  return values;
}

function evaluateFunction(name: string, args: ASTNode[], cells: CellMap): FormulaResult {
  // Functions can handle arguments lazily or eagerly. 
  // For most, we collect eagerly.
  // Exception: IF needs lazy eval for true/false branches.
  
  if (name === 'IF') {
      if (args.length >= 3) {
        const cond = evaluateAST(args[0], cells);
        // Any non-zero number or non-empty string is true? 
        // Excel: number!=0 is true. String? usually false or error.
        // We'll treat truthy as true for simplicity
        return cond ? evaluateAST(args[1], cells) : evaluateAST(args[2], cells);
      }
      return 0;
  }

  const values = collectValues(args, cells);
  const numericValues = values.map(v => (typeof v === 'number' ? v : Number(v))).filter(v => !isNaN(v));

  switch (name) {
    case 'SUM':
      return numericValues.reduce((a, b) => a + b, 0);

    case 'AVERAGE':
    case 'AVG':
      return numericValues.length === 0 ? 0 : numericValues.reduce((a, b) => a + b, 0) / numericValues.length;

    case 'COUNT':
      return numericValues.length;

    case 'MIN':
      return numericValues.length === 0 ? 0 : Math.min(...numericValues);

    case 'MAX':
      return numericValues.length === 0 ? 0 : Math.max(...numericValues);

    case 'ABS':
      return numericValues.length > 0 ? Math.abs(numericValues[0]) : 0;

    case 'ROUND':
      if (numericValues.length >= 2) {
        const decimals = Math.floor(numericValues[1]);
        return Number(numericValues[0].toFixed(decimals));
      }
      return numericValues.length > 0 ? Math.round(numericValues[0]) : 0;

    // String / Data Quality Functions
    case 'TRIM':
      return String(values[0] || '').trim();
    
    case 'UPPER':
      return String(values[0] || '').toUpperCase();

    case 'LOWER':
      return String(values[0] || '').toLowerCase();

    default:
      return NaN; // Unknown function
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

const parserInstance = new FormulaParser();

/**
 * Evaluates a formula string and returns the result.
 * If the input doesn't start with '=', returns it as-is.
 * Returns a string for display (could be number or error text).
 */
export function evaluateFormula(
  formula: string,
  cells: CellMap
): string {
  if (!formula.startsWith('=')) return formula;

  try {
    const expr = formula.substring(1).trim();
    if (!expr) return '';

    const tokens = tokenize(expr);
    if (tokens.length === 0) return '';

    const ast = parserInstance.parse(tokens);
    const result = evaluateAST(ast, cells);

    if (typeof result === 'string') return result;

    if (isNaN(result)) return '#ERROR!';
    if (!isFinite(result)) return '#DIV/0!';

    // Format: remove trailing zeros for clean display
    return String(parseFloat(result.toFixed(10)));
  } catch {
    return '#ERROR!';
  }
}

/**
 * Checks if a value is a formula (starts with '=').
 */
export function isFormula(value: string): boolean {
  return value.startsWith('=');
}
