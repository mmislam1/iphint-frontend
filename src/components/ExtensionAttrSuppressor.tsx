'use client';

import { useEffect } from 'react';

/**
 * Strips browser-extension attributes (e.g. Grammarly) from <html> and <body>
 * before React's hydration diffing can complain about them.
 */
export default function ExtensionAttrSuppressor() {
  useEffect(() => {
    const ATTRS = [
      'data-new-gr-c-s-check-loaded',
      'data-gr-ext-installed',
      'data-gr-c-s-loaded',
    ];
    [document.documentElement, document.body].forEach((el) => {
      if (!el) return;
      ATTRS.forEach((attr) => el.removeAttribute(attr));
    });
  }, []);

  return null;
}
