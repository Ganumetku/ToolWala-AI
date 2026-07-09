export function rgbaToHex(rgbaStr: string): string {
  try {
    const match = rgbaStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '#fbbf24';
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  } catch {
    return '#fbbf24';
  }
}

export function hexToRgbaStr(hex: string, opacity: number): string {
  try {
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    return `rgba(${r || 0}, ${g || 0}, ${b || 0}, ${opacity})`;
  } catch {
    return `rgba(0, 0, 0, ${opacity})`;
  }
}

export function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1];
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
