export function pushHistoryState(
  history: Record<string, unknown>[],
  historyIndex: number,
  newState: Record<string, unknown>
): { history: Record<string, unknown>[]; historyIndex: number } {
  const nextHist = history.slice(0, historyIndex + 1);
  nextHist.push(newState);
  return { history: nextHist, historyIndex: nextHist.length - 1 };
}

export function applyHistoryToCanvases(
  canvasInstances: Record<string, unknown>,
  states: Record<string, unknown>
): void {
  Object.entries(canvasInstances).forEach(([pageId, canvas]) => {
    const c = canvas as {
      loadFromJSON: (state: unknown, cb: () => void) => void;
      renderAll: () => void;
      clear: () => void;
    };
    const state = states[pageId];
    if (state) {
      c.loadFromJSON(state, () => {
        c.renderAll();
      });
    } else {
      c.clear();
    }
  });
}
