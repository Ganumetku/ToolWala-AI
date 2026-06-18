"use client";

import React, { useEffect, useRef } from 'react';
import { useTranslation } from '@/components/I18nContext';

const IGNORED_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'NOSCRIPT', 'INPUT', 'TEXTAREA']);
const hasDevanagari = (str: string) => /[\u0900-\u097F]/.test(str || '');
const hasEnglish = (str: string) => /[a-zA-Z]/.test(str || '');

export default function LocaleDomTranslator({ children }: { children: React.ReactNode }) {
  const { locale } = useTranslation();
  const observerRef = useRef<MutationObserver | null>(null);
  const isTranslatingRef = useRef(false);

  useEffect(() => {
    if (locale !== 'hi') return;

    const translateNodes = async (nodes: Node[]) => {
      if (isTranslatingRef.current) return;
      isTranslatingRef.current = true;

      const textMap = new Map<Node, string>();
      const placeholderMap = new Map<Element, string>();
      const textsToTranslateSet = new Set<string>();

      const traverse = (node: Node) => {
        // Exclude specific elements
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element;
          if (IGNORED_TAGS.has(el.tagName)) {
            // Translate placeholders for inputs / textareas
            if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && el.hasAttribute('placeholder')) {
              const ph = el.getAttribute('placeholder') || '';
              if (ph && hasEnglish(ph) && !hasDevanagari(ph)) {
                placeholderMap.set(el, ph);
                textsToTranslateSet.add(ph);
              }
            }
            return;
          }
          if (
            el.hasAttribute('data-no-translate') ||
            el.getAttribute('translate') === 'no' ||
            el.classList.contains('no-translate')
          ) {
            return;
          }
        }

        if (node.nodeType === Node.TEXT_NODE) {
          const content = node.nodeValue || '';
          const trimmed = content.trim();
          if (trimmed && hasEnglish(trimmed) && !hasDevanagari(trimmed)) {
            textMap.set(node, trimmed);
            textsToTranslateSet.add(trimmed);
          }
        }

        node.childNodes.forEach(traverse);
      };

      nodes.forEach(traverse);

      if (textsToTranslateSet.size === 0) {
        isTranslatingRef.current = false;
        return;
      }

      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: Array.from(textsToTranslateSet), targetLang: 'hi' }),
        });

        if (res.ok) {
          const { translations } = await res.json();
          
          // Disconnect observer to avoid self-triggering on DOM mutation writes
          observerRef.current?.disconnect();

          textMap.forEach((trimmed, node) => {
            const translated = translations[trimmed];
            if (translated) {
              node.nodeValue = translated;
            }
          });

          placeholderMap.forEach((ph, el) => {
            const translated = translations[ph];
            if (translated) {
              el.setAttribute('placeholder', translated);
            }
          });

          // Re-observe
          startObserving();
        }
      } catch (err) {
        console.error('Dynamic translation failed:', err);
      } finally {
        isTranslatingRef.current = false;
      }
    };

    const startObserving = () => {
      if (!observerRef.current) {
        observerRef.current = new MutationObserver((mutations) => {
          const nodesToProcess: Node[] = [];
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => nodesToProcess.push(node));
            } else if (mutation.type === 'characterData') {
              nodesToProcess.push(mutation.target);
            }
          });
          if (nodesToProcess.length > 0) {
            translateNodes(nodesToProcess);
          }
        });
      }
      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    };

    // Initial translation run
    translateNodes([document.body]);
    startObserving();

    return () => {
      observerRef.current?.disconnect();
    };
  }, [locale]);

  return <>{children}</>;
}
