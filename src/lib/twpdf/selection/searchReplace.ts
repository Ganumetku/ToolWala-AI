import type { PageItem, SearchMatch, TextBoxInfo } from '@/types/pdf';

export function findSearchMatches(
  query: string,
  pageList: PageItem[],
  canvasStates: Record<string, { objects?: Array<{ type?: string; text?: string; id?: string }> }>,
  originalTexts: Record<number, TextBoxInfo[]>
): SearchMatch[] {
  if (!query.trim() || pageList.length === 0) return [];

  const matches: SearchMatch[] = [];
  const lowerQuery = query.toLowerCase();

  pageList.forEach((pageItem) => {
    const state = canvasStates[pageItem.id];
    if (state && state.objects) {
      state.objects.forEach((obj) => {
        if ((obj.type === 'textbox' || obj.type === 'i-text') && obj.text) {
          const txt = obj.text.toLowerCase();
          let idx = txt.indexOf(lowerQuery);
          while (idx !== -1) {
            matches.push({
              pageId: pageItem.id,
              originalPageNum: pageItem.originalPageNum,
              boxId: obj.id || '',
              text: obj.text,
              index: idx,
            });
            idx = txt.indexOf(lowerQuery, idx + 1);
          }
        }
      });
    } else {
      const boxes = originalTexts[pageItem.originalPageNum] || [];
      boxes.forEach((box) => {
        const displayText = box.replacedText !== undefined ? box.replacedText : box.text;
        if (displayText) {
          const txt = displayText.toLowerCase();
          let idx = txt.indexOf(lowerQuery);
          while (idx !== -1) {
            matches.push({
              pageId: pageItem.id,
              originalPageNum: pageItem.originalPageNum,
              boxId: box.id,
              text: displayText,
              index: idx,
            });
            idx = txt.indexOf(lowerQuery, idx + 1);
          }
        }
      });
    }
  });

  return matches;
}
