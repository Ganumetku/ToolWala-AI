'use client';

import { useState, useCallback } from 'react';

export function useHistory() {
  const [canvasStates, setCanvasStates] = useState<Record<string, unknown>>({});

  const handleCanvasStateUpdate = useCallback((pageId: string, stateJSON: unknown) => {
    setCanvasStates((prev) => ({ ...prev, [pageId]: stateJSON }));
  }, []);

  const resetHistory = useCallback(() => {
    setCanvasStates({});
  }, []);

  return {
    canvasStates,
    setCanvasStates,
    handleCanvasStateUpdate,
    resetHistory,
  };
}
