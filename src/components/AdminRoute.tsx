'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from '@/i18n/routing';
import { RootState } from '@/lib/store/store';

const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, role } = useSelector((state: RootState) => state.user);
  const ready = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const isAuthenticated = Boolean(token);
  const isAdmin = role === 'admin';

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!isAdmin) {
      router.replace('/user');
    }
  }, [isAdmin, isAuthenticated, ready, router]);

  if (!ready || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
      </div>
    );
  }

  return <>{children}</>;
}