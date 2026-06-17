import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'kr'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

// Use these instead of next/navigation for language switching to work
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);