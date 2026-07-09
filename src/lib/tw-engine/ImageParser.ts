import type { TWImageObject, TWImageState } from './types';

/**
 * ImageParser scans the page operator list, tracks the Graphics State Stack (CTM),
 * and extracts raw image buffers, translating them into standard PNG bytes.
 */
export class ImageParser {
  /**
   * Parses images from the page operator list and maps them to TWImageObject instances.
   */
  static async parsePageImages(
    page: any,
    pageNum: number,
    viewport: any,
    pdfjs: any
  ): Promise<TWImageObject[]> {
    const images: TWImageObject[] = [];
    try {
      const opList = await page.getOperatorList();
      const { fnArray, argsArray } = opList;

      const OPS = pdfjs.OPS;
      if (!OPS) {
        throw new Error('PDF.js OPS is not available.');
      }

      let ctm = [1, 0, 0, 1, 0, 0];
      const gssStack: number[][] = [];

      for (let i = 0; i < fnArray.length; i++) {
        const fn = fnArray[i];
        const args = argsArray[i];

        switch (fn) {
          case OPS.save:
            gssStack.push([...ctm]);
            break;

          case OPS.restore:
            if (gssStack.length > 0) {
              ctm = gssStack.pop()!;
            }
            break;

          case OPS.transform:
            ctm = this.multiplyMatrices(ctm, args);
            break;

          case OPS.paintImageXObject:
          case OPS.paintImageMaskXObject:
            const imgRef = args[0];
            let rawImg = page.objs.get(imgRef) || page.commonObjs.get(imgRef);
            if (rawImg) {
              const imgObj = this.compileImageObject(rawImg, ctm, pageNum, viewport, imgRef, i);
              if (imgObj) {
                images.push(imgObj);
              }
            }
            break;

          case OPS.paintInlineImageXObject:
            const inlineRawImg = args[0];
            if (inlineRawImg) {
              const imgRefId = `inline_${Date.now()}_${i}`;
              const inlineObj = this.compileImageObject(inlineRawImg, ctm, pageNum, viewport, imgRefId, i);
              if (inlineObj) {
                images.push(inlineObj);
              }
            }
            break;
        }
      }
    } catch (e) {
      console.error(`ImageParser failed on page ${pageNum}`, e);
    }
    return images;
  }

  private static multiplyMatrices(m1: number[], m2: number[]): number[] {
    const [a1, b1, c1, d1, e1, f1] = m1;
    const [a2, b2, c2, d2, e2, f2] = m2;
    return [
      a1 * a2 + c1 * b2,
      b1 * a2 + d1 * b2,
      a1 * c2 + c1 * d2,
      b1 * c2 + d1 * d2,
      a1 * e2 + c1 * f2 + e1,
      b1 * e2 + d1 * f2 + f1,
    ];
  }

  private static compileImageObject(
    rawImg: any,
    ctm: number[],
    pageNum: number,
    viewport: any,
    imgRef: string,
    opIdx: number
  ): TWImageObject | null {
    if (!rawImg || !rawImg.width || !rawImg.height) return null;

    const [a, b, c, d, e, f] = ctm;

    const width = Math.sqrt(a * a + b * b) || 100;
    const height = Math.sqrt(c * c + d * d) || 100;
    const rotation = Math.atan2(b, a) * (180 / Math.PI);

    const [vx, vy] = viewport.convertToViewportPoint(e, f + d) as [number, number];

    let imageBytes: Uint8Array | null = null;
    const mimeType = 'image/png';

    if (typeof document !== 'undefined') {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = rawImg.width;
        canvas.height = rawImg.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          const imgData = ctx.createImageData(rawImg.width, rawImg.height);
          const dest = imgData.data;
          const src = rawImg.data;

          if (src) {
            if (src.length === rawImg.width * rawImg.height * 4) {
              dest.set(src);
            } else if (src.length === rawImg.width * rawImg.height * 3) {
              let srcIdx = 0;
              for (let i = 0; i < dest.length; i += 4) {
                dest[i] = src[srcIdx];
                dest[i + 1] = src[srcIdx + 1];
                dest[i + 2] = src[srcIdx + 2];
                dest[i + 3] = 255;
                srcIdx += 3;
              }
            } else if (src.length === rawImg.width * rawImg.height) {
              for (let i = 0; i < dest.length; i += 4) {
                const val = src[i / 4];
                dest[i] = val;
                dest[i + 1] = val;
                dest[i + 2] = val;
                dest[i + 3] = 255;
              }
            } else {
              for (let i = 0; i < dest.length; i += 4) {
                dest[i] = src[i] || 0;
                dest[i + 1] = src[i + 1] || 0;
                dest[i + 2] = src[i + 2] || 0;
                dest[i + 3] = src[i + 3] !== undefined ? src[i + 3] : 255;
              }
            }

            ctx.putImageData(imgData, 0, 0);
            const dataUrl = canvas.toDataURL(mimeType);
            const base64 = dataUrl.split(',')[1];
            if (base64) {
              const binary = atob(base64);
              imageBytes = new Uint8Array(binary.length);
              for (let j = 0; j < binary.length; j++) {
                imageBytes[j] = binary.charCodeAt(j);
              }
            }
          }
        }
      } catch (err) {
        console.error(`Failed to encode raw image ${imgRef} to PNG`, err);
      }
    }

    const imageState: TWImageState = {
      x: vx,
      y: vy,
      width,
      height,
      rotation,
      opacity: 1.0,
      transformMatrix: [...ctm],
    };

    return {
      id: `tw_img_${pageNum}_${imgRef}_${Date.now()}`,
      page: pageNum,
      type: 'image',
      zIndex: 0, // Assigned by PageParser
      
      x: vx,
      y: vy,
      width,
      height,
      rotation,
      opacity: 1.0,
      
      visible: true,
      locked: false,
      deleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      
      pageIndex: pageNum - 1,
      operatorIndex: opIdx,
      resourceName: imgRef,
      transformationMatrix: [...ctm],
      isDirty: false,

      imageBytes,
      mimeType,

      originalState: { ...imageState },
      currentState: { ...imageState },
    };
  }
}
