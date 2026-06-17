import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  type SupportedLocale = (typeof routing.locales)[number];

  const activeLocale: SupportedLocale =
    locale && routing.locales.includes(locale as SupportedLocale)
      ? (locale as SupportedLocale)
      : routing.defaultLocale;

  return {
    locale: activeLocale,
    messages: (await import(`../messages/${activeLocale}.json`)).default
  };
});