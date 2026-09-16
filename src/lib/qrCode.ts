// Pure TypeScript QR Code generator (Byte Mode, Error Correction Level M/L)
// Standalone, zero external dependencies, renders crisp SVG

export class QrCode {
  public readonly size: number;
  private readonly modules: boolean[][];
  private readonly isFunction: boolean[][];

  constructor(version: number) {
    if (version < 1 || version > 10) throw new Error('Version out of range');
    this.size = version * 4 + 17;
    this.modules = Array.from({ length: this.size }, () => Array(this.size).fill(false));
    this.isFunction = Array.from({ length: this.size }, () => Array(this.size).fill(false));
  }

  public getModule(x: number, y: number): boolean {
    return this.modules[y][x];
  }

  public setModule(x: number, y: number, isDark: boolean): void {
    this.modules[y][x] = isDark;
  }

  public setFunctionModule(x: number, y: number, isDark: boolean): void {
    this.modules[y][x] = isDark;
    this.isFunction[y][x] = true;
  }

  public isFunctionModule(x: number, y: number): boolean {
    return this.isFunction[y][x];
  }

  public getMatrix(): boolean[][] {
    return this.modules.map(row => [...row]);
  }
}

// Reed-Solomon Galois Field 256 math
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);
(function initTables() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    EXP_TABLE[i + 255] = x;
    LOG_TABLE[x] = i;
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
}

function rsComputeDivisor(degree: number): Uint8Array {
  let result = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(result.length + 1);
    const factor = EXP_TABLE[i];
    for (let j = 0; j < result.length; j++) {
      next[j] ^= gfMul(result[j], factor);
      next[j + 1] ^= result[j];
    }
    result = next;
  }
  return result;
}

function rsComputeRemainder(data: Uint8Array, divisor: Uint8Array): Uint8Array {
  const degree = divisor.length - 1;
  const result = new Uint8Array(degree);
  for (let d = 0; d < data.length; d++) {
    const b = data[d];
    const factor = b ^ result[0];
    result.copyWithin(0, 1);
    result[degree - 1] = 0;
    for (let i = 0; i < degree; i++) {
      result[i] ^= gfMul(divisor[i + 1], factor);
    }
  }
  return result;
}

// QR Code generation helper
export function generateQrMatrix(text: string): boolean[][] {
  const utf8Bytes = new TextEncoder().encode(text);
  
  // Choose smallest version that fits data with EC level M
  const capacityTableM: { [v: number]: { dataCodewords: number; ecCodewords: number; blocks: number; alignment: number[] } } = {
    1: { dataCodewords: 16, ecCodewords: 10, blocks: 1, alignment: [] },
    2: { dataCodewords: 28, ecCodewords: 16, blocks: 1, alignment: [6, 18] },
    3: { dataCodewords: 44, ecCodewords: 26, blocks: 1, alignment: [6, 22] },
    4: { dataCodewords: 64, ecCodewords: 36, blocks: 2, alignment: [6, 26] },
    5: { dataCodewords: 86, ecCodewords: 48, blocks: 2, alignment: [6, 30] },
    6: { dataCodewords: 108, ecCodewords: 64, blocks: 4, alignment: [6, 34] },
  };

  let version = 2;
  while (version <= 6 && capacityTableM[version].dataCodewords < utf8Bytes.length + 3) {
    version++;
  }
  if (version > 6) version = 6;

  const spec = capacityTableM[version];
  const qr = new QrCode(version);
  const size = qr.size;

  // 1. Draw Finder Patterns (top-left, top-right, bottom-left)
  function drawFinderPattern(startX: number, startY: number) {
    for (let dy = -1; dy <= 7; dy++) {
      for (let dx = -1; dx <= 7; dx++) {
        const x = startX + dx;
        const y = startY + dy;
        if (x >= 0 && x < size && y >= 0 && y < size) {
          const dist = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
          const isDark = (dist !== 2 && dist !== 4);
          qr.setFunctionModule(x, y, isDark);
        }
      }
    }
  }

  drawFinderPattern(0, 0);
  drawFinderPattern(size - 7, 0);
  drawFinderPattern(0, size - 7);

  // 2. Draw Alignment Pattern if version >= 2
  if (spec.alignment.length > 0) {
    const coords = spec.alignment;
    for (let cy = 0; cy < coords.length; cy++) {
      const y = coords[cy];
      for (let cx = 0; cx < coords.length; cx++) {
        const x = coords[cx];
        // Don't draw on top of finders
        if ((x < 9 && y < 9) || (x > size - 9 && y < 9) || (x < 9 && y > size - 9)) continue;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const dist = Math.max(Math.abs(dx), Math.abs(dy));
            qr.setFunctionModule(x + dx, y + dy, dist !== 1);
          }
        }
      }
    }
  }

  // 3. Draw Timing Patterns
  for (let i = 8; i < size - 8; i++) {
    qr.setFunctionModule(i, 6, i % 2 === 0);
    qr.setFunctionModule(6, i, i % 2 === 0);
  }

  // 4. Dark Module
  qr.setFunctionModule(8, size - 8, true);

  // Reserve Format Bits
  for (let i = 0; i <= 8; i++) {
    if (i !== 6) qr.setFunctionModule(8, i, false);
    if (i <= 7 && i !== 6) qr.setFunctionModule(i, 8, false);
  }
  for (let i = 0; i <= 7; i++) {
    qr.setFunctionModule(size - 1 - i, 8, false);
    qr.setFunctionModule(8, size - 1 - i, false);
  }

  // 5. Data Bitstream: Byte Mode (0100) + Length + Payload + Terminator + Padding
  const bitstream: number[] = [];
  function pushBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) {
      bitstream.push((val >>> i) & 1);
    }
  }

  // Mode Indicator: Byte Mode = 4 (0100)
  pushBits(0b0100, 4);
  // Character Count Indicator (8 bits for version 1-9)
  pushBits(utf8Bytes.length, 8);
  // Payload
  for (let i = 0; i < utf8Bytes.length; i++) {
    pushBits(utf8Bytes[i], 8);
  }
  // Terminator
  const totalBits = spec.dataCodewords * 8;
  const termLen = Math.min(4, totalBits - bitstream.length);
  pushBits(0, termLen);
  // Bit pad to byte boundary
  while (bitstream.length % 8 !== 0) {
    bitstream.push(0);
  }
  // Byte pad (0xEC, 0x11)
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bitstream.length < totalBits) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bitstream to bytes
  const dataBytes = new Uint8Array(spec.dataCodewords);
  for (let i = 0; i < spec.dataCodewords; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bitstream[i * 8 + b];
    }
    dataBytes[i] = byteVal;
  }

  // Reed Solomon Error Correction
  const ecPerBlock = spec.ecCodewords / spec.blocks;
  const dataPerBlock = spec.dataCodewords / spec.blocks;
  const divisor = rsComputeDivisor(ecPerBlock);

  const blockData: Uint8Array[] = [];
  const blockEc: Uint8Array[] = [];
  for (let b = 0; b < spec.blocks; b++) {
    const start = b * dataPerBlock;
    const slice = dataBytes.slice(start, start + dataPerBlock);
    blockData.push(slice);
    blockEc.push(rsComputeRemainder(slice, divisor));
  }

  // Interleave data and EC codewords
  const finalCodewords: number[] = [];
  for (let i = 0; i < dataPerBlock; i++) {
    for (let b = 0; b < spec.blocks; b++) {
      finalCodewords.push(blockData[b][i]);
    }
  }
  for (let i = 0; i < ecPerBlock; i++) {
    for (let b = 0; b < spec.blocks; b++) {
      finalCodewords.push(blockEc[b][i]);
    }
  }

  // Convert final codewords to bits
  const allBits: number[] = [];
  for (let c = 0; c < finalCodewords.length; c++) {
    const cw = finalCodewords[c];
    for (let i = 7; i >= 0; i--) {
      allBits.push((cw >>> i) & 1);
    }
  }

  // 6. Populate Matrix (Zigzag upwards and downwards)
  let bitIdx = 0;
  let upwards = true;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing pattern
    for (let vert = 0; vert < size; vert++) {
      const y = upwards ? size - 1 - vert : vert;
      for (let xOffset = 0; xOffset < 2; xOffset++) {
        const x = right - xOffset;
        if (!qr.isFunctionModule(x, y)) {
          let dark = false;
          if (bitIdx < allBits.length) {
            dark = allBits[bitIdx] === 1;
            bitIdx++;
          }
          // Mask 0: (x + y) % 2 === 0
          if ((x + y) % 2 === 0) {
            dark = !dark;
          }
          qr.setModule(x, y, dark);
        }
      }
    }
    upwards = !upwards;
  }

  // 7. Write Format Information (Mask 0, EC Level M = 00) -> Format bits with BCH: 101010000010010
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  
  // Write along top-left finder
  for (let i = 0; i <= 5; i++) qr.setModule(8, i, formatBits[i] === 1);
  qr.setModule(8, 7, formatBits[6] === 1);
  qr.setModule(8, 8, formatBits[7] === 1);
  qr.setModule(7, 8, formatBits[8] === 1);
  for (let i = 9; i <= 14; i++) qr.setModule(14 - i, 8, formatBits[i] === 1);

  // Write along other two finders
  for (let i = 0; i <= 7; i++) qr.setModule(size - 1 - i, 8, formatBits[i] === 1);
  for (let i = 8; i <= 14; i++) qr.setModule(8, size - 15 + i, formatBits[i] === 1);

  return qr.getMatrix();
}

// Convert matrix to crisp SVG markup
export function generateQrSvg(text: string, sizePx: number = 200, fgColor: string = '#064e3b'): string {
  const matrix = generateQrMatrix(text);
  const n = matrix.length;
  const quietZone = 2;
  const viewBoxSize = n + quietZone * 2;

  let pathData = '';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (matrix[y][x]) {
        pathData += `M${x + quietZone},${y + quietZone}h1v1h-1z `;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${sizePx}" height="${sizePx}" shape-rendering="crispEdges">
    <rect width="${viewBoxSize}" height="${viewBoxSize}" fill="#ffffff" rx="1" />
    <path d="${pathData.trim()}" fill="${fgColor}" />
  </svg>`;
}
