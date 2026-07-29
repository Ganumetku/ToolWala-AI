import { marked } from 'marked';

/**
 * Render Markdown content cleanly to HTML string
 */
export function renderMarkdown(content: string): string {
  if (!content) return '';
  try {
    return marked.parse(content, { async: false, breaks: true, gfm: true }) as string;
  } catch (err) {
    console.error('Error parsing markdown:', err);
    return content;
  }
}
