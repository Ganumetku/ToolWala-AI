/**
 * Recover clipped subject (shoulders, sleeves, hair) after IMG.LY matting.
 *
 * ISNet often under-segments light clothing on a light backdrop. A hard alpha
 * wipe then deletes the remaining garment edge. Rebuild the cutout from the
 * original RGB: keep uncertain subject pixels, close holes, dilate the mask,
 * and only punch out pixels that look like flat sampled background.
 */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image for mask refine'));
    img.src = src;
  });
}

function dilate(src: Uint8Array, w: number, h: number, radius: number): Uint8Array {
  if (radius <= 0) return src;
  const tmp = new Uint8Array(w * h);
  const dst = new Uint8Array(w * h);

  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      let m = 0;
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(w - 1, x + radius);
      for (let xx = x0; xx <= x1; xx++) {
        const v = src[row + xx];
        if (v > m) m = v;
      }
      tmp[row + x] = m;
    }
  }

  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - radius);
    const y1 = Math.min(h - 1, y + radius);
    for (let x = 0; x < w; x++) {
      let m = 0;
      for (let yy = y0; yy <= y1; yy++) {
        const v = tmp[yy * w + x];
        if (v > m) m = v;
      }
      dst[y * w + x] = m;
    }
  }
  return dst;
}

function erode(src: Uint8Array, w: number, h: number, radius: number): Uint8Array {
  if (radius <= 0) return src;
  const tmp = new Uint8Array(w * h);
  const dst = new Uint8Array(w * h);

  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      let m = 255;
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(w - 1, x + radius);
      for (let xx = x0; xx <= x1; xx++) {
        const v = src[row + xx];
        if (v < m) m = v;
      }
      tmp[row + x] = m;
    }
  }

  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - radius);
    const y1 = Math.min(h - 1, y + radius);
    for (let x = 0; x < w; x++) {
      let m = 255;
      for (let yy = y0; yy <= y1; yy++) {
        const v = tmp[yy * w + x];
        if (v < m) m = v;
      }
      dst[y * w + x] = m;
    }
  }
  return dst;
}

function sampleBackground(data: Uint8ClampedArray, alpha: Uint8Array, w: number, h: number) {
  const acc = { r: 0, g: 0, b: 0, n: 0 };
  const step = Math.max(1, Math.floor(Math.min(w, h) / 80));

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const p = y * w + x;
      if (alpha[p] >= 12) continue;
      const i = p * 4;
      acc.r += data[i];
      acc.g += data[i + 1];
      acc.b += data[i + 2];
      acc.n += 1;
    }
  }

  if (acc.n < 16) {
    const patch = Math.max(4, Math.round(Math.min(w, h) * 0.04));
    const corners = [
      [0, 0],
      [w - patch, 0],
      [0, h - patch],
      [w - patch, h - patch],
    ];
    for (const [sx, sy] of corners) {
      for (let y = sy; y < sy + patch; y++) {
        for (let x = sx; x < sx + patch; x++) {
          const i = (y * w + x) * 4;
          acc.r += data[i];
          acc.g += data[i + 1];
          acc.b += data[i + 2];
          acc.n += 1;
        }
      }
    }
  }

  return {
    r: acc.r / acc.n,
    g: acc.g / acc.n,
    b: acc.b / acc.n,
  };
}

function colorDist(r: number, g: number, b: number, bg: { r: number; g: number; b: number }) {
  const dr = r - bg.r;
  const dg = g - bg.g;
  const db = b - bg.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function lumaVar(
  data: Uint8ClampedArray,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const x0 = Math.max(0, x - radius);
  const x1 = Math.min(w - 1, x + radius);
  const y0 = Math.max(0, y - radius);
  const y1 = Math.min(h - 1, y + radius);
  let n = 0;
  let sum = 0;
  let sum2 = 0;
  for (let yy = y0; yy <= y1; yy++) {
    for (let xx = x0; xx <= x1; xx++) {
      const i = (yy * w + xx) * 4;
      const yv = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      sum += yv;
      sum2 += yv * yv;
      n += 1;
    }
  }
  const mean = sum / n;
  return sum2 / n - mean * mean;
}

export async function refineCutout(
  originalUrl: string,
  cutoutUrl: string,
  defringe: number
): Promise<string> {
  const [original, cutout] = await Promise.all([loadImage(originalUrl), loadImage(cutoutUrl)]);

  const w = original.naturalWidth || original.width;
  const h = original.naturalHeight || original.height;
  if (!w || !h) return cutoutUrl;

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = w;
  srcCanvas.height = h;
  const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
  if (!srcCtx) return cutoutUrl;
  srcCtx.drawImage(original, 0, 0, w, h);
  const src = srcCtx.getImageData(0, 0, w, h);

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = w;
  maskCanvas.height = h;
  const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
  if (!maskCtx) return cutoutUrl;
  maskCtx.drawImage(cutout, 0, 0, w, h);
  const maskImg = maskCtx.getImageData(0, 0, w, h);

  const alpha = new Uint8Array(w * h);
  const solid = new Uint8Array(w * h);
  for (let p = 0, i = 3; p < alpha.length; p++, i += 4) {
    const a = maskImg.data[i];
    alpha[p] = a;
    // Keep uncertain garment / hair pixels instead of treating them as background.
    solid[p] = a >= 12 ? 255 : 0;
  }

  const minDim = Math.min(w, h);
  const closeRadius = Math.max(3, Math.round(minDim * 0.006));
  const recoverRadius = Math.max(14, Math.round(minDim * 0.042));

  const closed = erode(dilate(solid, w, h, closeRadius), w, h, closeRadius);
  const expanded = dilate(closed, w, h, recoverRadius);
  const bg = sampleBackground(src.data, alpha, w, h);

  const out = srcCtx.createImageData(w, h);
  const od = out.data;
  const sd = src.data;

  for (let p = 0, i = 0; p < alpha.length; p++, i += 4) {
    od[i] = sd[i];
    od[i + 1] = sd[i + 1];
    od[i + 2] = sd[i + 2];

    const originalA = alpha[p];
    let a = Math.max(originalA >= 12 ? 255 : originalA, closed[p]);

    if (a < 16 && expanded[p] >= 16) {
      const dist = colorDist(sd[i], sd[i + 1], sd[i + 2], bg);
      const x = p % w;
      const y = (p / w) | 0;
      const vari = lumaVar(sd, x, y, w, h, 2);
      const isFlatBg = dist < 28 && vari < 36;
      if (!isFlatBg) {
        a = 255;
      }
    }

    if (defringe > 0 && a > 0 && a < defringe) {
      const dist = colorDist(sd[i], sd[i + 1], sd[i + 2], bg);
      const x = p % w;
      const y = (p / w) | 0;
      const vari = lumaVar(sd, x, y, w, h, 2);
      if (dist < 28 && vari < 30) {
        a = 0;
      }
    }

    od[i + 3] = a;
  }

  srcCtx.putImageData(out, 0, 0);
  return srcCanvas.toDataURL('image/png');
}
