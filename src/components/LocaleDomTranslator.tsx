"use client";

import React, { useEffect, useRef } from 'react';
import { useTranslation } from '@/components/I18nContext';

const IGNORED_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'NOSCRIPT', 'INPUT', 'TEXTAREA']);
const hasDevanagari = (str: string) => /[\u0900-\u097F]/.test(str || '');
const hasEnglish = (str: string) => /[a-zA-Z]/.test(str || '');

export default function LocaleDomTranslator({ children }: { children: React.ReactNode }) {
  const { locale, messages } = useTranslation();
  const observerRef = useRef<MutationObserver | null>(null);
  const isTranslatingRef = useRef(false);

  useEffect(() => {
    if (locale === 'en') return;

    const knownTranslationsSet = new Set<string>();

    const collectAllValues = (obj: any) => {
      if (!obj) return;
      if (typeof obj === 'string') {
        const trimmed = obj.trim();
        if (trimmed) {
          knownTranslationsSet.add(trimmed);
          knownTranslationsSet.add(trimmed.toLowerCase());
        }
      } else if (typeof obj === 'object') {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            collectAllValues(obj[key]);
          }
        }
      }
    };

    collectAllValues(messages);

    const isTranslationExcluded = (node: Node): boolean => {
      let current: Node | null = node;
      while (current) {
        if (current.nodeType === Node.ELEMENT_NODE) {
          const el = current as Element;
          if (
            el.hasAttribute('data-no-translate') ||
            el.getAttribute('translate') === 'no' ||
            el.classList.contains('no-translate') ||
            el.classList.contains('notranslate')
          ) {
            return true;
          }
        }
        current = current.parentNode;
      }
      return false;
    };

    const translateNodes = async (nodes: Node[]) => {
      if (isTranslatingRef.current) return;
      isTranslatingRef.current = true;

      const textMap = new Map<Node, string>();
      const placeholderMap = new Map<Element, string>();
      const textsToTranslateSet = new Set<string>();

      const traverse = (node: Node) => {
        if (isTranslationExcluded(node)) {
          return;
        }

        // Exclude specific elements
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element;
          if (IGNORED_TAGS.has(el.tagName)) {
            // Translate placeholders for inputs / textareas
            if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && el.hasAttribute('placeholder')) {
              const ph = el.getAttribute('placeholder') || '';
              if (ph && hasEnglish(ph) && !hasDevanagari(ph)) {
                if (knownTranslationsSet.has(ph) || knownTranslationsSet.has(ph.toLowerCase())) {
                  return;
                }
                placeholderMap.set(el, ph);
                textsToTranslateSet.add(ph);
              }
            }
            return;
          }
        }

        if (node.nodeType === Node.TEXT_NODE) {
          const content = node.nodeValue || '';
          const trimmed = content.trim();
          if (trimmed && hasEnglish(trimmed) && !hasDevanagari(trimmed)) {
            if (knownTranslationsSet.has(trimmed) || knownTranslationsSet.has(trimmed.toLowerCase())) {
              return;
            }
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
          body: JSON.stringify({ texts: Array.from(textsToTranslateSet), targetLang: locale }),
        });

        if (res.ok) {
          const { translations } = await res.json();
          
          // Disconnect observer to avoid self-triggering on DOM mutation writes
          observerRef.current?.disconnect();

          textMap.forEach((trimmed, node) => {
            const translated = translations[trimmed];
            if (translated) {
              node.nodeValue = translated;
              knownTranslationsSet.add(translated);
              knownTranslationsSet.add(translated.toLowerCase());
            }
          });

          placeholderMap.forEach((ph, el) => {
            const translated = translations[ph];
            if (translated) {
              el.setAttribute('placeholder', translated);
              knownTranslationsSet.add(translated);
              knownTranslationsSet.add(translated.toLowerCase());
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
  }, [locale, messages]);

  return <>{children}</>;
}
