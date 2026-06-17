'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from '@/i18n/routing';
import { logout, selectIsAuthenticated } from '@/lib/store/slices/userSlice';
import type { AppDispatch } from '@/lib/store/store';

const DEFAULT_IDLE_MINUTES = 30;
const LAST_ACTIVITY_KEY = 'lastActivityAt';

const getIdleTimeoutMs = (): number => {
  const raw = process.env.NEXT_PUBLIC_IDLE_LOGOUT_MINUTES;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_IDLE_MINUTES * 60 * 1000;
  }
  return parsed * 60 * 1000;
};

export default function SessionInactivityHandler() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const timeoutRef = useRef<number | null>(null);
  const idleTimeoutMs = useMemo(() => getIdleTimeoutMs(), []);

  useEffect(() => {
    if (!isAuthenticated) {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      return;
    }

    const clearTimer = () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const triggerIdleLogout = () => {
      clearTimer();
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      dispatch(logout());
      router.push('/login');
    };

    const resetTimer = () => {
      const now = Date.now();
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      clearTimer();
      timeoutRef.current = window.setTimeout(triggerIdleLogout, idleTimeoutMs);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        return;
      }

      const last = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || Date.now());
      if (Date.now() - last >= idleTimeoutMs) {
        triggerIdleLogout();
        return;
      }

      resetTimer();
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'click',
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, { passive: true });
    });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    resetTimer();

    return () => {
      clearTimer();
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch, idleTimeoutMs, isAuthenticated, router]);

  return null;
}