import type { Token, TokenType } from '../types';

/**
 * Tokenizes a formula string (without the leading '=').
 * Supports: numbers, cell references (A1), ranges (A1:B3),
 * function names (SUM), operators (+,-,*,/), parentheses, commas.
 */
export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = input.trim();

  while (i < s.length) {
    // Skip whitespace
    if (s[i] === ' ' || s[i] === '\t') {
      i++;
      continue;
    }

    // Number (including decimals)
    if (/\d/.test(s[i]) || (s[i] === '.' && i + 1 < s.length && /\d/.test(s[i + 1]))) {
      let num = '';
      while (i < s.length && (/\d/.test(s[i]) || s[i] === '.')) {
        num += s[i++];
      }
      tokens.push({ type: 'NUMBER', value: num });
      continue;
    }

    // String literal
    if (s[i] === '"') {
      let str = '';
      i++; // skip opening quote
      while (i < s.length && s[i] !== '"') {
        str += s[i++];
      }
      i++; // skip closing quote
      tokens.push({ type: 'STRING', value: str });
      continue;
    }

    // Cell reference, range, or function
    if (/[A-Za-z]/.test(s[i])) {
      let word = '';
      while (i < s.length && /[A-Za-z0-9]/.test(s[i])) {
        word += s[i++];
      }

      // Check if this is a range (e.g., A1:B3)
      if (s[i] === ':') {
        i++; // skip colon
        let endRef = '';
        while (i < s.length && /[A-Za-z0-9]/.test(s[i])) {
          endRef += s[i++];
        }
        tokens.push({ type: 'RANGE', value: `${word.toUpperCase()}:${endRef.toUpperCase()}` });
        continue;
      }

      // Check if it's a function (followed by '(')
      if (s[i] === '(' && /^[A-Z]+$/i.test(word)) {
        tokens.push({ type: 'FUNCTION', value: word.toUpperCase() });
        continue;
      }

      // It's a cell reference (e.g., A1, BC23)
      if (/^[A-Z]+\d+$/i.test(word)) {
        tokens.push({ type: 'CELL_REF', value: word.toUpperCase() });
        continue;
      }

      // Treat as function name anyway (for cases like SUM without paren yet)
      tokens.push({ type: 'FUNCTION', value: word.toUpperCase() });
      continue;
    }

    // Operators
    if ('+-*/'.includes(s[i])) {
      tokens.push({ type: 'OPERATOR', value: s[i] });
      i++;
      continue;
    }

    // Parentheses
    if (s[i] === '(') {
      tokens.push({ type: 'PAREN_OPEN', value: '(' });
      i++;
      continue;
    }

    if (s[i] === ')') {
      tokens.push({ type: 'PAREN_CLOSE', value: ')' });
      i++;
      continue;
    }

    // Comma
    if (s[i] === ',') {
      tokens.push({ type: 'COMMA', value: ',' });
      i++;
      continue;
    }

    // Skip unknown characters
    i++;
  }

  return tokens;
}
