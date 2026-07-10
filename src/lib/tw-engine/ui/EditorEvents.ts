export type EditorEventType =
  | 'SelectionChanged'
  | 'ObjectMoved'
  | 'ObjectScaled'
  | 'ObjectRotated'
  | 'ObjectDeleted'
  | 'ObjectInserted'
  | 'HistoryChanged'
  | 'ZoomChanged'
  | 'PageChanged';

export interface EditorEvent {
  type: EditorEventType;
  payload: any;
}

/**
 * EditorEvents coordinates pub-sub subscription channels for layout events.
 */
export class EditorEvents {
  private static instance: EditorEvents | null = null;
  private listeners: Map<EditorEventType, Array<(payload: any) => void>> = new Map();

  private constructor() {}

  static getInstance(): EditorEvents {
    if (!this.instance) {
      this.instance = new EditorEvents();
    }
    return this.instance;
  }

  /**
   * Subscribes a listener to an event type. Returns an unsubscription callback.
   */
  subscribe(event: EditorEventType, callback: (payload: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
    return () => {
      const arr = this.listeners.get(event);
      if (arr) {
        const idx = arr.indexOf(callback);
        if (idx !== -1) arr.splice(idx, 1);
      }
    };
  }

  /**
   * Broadcasts an event payload to all active subscribers.
   */
  dispatch(event: EditorEventType, payload: any): void {
    const arr = this.listeners.get(event);
    if (arr) {
      arr.forEach((cb) => cb(payload));
    }
  }
}
