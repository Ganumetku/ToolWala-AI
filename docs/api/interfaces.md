# API Interfaces Reference

This document maps public TypeScript interfaces declaring structures, state schemas, and bounds inside the ToolWala engines.

---

## `TWObject`
Base interface for all objects parsed from PDF streams.
```typescript
export interface TWObject {
  id: string;
  page: number; // 1-based page index
  type: 'text' | 'image' | 'path' | 'annotation';
  zIndex: number; // drawing-order priority
  x: number; // left screen coordinate (px)
  y: number; // top screen coordinate (px)
  width: number; // screen width (px)
  height: number; // screen height (px)
  rotation: number; // degrees (0 to 360)
  opacity: number; // transparent alpha (0.0 to 1.0)
  visible: boolean;
  locked: boolean;
  deleted: boolean;
  createdAt: number;
  updatedAt: number;
  isDirty: boolean; // toggle dirty status triggers

  // Original PDF metadata
  pdfObjectId?: string;
  pageIndex: number;
  operatorIndex: number;
  resourceName?: string;
  transformationMatrix: number[];

  // Snapshots transaction state history maps
  originalState: any;
  currentState: any;
  editedState?: any;
}
```

---

## `TWTextObject`
Text run model inheriting from `TWObject`.
```typescript
export interface TWTextObject extends TWObject {
  type: 'text';
  text: string;
  fontName: string;
  fontSize: number;
  fontColor: string;
  baseline: number; // baseline Y screen offset
  boundingBox: { x: number; y: number; width: number; height: number };
}
```

---

## `TWImageObject`
Raster pixel image node inheriting from `TWObject`.
```typescript
export interface TWImageObject extends TWObject {
  type: 'image';
  imageBytes?: Uint8Array;
  mimeType: string;
}
```

---

## `TWPathObject`
Lines, curves, and graphics paths node inheriting from `TWObject`.
```typescript
export interface TWPathObject extends TWObject {
  type: 'path';
  pathData: string; // SVG path coordinate operators string
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}
```

---

## `TWAnnotationObject`
Interactive page elements or links node inheriting from `TWObject`.
```typescript
export interface TWAnnotationObject extends TWObject {
  type: 'annotation';
  annotType: 'link' | 'highlight' | 'widget';
  contents?: string;
  color?: number[];
  formName?: string;
}
```

---

## `FontMetrics`
Typographic font measurements.
```typescript
export interface FontMetrics {
  fontName: string;
  ascent: number;
  descent: number;
  capHeight: number;
  xHeight: number;
  lineGap: number;
  averageWidth: number;
  unitsPerEm: number;
}
```
