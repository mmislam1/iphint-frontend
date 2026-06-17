'use client';

import type { CheckoutOpenOptions, Paddle, PaddleEventData } from '@paddle/paddle-js';
import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Crown } from 'lucide-react';
import { apiClient, getApiErrorMessage } from '@/lib/api';
import { formatPriceByCountry } from '@/lib/currency';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  cancelPlanSubscription,
  fetchBillingPageData,
  pauseSubscription,
  resumeAutoRenew,
  resumeSubscription,
  upgradeSubscription,
} from '@/lib/store/slices/accountSlice';

type PlanTier = 'starter' | 'pro' | 'premium';
type BillingCycle = 'monthly' | 'annual';

interface Plan {
  tier: PlanTier;
  name: string;
  imageUploadLimit: number;
  alertLimit: number;
  pdfEnabled: boolean;
  weeklyEmailAlerts: boolean;
  features: string[];
  pricing: { monthly: number; annual: number };
}

interface BillingSnapshot {
  subscription: {
    id?: string;
    status: 'active' | 'trialing' | 'past_due' | 'paused' | 'cancelled' | 'expired' | 'pending';
    hasAccess?: boolean;
    billingCycle: BillingCycle;
    grantSource?: 'paid' | 'trial' | 'referral';
    isTrial?: boolean;
    isTrialing?: boolean;
    isPastDue?: boolean;
    paddleManaged?: boolean;
    trialEndsAt?: string | null;
    trialDaysLeft?: number;
    activationDate?: string;
    currentPeriodEnd?: string;
    nextBillingDate?: string;
    cancelDate?: string;
    paddleStatus?: string;
    pendingPlan?: {
      tier: PlanTier;
      name: string;
      billingCycle: BillingCycle;
      effectiveAt?: string | null;
    } | null;
  } | null;
  plan: Plan;
  credits?: number;
  alertsRemaining?: number;
  usage: {
    imagesUsedThisMonth: number;
    imageUploadLimit: number;
    alertLimit: number;
    pdfEnabled: boolean;
  };
}

interface BillingHistoryItem {
  _id: string;
  amount: number;
  currency: string;
  status: 'completed' | 'failed' | 'refunded';
  paddleTransactionId: string;
  createdAt: string;
}

const paddleEnvironment =
  (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT ?? process.env.NEXT_PUBLIC_PADDLE_ENV) === 'sandbox'
    ? 'sandbox'
    : 'production';
const paddleClientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.trim().replace(/^['"']|['"']$/g, '') || undefined;

const getPaymentErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'string') {
    const trimmed = error.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  if (error instanceof Error) {
    const trimmed = error.message.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return getApiErrorMessage(error, fallback);
};

export default function BillingPage() {
  const dispatch = useAppDispatch();
  const { plans, loading, error, savingPlan, cancelLoading, pauseLoading, resumeLoading, resumeAutoRenewLoading, upgradeLoading, countryCode } = useAppSelector((state) => state.account.billing);
  const snapshot = useAppSelector((state) => state.account.subscription.data) as BillingSnapshot | null;
  const t = useTranslations('UserPanel.billing');
  const locale = useLocale();
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanTier | null>(null);
  const [popupMessage, setPopupMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [updatePaymentLoading, setUpdatePaymentLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState<BillingHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const paddleRef = useRef<Paddle | null>(null);
  const paddlePromiseRef = useRef<Promise<Paddle> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isKoreanLocale = locale === 'kr';

  const formatPrice = (usd: number) => {
    return formatPriceByCountry(usd, countryCode);
  };

  const showPopup = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    setPopupMessage({ type, text });

    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
    }

    popupTimerRef.current = setTimeout(() => {
      setPopupMessage(null);
      popupTimerRef.current = null;
    }, 3500);
  }, []);

  useEffect(() => {
    dispatch(fetchBillingPageData());
  }, [dispatch, t]);

  useEffect(() => {
    let active = true;
    const loadHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const response = await apiClient.get('/billing/history', { params: { page: 1, limit: 20 } });
        if (!active) return;
        setHistoryItems(Array.isArray(response.data?.items) ? response.data.items : []);
      } catch (err) {
        if (!active) return;
        setHistoryError(getPaymentErrorMessage(err, 'Could not load billing history.'));
      } finally {
        if (active) setHistoryLoading(false);
      }
    };

    void loadHistory();
    return () => {
      active = false;
    };
  }, []);

  const handlePaddleEvent = useCallback((event: PaddleEventData) => {
    if (event.name === 'checkout.completed') {
      setCheckoutPlan(null);
      setCheckoutError(null);

      // Immediately sync from Paddle API in case webhook delivery is delayed.
      // This force-writes the paid subscription state to the DB so the UI
      // doesn't remain stuck on the trial badge.
      void (async () => {
        try {
          await apiClient.post('/billing/sync', {});
        } catch {
          // Non-fatal — polling below will still refresh via the standard endpoint.
        }
        // Poll until subscription is active and Paddle-managed
        let attempts = 0;
        const poll = () => {
          if (attempts >= 12) return;
          attempts++;
          pollTimerRef.current = setTimeout(async () => {
            const result = await dispatch(fetchBillingPageData());
            const sub = (result as { payload?: { snapshot?: BillingSnapshot | null } }).payload?.snapshot?.subscription;
            if (sub?.status === 'active' && sub?.paddleManaged) return;
            poll();
          }, 2500);
        };
        poll();
        startTransition(() => { void dispatch(fetchBillingPageData()); });
      })();
      return;
    }

    if (event.name === 'checkout.error' || event.name === 'checkout.failed') {
      setCheckoutPlan(null);      setCheckoutError(t('checkoutError'));
      return;
    }

    if (event.name === 'checkout.closed') {
      setCheckoutPlan(null);
    }
  }, [dispatch, t]);

  const currentSubscription = snapshot?.subscription ?? null;
  const hasEffectivePlan =
    !!currentSubscription &&
    (currentSubscription.hasAccess === true || ['active', 'trialing', 'past_due'].includes(currentSubscription.status));
  const currentTier: PlanTier | null = hasEffectivePlan ? (snapshot?.plan?.tier ?? null) : null;
  const currentPlanName = hasEffectivePlan ? (snapshot?.plan?.name ?? '--') : '--';
  // Paid active status MUST take priority over trial flags.
  // If status is 'active' the user has converted to a paid plan — never show trial badge.
  const isProTrial =
    currentTier === 'pro' &&
    !!currentSubscription &&
    currentSubscription.status !== 'active' &&
    (currentSubscription.status === 'trialing' || currentSubscription.isTrialing || currentSubscription.isTrial);
  const autoPayEnabled = snapshot?.subscription?.status === 'active' && snapshot.subscription.paddleManaged;
  const isPaddleActive = snapshot?.subscription?.status === 'active' && snapshot?.subscription?.paddleManaged;
  const pendingPlan = snapshot?.subscription?.pendingPlan ?? null;
  const hasPendingDowngrade = !!pendingPlan;
  const cancelEffectiveDate = snapshot?.subscription?.cancelDate
    ? new Date(snapshot.subscription.cancelDate)
    : null;
  const isCancelScheduled =
    snapshot?.subscription?.status === 'active' &&
    !!snapshot?.subscription?.paddleManaged &&
    !!cancelEffectiveDate &&
    !Number.isNaN(cancelEffectiveDate.getTime()) &&
    cancelEffectiveDate.getTime() > Date.now();
  const scheduledCancelDaysLeft = isCancelScheduled && cancelEffectiveDate
    ? Math.max(0, Math.ceil((cancelEffectiveDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : null;

  const tierOrder: PlanTier[] = ['starter', 'pro', 'premium'];
  const currentTierIndex = currentTier ? tierOrder.indexOf(currentTier) : -1;
  const koreanPlanFeatures: Record<PlanTier, string[]> = {
    starter: [
      '최대 10개 등록 항목 모니터링',
      '검색당 최대 1,000개 결과 조회',
      '누적 탐지 알림 1,000건',
      '자동 중복 필터링',
      '콘텐츠 노출 위험 분석',
      '인앱 알림',
    ],
    pro: [
      '최대 50개 등록 항목 모니터링',
      '검색당 최대 5,000개 결과 조회',
      '누적 탐지 알림 5,000건',
      '자동 중복 필터링',
      '콘텐츠 노출 위험 분석',
      'PDF 보고서 생성',
      '인앱 알림',
    ],
    premium: [
      '최대 100개 등록 항목 모니터링',
      '검색당 무제한 결과 조회',
      '무제한 탐지 알림',
      '자동 중복 필터링',
      '콘텐츠 노출 위험 분석',
      'PDF 보고서 생성',
      '1:1 전담 매니저 배정',
      '인앱 알림',
    ],
  };

  const getLocalizedPlanFeatures = (plan: Plan) => {
    if (!isKoreanLocale) return plan.features;
    return koreanPlanFeatures[plan.tier] ?? plan.features;
  };

  const getPlanName = (planTier: PlanTier) => plans.find((p) => p.tier === planTier)?.name || planTier;

  const getPlanCtaLabel = (planTier: PlanTier, isWorking: boolean) => {
    if (isWorking) return isKoreanLocale ? '처리 중...' : 'Processing...';

    if (isProTrial) {
      if (planTier === 'pro') return isKoreanLocale ? '지금 구독' : 'Subscribe now';
      if (planTier === 'premium') return isKoreanLocale ? 'Premium으로 업그레이드' : 'Upgrade to Premium';
    }

    const planIndex = tierOrder.indexOf(planTier);
    if (!hasEffectivePlan) {
      return isKoreanLocale ? `${getPlanName(planTier)} 구매` : `Buy ${getPlanName(planTier)}`;
    }

    if (isPaddleActive) {
      if (planIndex > currentTierIndex) return isKoreanLocale ? `${getPlanName(planTier)}로 업그레이드` : `Upgrade to ${getPlanName(planTier)}`;
      if (planIndex < currentTierIndex) {
        return isKoreanLocale ? `${getPlanName(planTier)}로 다운그레이드` : `Downgrade to ${getPlanName(planTier)}`;
      }
    }

    if (hasPendingDowngrade && currentTier && planTier === currentTier) {
      return isKoreanLocale ? '현재 요금제 유지' : 'Keep current plan';
    }

    return isKoreanLocale ? `${getPlanName(planTier)} 구독` : `Subscribe to ${getPlanName(planTier)}`;
  };

  const handlePlanAction = async (tier: PlanTier) => {
    if (isPaddleActive) {
      setCheckoutError(null);
      try {
        const targetTier = hasPendingDowngrade && currentTier && tier === currentTier
          ? currentTier
          : tier;
        const targetCycle = hasPendingDowngrade && currentTier && tier === currentTier
          ? currentSubscription?.billingCycle ?? cycle
          : cycle;

        await dispatch(upgradeSubscription({ tier: targetTier, billingCycle: targetCycle })).unwrap();
        const planName = plans.find((plan) => plan.tier === tier)?.name || tier;
        if (hasPendingDowngrade && currentTier && tier === currentTier) {
          showPopup('success', isKoreanLocale ? '예약된 다운그레이드가 취소되었습니다.' : 'Scheduled downgrade has been canceled.');
        } else {
          showPopup('success', `Your plan was updated to ${planName}.`);
        }
      } catch (err) {
        showPopup('error', getPaymentErrorMessage(err, 'Unable to change your plan right now.'));
      }
    } else {
      await subscribe(tier, { withTrial: !isProTrial });
    }
  };

  const usageLabel = useMemo(() => {
    if (!snapshot) return '';
    const used = snapshot.usage.imagesUsedThisMonth;
    const limit = snapshot.usage.imageUploadLimit;
    if (!limit) return `${used} uploads this month (unlimited plan)`;
    return `${used}/${limit} uploads used this month`;
  }, [snapshot]);

  const searchUsage = useMemo(() => {
    if (!snapshot) {
      return { used: 0, limit: 0, remaining: 0, unlimited: false };
    }

    const used = Number(snapshot.usage.imagesUsedThisMonth || 0);
    const limit = Number(snapshot.usage.imageUploadLimit || 0);
    if (limit <= 0) {
      return { used, limit, remaining: -1, unlimited: true };
    }

    const safeUsed = Math.max(0, used);
    const remaining = Math.max(0, limit - safeUsed);
    return { used: safeUsed, limit, remaining, unlimited: false };
  }, [snapshot]);

  const ensurePaddle = async () => {
    if (paddleRef.current) {
      return paddleRef.current;
    }

    if (!paddleClientToken) {
      throw new Error('Paddle checkout is not configured. Add NEXT_PUBLIC_PADDLE_CLIENT_TOKEN to enable paid subscriptions.');
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
      })().catch((error) => {
        paddlePromiseRef.current = null;
        throw error;
      });
    }

    return paddlePromiseRef.current;
  };

  const subscribe = async (tier: PlanTier, options?: { withTrial?: boolean }) => {
    setCheckoutError(null);
    setCheckoutPlan(tier);

    try {
      const paddle = await ensurePaddle();
      const response = await apiClient.post('/billing/paddle/checkout', {
        tier,
        billingCycle: cycle,
        withTrial: options?.withTrial,
      });

      const transactionId: string | undefined = response.data?.transactionId;
      const checkoutUrl: string | undefined = response.data?.checkoutUrl;
      if (!transactionId && !checkoutUrl) {
        throw new Error('Billing API did not return a transaction ID.');
      }

      // Always prefer transactionId for overlay — using the URL causes "bad request"
      const openPayload = transactionId
        ? { transactionId }
        : { url: checkoutUrl! };

      paddle.Checkout.open({
        ...openPayload,
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          successUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        },
      } as unknown as CheckoutOpenOptions);
      const planName = plans.find((plan) => plan.tier === tier)?.name || tier;
      showPopup('info', t('checkoutOpened', { plan: planName }));
    } catch (paymentError) {
      setCheckoutPlan(null);
      setCheckoutError(getPaymentErrorMessage(paymentError, 'Unable to start Paddle checkout.'));
      showPopup('error', getPaymentErrorMessage(paymentError, 'Unable to start Paddle checkout.'));
    }
  };

  const cancelSubscription = async () => {
    try {
      await dispatch(cancelPlanSubscription()).unwrap();
      showPopup('success', t('subscriptionCancelled'));
    } catch (err) {
      showPopup('error', getPaymentErrorMessage(err, 'Unable to cancel subscription.'));
    }
  };

  const handlePause = async () => {
    try {
      await dispatch(pauseSubscription()).unwrap();
      showPopup('success', t('subscriptionPausedSuccess'));
    } catch (err) {
      showPopup('error', getPaymentErrorMessage(err, 'Unable to pause subscription.'));
    }
  };

  const handleResume = async () => {
    try {
      await dispatch(resumeSubscription()).unwrap();
      showPopup('success', t('subscriptionResumed'));
    } catch (err) {
      showPopup('error', getPaymentErrorMessage(err, 'Unable to resume subscription.'));
    }
  };

  const handleResumeAutoRenew = async () => {
    try {
      await dispatch(resumeAutoRenew()).unwrap();
      showPopup('success', t('autoRenewResumed'));
    } catch (err) {
      showPopup('error', getPaymentErrorMessage(err, 'Unable to resume auto-renew.'));
    }
  };

  const handleUpdatePayment = async () => {
    setUpdatePaymentLoading(true);
    try {
      const response = await apiClient.get('/billing/payment-method');
      const updateUrl: string | undefined = response.data?.updateUrl ?? response.data?.portalUrl;
      if (updateUrl) window.location.href = updateUrl;
    } catch {
      // ignore
    } finally {
      setUpdatePaymentLoading(false);
    }
  };

  const handleOpenInvoicePortal = async () => {
    setPortalLoading(true);
    try {
      const response = await apiClient.get('/billing/portal');
      const portalUrl: string | undefined = response.data?.portalUrl;
      if (portalUrl) {
        window.open(portalUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      // ignore
    } finally {
      setPortalLoading(false);
    }
  };

  const formatPaymentAmount = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
      }).format(amount);
    } catch {
      return `${currency || 'USD'} ${amount}`;
    }
  };

  // Cleanup polling on unmount
  useEffect(() => () => { if (pollTimerRef.current) clearTimeout(pollTimerRef.current); }, []);
  useEffect(() => () => { if (popupTimerRef.current) clearTimeout(popupTimerRef.current); }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-100" />
        <div className="h-24 animate-pulse rounded-2xl border border-gray-100 bg-white" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-72 animate-pulse rounded-2xl border border-gray-100 bg-white" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {popupMessage && (
        <div
          className={`fixed right-4 top-4 z-50 max-w-sm rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm ${
            popupMessage.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : popupMessage.type === 'info'
                ? 'border-sky-200 bg-sky-50 text-sky-900'
                : 'border-red-200 bg-red-50 text-red-800'
          }`}
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-medium">{popupMessage.text}</p>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t('title')}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t('description')}
        </p>
      </div>

      {/* Trial / referral banner */}
      {snapshot?.subscription && (snapshot.subscription.isTrial || snapshot.subscription.status === 'trialing') && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <span className="font-semibold">
            {snapshot.subscription.trialDaysLeft != null
              ? t('trialDaysLeft', { days: snapshot.subscription.trialDaysLeft, unit: snapshot.subscription.trialDaysLeft !== 1 ? t('days') : t('day') })
              : t('trialActive')}
          </span>{' '}
          {t('trialConvert')}
        </div>
      )}

      {/* Past-due warning */}
      {snapshot?.subscription?.status === 'past_due' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span className="font-semibold">{t('pastDueWarning')}</span>
          {snapshot.subscription.paddleManaged && (
            <button
              type="button"
              disabled={updatePaymentLoading}
              onClick={handleUpdatePayment}
              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {updatePaymentLoading ? t('loadingPayment') : t('updatePaymentMethod')}
            </button>
          )}
        </div>
      )}

      {/* Paused notice */}
      {snapshot?.subscription?.status === 'paused' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          <span>
            <span className="mr-2 inline-block rounded-full bg-gray-300 px-2 py-0.5 text-xs font-semibold uppercase text-gray-700">{t('pausedBadge')}</span>
            {t('subscriptionPaused')}
            {snapshot.subscription.currentPeriodEnd && (
              <> {t('resumeOrExpire', { date: new Date(snapshot.subscription.currentPeriodEnd).toLocaleDateString() })}</>
            )}
          </span>
          {snapshot.subscription.paddleManaged && (
            <button
              type="button"
              disabled={resumeLoading}
              onClick={handleResume}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-60"
            >
              {resumeLoading ? t('resuming') : t('resume')}
            </button>
          )}
        </div>
      )}

      {/* Scheduled cancellation notice */}
      {isCancelScheduled && cancelEffectiveDate && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>
            <span className="mr-2 inline-block rounded-full bg-amber-600 px-2 py-0.5 text-xs font-semibold uppercase text-white">{t('autoRenewOffBadge')}</span>
            {t('cancellationScheduled', { date: cancelEffectiveDate.toLocaleDateString() })}
            {scheduledCancelDaysLeft != null && (
              <> {t('daysRemaining', { days: scheduledCancelDaysLeft, unit: scheduledCancelDaysLeft !== 1 ? t('days') : t('day') })}</>
            )}
          </span>
          <button
            type="button"
            onClick={handleResumeAutoRenew}
            disabled={resumeAutoRenewLoading}
            className="rounded-md bg-amber-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-800 disabled:opacity-60"
          >
            {resumeAutoRenewLoading ? t('resuming') : t('resumeAutoRenew')}
          </button>
        </div>
      )}

      {hasPendingDowngrade && !isCancelScheduled && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          <span>
            {isKoreanLocale
              ? `다운그레이드 예약됨: ${pendingPlan?.name} (${pendingPlan?.billingCycle === 'annual' ? '연간' : '월간'})`
              : `Downgrade scheduled: ${pendingPlan?.name} (${pendingPlan?.billingCycle})`}
            {pendingPlan?.effectiveAt && (
              <> {isKoreanLocale ? `적용일 ${new Date(pendingPlan.effectiveAt).toLocaleDateString()}` : `on ${new Date(pendingPlan.effectiveAt).toLocaleDateString()}`}</>
            )}
          </span>
        </div>
      )}

      {/* Cancelled notice */}
      {snapshot?.subscription?.status === 'cancelled' && snapshot.subscription.cancelDate && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>
            {t('cancelledAccess', { date: new Date(snapshot.subscription.cancelDate).toLocaleDateString() })}
          </span>
          <button
            type="button"
            onClick={() => document.getElementById('plan-cards')?.scrollIntoView({ behavior: 'smooth' })}
            className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
          >
            {t('resubscribe')}
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {checkoutError && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{checkoutError}</div>
      )}

      {!paddleClientToken && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t('paddleNotConfigured')}
        </div>
      )}

      {/* Subscription status card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">{t('currentPlanLabel', { name: currentPlanName })}</p>
            <p className="mt-1 text-xs text-gray-500">{hasEffectivePlan ? usageLabel : t('noActivePlan')}</p>
            {snapshot && hasEffectivePlan && (
              <p className="mt-1 text-xs text-gray-500">
                {searchUsage.unlimited
                  ? t('unlimitedSearches')
                  : t('searchesRemaining', { count: searchUsage.remaining })}
              </p>
            )}
            {hasEffectivePlan && snapshot?.alertsRemaining != null && (
              <p className="mt-1 text-xs text-gray-500">
                {snapshot.alertsRemaining === -1 ? t('unlimitedAlerts') : t('alertsRemaining', { count: snapshot.alertsRemaining })}
              </p>
            )}

            {/* Upload quota progress bar */}
            {hasEffectivePlan && snapshot && snapshot.usage.imageUploadLimit > 0 && (() => {
              const used = searchUsage.used;
              const total = searchUsage.limit;
              const pct = Math.min(100, Math.max(0, Math.round((used / total) * 100)));
              return (
                <div className="mt-3 max-w-xs">
                  <div className="mb-1 flex justify-between text-[10px] text-gray-400">
                    <span>{t('uploadsUsed')}</span>
                    <span>{used} / {total}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-gray-900 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })()}

            {/* Alerts quota — unlimited indicator */}
            {hasEffectivePlan && snapshot && snapshot.usage.alertLimit === 0 && (
              <div className="mt-3 max-w-xs">
                <div className="mb-1 flex justify-between text-[10px] text-gray-400">
                  <span>{t('alerts')}</span>
                  <span>{t('unlimited')}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full w-full rounded-full bg-emerald-500" />
                </div>
              </div>
            )}
            {hasEffectivePlan && snapshot?.subscription?.nextBillingDate && (
              <p className="mt-1 text-xs text-gray-500">
                {t('nextBilling', { date: new Date(snapshot.subscription.nextBillingDate).toLocaleDateString() })}
              </p>
            )}
            {autoPayEnabled && snapshot?.subscription?.billingCycle && !isCancelScheduled && (
              <p className="mt-1 text-xs text-gray-500">
                {t('autoPayActive', { cycle: snapshot.subscription.billingCycle === 'annual' ? t('year') : t('month') })}
              </p>
            )}
            {isCancelScheduled && cancelEffectiveDate && (
              <p className="mt-1 text-xs text-amber-700">
                {t('autoRenewOffAccess', { date: cancelEffectiveDate.toLocaleDateString() })}
              </p>
            )}
            {!snapshot?.subscription?.paddleManaged && snapshot?.subscription && (
              <p className="mt-1 text-xs text-gray-400">
                {t('subscribeToPaidPlan')}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center rounded-lg border border-gray-300 bg-white p-1">
              <button
                type="button"
                onClick={() => setCycle('monthly')}
                className={[
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  cycle === 'monthly' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100',
                ].join(' ')}
              >
                {t('monthly')}
              </button>
              <button
                type="button"
                onClick={() => setCycle('annual')}
                className={[
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  cycle === 'annual' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100',
                ].join(' ')}
              >
                {t('annual')}
              </button>
            </div>

            {/* Renewal controls — only for active + paddle-managed */}
            {snapshot?.subscription?.status === 'active' && snapshot.subscription.paddleManaged && (
              <button
                type="button"
                onClick={isCancelScheduled ? handleResumeAutoRenew : cancelSubscription}
                disabled={cancelLoading || resumeAutoRenewLoading}
                className={[
                  'rounded-lg px-3 py-2 text-xs font-medium disabled:opacity-60',
                  isCancelScheduled
                    ? 'border border-red-200 text-red-600 hover:bg-red-50'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50',
                ].join(' ')}
              >
                {isCancelScheduled
                  ? (resumeAutoRenewLoading ? t('resuming') : isKoreanLocale ? '갱신 재개' : 'Resume renewal')
                  : (cancelLoading ? t('cancelling') : isKoreanLocale ? '자동 갱신 끄기' : 'Turn off renewal')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Plan cards */}
      <div id="plan-cards" className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {plans.map((plan) => {
          const price = cycle === 'annual' ? plan.pricing.annual : plan.pricing.monthly;
          const isCurrent = currentTier ? plan.tier === currentTier : false;
          const isCurrentPaidPlan =
            isCurrent &&
            !!currentSubscription &&
            currentSubscription.status === 'active' &&
            !currentSubscription.isTrial &&
            !currentSubscription.isTrialing;
          const isCurrentTrialPlan = isCurrent && plan.tier === 'pro' && isProTrial;
          const isWorking = savingPlan === plan.tier || checkoutPlan === plan.tier || upgradeLoading === plan.tier;
          const isPaddleUnavailable = !paddleClientToken && !isPaddleActive;
          const isPendingTargetPlan = !!pendingPlan && pendingPlan.tier === plan.tier;
          const isDisabled = isWorking || isPaddleUnavailable || (isCurrentPaidPlan && !hasPendingDowngrade) || (isPendingTargetPlan && hasPendingDowngrade);
          const planButtonClass = [
            'mt-5 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
            isCurrentPaidPlan
              ? 'border border-gray-200 bg-gray-200 text-gray-500'
              : 'bg-gray-900 text-white hover:bg-gray-800',
          ].join(' ');

          return (
            <div
              key={plan.tier}
              className={[
                'relative rounded-2xl border bg-white p-5 shadow-sm',
                isCurrent ? 'border-gray-900 ring-1 ring-gray-900/10' : 'border-gray-200',
              ].join(' ')}
            >
              {isCurrentTrialPlan && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  <Crown className="h-3 w-3" />
                  {t('proTrialBadge')}
                </span>
              )}

              <h2 className="text-lg font-semibold text-gray-900">{plan.name}</h2>
              <p className="mt-2 text-2xl font-bold text-gray-900">{formatPrice(price)}</p>
              <p className="text-xs text-gray-500">{t('perMonth')} ({cycle === 'annual' ? t('billedAnnually') : t('billedMonthly')})</p>

              {isCurrentTrialPlan && (
                <p className="mt-2 text-xs font-medium text-gray-700">
                  {currentSubscription?.trialDaysLeft != null
                    ? t('trialDaysLeftCard', { days: currentSubscription.trialDaysLeft, unit: currentSubscription.trialDaysLeft !== 1 ? t('days') : t('day') })
                    : t('trialActiveCard')}
                </p>
              )}

              <p className="mt-2 text-xs text-gray-500">
                {t('autoPayStarts', { cycle: cycle === 'annual' ? t('yearly') : t('monthly') })}
              </p>

              <div className="mt-4 space-y-2 text-sm text-gray-700">
                {getLocalizedPlanFeatures(plan).map((feature) => (
                  <p key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
                    <span>{feature}</span>
                  </p>
                ))}
              </div>

              <button
                type="button"
                disabled={isDisabled}
                onClick={() => handlePlanAction(plan.tier)}
                className={planButtonClass}
              >
                {isCurrentPaidPlan
                  ? t('currentPlanButton')
                  : getPlanCtaLabel(plan.tier, isWorking)}
              </button>
            </div>
          );
        })}
      </div>

      {/* Billing history */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('billingHistoryTitle')}</h2>
            <p className="mt-1 text-xs text-gray-500">{t('billingHistoryDescription')}</p>
          </div>
          <button
            type="button"
            onClick={handleOpenInvoicePortal}
            disabled={portalLoading}
            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {portalLoading ? t('openingPortal') : t('openInvoicePortal')}
          </button>
        </div>

        {historyError && (
          <div className="mb-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">{historyError}</div>
        )}

        {historyLoading ? (
          <div className="text-sm text-gray-500">{t('loadingHistory')}</div>
        ) : historyItems.length === 0 ? (
          <div className="text-sm text-gray-500">{t('noHistory')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-2 py-2">{t('dateHeader')}</th>
                  <th className="px-2 py-2">{t('amountHeader')}</th>
                  <th className="px-2 py-2">{t('statusHeader')}</th>
                  <th className="px-2 py-2">{t('transactionHeader')}</th>
                </tr>
              </thead>
              <tbody>
                {historyItems.map((item) => (
                  <tr key={item._id} className="border-b border-gray-100 text-gray-700">
                    <td className="px-2 py-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="px-2 py-2">{formatPaymentAmount(item.amount, item.currency)}</td>
                    <td className="px-2 py-2">
                      <span className={[
                        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                        item.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.status === 'refunded'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700',
                      ].join(' ')}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 font-mono text-xs text-gray-500">{item.paddleTransactionId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
