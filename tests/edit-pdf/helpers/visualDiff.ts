import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { BASELINE_DIR, OUTPUT_DIR } from './editor';

const DEFAULT_RATIO = Number(process.env.EDIT_PDF_MAX_DIFF_RATIO || 0.02);

function pixelDiff(
  a: Buffer,
  b: Buffer,
  out: Buffer,
  width: number,
  height: number,
  threshold = 0.1
): number {
  const maxDelta = 35215 * threshold * threshold;
  let diff = 0;
  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    const dr = a[o] - b[o];
    const dg = a[o + 1] - b[o + 1];
    const db = a[o + 2] - b[o + 2];
    const da = a[o + 3] - b[o + 3];
    const delta = dr * dr + dg * dg + db * db + da * da;
    if (delta > maxDelta) {
      diff += 1;
      out[o] = 255;
      out[o + 1] = 0;
      out[o + 2] = 0;
      out[o + 3] = 255;
    } else {
      const g = Math.round(a[o] * 0.3 + a[o + 1] * 0.59 + a[o + 2] * 0.11);
      out[o] = out[o + 1] = out[o + 2] = g;
      out[o + 3] = 255;
    }
  }
  return diff;
}

export function shouldUpdateBaselines(): boolean {
  return process.env.UPDATE_EDIT_PDF_BASELINES === '1';
}

export function comparePngToBaseline(
  actualPng: Buffer,
  baselineName: string,
  maxDiffPixelRatio = DEFAULT_RATIO
): { diffPixels: number; ratio: number; diffPath?: string } {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(BASELINE_DIR, { recursive: true });
  const baselinePath = path.join(BASELINE_DIR, baselineName);
  const actualPath = path.join(OUTPUT_DIR, baselineName.replace(/\.png$/, '.actual.png'));
  fs.writeFileSync(actualPath, actualPng);

  if (shouldUpdateBaselines()) {
    fs.writeFileSync(baselinePath, actualPng);
    return { diffPixels: 0, ratio: 0 };
  }

  if (!fs.existsSync(baselinePath)) {
    fs.writeFileSync(actualPath, actualPng);
    throw new Error(
      `Missing baseline ${baselinePath}. Run npm run test:visual:update and commit the PNG.`
    );
  }

  const expected = PNG.sync.read(fs.readFileSync(baselinePath));
  const actual = PNG.sync.read(actualPng);
  if (expected.width !== actual.width || expected.height !== actual.height) {
    const diffPath = path.join(OUTPUT_DIR, baselineName.replace(/\.png$/, '.diff.png'));
    fs.writeFileSync(diffPath, actualPng);
    throw new Error(
      `Baseline size ${expected.width}x${expected.height} != actual ${actual.width}x${actual.height} (${baselineName})`
    );
  }

  const diff = new PNG({ width: expected.width, height: expected.height });
  const diffPixels = pixelDiff(expected.data, actual.data, diff.data, expected.width, expected.height, 0.1);
  const ratio = diffPixels / (expected.width * expected.height);
  const diffPath = path.join(OUTPUT_DIR, baselineName.replace(/\.png$/, '.diff.png'));
  if (ratio > maxDiffPixelRatio) {
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
  }
  return { diffPixels, ratio, diffPath: ratio > maxDiffPixelRatio ? diffPath : undefined };
}

export function samplePixel(png: Buffer, x: number, y: number): { r: number; g: number; b: number } {
  const image = PNG.sync.read(png);
  const sx = Math.max(0, Math.min(image.width - 1, x));
  const sy = Math.max(0, Math.min(image.height - 1, y));
  const idx = (image.width * sy + sx) << 2;
  return { r: image.data[idx], g: image.data[idx + 1], b: image.data[idx + 2] };
}

export function isNearColor(
  pixel: { r: number; g: number; b: number },
  target: { r: number; g: number; b: number },
  tol = 40
): boolean {
  return (
    Math.abs(pixel.r - target.r) <= tol &&
    Math.abs(pixel.g - target.g) <= tol &&
    Math.abs(pixel.b - target.b) <= tol
  );
}
