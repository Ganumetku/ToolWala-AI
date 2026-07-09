'use client';

import { useState, useEffect, useCallback } from 'react';
import { findSearchMatches, applyPropertyChange, adjustObjectLayer } from '@/lib/twpdf/selection';
import type { PageItem, SearchMatch, SelectedObjectInfo, TextBoxInfo } from '@/types/pdf';

interface UseSelectionOptions {
  pageList: PageItem[];
  canvasStates: Record<string, unknown>;
  originalTexts: Record<number, TextBoxInfo[]>;
  canvasInstances: React.MutableRefObject<Record<string, unknown>>;
  activePageId: string | null;
  fontSize: number;
  fontFamily: string;
  handlePageThumbClick: (pageId: string) => void;
  setSuccess: (msg: string | null) => void;
  setOriginalTexts: React.Dispatch<React.SetStateAction<Record<number, TextBoxInfo[]>>>;
  setCanvasStates: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
}

export function useSelection({
  pageList,
  canvasStates,
  originalTexts,
  canvasInstances,
  activePageId,
  fontSize,
  fontFamily,
  handlePageThumbClick,
  setSuccess,
  setOriginalTexts,
  setCanvasStates,
}: UseSelectionOptions) {
  const [selectedObjectInfo, setSelectedObjectInfo] = useState<SelectedObjectInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replaceQuery, setReplaceQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchMatch[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'properties' | 'search'>('properties');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const matches = findSearchMatches(
      debouncedSearchQuery,
      pageList,
      canvasStates as Record<string, { objects?: Array<{ type?: string; text?: string; id?: string }> }>,
      originalTexts
    );
    setSearchResults(matches);
    setCurrentMatchIndex(matches.length > 0 ? 0 : -1);
  }, [debouncedSearchQuery, canvasStates, originalTexts, pageList]);

  const getActiveCanvas = useCallback(() => {
    const pageId = activePageId || pageList[0]?.id;
    if (!pageId) return null;
    return canvasInstances.current[pageId] as any;
  }, [activePageId, pageList, canvasInstances]);

  const focusMatch = useCallback(
    (match: SearchMatch) => {
      const { pageId, boxId } = match;
      handlePageThumbClick(pageId);

      setTimeout(() => {
        const canvas = canvasInstances.current[pageId] as any;
        if (canvas) {
          const obj = canvas.getObjects().find((o: any) => o.id === boxId);
          if (obj) {
            canvas.setActiveObject(obj);
            canvas.requestRenderAll();
          }
        }
      }, 200);
    },
    [handlePageThumbClick, canvasInstances]
  );

  const handleNextMatch = useCallback(() => {
    if (searchResults.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % searchResults.length;
    setCurrentMatchIndex(nextIdx);
    focusMatch(searchResults[nextIdx]);
  }, [searchResults, currentMatchIndex, focusMatch]);

  const handlePrevMatch = useCallback(() => {
    if (searchResults.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentMatchIndex(prevIdx);
    focusMatch(searchResults[prevIdx]);
  }, [searchResults, currentMatchIndex, focusMatch]);

  const handleReplace = useCallback(() => {
    if (currentMatchIndex === -1 || searchResults.length === 0) return;
    const match = searchResults[currentMatchIndex];
    const { pageId, originalPageNum, boxId } = match;

    const regex = new RegExp(debouncedSearchQuery, 'i');
    const newText = match.text.replace(regex, replaceQuery);

    const canvas = canvasInstances.current[pageId] as any;

    if (canvas) {
      const obj = canvas.getObjects().find((o: any) => o.id === boxId);
      if (obj) {
        obj.set('text', newText);
        if (obj.isOriginalText) {
          const detectedColor = obj.originalTextData?.detectedColor || '#0b2c8c';
          obj.set({
            fill: obj.fill === 'transparent' ? detectedColor : obj.fill,
            backgroundColor: 'transparent',
            stroke: 'transparent',
          });
        }
        canvas.requestRenderAll();
        canvas.fire('object:modified');
      }
    } else {
      const state = canvasStates[pageId] as { objects?: Array<Record<string, unknown>> } | undefined;
      if (state && state.objects) {
        const updatedObjects = state.objects.map((obj) => {
          if (obj.id === boxId) {
            const isOriginal = obj.isOriginalText;
            const detectedColor = (obj.originalTextData as { detectedColor?: string })?.detectedColor || '#0b2c8c';
            return {
              ...obj,
              text: newText,
              fill: isOriginal ? (obj.fill === 'transparent' ? detectedColor : obj.fill) : obj.fill,
              backgroundColor: 'transparent',
            };
          }
          return obj;
        });
        setCanvasStates((prev) => ({ ...prev, [pageId]: { ...state, objects: updatedObjects } }));
      } else {
        setOriginalTexts((prev) => {
          const pageBoxes = prev[originalPageNum] || [];
          const updatedBoxes = pageBoxes.map((box) => {
            if (box.id === boxId) {
              return { ...box, replacedText: newText };
            }
            return box;
          });
          return { ...prev, [originalPageNum]: updatedBoxes };
        });
      }
    }

    setSuccess('Replaced match successfully.');
    setTimeout(() => setSuccess(null), 3000);
  }, [
    currentMatchIndex,
    searchResults,
    debouncedSearchQuery,
    replaceQuery,
    canvasInstances,
    canvasStates,
    setCanvasStates,
    setOriginalTexts,
    setSuccess,
  ]);

  const handleReplaceAll = useCallback(() => {
    if (searchResults.length === 0) return;

    const query = debouncedSearchQuery.toLowerCase();
    const regex = new RegExp(debouncedSearchQuery, 'gi');

    const matchesByPage: Record<string, SearchMatch[]> = {};
    searchResults.forEach((m) => {
      if (!matchesByPage[m.pageId]) matchesByPage[m.pageId] = [];
      matchesByPage[m.pageId].push(m);
    });

    setOriginalTexts((prevOriginal) => {
      const updatedOriginal = { ...prevOriginal };

      setCanvasStates((prevStates) => {
        const updatedStates = { ...prevStates };

        pageList.forEach((pageItem) => {
          const pageMatches = matchesByPage[pageItem.id];
          if (!pageMatches) return;

          const canvas = canvasInstances.current[pageItem.id] as any;

          if (canvas) {
            let canvasModified = false;
            canvas.getObjects().forEach((obj: any) => {
              if ((obj.type === 'textbox' || obj.type === 'i-text') && obj.text) {
                if (obj.text.toLowerCase().includes(query)) {
                  const updatedText = obj.text.replace(regex, replaceQuery);
                  obj.set('text', updatedText);
                  if (obj.isOriginalText) {
                    const detectedColor = obj.originalTextData?.detectedColor || '#0b2c8c';
                    obj.set({
                      fill: obj.fill === 'transparent' ? detectedColor : obj.fill,
                      backgroundColor: 'transparent',
                      stroke: 'transparent',
                    });
                  }
                  canvasModified = true;
                }
              }
            });
            if (canvasModified) {
              canvas.requestRenderAll();
              const state = canvas.toJSON(['id', 'isOriginalText', 'originalTextData', 'isDeletedOriginal']);
              updatedStates[pageItem.id] = state;
            }
          } else {
            const state = updatedStates[pageItem.id] as { objects?: Array<Record<string, unknown>> } | undefined;
            if (state && state.objects) {
              const updatedObjects = state.objects.map((obj) => {
                if (
                  (obj.type === 'textbox' || obj.type === 'i-text') &&
                  obj.text &&
                  (obj.text as string).toLowerCase().includes(query)
                ) {
                  const isOriginal = obj.isOriginalText;
                  const detectedColor = (obj.originalTextData as { detectedColor?: string })?.detectedColor || '#0b2c8c';
                  return {
                    ...obj,
                    text: (obj.text as string).replace(regex, replaceQuery),
                    fill: isOriginal ? (obj.fill === 'transparent' ? detectedColor : obj.fill) : obj.fill,
                    backgroundColor: 'transparent',
                  };
                }
                return obj;
              });
              updatedStates[pageItem.id] = { ...state, objects: updatedObjects };
            } else {
              const pageBoxes = updatedOriginal[pageItem.originalPageNum] || [];
              const updatedBoxes = pageBoxes.map((box) => {
                const textToCheck = box.replacedText !== undefined ? box.replacedText : box.text;
                if (textToCheck && textToCheck.toLowerCase().includes(query)) {
                  return { ...box, replacedText: textToCheck.replace(regex, replaceQuery) };
                }
                return box;
              });
              updatedOriginal[pageItem.originalPageNum] = updatedBoxes;
            }
          }
        });

        return updatedStates;
      });

      return updatedOriginal;
    });

    setSuccess(`Successfully replaced all ${searchResults.length} occurrences.`);
    setTimeout(() => setSuccess(null), 4000);
  }, [
    searchResults,
    debouncedSearchQuery,
    replaceQuery,
    pageList,
    canvasInstances,
    setOriginalTexts,
    setCanvasStates,
    setSuccess,
  ]);

  const handleObjectSelected = useCallback(
    (pageId: string, activeObj: unknown) => {
      const obj = activeObj as Record<string, unknown>;
      setActiveSidebarTab('properties');
      setSelectedObjectInfo({
        id: (obj.id as string) || 'annot',
        type: obj.type as string,
        text: (obj.text as string) || '',
        fontSize: (obj.fontSize as number) || fontSize,
        fontFamily: (obj.fontFamily as string) || fontFamily,
        fill: (obj.fill as string) || 'transparent',
        stroke: (obj.stroke as string) || '#000000',
        strokeWidth: (obj.strokeWidth as number) || 1,
        fontWeight: (obj.fontWeight as string) || 'normal',
        fontStyle: (obj.fontStyle as string) || 'normal',
        underline: (obj.underline as boolean) || false,
        textAlign: (obj.textAlign as string) || 'left',
        opacity: (obj.opacity as number) || 1,
        angle: (obj.angle as number) || 0,
        isOriginalText: (obj.isOriginalText as boolean) || false,
        isHighlight: (obj.isHighlight as boolean) || false,
        pageId,
        originalTextData: obj.originalTextData as SelectedObjectInfo['originalTextData'],
      });
    },
    [fontSize, fontFamily]
  );

  const handleObjectCleared = useCallback(() => {
    setSelectedObjectInfo(null);
  }, []);

  const changeSelectedProperty = useCallback(
    (key: string, value: unknown) => {
      const canvas = getActiveCanvas();
      if (!canvas) return;
      const activeObj = canvas.getActiveObject() as Parameters<typeof applyPropertyChange>[0] | null;
      if (!activeObj) return;

      applyPropertyChange(activeObj, canvas, key, value);
      setSelectedObjectInfo((prev) => (prev ? { ...prev, [key]: value } : null));
    },
    [getActiveCanvas]
  );

  const adjustLayer = useCallback(
    (action: 'front' | 'back' | 'forward' | 'backward') => {
      const canvas = getActiveCanvas();
      if (!canvas) return;
      const activeObj = canvas.getActiveObject() as Parameters<typeof adjustObjectLayer>[0] | null;
      if (!activeObj) return;
      adjustObjectLayer(activeObj, canvas, action);
    },
    [getActiveCanvas]
  );

  const handleDeleteSelected = useCallback(() => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const activeObj = canvas.getActiveObject() as any;
    if (!activeObj) return;

    if (activeObj.isOriginalText) {
      activeObj.set({ isDeletedOriginal: true, opacity: 0, selectable: false });
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      canvas.fire('object:modified');
    } else {
      canvas.remove(activeObj);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
    setSelectedObjectInfo(null);
  }, [getActiveCanvas]);

  return {
    selectedObjectInfo,
    searchQuery,
    setSearchQuery,
    replaceQuery,
    setReplaceQuery,
    searchResults,
    currentMatchIndex,
    activeSidebarTab,
    setActiveSidebarTab,
    debouncedSearchQuery,
    getActiveCanvas,
    handleNextMatch,
    handlePrevMatch,
    handleReplace,
    handleReplaceAll,
    handleObjectSelected,
    handleObjectCleared,
    changeSelectedProperty,
    adjustLayer,
    handleDeleteSelected,
  };
}
