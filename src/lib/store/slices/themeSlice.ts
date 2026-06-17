import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type FontSizeKey = 'sm' | 'md' | 'lg' | 'xl';

export const FONT_SIZE_MAP: Record<FontSizeKey, string> = {
  sm: '14px',
  md: '16px',
  lg: '18px',
  xl: '20px',
};

export const FONT_SIZE_LABELS: Record<FontSizeKey, string> = {
  sm: 'Small (14px)',
  md: 'Default (16px)',
  lg: 'Large (18px)',
  xl: 'X-Large (20px)',
};

interface ThemeState {
  fontSize: FontSizeKey;
}

const initialState: ThemeState = {
  fontSize: 'md',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setFontSize(state, action: PayloadAction<FontSizeKey>) {
      state.fontSize = action.payload;
    },
  },
});

export const { setFontSize } = themeSlice.actions;
export default themeSlice.reducer;
