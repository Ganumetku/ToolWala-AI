export interface Token {
  type:
    | 'number'
    | 'literal_string'
    | 'hex_string'
    | 'name'
    | 'array_start'
    | 'array_end'
    | 'dict_start'
    | 'dict_end'
    | 'keyword'
    | 'whitespace'
    | 'comment';
  start: number;
  end: number;
  bytes: Uint8Array;
  value?: any;
}

/**
 * ContentStreamTokenizer splits a raw Uint8Array PDF content stream
 * into structural tokens.
 */
export class ContentStreamTokenizer {
  static tokenize(bytes: Uint8Array): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    const isWhitespace = (b: number) => b === 32 || b === 9 || b === 10 || b === 13 || b === 0;
    const isDelimiter = (b: number) =>
      b === 40 || // '('
      b === 41 || // ')'
      b === 60 || // '<'
      b === 62 || // '>'
      b === 91 || // '['
      b === 93 || // ']'
      b === 123 || // '{'
      b === 125 || // '}'
      b === 47 || // '/'
      b === 37 || // '%'
      isWhitespace(b);

    while (i < bytes.length) {
      const start = i;
      const b = bytes[i];

      // Whitespace
      if (isWhitespace(b)) {
        while (i < bytes.length && isWhitespace(bytes[i])) {
          i++;
        }
        tokens.push({ type: 'whitespace', start, end: i, bytes: bytes.subarray(start, i) });
        continue;
      }

      // Comments
      if (b === 37) { // '%'
        while (i < bytes.length && bytes[i] !== 10 && bytes[i] !== 13) {
          i++;
        }
        tokens.push({ type: 'comment', start, end: i, bytes: bytes.subarray(start, i) });
        continue;
      }

      // Literal Strings
      if (b === 40) { // '('
        let depth = 1;
        i++;
        while (i < bytes.length && depth > 0) {
          if (bytes[i] === 92) { // '\\'
            i += 2;
            continue;
          }
          if (bytes[i] === 40) depth++;
          if (bytes[i] === 41) depth--;
          i++;
        }
        tokens.push({ type: 'literal_string', start, end: i, bytes: bytes.subarray(start, i) });
        continue;
      }

      // Hex Strings & Dictionaries
      if (b === 60) { // '<'
        if (bytes[i + 1] === 60) { // '<<'
          i += 2;
          tokens.push({ type: 'dict_start', start, end: i, bytes: bytes.subarray(start, i) });
          continue;
        }
        i++;
        while (i < bytes.length && bytes[i] !== 62) { // '>'
          i++;
        }
        i++; // consume '>'
        tokens.push({ type: 'hex_string', start, end: i, bytes: bytes.subarray(start, i) });
        continue;
      }

      if (b === 62 && bytes[i + 1] === 62) { // '>>'
        i += 2;
        tokens.push({ type: 'dict_end', start, end: i, bytes: bytes.subarray(start, i) });
        continue;
      }

      // Arrays
      if (b === 91) { // '['
        i++;
        tokens.push({ type: 'array_start', start, end: i, bytes: bytes.subarray(start, i) });
        continue;
      }
      if (b === 93) { // ']'
        i++;
        tokens.push({ type: 'array_end', start, end: i, bytes: bytes.subarray(start, i) });
        continue;
      }

      // Names
      if (b === 47) { // '/'
        i++;
        while (i < bytes.length && !isDelimiter(bytes[i])) {
          i++;
        }
        tokens.push({ type: 'name', start, end: i, bytes: bytes.subarray(start, i) });
        continue;
      }

      // Numbers and keywords
      while (i < bytes.length && !isDelimiter(bytes[i])) {
        i++;
      }
      const valBytes = bytes.subarray(start, i);
      let valStr = '';
      for (let k = 0; k < valBytes.length; k++) {
        valStr += String.fromCharCode(valBytes[k]);
      }

      if (!isNaN(Number(valStr)) && valStr.trim().length > 0) {
        tokens.push({ type: 'number', start, end: i, bytes: valBytes, value: Number(valStr) });
      } else {
        tokens.push({ type: 'keyword', start, end: i, bytes: valBytes, value: valStr });
      }
    }

    return tokens;
  }
}
