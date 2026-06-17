'use client';

import { useEffect } from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { defaultLocale, isLocale } from '@/lib/i18n';

const resolveLocale = (searchParams: URLSearchParams): string => {
  const localeFromQuery = searchParams.get('locale');
  if (localeFromQuery && isLocale(localeFromQuery)) {
    return localeFromQuery;
  }

  const localeCookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith('NEXT_LOCALE='))
    ?.split('=')[1];

  if (localeCookie && isLocale(localeCookie)) {
    return localeCookie;
  }

  return defaultLocale;
};

function GoogleSuccessInner() {
  const searchParams = useSearchParams();

  const hydrateCurrentUser = async () => {
    const response = await apiClient.get('/auth/me');
    const user = response?.data?.data;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      return;
    }
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const run = async () => {
      const token = searchParams.get('token');

      if (!token) {
        // No token — something went wrong, redirect to login with error
        window.location.replace('/login?error=google_auth_failed');
        return;
      }

      // 1. Persist token to localStorage and clear stale user payload from older sessions.
      localStorage.setItem('token', token);
      localStorage.removeItem('user');

      // 2. Immediately strip the token from the URL bar (security hygiene)
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }

      // 3. Hydrate user identity so dashboard/sidebar shows the correct name after OAuth login.
      try {
        await hydrateCurrentUser();
      } catch {
        // Keep token flow working even if profile fetch fails; app can retry later.
      }

      // 4. Hard-navigate to user dashboard so Redux re-hydrates from localStorage.
      const locale = resolveLocale(searchParams);
      window.location.replace(`/${locale}/user`);
    };

    run();
  }, [searchParams]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-gray-900" />
    </div>
  );
}

export default function GoogleSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-white">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-gray-900" />
        </div>
      }
    >
      <GoogleSuccessInner />
    </Suspense>
  );
}
