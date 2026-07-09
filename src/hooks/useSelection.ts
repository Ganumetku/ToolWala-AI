'use client';

import { useState, useEffect, useCallback } from 'react';
import { findSearchMatches } from '@/lib/twpdf/selection';
import { hexToRgbaStr } from '@/lib/twpdf/utils';
import { fabricPropertyToTwpdfPatch } from '@/lib/twpdf/editing/renderer/domToFabric';
import type { TWPDFEditingEngine } from '@/lib/twpdf/editing/editingEngine';
import type { TWPDFObject } from '@/types/twpdf';
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
  engine: TWPDFEditingEngine | null;
  syncPageFromFabric?: (pageId: string, state: unknown) => void;
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
  engine,
  syncPageFromFabric,
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

    if (engine) {
      const detectedColor =
        (match as SearchMatch & { detectedColor?: string }).detectedColor || '#0b2c8c';
      engine.updateObject(pageId, boxId, { text: newText, color: detectedColor });
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
        const updatedState = { ...state, objects: updatedObjects };
        setCanvasStates((prev) => ({ ...prev, [pageId]: updatedState }));
        syncPageFromFabric?.(pageId, updatedState);
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
    engine,
    canvasStates,
    setCanvasStates,
    syncPageFromFabric,
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
            const updatedState = { ...state, objects: updatedObjects };
            updatedStates[pageItem.id] = updatedState;
            syncPageFromFabric?.(pageItem.id, updatedState);
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
    setOriginalTexts,
    setCanvasStates,
    syncPageFromFabric,
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
      if (!engine || !selectedObjectInfo) return;
      const { pageId, id: objectId } = selectedObjectInfo;

      let patchValue = value;
      if (key === 'fill' && selectedObjectInfo.isHighlight) {
        const cleanHex = (value as string).startsWith('#') ? (value as string) : '#fbbf24';
        let op = 0.4;
        if (selectedObjectInfo.fill && selectedObjectInfo.fill.startsWith('rgba')) {
          const match = selectedObjectInfo.fill.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
          if (match) op = parseFloat(match[4]);
        }
        patchValue = hexToRgbaStr(cleanHex, op);
        engine.updateObject(pageId, objectId, { color: patchValue as string });
      } else if (key === 'opacity' && selectedObjectInfo.isHighlight) {
        const fill = selectedObjectInfo.fill || '#fbbf24';
        if (fill.startsWith('rgba')) {
          const match = fill.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (match) {
            engine.updateObject(pageId, objectId, {
              color: `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${value})`,
              opacity: 1,
            });
          }
        } else {
          engine.updateObject(pageId, objectId, {
            color: hexToRgbaStr(fill, value as number),
            opacity: 1,
          });
        }
      } else {
        const existingType = selectedObjectInfo.isHighlight
          ? 'highlight'
          : selectedObjectInfo.type === 'textbox' || selectedObjectInfo.type === 'i-text'
            ? 'text'
            : 'shape';
        const stubObj = { type: existingType } as TWPDFObject;
        const patch = fabricPropertyToTwpdfPatch(key, patchValue, stubObj);
        engine.updateObject(pageId, objectId, patch);
      }

      setSelectedObjectInfo((prev) => (prev ? { ...prev, [key]: value } : null));
    },
    [engine, selectedObjectInfo]
  );

  const adjustLayer = useCallback(
    (action: 'front' | 'back' | 'forward' | 'backward') => {
      if (!engine || !selectedObjectInfo) return;
      const { pageId, id: objectId } = selectedObjectInfo;

      switch (action) {
        case 'front':
          engine.bringToFront(pageId, objectId);
          break;
        case 'back':
          engine.sendToBack(pageId, objectId);
          break;
        case 'forward':
          engine.bringForward(pageId, objectId);
          break;
        case 'backward':
          engine.sendBackward(pageId, objectId);
          break;
      }
    },
    [engine, selectedObjectInfo]
  );

  const handleDeleteSelected = useCallback(() => {
    if (!engine || !selectedObjectInfo) return;
    engine.deleteObject(selectedObjectInfo.pageId, selectedObjectInfo.id);
    setSelectedObjectInfo(null);
  }, [engine, selectedObjectInfo]);

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
