export type MutationType =
  | 'TextReplace'
  | 'TextInsert'
  | 'TextDelete'
  | 'Move'
  | 'Resize'
  | 'Rotate'
  | 'OpacityChange'
  | 'ColorChange'
  | 'FontChange'
  | 'ImageReplace'
  | 'ImageDelete'
  | 'AnnotationAdd'
  | 'AnnotationDelete'
  | 'LayerChange'
  | 'VisibilityChange';

export interface Mutation {
  id: string; // Unique mutation transaction ID
  type: MutationType;
  objectId: string;
  page: number; // 1-based page index
  timestamp: number;
  beforeState: any; // Object copy before transformation
  afterState: any;  // Object copy after transformation
  author?: string;
}
