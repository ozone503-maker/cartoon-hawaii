/** Decode a 16-bit grayscale PNG to meters. Browsers turn these into 8-bit. */

const FRAME_W = 11180;
const FRAME_H = 12800;
const TILE = 4096;
const STEP = 4;

export type TileHeight = {
  row: number;
  col: number;
  meters: Uint16Array;
  w: number;
  h: number;
  x0: number;
  x1: number;
  z0: number;
  z1: number;
};

function paeth(a: number, b: number, c: number) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

async function inflate(zlib: Uint8Array) {
  const raw = zlib.subarray(2, zlib.length - 4);
  const stream = new DecompressionStream("deflate");
  const writer = stream.writable.getWriter();
  void writer.write(raw);
  void writer.close();
  const buf = await new Response(stream.readable).arrayBuffer();
  return new Uint8Array(buf);
}

export async function decodeHeightPng(buf: ArrayBuffer, row: number, col: number, worldW: number, worldD: number): Promise<TileHeight> {
  const bytes = new Uint8Array(buf);
  const view = new DataView(buf);
  let p = 8;
  const idat: Uint8Array[] = [];
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  while (p < bytes.length) {
    const len = view.getUint32(p);
    const type = String.fromCharCode(bytes[p + 4]!, bytes[p + 5]!, bytes[p + 6]!, bytes[p + 7]!);
    const data = bytes.subarray(p + 8, p + 8 + len);
    if (type === "IHDR") {
      width = view.getUint32(p + 8);
      height = view.getUint32(p + 12);
      bitDepth = bytes[p + 16]!;
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    p += 12 + len;
  }
  if (bitDepth !== 16) throw new Error(`height png is ${bitDepth}-bit`);
  const packed = new Uint8Array(idat.reduce((n, a) => n + a.length, 0));
  let o = 0;
  for (const a of idat) {
    packed.set(a, o);
    o += a.length;
  }
  const raw = await inflate(packed);
  const bpp = 2;
  const stride = width * bpp;
  const rows = new Uint8Array(height * stride);
  let rp = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[rp++]!;
    const rowStart = y * stride;
    const prev = y === 0 ? null : rows.subarray((y - 1) * stride, y * stride);
    for (let i = 0; i < stride; i++) {
      const x = raw[rp++]!;
      const a = i >= bpp ? rows[rowStart + i - bpp]! : 0;
      const b = prev ? prev[i]! : 0;
      const c = prev && i >= bpp ? prev[i - bpp]! : 0;
      let v = x;
      if (filter === 1) v = (x + a) & 255;
      else if (filter === 2) v = (x + b) & 255;
      else if (filter === 3) v = (x + ((a + b) >> 1)) & 255;
      else if (filter === 4) v = (x + paeth(a, b, c)) & 255;
      rows[rowStart + i] = v;
    }
  }
  const w = Math.ceil(width / STEP);
  const h = Math.ceil(height / STEP);
  const meters = new Uint16Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = Math.min(width - 1, x * STEP);
      const sy = Math.min(height - 1, y * STEP);
      const i = (sy * width + sx) * 2;
      meters[y * w + x] = (rows[i]! << 8) | rows[i + 1]!;
    }
  }
  const cw = Math.min(TILE, FRAME_W - col * TILE);
  const ch = Math.min(TILE, FRAME_H - row * TILE);
  const x0 = ((col * TILE) / FRAME_W) * worldW - worldW / 2;
  const x1 = ((col * TILE + cw) / FRAME_W) * worldW - worldW / 2;
  const z0 = ((row * TILE) / FRAME_H) * worldD - worldD / 2;
  const z1 = ((row * TILE + ch) / FRAME_H) * worldD - worldD / 2;
  return { row, col, meters, w, h, x0, x1, z0, z1 };
}
