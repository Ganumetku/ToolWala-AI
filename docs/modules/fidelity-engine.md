# fidelity-engine

The `fidelity` module handles high-fidelity client-side PDF text rendering. By typesetting characters individually based on PDF metadata, font matrices, and glyph metrics, it prevents browser-specific layout discrepancies (such as baseline offset drifts or spacing misalignments) and matches original document dimensions.

---

## Typography Core Interfaces

### 1. PositionedGlyph
Represents the local positioning coordinate for a single typeset character glyph:
```typescript
export interface PositionedGlyph {
  char: string;
  x: number;
  y: number;
  width: number;
  height: number;
  advance: number;
}
```

### 2. GlyphRun
Encapsulates compiled layout variables for a run of characters:
```typescript
export interface GlyphRun {
  fontFamily: string;
  fontSize: number;
  matrix: number[];
  glyphs: PositionedGlyph[];
  bounds: BoundingRect;
}
```

---

## Layout Cache

Layout compilations areCached to avoid recalculating typesetting matrices during camera operations (such as zoom or pan actions):
```typescript
const cacheKey = `${text}_${rawFontName}_${fontSize}_${JSON.stringify(params)}`;
```
The cached `GlyphRun` is retrieved on subsequent rendering ticks.
