'use client';

import type { CheckoutOpenOptions, Paddle, PaddleEventData } from '@paddle/paddle-js';
import axios from 'axios';
import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AlertTriangle, Check, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient, getApiErrorMessage, getApiPayloadMessages } from '@/lib/api';
import { formatPriceByCountry } from '@/lib/currency';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { normalizeNotificationLocale } from '@/lib/notifications';
import {
  type BillingPageData,
  fetchNotifications,
  fetchBillingPageData,
  setAutoRenew,
  upgradeSubscription,
  type BillingCycle,
  type BillingPlan as Plan,
  type BillingSnapshot,
  type PlanTier,
} from '@/lib/store/slices/accountSlice';

interface BillingHistoryItem {
  _id: string;
  amount: number;
  currency: string;
  status: 'completed' | 'failed' | 'refunded';
  paddleTransactionId: string;
  createdAt: string;
}

interface CheckoutResponse {
  code?: string;
  message?: string;
  messages?: string[];
  warnings?: string[];
  transactionId?: string;
  checkoutUrl?: string;
  url?: string;
  snapshot?: BillingSnapshot | null;
  subscription?: BillingSnapshot['subscription'];
}

interface PendingTrialCheckout {
  tier: PlanTier;
  billingCycle: BillingCycle;
  withTrial: boolean;
  checkout: CheckoutResponse | null;
}

interface PendingPurchaseConfirmation {
  tier: PlanTier;
  billingCycle: BillingCycle;
  mode: 'checkout' | 'planChange';
  planName: string;
  price: string;
  isUpgrade: boolean;
  currentPlanName: string;
}

interface NormalizedScheduledPlan {
  tier: PlanTier | null;
  name: string;
  billingCycle: BillingCycle;
  effectiveAt: string | null;
  chargeAt: string | null;
  activatesAt: string | null;
}

type BillingTranslator = ReturnType<typeof useTranslations>;
type FormatDate = (value?: string | null) => string;
type GetCycleLabel = (value?: BillingCycle | null) => string;

function PlanSummary({
  t,
  currentPlanName,
  currentBillingCycle,
  currentPlanPrice,
  hasEffectivePlan,
  isTrial,
  creditsRemaining,
  creditsProgressPercent,
  scheduledPlan,
  formatDate,
  getCycleLabel,
  numberFormatter,
  trialDaysLeft,
  trialEndsAt,
  autoRenewEnabled,
  autoRenewLoading,
  canToggleAutoRenew,
  renewalEndsAt,
  renewalRenewsAt,
  onAutoRenewToggle,
}: {
  t: BillingTranslator;
  currentPlanName: string;
  currentBillingCycle: BillingCycle;
  currentPlanPrice: string;
  hasEffectivePlan: boolean;
  isTrial: boolean;
  creditsRemaining: number | null;
  creditsProgressPercent: number;
  scheduledPlan: NormalizedScheduledPlan | null;
  formatDate: FormatDate;
  getCycleLabel: GetCycleLabel;
  numberFormatter: Intl.NumberFormat;
  trialDaysLeft: number | null;
  trialEndsAt: string | null;
  autoRenewEnabled: boolean;
  autoRenewLoading: boolean;
  canToggleAutoRenew: boolean;
  renewalEndsAt: string | null;
  renewalRenewsAt: string | null;
  onAutoRenewToggle: (enabled: boolean) => void;
}) {
  const renewalDetail =
    !hasEffectivePlan || (!canToggleAutoRenew && !renewalEndsAt && !renewalRenewsAt)
      ? t('subscribeToPaidPlan')
      : autoRenewEnabled
        ? t('nextRenewal', { date: formatDate(renewalRenewsAt) })
        : t('accessContinuesUntil', { date: formatDate(renewalEndsAt) });

  return (
    <section className="border-y border-gray-200 py-4 sm:py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('planSummaryTitle')}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h2 className="break-words text-lg font-semibold text-gray-900">{t('currentPlanLabel', { name: currentPlanName })}</h2>
            {isTrial && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                <Crown className="h-3 w-3" />
                {t('proTrialBadge')}
              </span>
            )}
          </div>
          {hasEffectivePlan ? (
            <p className="mt-1 text-sm text-gray-500">
              {getCycleLabel(currentBillingCycle)} / {currentPlanPrice}
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">{t('noActivePlan')}</p>
          )}
        </div>

        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
          {canToggleAutoRenew && (
            <button
              type="button"
              onClick={() => onAutoRenewToggle(!autoRenewEnabled)}
              disabled={autoRenewLoading}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {autoRenewLoading
                ? t('processing')
                : autoRenewEnabled
                  ? t('turnRenewalOff')
                  : t('turnRenewalOn')}
            </button>
          )}
          {isTrial && (
            <div className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 sm:w-auto">
              {trialDaysLeft != null
                ? t('trialDaysLeft', { days: trialDaysLeft, unit: trialDaysLeft !== 1 ? t('days') : t('day') })
                : trialEndsAt
                  ? t('trialEndsAt', { date: formatDate(trialEndsAt) })
                  : t('trialActive')}
            </div>
          )}
        </div>
      </div>

      {hasEffectivePlan && (
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{t('creditsRemaining')}</p>
            <p className="mt-1 text-xl font-semibold leading-none text-gray-900">
              {creditsRemaining == null ? t('unlimited') : numberFormatter.format(creditsRemaining)}
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200" aria-hidden="true">
              <div
                className="h-full rounded-full bg-gray-900 transition-all"
                style={{ width: `${creditsProgressPercent}%` }}
              />
            </div>
          </div>

          <div className="min-w-0 border-t border-gray-200 pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              {autoRenewEnabled ? t('autoRenewOn') : t('autoRenewOff')}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">{renewalDetail}</p>
          </div>

          {scheduledPlan && (
            <div className="min-w-0 border-t border-gray-200 pt-4 md:col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{t('scheduledPlanTitle')}</p>
              <p className="mt-1 text-sm font-semibold">
                {scheduledPlan.name} / {getCycleLabel(scheduledPlan.billingCycle)}
              </p>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                <span>{t('scheduledPlanChargeAt', { date: formatDate(scheduledPlan.chargeAt) })}</span>
                <span>{t('scheduledPlanActivatesAt', { date: formatDate(scheduledPlan.activatesAt) })}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function PlanPicker({
  t,
  plans,
  cycle,
  currentTier,
  currentBillingCycle,
  checkoutPlan,
  savingPlan,
  upgradeLoading,
  hasExistingPaddleSubscription,
  hasScheduledPlan,
  visibleScheduledPlan,
  isTrial,
  trialDaysLeft,
  formatPrice,
  getLocalizedPlanFeatures,
  getPlanCtaLabel,
  handlePlanAction,
  setCycle,
}: {
  t: BillingTranslator;
  plans: Plan[];
  cycle: BillingCycle;
  currentTier: PlanTier | null;
  currentBillingCycle: BillingCycle;
  checkoutPlan: PlanTier | null;
  savingPlan: PlanTier | null;
  upgradeLoading: PlanTier | null;
  hasExistingPaddleSubscription: boolean;
  hasScheduledPlan: boolean;
  visibleScheduledPlan: NormalizedScheduledPlan | null;
  isTrial: boolean;
  trialDaysLeft: number | null;
  formatPrice: (value: number) => string;
  getLocalizedPlanFeatures: (plan: Plan) => string[];
  getPlanCtaLabel: (planTier: PlanTier, isWorking: boolean, isPendingTargetPlan: boolean) => string;
  handlePlanAction: (tier: PlanTier) => void;
  setCycle: (cycle: BillingCycle) => void;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t('planPickerTitle')}</p>
          <h2 className="mt-1 text-lg font-semibold text-gray-900">{t('planPickerDescription')}</h2>
        </div>
        <div className="grid w-full grid-cols-2 rounded-lg border border-gray-300 bg-white p-1 sm:inline-flex sm:w-auto sm:grid-cols-none">
          <button
            type="button"
            onClick={() => setCycle('monthly')}
            className={[
              'rounded-md px-3 py-1.5 text-center text-xs font-medium transition-colors',
              cycle === 'monthly' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100',
            ].join(' ')}
          >
            {t('monthly')}
          </button>
          <button
            type="button"
            onClick={() => setCycle('annual')}
            className={[
              'rounded-md px-3 py-1.5 text-center text-xs font-medium transition-colors',
              cycle === 'annual' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100',
            ].join(' ')}
          >
            {t('annual')}
          </button>
        </div>
      </div>

      <div id="plan-cards" className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {plans.map((plan) => {
          const price = cycle === 'annual' ? plan.pricing.annual : plan.pricing.monthly;
          const isCurrent = currentTier ? plan.tier === currentTier : false;
          const isCurrentPaidPlan = isCurrent && hasExistingPaddleSubscription;
          const isCurrentSelectedCycle = currentBillingCycle === cycle;
          const isPendingTargetPlan =
            !!visibleScheduledPlan &&
            visibleScheduledPlan.tier === plan.tier &&
            visibleScheduledPlan.billingCycle === cycle;
          const isWorking = savingPlan === plan.tier || checkoutPlan === plan.tier || upgradeLoading === plan.tier;
          const isDisabled = isWorking || isPendingTargetPlan || (isCurrentPaidPlan && isCurrentSelectedCycle && !hasScheduledPlan);
          const planButtonClass = [
            'mt-5 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
            isCurrentPaidPlan && isCurrentSelectedCycle
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
              {isCurrent && isTrial && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  <Crown className="h-3 w-3" />
                  {t('proTrialBadge')}
                </span>
              )}

              <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">{formatPrice(price)}</p>
              <p className="text-xs text-gray-500">
                {t('perMonth')} ({cycle === 'annual' ? t('billedAnnually') : t('billedMonthly')})
              </p>

              {isCurrent && isTrial && (
                <p className="mt-2 text-xs font-medium text-gray-700">
                  {trialDaysLeft != null
                    ? t('trialDaysLeftCard', { days: trialDaysLeft, unit: trialDaysLeft !== 1 ? t('days') : t('day') })
                    : t('trialActiveCard')}
                </p>
              )}

              {!hasExistingPaddleSubscription && (
                <p className="mt-2 text-xs text-gray-500">
                  {t('autoPayStarts', { cycle: cycle === 'annual' ? t('yearly') : t('monthly') })}
                </p>
              )}

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
                {isCurrentPaidPlan && isCurrentSelectedCycle && !hasScheduledPlan
                  ? t('currentPlanButton')
                  : getPlanCtaLabel(plan.tier, isWorking, isPendingTargetPlan)}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const planTiers: PlanTier[] = ['starter', 'pro', 'premium'];
const paddleEnvironment =
  (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT ?? process.env.NEXT_PUBLIC_PADDLE_ENV) === 'sandbox'
    ? 'sandbox'
    : 'production';
const paddleClientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.trim().replace(/^['"']|['"']$/g, '') || undefined;

const isPlanTier = (value: unknown): value is PlanTier =>
  typeof value === 'string' && planTiers.includes(value as PlanTier);

const readResponseCode = (value: unknown): string | null => {
  if (!value || typeof value !== 'object' || !('code' in value)) {
    return null;
  }

  const code = (value as { code?: unknown }).code;
  return typeof code === 'string' && code.trim() ? code.trim() : null;
};

const getAxiosResponseData = (error: unknown): unknown =>
  axios.isAxiosError(error) ? error.response?.data : null;

const getBillingErrorCode = (error: unknown) => readResponseCode(getAxiosResponseData(error));

const getPaymentErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'string') {
    const trimmed = error.trim();
    if (trimmed) return trimmed;
  }

  if (error instanceof Error) {
    const trimmed = error.message.trim();
    if (trimmed) return trimmed;
  }

  return getApiErrorMessage(error, fallback);
};

const getPaddleEventTransactionId = (event: PaddleEventData) => {
  const data = (event as { data?: Record<string, unknown> }).data;
  const transaction =
    data?.transactionId ??
    data?.transaction_id ??
    (typeof data?.transaction === 'object' && data.transaction !== null
      ? (data.transaction as { id?: unknown }).id
      : null);

  return typeof transaction === 'string' && transaction.trim() ? transaction.trim() : null;
};

type BillingToastType = 'success' | 'error' | 'info' | 'warning';

const showRawToast = (type: BillingToastType, text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return false;

  toast[type](trimmed);
  return true;
};

const isTrialStartedCode = (code?: string | null) =>
  !!code && ['TRIAL_STARTED', 'FREE_TRIAL_STARTED', 'TRIAL_ACTIVATED', 'FREE_TRIAL_ACTIVATED'].includes(code);

const hasTrialingSubscription = (payload: CheckoutResponse) => {
  const subscription = payload.snapshot?.subscription ?? payload.subscription;
  if (!subscription) return false;

  return (
    subscription.status === 'trialing' ||
    subscription.grantSource === 'trial' ||
    subscription.isTrial === true ||
    subscription.isTrialing === true
  );
};

const hasCheckoutDestination = (payload: CheckoutResponse) =>
  Boolean(payload.transactionId || payload.checkoutUrl || payload.url);

const textLooksLikeTrialStarted = (text: string) =>
  /(?:7[-\s]?day\s+)?(?:free\s+)?trial/i.test(text) &&
  /(?:started|activated|active)/i.test(text) &&
  !/already/i.test(text);

const isImmediateTrialStartPayload = (payload: CheckoutResponse) => {
  const code = readResponseCode(payload);
  const messageText = [
    payload.message,
    ...(Array.isArray(payload.messages) ? payload.messages : []),
    ...(Array.isArray(payload.warnings) ? payload.warnings : []),
  ]
    .filter((value): value is string => typeof value === 'string')
    .join(' ');

  return (
    !hasCheckoutDestination(payload) &&
    (isTrialStartedCode(code) || hasTrialingSubscription(payload) || textLooksLikeTrialStarted(messageText))
  );
};

const localizeBillingToastText = (
  text: string,
  locale: 'en' | 'ko',
  t: BillingTranslator,
  code?: string | null,
) => {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  if (/trial.*already.*active/i.test(trimmed)) {
    return t('trialAlreadyActiveToast');
  }

  if (isTrialStartedCode(code) || textLooksLikeTrialStarted(trimmed)) {
    return t('trialStartedToast');
  }

  if (/turn renewal on before downgrading/i.test(trimmed)) {
    return t('turnRenewalOnBeforeDowngrade');
  }

  if (/auto-renew is off.*scheduled plan change/i.test(trimmed)) {
    return t('autoRenewScheduleCancelled');
  }

  if (/scheduled plan change.*(?:canceled|cancelled)/i.test(trimmed)) {
    return t('scheduledPlanCancelled');
  }

  if (/plan change scheduled/i.test(trimmed)) {
    return t('planChangeScheduled');
  }

  if (/active subscription already exists/i.test(trimmed)) {
    return t('activeSubscriptionChangeStarted');
  }

  if (locale === 'en') return trimmed;

  if (/checkout opened/i.test(trimmed)) {
    return t('checkoutOpened', { plan: trimmed.match(/for\s+(.+?)\./i)?.[1] ?? 'Pro' });
  }

  return trimmed;
};

export default function BillingPage() {
  const dispatch = useAppDispatch();
  const { plans, loading, error, savingPlan, autoRenewLoading, upgradeLoading, countryCode } = useAppSelector(
    (state) => state.account.billing,
  );
  const snapshot = useAppSelector((state) => state.account.subscription.data) as BillingSnapshot | null;
  const notificationPreferences = useAppSelector((state) => state.account.settings.notificationPreferences);
  const t = useTranslations('UserPanel.billing');
  const locale = useLocale();
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanTier | null>(null);
  const [purchaseWarning, setPurchaseWarning] = useState<PendingPurchaseConfirmation | null>(null);
  const [trialWarning, setTrialWarning] = useState<PendingTrialCheckout | null>(null);
  const [updatePaymentLoading, setUpdatePaymentLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState<BillingHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const paddleRef = useRef<Paddle | null>(null);
  const paddlePromiseRef = useRef<Promise<Paddle> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeCheckoutTransactionIdRef = useRef<string | null>(null);

  const isKoreanLocale = locale === 'kr';
  const toastLocale = normalizeNotificationLocale(notificationPreferences.locale ?? locale);
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(isKoreanLocale ? 'ko-KR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    [isKoreanLocale],
  );
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(isKoreanLocale ? 'ko-KR' : 'en-US'),
    [isKoreanLocale],
  );

  const formatPrice = useCallback(
    (usd: number) => formatPriceByCountry(usd, countryCode),
    [countryCode],
  );

  const formatDate = useCallback(
    (value?: string | null) => {
      if (!value) return '--';
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
    },
    [dateFormatter],
  );

  const getCycleLabel = useCallback(
    (value?: BillingCycle | null) => (value === 'annual' ? t('annual') : t('monthly')),
    [t],
  );

  const showToast = useCallback(
    (type: BillingToastType, text: string, code?: string | null) =>
      showRawToast(type, localizeBillingToastText(text, toastLocale, t, code)),
    [t, toastLocale],
  );

  const showApiPayloadToasts = useCallback(
    (payload: unknown, messageType: BillingToastType = 'info') => {
      const { errors, warnings, messages } = getApiPayloadMessages(payload);
      const code = readResponseCode(payload);

      errors.forEach((message) => showToast('error', message, code));
      warnings.forEach((message) => showToast('warning', message, code));
      messages.forEach((message) => showToast(messageType, message, code));

      return errors.length + warnings.length + messages.length > 0;
    },
    [showToast],
  );

  const showBillingResult = useCallback((result: BillingPageData, type: BillingToastType, fallback?: string) => {
    const showedPayloadMessage = showApiPayloadToasts(result, type);
    if (!showedPayloadMessage && fallback) {
      showToast(type, fallback);
    }
  }, [showApiPayloadToasts, showToast]);

  const refreshNotifications = useCallback(async () => {
    try {
      await dispatch(
        fetchNotifications({
          scope: 'topbar',
          status: 'all',
          page: 1,
          limit: 8,
          locale: toastLocale,
        }),
      ).unwrap();
    } catch {
      // Notification refresh is best-effort; billing state remains authoritative.
    }
  }, [dispatch, toastLocale]);

  useEffect(() => {
    let active = true;

    dispatch(fetchBillingPageData({ includeMessages: true }))
      .unwrap()
      .then((result) => {
        if (active) {
          showBillingResult(result, 'success');
        }
      })
      .catch(() => {
        return;
      });

    return () => {
      active = false;
    };
  }, [dispatch, showBillingResult]);

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
        setHistoryError(getPaymentErrorMessage(err, 'Unable to load billing history.'));
      } finally {
        if (active) setHistoryLoading(false);
      }
    };

    void loadHistory();

    return () => {
      active = false;
    };
  }, []);

  const brief = snapshot?.brief ?? null;
  const currentSubscription = snapshot?.subscription ?? null;
  const briefCurrentPlan = brief?.currentPlan ?? null;
  const hasBriefPlan = Boolean(briefCurrentPlan?.name || briefCurrentPlan?.tier);
  const hasLegacyEffectivePlan =
    !!currentSubscription &&
    (currentSubscription.hasAccess === true || ['active', 'trialing', 'past_due'].includes(currentSubscription.status));
  const hasEffectivePlan = hasBriefPlan || hasLegacyEffectivePlan;
  const currentTier = isPlanTier(briefCurrentPlan?.tier)
    ? briefCurrentPlan.tier
    : hasEffectivePlan
      ? snapshot?.plan?.tier ?? null
      : null;
  const currentPlanFromCatalog = currentTier ? plans.find((plan) => plan.tier === currentTier) ?? snapshot?.plan : snapshot?.plan;
  const currentPlanName = briefCurrentPlan?.name || (hasEffectivePlan ? currentPlanFromCatalog?.name ?? '--' : '--');
  const currentBillingCycle = briefCurrentPlan?.billingCycle ?? currentSubscription?.billingCycle ?? cycle;
  const isTrial = Boolean(
    brief?.trial?.isTrial ??
      (!!currentSubscription &&
        currentSubscription.status !== 'active' &&
        (currentSubscription.status === 'trialing' || currentSubscription.isTrialing || currentSubscription.isTrial)),
  );
  const trialDaysLeft = brief?.trial?.daysLeft ?? brief?.trial?.trialDaysLeft ?? currentSubscription?.trialDaysLeft ?? null;
  const trialEndsAt = brief?.trial?.endsAt ?? currentSubscription?.trialEndsAt ?? null;
  const isPaidSubscription = Boolean(
    currentSubscription?.paddleManaged ||
      currentSubscription?.grantSource === 'paid' ||
      (hasEffectivePlan && !isTrial && brief?.renewal),
  );
  const legacyCancelDate = currentSubscription?.cancelDate ?? null;
  const legacyCancelTime = legacyCancelDate ? new Date(legacyCancelDate).getTime() : Number.NaN;
  const hasLegacyAutoRenewOff =
    currentSubscription?.status === 'active' &&
    !!currentSubscription?.paddleManaged &&
    Number.isFinite(legacyCancelTime) &&
    legacyCancelTime > Date.now();
  const autoRenewEnabled =
    typeof brief?.renewal?.autoRenew === 'boolean'
      ? brief.renewal.autoRenew
      : Boolean(currentSubscription?.status === 'active' && currentSubscription?.paddleManaged && !hasLegacyAutoRenewOff);
  const renewalEndsAt = brief?.renewal?.endsAt ?? legacyCancelDate ?? currentSubscription?.currentPeriodEnd ?? null;
  const renewalRenewsAt = brief?.renewal?.renewsAt ?? currentSubscription?.nextBillingDate ?? null;
  const isAutoRenewOff = isPaidSubscription && !autoRenewEnabled;
  const hasExistingPaddleSubscription = isPaidSubscription && !isTrial;
  const canToggleAutoRenew =
    typeof brief?.renewal?.canToggle === 'boolean'
      ? brief.renewal.canToggle
      : isPaidSubscription && hasEffectivePlan;
  const scheduledPlan = useMemo<NormalizedScheduledPlan | null>(() => {
    const scheduled = brief?.scheduledPlan;
    if (scheduled) {
      return {
        tier: isPlanTier(scheduled.tier) ? scheduled.tier : null,
        name: scheduled.name || String(scheduled.tier ?? ''),
        billingCycle: scheduled.billingCycle ?? currentBillingCycle,
        effectiveAt: scheduled.effectiveAt ?? null,
        chargeAt: scheduled.chargeAt ?? null,
        activatesAt: scheduled.activatesAt ?? null,
      };
    }

    const pendingPlan = currentSubscription?.pendingPlan;
    if (!pendingPlan) return null;

    return {
      tier: pendingPlan.tier,
      name: pendingPlan.name,
      billingCycle: pendingPlan.billingCycle,
      effectiveAt: pendingPlan.effectiveAt ?? null,
      chargeAt: null,
      activatesAt: pendingPlan.effectiveAt ?? null,
    };
  }, [brief?.scheduledPlan, currentBillingCycle, currentSubscription?.pendingPlan]);
  const visibleScheduledPlan = scheduledPlan;
  const hasScheduledPlan = !!visibleScheduledPlan;

  const currentPlanPrice = useMemo(() => {
    if (briefCurrentPlan?.priceFormatted) return briefCurrentPlan.priceFormatted;
    if (typeof briefCurrentPlan?.price === 'string' && briefCurrentPlan.price.trim()) return briefCurrentPlan.price;
    if (typeof briefCurrentPlan?.price === 'number') return formatPrice(briefCurrentPlan.price);

    const fallbackPrice = currentPlanFromCatalog?.pricing?.[currentBillingCycle];
    return typeof fallbackPrice === 'number' ? formatPrice(fallbackPrice) : '--';
  }, [briefCurrentPlan?.price, briefCurrentPlan?.priceFormatted, currentBillingCycle, currentPlanFromCatalog?.pricing, formatPrice]);

  const creditsRemaining = useMemo(() => {
    if (!snapshot) return 0;

    const credits = Number(snapshot.credits);
    if (Number.isFinite(credits)) return Math.max(0, credits);

    const used = Number(snapshot.usage.imagesUsedThisMonth || 0);
    const limit = Number(snapshot.usage.imageUploadLimit || 0);
    if (!Number.isFinite(limit) || limit <= 0) return null;

    const safeUsed = Number.isFinite(used) ? Math.max(0, used) : 0;
    return Math.max(0, limit - safeUsed);
  }, [snapshot]);
  const creditsTotal = useMemo(() => {
    const limit = Number(snapshot?.usage?.imageUploadLimit ?? currentPlanFromCatalog?.imageUploadLimit ?? 0);
    return Number.isFinite(limit) ? Math.max(0, limit) : 0;
  }, [currentPlanFromCatalog?.imageUploadLimit, snapshot?.usage?.imageUploadLimit]);
  const creditsProgressPercent =
    creditsRemaining == null
      ? 100
      : creditsTotal > 0
        ? Math.min(100, Math.max(0, Math.round((creditsRemaining / creditsTotal) * 100)))
        : 0;

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

  const getPlanName = (planTier: PlanTier) => plans.find((plan) => plan.tier === planTier)?.name || planTier;

  const getPlanCtaLabel = (planTier: PlanTier, isWorking: boolean, isPendingTargetPlan: boolean) => {
    if (isWorking) return isKoreanLocale ? '처리 중...' : 'Processing...';
    if (isPendingTargetPlan) return t('scheduledPlanButton');

    if (hasScheduledPlan && currentTier && planTier === currentTier) {
      return t('keepCurrentPlan');
    }

    if (isTrial) {
      if (planTier === currentTier) return isKoreanLocale ? '지금 구독' : 'Subscribe now';
      if (planTier === 'premium') return isKoreanLocale ? 'Premium으로 업그레이드' : 'Upgrade to Premium';
    }

    const planIndex = tierOrder.indexOf(planTier);
    if (!hasEffectivePlan) {
      return isKoreanLocale ? `${getPlanName(planTier)} 구매` : `Buy ${getPlanName(planTier)}`;
    }

    if (hasExistingPaddleSubscription) {
      if (planTier === currentTier && cycle !== currentBillingCycle) return t('changeBillingCycle');
      if (planIndex > currentTierIndex) return isKoreanLocale ? `${getPlanName(planTier)}로 업그레이드` : `Upgrade to ${getPlanName(planTier)}`;
      if (planIndex < currentTierIndex) return isKoreanLocale ? `${getPlanName(planTier)}로 다운그레이드` : `Downgrade to ${getPlanName(planTier)}`;
    }

    return isKoreanLocale ? `${getPlanName(planTier)} 구독` : `Subscribe to ${getPlanName(planTier)}`;
  };

  const schedulePlanChange = async (
    tier: PlanTier,
    billingCycle: BillingCycle,
    options?: { cancelScheduledChange?: boolean; fromCheckoutConflict?: boolean },
  ) => {
    setCheckoutError(null);

    try {
      const result = await dispatch(
        upgradeSubscription({
          tier,
          billingCycle,
        }),
      ).unwrap();

      if (result.code === 'AUTO_RENEW_OFF_SCHEDULE_CANCELLED') {
        showBillingResult(result, 'info', t('autoRenewScheduleCancelled'));
      } else if (options?.cancelScheduledChange) {
        showBillingResult(result, 'success', t('scheduledPlanCancelled'));
      } else if (options?.fromCheckoutConflict) {
        showBillingResult(result, 'info', t('activeSubscriptionChangeStarted'));
      } else {
        showBillingResult(result, 'success', t('planChangeScheduled'));
      }
    } catch (err) {
      if (!showApiPayloadToasts(getAxiosResponseData(err), 'error')) {
        showToast('error', getPaymentErrorMessage(err, 'Unable to change your plan right now.'));
      }
    } finally {
      setCheckoutPlan(null);
    }
  };

  const handlePaddleEvent = useCallback(
    (event: PaddleEventData) => {
      if (event.name === 'checkout.completed') {
        const transactionId = getPaddleEventTransactionId(event) ?? activeCheckoutTransactionIdRef.current;
        activeCheckoutTransactionIdRef.current = null;
        setCheckoutPlan(null);
        setCheckoutError(null);

        void (async () => {
          try {
            await apiClient.post('/billing/sync', transactionId ? { transactionId } : {});
          } catch {
            // Webhooks and polling below still provide eventual consistency.
          }

          let attempts = 0;
          const poll = () => {
            if (attempts >= 12) return;
            attempts += 1;
            pollTimerRef.current = setTimeout(async () => {
              try {
                const result = await dispatch(fetchBillingPageData()).unwrap();
                const subscription = result.snapshot?.subscription;
                const renewal = result.snapshot?.brief?.renewal;
                if (subscription?.status === 'active' && (subscription.paddleManaged || renewal?.autoRenew)) return;
              } catch {
                // Try again until attempts are exhausted.
              }
              poll();
            }, 2500);
          };

          poll();
          startTransition(() => {
            void dispatch(fetchBillingPageData());
          });
          void refreshNotifications();
        })();
        return;
      }

      if (event.name === 'checkout.error' || event.name === 'checkout.failed') {
        activeCheckoutTransactionIdRef.current = null;
        setCheckoutPlan(null);
        setCheckoutError(t('checkoutError'));
        showToast('error', t('checkoutError'));
        return;
      }

      if (event.name === 'checkout.closed') {
        activeCheckoutTransactionIdRef.current = null;
        setCheckoutPlan(null);
      }
    },
    [dispatch, refreshNotifications, showToast, t],
  );

  const ensurePaddle = async () => {
    if (paddleRef.current) return paddleRef.current;

    if (!paddleClientToken) {
      throw new Error('Paddle checkout overlay is not configured. Add NEXT_PUBLIC_PADDLE_CLIENT_TOKEN or return a checkoutUrl.');
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

  const launchCheckout = async (checkout: CheckoutResponse, tier: PlanTier) => {
    const transactionId = checkout.transactionId;
    const checkoutUrl = checkout.checkoutUrl ?? checkout.url;

    if (transactionId) {
      const paddle = await ensurePaddle();
      activeCheckoutTransactionIdRef.current = transactionId;
      paddle.Checkout.open({
        transactionId,
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          successUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        },
      } as unknown as CheckoutOpenOptions);
    } else if (checkoutUrl) {
      if (typeof window !== 'undefined') {
        window.location.assign(checkoutUrl);
      }
    } else {
      throw new Error('Billing API did not return a transaction ID or checkout URL.');
    }

    const planName = plans.find((plan) => plan.tier === tier)?.name || tier;
    showToast('info', t('checkoutOpened', { plan: planName }));
  };

  const handleImmediateTrialStart = async (checkout: CheckoutResponse) => {
    setCheckoutPlan(null);
    setCheckoutError(null);

    const showedPayloadMessage = showApiPayloadToasts(checkout, 'success');
    if (!showedPayloadMessage) {
      showToast('success', t('trialStartedToast'));
    }

    await dispatch(fetchBillingPageData()).unwrap().catch(() => {
      return;
    });
    await refreshNotifications();
  };

  const handleCheckoutResponse = async (
    checkout: CheckoutResponse,
    tier: PlanTier,
    billingCycle: BillingCycle,
    bypassTrialWarning: boolean,
  ) => {
    const code = readResponseCode(checkout);

    if (code === 'ACTIVE_PADDLE_SUBSCRIPTION_EXISTS') {
      await schedulePlanChange(tier, billingCycle, { fromCheckoutConflict: true });
      return;
    }

    if (code === 'TRIAL_WILL_BE_CANCELLED' && !bypassTrialWarning) {
      setTrialWarning({
        tier,
        billingCycle,
        withTrial: false,
        checkout,
      });
      setCheckoutPlan(null);
      return;
    }

    if (isImmediateTrialStartPayload(checkout)) {
      await handleImmediateTrialStart(checkout);
      return;
    }

    showApiPayloadToasts(checkout, code === 'TRIAL_WILL_BE_CANCELLED' ? 'warning' : 'info');
    await launchCheckout(checkout, tier);
  };

  const beginCheckout = async (
    tier: PlanTier,
    options?: { billingCycle?: BillingCycle; withTrial?: boolean; bypassTrialWarning?: boolean },
  ) => {
    const targetCycle = options?.billingCycle ?? cycle;
    const withTrial = options?.withTrial ?? !isTrial;

    setCheckoutError(null);
    setCheckoutPlan(tier);

    try {
      const response = await apiClient.post('/billing/paddle/checkout', {
        tier,
        billingCycle: targetCycle,
        withTrial,
      });

      const checkout = response.data as CheckoutResponse;
      await handleCheckoutResponse(checkout, tier, targetCycle, Boolean(options?.bypassTrialWarning));
    } catch (paymentError) {
      const code = getBillingErrorCode(paymentError);
      const responseData = getAxiosResponseData(paymentError) as CheckoutResponse | null;

      if (code === 'ACTIVE_PADDLE_SUBSCRIPTION_EXISTS') {
        showApiPayloadToasts(responseData, 'info');
        await schedulePlanChange(tier, targetCycle, { fromCheckoutConflict: true });
        return;
      }

      if (code === 'TRIAL_WILL_BE_CANCELLED' && !options?.bypassTrialWarning) {
        showApiPayloadToasts(responseData, 'warning');
        setTrialWarning({
          tier,
          billingCycle: targetCycle,
          withTrial,
          checkout: responseData,
        });
        setCheckoutPlan(null);
        return;
      }

      setCheckoutPlan(null);
      const message = getPaymentErrorMessage(paymentError, 'Unable to start Paddle checkout.');
      setCheckoutError(message);
      if (!showApiPayloadToasts(responseData, 'error')) {
        showToast('error', message);
      }
    }
  };

  const handleContinueTrialCheckout = async () => {
    if (!trialWarning) return;

    const pending = trialWarning;
    setTrialWarning(null);
    setCheckoutPlan(pending.tier);

    try {
      if (pending.checkout?.transactionId || pending.checkout?.checkoutUrl || pending.checkout?.url) {
        await launchCheckout(pending.checkout, pending.tier);
      } else {
        await beginCheckout(pending.tier, {
          billingCycle: pending.billingCycle,
          withTrial: false,
          bypassTrialWarning: true,
        });
      }
    } catch (err) {
      setCheckoutPlan(null);
      const message = getPaymentErrorMessage(err, 'Unable to start Paddle checkout.');
      setCheckoutError(message);
      if (!showApiPayloadToasts(getAxiosResponseData(err), 'error')) {
        showToast('error', message);
      }
    }
  };

  const openPurchaseWarning = (
    tier: PlanTier,
    billingCycle: BillingCycle,
    mode: PendingPurchaseConfirmation['mode'],
  ) => {
    const plan = plans.find((item) => item.tier === tier);
    const priceValue = plan?.pricing?.[billingCycle];
    const targetTierIndex = tierOrder.indexOf(tier);

    setCheckoutError(null);
    setPurchaseWarning({
      tier,
      billingCycle,
      mode,
      planName: plan?.name || getPlanName(tier),
      price: typeof priceValue === 'number' ? formatPrice(priceValue) : '--',
      isUpgrade: currentTierIndex >= 0 && targetTierIndex >= 0 && targetTierIndex > currentTierIndex,
      currentPlanName,
    });
  };

  const handleConfirmPurchase = async () => {
    if (!purchaseWarning) return;

    const pending = purchaseWarning;
    setPurchaseWarning(null);

    if (pending.mode === 'planChange') {
      await schedulePlanChange(pending.tier, pending.billingCycle);
      return;
    }

    await beginCheckout(pending.tier, {
      billingCycle: pending.billingCycle,
      withTrial: !isTrial,
    });
  };

  const handlePlanAction = async (tier: PlanTier) => {
    if (hasExistingPaddleSubscription) {
      const cancelScheduledChange = Boolean(hasScheduledPlan && currentTier && tier === currentTier);
      const targetTierIndex = tierOrder.indexOf(tier);
      const isDowngrade = currentTierIndex >= 0 && targetTierIndex >= 0 && targetTierIndex < currentTierIndex;
      if (isAutoRenewOff && isDowngrade) {
        showToast('warning', t('turnRenewalOnBeforeDowngrade'));
        return;
      }

      const targetTier = cancelScheduledChange && currentTier ? currentTier : tier;
      const targetCycle = cancelScheduledChange ? currentBillingCycle : cycle;
      if (cancelScheduledChange) {
        await schedulePlanChange(targetTier, targetCycle, { cancelScheduledChange });
        return;
      }

      openPurchaseWarning(targetTier, targetCycle, 'planChange');
      return;
    }

    openPurchaseWarning(tier, cycle, 'checkout');
  };

  const handleAutoRenewToggle = async (enabled: boolean) => {
    try {
      const result = await dispatch(setAutoRenew({ enabled })).unwrap();
      showBillingResult(result, 'success', enabled ? t('autoRenewResumed') : t('autoRenewDisabled'));
    } catch (err) {
      if (!showApiPayloadToasts(getAxiosResponseData(err), 'error')) {
        showToast('error', getPaymentErrorMessage(err, 'Unable to update auto-renew.'));
      }
    }
  };

  const handleUpdatePayment = async () => {
    setUpdatePaymentLoading(true);

    try {
      const response = await apiClient.get('/billing/payment-method');
      showApiPayloadToasts(response.data, 'info');
      const updateUrl: string | undefined = response.data?.updateUrl ?? response.data?.portalUrl;
      if (updateUrl) window.location.href = updateUrl;
    } catch (err) {
      showApiPayloadToasts(getAxiosResponseData(err), 'error');
    } finally {
      setUpdatePaymentLoading(false);
    }
  };

  const handleOpenInvoicePortal = async () => {
    setPortalLoading(true);

    try {
      const response = await apiClient.get('/billing/portal');
      showApiPayloadToasts(response.data, 'info');
      const portalUrl: string | undefined = response.data?.portalUrl;
      if (portalUrl) {
        window.open(portalUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      showApiPayloadToasts(getAxiosResponseData(err), 'error');
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

  useEffect(() => () => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
  }, []);

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
      {purchaseWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="purchase-warning-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h2 id="purchase-warning-title" className="text-lg font-semibold text-gray-950">
                  {purchaseWarning.mode === 'planChange'
                    ? t('planChangeWarningTitle')
                    : t('purchaseWarningTitle')}
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {purchaseWarning.mode === 'planChange'
                    ? t('planChangeWarningBody')
                    : t('purchaseWarningBody')}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">{t('purchaseWarningPlanLabel')}</span>
                <span className="text-right font-semibold text-gray-950">{purchaseWarning.planName}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">{t('purchaseWarningPriceLabel')}</span>
                <span className="text-right font-semibold text-gray-950">
                  {purchaseWarning.price} / {t('perMonth')}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500">{t('purchaseWarningBillingLabel')}</span>
                <span className="text-right font-semibold text-gray-950">
                  {purchaseWarning.billingCycle === 'annual' ? t('billedAnnually') : t('billedMonthly')}
                </span>
              </div>
            </div>

            {purchaseWarning.isUpgrade && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                {t('upgradeForfeitWarning', { plan: purchaseWarning.currentPlanName })}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPurchaseWarning(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('cancelPurchase')}
              </button>
              <button
                type="button"
                onClick={handleConfirmPurchase}
                className="rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                {purchaseWarning.mode === 'planChange' ? t('confirmPlanChange') : t('confirmPurchase')}
              </button>
            </div>
          </div>
        </div>
      )}

      {trialWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-950">{t('trialWarningTitle')}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">{t('trialWarningBody')}</p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setTrialWarning(null);
                  setCheckoutPlan(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('keepTrial')}
              </button>
              <button
                type="button"
                onClick={handleContinueTrialCheckout}
                className="rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                {t('continueToCheckout')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t('title')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('description')}</p>
      </div>

      {isTrial && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <span className="font-semibold">
            {trialDaysLeft != null
              ? t('trialDaysLeft', { days: trialDaysLeft, unit: trialDaysLeft !== 1 ? t('days') : t('day') })
              : trialEndsAt
                ? t('trialEndsAt', { date: formatDate(trialEndsAt) })
                : t('trialActive')}
          </span>{' '}
          {t('trialConvert')}
        </div>
      )}

      {currentSubscription?.status === 'past_due' && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span className="font-semibold">{t('pastDueWarning')}</span>
          <button
            type="button"
            disabled={updatePaymentLoading}
            onClick={handleUpdatePayment}
            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {updatePaymentLoading ? t('loadingPayment') : t('updatePaymentMethod')}
          </button>
        </div>
      )}

      {isAutoRenewOff && renewalEndsAt && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>
            <span className="mr-2 inline-block rounded-full bg-amber-600 px-2 py-0.5 text-xs font-semibold uppercase text-white">
              {t('autoRenewOffBadge')}
            </span>
            {t('autoRenewOffAccess', { date: formatDate(renewalEndsAt) })}
          </span>
          {canToggleAutoRenew && (
            <button
              type="button"
              onClick={() => handleAutoRenewToggle(true)}
              disabled={autoRenewLoading}
              className="rounded-md bg-amber-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-800 disabled:opacity-60"
            >
              {autoRenewLoading ? t('resuming') : t('resumeAutoRenew')}
            </button>
          )}
        </div>
      )}

      {currentSubscription?.status === 'cancelled' && renewalEndsAt && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>{t('cancelledAccess', { date: formatDate(renewalEndsAt) })}</span>
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
          {t('paddleOverlayNotConfigured')}
        </div>
      )}

      <PlanSummary
        t={t}
        currentPlanName={currentPlanName}
        currentBillingCycle={currentBillingCycle}
        currentPlanPrice={currentPlanPrice}
        hasEffectivePlan={hasEffectivePlan}
        isTrial={isTrial}
        creditsRemaining={creditsRemaining}
        creditsProgressPercent={creditsProgressPercent}
        scheduledPlan={visibleScheduledPlan}
        formatDate={formatDate}
        getCycleLabel={getCycleLabel}
        numberFormatter={numberFormatter}
        trialDaysLeft={trialDaysLeft}
        trialEndsAt={trialEndsAt}
        autoRenewEnabled={autoRenewEnabled}
        autoRenewLoading={autoRenewLoading}
        canToggleAutoRenew={canToggleAutoRenew}
        renewalEndsAt={renewalEndsAt}
        renewalRenewsAt={renewalRenewsAt}
        onAutoRenewToggle={handleAutoRenewToggle}
      />

      <PlanPicker
        t={t}
        plans={plans}
        cycle={cycle}
        currentTier={currentTier}
        currentBillingCycle={currentBillingCycle}
        checkoutPlan={checkoutPlan}
        savingPlan={savingPlan}
        upgradeLoading={upgradeLoading}
        hasExistingPaddleSubscription={hasExistingPaddleSubscription}
        hasScheduledPlan={hasScheduledPlan}
        visibleScheduledPlan={visibleScheduledPlan}
        isTrial={isTrial}
        trialDaysLeft={trialDaysLeft}
        formatPrice={formatPrice}
        getLocalizedPlanFeatures={getLocalizedPlanFeatures}
        getPlanCtaLabel={getPlanCtaLabel}
        handlePlanAction={handlePlanAction}
        setCycle={setCycle}
      />

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
                    <td className="px-2 py-2">{formatDate(item.createdAt)}</td>
                    <td className="px-2 py-2">{formatPaymentAmount(item.amount, item.currency)}</td>
                    <td className="px-2 py-2">
                      <span
                        className={[
                          'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                          item.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : item.status === 'refunded'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700',
                        ].join(' ')}
                      >
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
