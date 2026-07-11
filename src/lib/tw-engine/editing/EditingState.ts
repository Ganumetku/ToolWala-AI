/**
 * EditingState restricts user operations to one active interaction mode at a time,
 * resolving concurrent conflicts between text carets and object dragging.
 */
export enum EditingState {
  IDLE = 'IDLE',
  OBJECT_SELECTED = 'OBJECT_SELECTED',
  TEXT_EDITING = 'TEXT_EDITING',
  TEXT_SELECTING = 'TEXT_SELECTING',
  DRAGGING = 'DRAGGING',
  RESIZING = 'RESIZING',
  ROTATING = 'ROTATING',
}
