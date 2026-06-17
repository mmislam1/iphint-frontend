'use client';

import type { CheckoutOpenOptions, Paddle, PaddleEventData } from '@paddle/paddle-js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { apiClient, getApiErrorMessage } from '@/lib/api';
import {
  getSignupOfferLabel,
  hasSubscriptionAccess,
  isSignupOfferConfigured,
  isSignupOfferMissingPrice,
  type AccessSnapshot,
} from '@/lib/billingAccess';
import { useAppDispatch } from '@/lib/hooks';
import { fetchSubscriptionSnapshot } from '@/lib/store/slices/accountSlice';

const paddleEnvironment =
  (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT ?? process.env.NEXT_PUBLIC_PADDLE_ENV) === 'sandbox'
    ? 'sandbox'
    : 'production';
const paddleClientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.trim().replace(/^['"]|['"]$/g, '') || undefined;

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const getCheckoutResponse = (value: unknown) => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  if ('response' in value) {
    return (value as { response?: { data?: unknown } }).response?.data ?? null;
  }

  return value;
};

const isPriceConfigurationError = (value: unknown) => {
  const data = getCheckoutResponse(value);
  return !!(
    data &&
    typeof data === 'object' &&
    (('success' in data && (data as { success?: unknown }).success === false) ||
      ('priceConfigured' in data && (data as { priceConfigured?: unknown }).priceConfigured === false))
  );
};

interface TrialActivationModalProps {
  snapshot: AccessSnapshot | null;
  loading: boolean;
  error?: string | null;
}

export default function TrialActivationModal({ snapshot, loading, error }: TrialActivationModalProps) {
  const t = useTranslations('UserPanel.accessGate');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [activationState, setActivationState] = useState<'idle' | 'launching' | 'verifying'>('idle');
  const [activationError, setActivationError] = useState<string | null>(null);
  const paddleRef = useRef<Paddle | null>(null);
  const paddlePromiseRef = useRef<Promise<Paddle> | null>(null);
  const transactionIdRef = useRef<string | null>(null);
  const verifyingRef = useRef(false);
  const mountedRef = useRef(true);

  const signupOffer = snapshot?.signupOffer ?? null;
  const trialLabel = getSignupOfferLabel(signupOffer);
  const canStartTrial = isSignupOfferConfigured(signupOffer);
  const trialPriceMissing = isSignupOfferMissingPrice(signupOffer);
  const isWorking = activationState === 'launching' || activationState === 'verifying';

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const verifyCheckout = useCallback(async (transactionId: string) => {
    if (verifyingRef.current) {
      return;
    }

    verifyingRef.current = true;
    if (mountedRef.current) {
      setActivationState('verifying');
      setActivationError(null);
    }

    try {
      try {
        await apiClient.post('/billing/sync', { transactionId });
      } catch (syncError) {
        console.error('Paddle checkout sync failed', { transactionId, error: syncError });
      }

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const nextSnapshot = await dispatch(fetchSubscriptionSnapshot()).unwrap();

        if (hasSubscriptionAccess(nextSnapshot)) {
          return;
        }

        if (attempt < 4) {
          await delay(1500);
        }
      }

      if (mountedRef.current) {
        setActivationError(t('verificationPending'));
      }
    } catch (pollError) {
      if (mountedRef.current) {
        setActivationError(getApiErrorMessage(pollError, t('verificationFailed')));
      }
    } finally {
      verifyingRef.current = false;
      if (mountedRef.current) {
        setActivationState('idle');
      }
    }
  }, [dispatch, t]);

  const handlePaddleEvent = useCallback((event: PaddleEventData) => {
    if (event.name === 'checkout.completed' || event.name === 'checkout.closed') {
      const transactionId = transactionIdRef.current;
      if (transactionId) {
        void verifyCheckout(transactionId);
      } else {
        setActivationState('idle');
      }
      return;
    }

    if (event.name === 'checkout.error' || event.name === 'checkout.failed') {
      setActivationState('idle');
      setActivationError(t('checkoutError'));
    }
  }, [t, verifyCheckout]);

  const ensurePaddle = useCallback(async () => {
    if (paddleRef.current) {
      return paddleRef.current;
    }

    if (!paddleClientToken) {
      return null;
    }

    if (!paddlePromiseRef.current) {
      paddlePromiseRef.current = (async () => {
        const { initializePaddle } = await import('@paddle/paddle-js');
        const instance = await initializePaddle({
          environment: paddleEnvironment,
          token: paddleClientToken,
          eventCallback: (event) => handlePaddleEvent(event),
        });

        if (!instance) {
          throw new Error('Paddle checkout could not be initialized.');
        }

        paddleRef.current = instance;
        return instance;
      })().catch((checkoutError) => {
        paddlePromiseRef.current = null;
        throw checkoutError;
      });
    }

    return paddlePromiseRef.current;
  }, [handlePaddleEvent]);

  const startTrialCheckout = async () => {
    if (!canStartTrial) {
      return;
    }

    setActivationState('launching');
    setActivationError(null);

    try {
      const response = await apiClient.post('/billing/paddle/checkout', {
        tier: 'pro',
        billingCycle: 'monthly',
        withTrial: true,
      });

      if (response.data?.success === false || response.data?.priceConfigured === false) {
        console.error('Trial checkout price is not configured', response.data);
        setActivationError(t('supportFallback'));
        setActivationState('idle');
        return;
      }

      const transactionId: string | undefined = response.data?.transactionId;
      const checkoutUrl: string | undefined = response.data?.checkoutUrl;

      if (!transactionId && !checkoutUrl) {
        throw new Error('Billing API did not return a transaction ID.');
      }

      if (transactionId) {
        transactionIdRef.current = transactionId;
      }

      const paddle = await ensurePaddle();

      if (paddle && transactionId) {
        paddle.Checkout.open({
          transactionId,
          settings: {
            displayMode: 'overlay',
            theme: 'light',
            successUrl: typeof window !== 'undefined' ? window.location.href : undefined,
          },
        } as unknown as CheckoutOpenOptions);
        return;
      }

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      throw new Error('Paddle checkout is not configured and no checkout URL was returned.');
    } catch (checkoutError) {
      console.error('Unable to start trial checkout', checkoutError);
      if (isPriceConfigurationError(checkoutError)) {
        setActivationError(t('supportFallback'));
      } else {
        setActivationError(getApiErrorMessage(checkoutError, t('checkoutError')));
      }
      setActivationState('idle');
    }
  };

  const goToBilling = () => {
    router.push('/user/billing');
  };

  const renderBody = () => {
    if (loading && !snapshot) {
      return (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('checkingAccess')}
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      );
    }

    if (trialPriceMissing) {
      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t('supportFallback')}
        </div>
      );
    }

    if (canStartTrial) {
      return (
        <>
          <p className="text-sm leading-6 text-gray-600">
            {t('trialCopy', { trialLabel })}
          </p>
          <button
            type="button"
            onClick={startTrialCheckout}
            disabled={isWorking}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isWorking ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            {activationState === 'verifying' ? t('verifying') : t('activateTrial', { trialLabel })}
          </button>
        </>
      );
    }

    return (
      <>
        <p className="text-sm leading-6 text-gray-600">{t('subscribeCopy')}</p>
        <button
          type="button"
          onClick={goToBilling}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          <CreditCard className="h-4 w-4" />
          {t('viewPlans')}
        </button>
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/45 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-950">{t('title')}</h2>
            <p className="mt-1 text-xs text-gray-500">{t('subtitle')}</p>
          </div>
        </div>

        {renderBody()}

        {activationError && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{activationError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
