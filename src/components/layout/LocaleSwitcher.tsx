'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { useLocale } from 'next-intl';
import { routing, usePathname, useRouter } from '@/i18n/routing';

const localeLabels: Record<(typeof routing.locales)[number], string> = {
  en: 'EN',
  kr: 'KR',
};

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleLanguageChange = (nextLocale: (typeof routing.locales)[number]) => {
    if (nextLocale === locale) {
      return;
    }

    router.replace(pathname, { locale: nextLocale, scroll: false });
  };

  return (
    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2 py-1.5 shadow-xs">
      <Languages className="h-4 w-4 text-gray-600" strokeWidth={1.9} />
      <div className="inline-flex items-center rounded-lg bg-gray-100 p-0.5">
        {routing.locales.map((supportedLocale) => (
          <button
            key={supportedLocale}
            type="button"
            onClick={() => handleLanguageChange(supportedLocale)}
            aria-label={`Switch language to ${supportedLocale.toUpperCase()}`}
            className={[
              'cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors',
              locale === supportedLocale ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900',
            ].join(' ')}
          >
            {localeLabels[supportedLocale]}
          </button>
        ))}
      </div>
    </div>
  );
}