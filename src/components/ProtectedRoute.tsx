'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from '@/i18n/routing';
import { RootState } from '@/lib/store/store';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useSelector((state: RootState) => state.user.token);
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [fallbackToken, setFallbackToken] = useState<string | null>(null);

  useEffect(() => {
    setReady(true);
    if (typeof window !== 'undefined') {
      setFallbackToken(localStorage.getItem('token'));
    }
  }, []);

  const effectiveToken = token || fallbackToken;

  useEffect(() => {
    if (ready && !effectiveToken) {
      router.replace('/login');
    }
  }, [ready, effectiveToken, router]);

  if (!ready || !effectiveToken) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-[#6366f1]" />
      </div>
    );
  }

  return <>{children}</>;
}
