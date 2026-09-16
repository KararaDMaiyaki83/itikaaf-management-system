// Pure TypeScript Code 128-B Barcode SVG Generator
// Zero external dependencies, renders crisp SVG bars compatible with laser scanners

const CODE128_PATTERNS: { [key: number]: number[] } = {
  0: [2, 1, 2, 2, 2, 2], 1: [2, 2, 2, 1, 2, 2], 2: [2, 2, 2, 2, 2, 1],
  3: [1, 2, 1, 2, 2, 3], 4: [1, 2, 1, 3, 2, 2], 5: [1, 3, 1, 2, 2, 2],
  6: [1, 2, 2, 2, 1, 3], 7: [1, 2, 2, 3, 1, 2], 8: [1, 3, 2, 2, 1, 2],
  9: [2, 2, 1, 2, 1, 3], 10: [2, 2, 1, 3, 1, 2], 11: [2, 3, 1, 2, 1, 2],
  12: [1, 1, 2, 2, 3, 2], 13: [1, 2, 2, 1, 3, 2], 14: [1, 2, 2, 2, 3, 1],
  15: [1, 1, 3, 2, 2, 2], 16: [1, 2, 3, 1, 2, 2], 17: [1, 2, 3, 2, 2, 1],
  18: [2, 2, 3, 2, 1, 1], 19: [2, 2, 1, 1, 3, 2], 20: [2, 2, 1, 2, 3, 1],
  21: [2, 1, 3, 2, 1, 2], 22: [2, 2, 3, 1, 1, 2], 23: [3, 1, 2, 1, 3, 1],
  24: [3, 1, 1, 2, 2, 2], 25: [3, 2, 1, 1, 2, 2], 26: [3, 2, 1, 2, 2, 1],
  27: [3, 1, 2, 2, 1, 2], 28: [3, 2, 2, 1, 1, 2], 29: [3, 2, 2, 2, 1, 1],
  30: [2, 1, 2, 1, 2, 3], 31: [2, 1, 2, 3, 2, 1], 32: [2, 3, 2, 1, 2, 1],
  33: [1, 1, 1, 3, 2, 3], 34: [1, 3, 1, 1, 2, 3], 35: [1, 3, 1, 3, 2, 1],
  36: [1, 1, 2, 3, 1, 3], 37: [1, 3, 2, 1, 1, 3], 38: [1, 3, 2, 3, 1, 1],
  39: [2, 1, 1, 3, 1, 3], 40: [2, 3, 1, 1, 1, 3], 41: [2, 3, 1, 3, 1, 1],
  42: [1, 1, 2, 1, 3, 3], 43: [1, 1, 2, 3, 3, 1], 44: [1, 3, 2, 1, 3, 1],
  45: [1, 1, 3, 1, 2, 3], 46: [1, 1, 3, 3, 2, 1], 47: [1, 3, 3, 1, 2, 1],
  48: [3, 1, 3, 1, 2, 1], 49: [2, 1, 1, 3, 3, 1], 50: [2, 3, 1, 1, 3, 1],
  51: [2, 1, 3, 1, 1, 3], 52: [2, 1, 3, 3, 1, 1], 53: [2, 1, 3, 1, 3, 1],
  54: [3, 1, 1, 1, 2, 3], 55: [3, 1, 1, 3, 2, 1], 56: [3, 3, 1, 1, 2, 1],
  57: [3, 1, 2, 1, 1, 3], 58: [3, 1, 2, 3, 1, 1], 59: [3, 3, 2, 1, 1, 1],
  60: [3, 1, 4, 1, 1, 1], 61: [2, 2, 1, 4, 1, 1], 62: [4, 3, 1, 1, 1, 1],
  63: [1, 1, 1, 2, 2, 4], 64: [1, 1, 1, 4, 2, 2], 65: [1, 2, 1, 1, 2, 4],
  66: [1, 2, 1, 4, 2, 1], 67: [1, 4, 1, 1, 2, 2], 68: [1, 4, 1, 2, 2, 1],
  69: [1, 1, 2, 2, 1, 4], 70: [1, 1, 2, 4, 1, 2], 71: [1, 2, 2, 1, 1, 4],
  72: [1, 2, 2, 4, 1, 1], 73: [1, 4, 2, 1, 1, 2], 74: [1, 4, 2, 2, 1, 1],
  75: [2, 4, 1, 2, 1, 1], 76: [2, 2, 1, 1, 1, 4], 77: [4, 1, 3, 1, 1, 1],
  78: [2, 4, 1, 1, 1, 2], 79: [1, 3, 4, 1, 1, 1], 80: [1, 1, 1, 2, 4, 2],
  81: [1, 2, 1, 1, 4, 2], 82: [1, 2, 1, 2, 4, 1], 83: [1, 1, 4, 2, 1, 2],
  84: [1, 2, 4, 1, 1, 2], 85: [1, 2, 4, 2, 1, 1], 86: [4, 1, 1, 2, 1, 2],
  87: [4, 2, 1, 1, 1, 2], 88: [4, 2, 1, 2, 1, 1], 89: [2, 1, 2, 1, 4, 1],
  90: [2, 1, 4, 1, 2, 1], 91: [4, 1, 2, 1, 2, 1], 92: [1, 1, 1, 1, 4, 3],
  93: [1, 1, 1, 3, 4, 1], 94: [1, 3, 1, 1, 4, 1], 95: [1, 1, 4, 1, 1, 3],
  96: [1, 1, 4, 3, 1, 1], 97: [4, 1, 1, 1, 1, 3], 98: [4, 1, 1, 3, 1, 1],
  99: [1, 1, 3, 1, 4, 1], 100: [1, 1, 4, 1, 3, 1], 101: [3, 1, 1, 1, 4, 1],
  102: [4, 1, 1, 1, 3, 1],
  104: [2, 1, 1, 2, 1, 4], // Start Code B
  106: [2, 3, 3, 1, 1, 1, 2], // Stop pattern
};

export function generateBarcodeSvg(
  text: string,
  widthPx: number = 240,
  heightPx: number = 44,
  showText: boolean = true
): string {
  // Start Code B is index 104
  const values: number[] = [104];
  let checkSum = 104;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 32;
    const val = Math.max(0, Math.min(102, code));
    values.push(val);
    checkSum += val * (i + 1);
  }

  // Checksum mod 103
  values.push(checkSum % 103);
  // Stop code is 106
  values.push(106);

  // Build widths array
  const barWidths: { width: number; isBar: boolean }[] = [];
  for (const v of values) {
    const pattern = CODE128_PATTERNS[v] || [1, 1, 1, 1, 1, 1];
    for (let p = 0; p < pattern.length; p++) {
      barWidths.push({
        width: pattern[p],
        isBar: p % 2 === 0,
      });
    }
  }

  const totalUnits = barWidths.reduce((sum, item) => sum + item.width, 0) + 20; // 10 units quiet zone each side
  const barHeight = showText ? heightPx - 14 : heightPx;

  let currentX = 10;
  let rectsSvg = '';

  for (const item of barWidths) {
    if (item.isBar) {
      rectsSvg += `<rect x="${currentX}" y="2" width="${item.width}" height="${barHeight}" fill="#111827" />`;
    }
    currentX += item.width;
  }

  const textSvg = showText
    ? `<text x="${totalUnits / 2}" y="${heightPx - 2}" font-family="monospace" font-size="10" font-weight="bold" fill="#111827" text-anchor="middle" letter-spacing="1.5">${text}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalUnits} ${heightPx}" width="${widthPx}" height="${heightPx}" shape-rendering="crispEdges">
    <rect width="${totalUnits}" height="${heightPx}" fill="#ffffff" />
    ${rectsSvg}
    ${textSvg}
  </svg>`;
}
