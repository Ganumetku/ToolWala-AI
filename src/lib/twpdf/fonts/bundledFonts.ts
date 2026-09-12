export const NOTO_SANS_FAMILY = 'Noto Sans';
export const NOTO_SANS_DEVANAGARI_FAMILY = 'Noto Sans Devanagari';

export const BUNDLED_EDITOR_FONTS = [
  { family: NOTO_SANS_FAMILY, url: '/fonts/noto/NotoSans-Regular.ttf', weight: '400', style: 'normal' as const },
  { family: NOTO_SANS_FAMILY, url: '/fonts/noto/NotoSans-Bold.ttf', weight: '700', style: 'normal' as const },
  { family: NOTO_SANS_FAMILY, url: '/fonts/noto/NotoSans-Italic.ttf', weight: '400', style: 'italic' as const },
  {
    family: NOTO_SANS_DEVANAGARI_FAMILY,
    url: '/fonts/noto/NotoSansDevanagari-Regular.ttf',
    weight: '400',
    style: 'normal' as const,
  },
  {
    family: NOTO_SANS_DEVANAGARI_FAMILY,
    url: '/fonts/noto/NotoSansDevanagari-Bold.ttf',
    weight: '700',
    style: 'normal' as const,
  },
];

let bundledFontsPromise: Promise<void> | null = null;

export function loadBundledEditorFonts(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) {
    return Promise.resolve();
  }
  if (!bundledFontsPromise) {
    bundledFontsPromise = Promise.all(
      BUNDLED_EDITOR_FONTS.map(async (spec) => {
        const face = new FontFace(spec.family, `url(${spec.url})`, {
          weight: spec.weight,
          style: spec.style,
          display: 'swap',
        });
        const loaded = await face.load();
        document.fonts.add(loaded);
      })
    ).then(() => undefined);
  }
  return bundledFontsPromise;
}
