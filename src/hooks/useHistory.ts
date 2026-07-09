'use client';

import { useState, useCallback } from 'react';
import { pushHistoryState, applyHistoryToCanvases } from '@/lib/twpdf/history';

export function useHistory(
  canvasInstances: React.MutableRefObject<Record<string, unknown>>
) {
  const [canvasStates, setCanvasStates] = useState<Record<string, unknown>>({});
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const handleCanvasStateUpdate = useCallback(
    (pageId: string, stateJSON: unknown) => {
      setCanvasStates((prev) => {
        const updated = { ...prev, [pageId]: stateJSON };

        setHistory((historyPrev) => {
          const { history: nextHist, historyIndex: nextIdx } = pushHistoryState(
            historyPrev,
            historyIndex,
            updated
          );
          setHistoryIndex(nextIdx);
          return nextHist;
        });

        return updated;
      });
    },
    [historyIndex]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      const prevStates = history[prevIdx];
      setCanvasStates(prevStates);
      applyHistoryToCanvases(canvasInstances.current, prevStates);
    }
  }, [historyIndex, history, canvasInstances]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      const nextStates = history[nextIdx];
      setCanvasStates(nextStates);
      applyHistoryToCanvases(canvasInstances.current, nextStates);
    }
  }, [historyIndex, history, canvasInstances]);

  const resetHistory = useCallback(() => {
    setCanvasStates({});
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  return {
    canvasStates,
    setCanvasStates,
    history,
    historyIndex,
    handleCanvasStateUpdate,
    handleUndo,
    handleRedo,
    resetHistory,
  };
}
