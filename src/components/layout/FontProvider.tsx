'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  setFontSize,
  FONT_SIZE_MAP,
  type FontSizeKey,
} from '@/lib/store/slices/themeSlice';

export default function FontProvider() {
  const dispatch = useAppDispatch();
  const { fontSize } = useAppSelector((state) => state.theme);

  // Hydrate from localStorage on first mount
  useEffect(() => {
    const savedSize = localStorage.getItem('app-font-size') as FontSizeKey | null;
    if (savedSize && savedSize in FONT_SIZE_MAP) dispatch(setFontSize(savedSize));
    localStorage.removeItem('app-font-family');
    document.documentElement.style.removeProperty('--app-font-family');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply base font size CSS variable whenever it changes
  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-size-base', FONT_SIZE_MAP[fontSize]);
    localStorage.setItem('app-font-size', fontSize);
  }, [fontSize]);

  return null;
}
