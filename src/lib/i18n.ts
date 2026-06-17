export const locales = ["en", "kr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

// Add this helper:
export const isLocale = (l: string): l is Locale => 
  (locales as readonly string[]).includes(l);
