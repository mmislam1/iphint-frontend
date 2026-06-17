'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Ban, CreditCard, Search, ShieldCheck, UserRound } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import AdminMetricCard from '@/components/admin/AdminMetricCard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminPanel from '@/components/admin/AdminPanel';
import AdminStatusBadge from '@/components/admin/AdminStatusBadge';
import { formatAdminDate, formatAdminNumber } from '@/lib/adminFormat';
import { getAdminStatusToken, humanizeAdminValue } from '@/lib/adminLabels';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { truncateText } from '@/lib/utils';
import {
  clearAdminDeactivationFeedback,
  clearAdminMemberState,
  deactivateAdminUser,
  fetchAdminUserDetails,
  fetchAdminUserSearches,
} from '@/lib/store/slices/adminSlice';

export default function AdminMemberDetailsPage() {
  const params = useParams<{ userId: string }>();
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  const t = useTranslations('Admin');
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.admin.memberDetails);
  const searchesState = useAppSelector((state) => state.admin.memberSearches);
  const deactivation = useAppSelector((state) => state.admin.deactivation);
  const [searchPage, setSearchPage] = useState(1);
  const [searchLimit, setSearchLimit] = useState(10);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!userId) {
      return;
    }

    dispatch(fetchAdminUserDetails(userId));

    return () => {
      dispatch(clearAdminMemberState());
      dispatch(clearAdminDeactivationFeedback());
    };
  }, [dispatch, userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    dispatch(fetchAdminUserSearches({ userId, page: searchPage, limit: searchLimit }));
  }, [dispatch, searchLimit, searchPage, userId]);

  const getStatusLabel = (status: string) => {
    const statusToken = getAdminStatusToken(status);
    return statusToken ? t(`common.statusLabels.${statusToken}`) : humanizeAdminValue(status);
  };

  const isDeactivating = userId ? Boolean(deactivation.loadingByUserId[userId]) : false;

  if (!userId) {
    return null;
  }

  if (loading && !data) {
    return (
      <AdminPanel title={t('memberDetails.loadingTitle')} description={t('memberDetails.loadingDescription')}>
        <p className="py-10 text-center text-sm text-slate-500">{t('memberDetails.loading')}</p>
      </AdminPanel>
    );
  }

  if (error && !data) {
    return (
      <AdminPanel title={t('memberDetails.errorTitle')} description={t('memberDetails.errorDescription')}>
        <div className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800">{error}</div>
      </AdminPanel>
    );
  }

  if (!data) {
    return null;
  }

  const subscriptionStatusValue = (data.subscription?.status || data.subscriptionStatus || '').toLowerCase();
  const subscriptionSource = (data.subscription?.grantSource || '').toLowerCase();
  const isTrialing = subscriptionStatusValue === 'trialing' || subscriptionSource === 'trial';
  const isTrialExpired =
    subscriptionSource === 'trial' && ['expired', 'cancelled'].includes(subscriptionStatusValue);
  const hasSubscriptionRecord = Boolean(data.subscription);

  const planDisplayName = isTrialing
    ? 'Pro (Trial)'
    : isTrialExpired
      ? t('memberDetails.noActivePlan')
      : hasSubscriptionRecord
        ? data.subscription?.planName || data.subscription?.planId || 'Pro'
        : t('memberDetails.noActivePlan');

  const statusDisplayValue = isTrialing
    ? 'trialing'
    : hasSubscriptionRecord
      ? subscriptionStatusValue || 'pending'
      : 'expired';

  const sourceDisplayValue = hasSubscriptionRecord
    ? subscriptionSource || 'paid'
    : 'none';

  const billingDisplay = isTrialing
    ? t('memberDetails.trialBillingCycle')
    : hasSubscriptionRecord
      ? (data.subscription?.billingCycle || t('memberDetails.noActivePlan'))
      : t('memberDetails.noActivePlan');

  const trialDaysLeft =
    data.subscription?.trialDaysLeft === null || data.subscription?.trialDaysLeft === undefined
      ? null
      : Number(data.subscription?.trialDaysLeft);
  const trialEndDate = data.subscription?.trialEndDate || '';

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow={t('memberDetails.eyebrow')}
        title={t('memberDetails.title', { name: data.name })}
        description={t('memberDetails.description')}
        actions={
          <Link
            href="/admin/users"
            className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('memberDetails.backToUsers')}
          </Link>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          title={t('memberDetails.metrics.credits')}
          value={formatAdminNumber(data.credits, locale)}
          hint={t('memberDetails.metricHints.credits')}
          icon={<CreditCard className="h-5 w-5" />}
          accent="teal"
        />
        <AdminMetricCard
          title={t('memberDetails.metrics.monitors')}
          value={formatAdminNumber(data.monitors, locale)}
          hint={t('memberDetails.metricHints.monitors')}
          icon={<ShieldCheck className="h-5 w-5" />}
          accent="slate"
        />
        <AdminMetricCard
          title={t('memberDetails.metrics.searches')}
          value={formatAdminNumber(data.searchCount, locale)}
          hint={t('memberDetails.metricHints.searches')}
          icon={<Search className="h-5 w-5" />}
          accent="emerald"
        />
        <AdminMetricCard
          title={t('memberDetails.metrics.referrals')}
          value={formatAdminNumber(data.referralCount, locale)}
          hint={t('memberDetails.metricHints.referrals')}
          icon={<UserRound className="h-5 w-5" />}
          accent="amber"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <AdminPanel title={t('memberDetails.profileTitle')} description={t('memberDetails.profileDescription')}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-4 rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t('memberDetails.fields.contact')}</p>
                  <p className="mt-2 text-base font-semibold text-slate-950" title={data.email}>{truncateText(data.email, 44)}</p>
                  <p className="mt-1 text-sm text-slate-500" title={data.phoneNumber || t('memberDetails.unavailable')}>
                    {truncateText(data.phoneNumber || t('memberDetails.unavailable'), 26)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusBadge value={data.isActive ? 'active' : 'inactive'} label={getStatusLabel(data.isActive ? 'active' : 'inactive')} />
                  <AdminStatusBadge value={data.isApproved ? 'approved' : 'inactive'} label={data.isApproved ? t('common.statusLabels.approved') : getStatusLabel('inactive')} />
                  <AdminStatusBadge value={data.role} label={humanizeAdminValue(data.role)} />
                </div>
              </div>

              <div className="space-y-3 rounded-3xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-600">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <span>{t('memberDetails.fields.jobTitle')}</span>
                  <span className="w-full font-medium text-left text-slate-900 sm:w-auto sm:text-right" title={data.jobTitle || t('memberDetails.unavailable')}>
                    {truncateText(data.jobTitle || t('memberDetails.unavailable'), 24)}
                  </span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <span>{t('memberDetails.fields.affiliation')}</span>
                  <span className="w-full font-medium text-left text-slate-900 sm:w-auto sm:text-right" title={data.affiliation || t('memberDetails.unavailable')}>
                    {truncateText(data.affiliation || t('memberDetails.unavailable'), 24)}
                  </span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <span>{t('memberDetails.fields.country')}</span>
                  <span className="w-full font-medium text-left text-slate-900 sm:w-auto sm:text-right" title={data.country || t('memberDetails.unavailable')}>
                    {truncateText(data.country || t('memberDetails.unavailable'), 24)}
                  </span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <span>{t('memberDetails.fields.joined')}</span>
                  <span className="w-full font-medium break-all text-left text-slate-900 sm:w-auto sm:text-right">{formatAdminDate(data.joiningDate, locale)}</span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <span>{t('memberDetails.fields.referralCode')}</span>
                  <span className="w-full font-medium text-left text-slate-900 sm:w-auto sm:text-right" title={data.referralCode || t('memberDetails.unavailable')}>
                    {truncateText(data.referralCode || t('memberDetails.unavailable'), 24)}
                  </span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <span>{t('memberDetails.fields.subscriptionId')}</span>
                  <span className="w-full font-medium text-left text-slate-900 sm:w-auto sm:text-right" title={data.subscriptionId || t('memberDetails.unavailable')}>
                    {truncateText(data.subscriptionId || t('memberDetails.unavailable'), 24)}
                  </span>
                </div>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel title={t('memberDetails.searchesTitle')} description={t('memberDetails.searchesDescription')}>
            <div className="mb-4 flex justify-start sm:justify-end">
              <select
                value={searchLimit}
                onChange={(event) => {
                  setSearchLimit(Number(event.target.value));
                  setSearchPage(1);
                }}
                className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
              >
                {[10, 20, 50].map((option) => (
                  <option key={option} value={option}>
                    {t('users.filters.perPage', { count: option })}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 md:hidden">
              {searchesState.loading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
                  {t('memberDetails.searchesLoading')}
                </div>
              ) : searchesState.error ? (
                <div className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-12 text-center text-sm text-slate-800">
                  {searchesState.error}
                </div>
              ) : searchesState.data.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
                  {t('memberDetails.searchesEmpty')}
                </div>
              ) : (
                searchesState.data.map((searchItem) => (
                  <article key={searchItem._id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-start gap-3">
                      <img src={searchItem.image} alt="search" className="h-14 w-14 shrink-0 rounded-2xl border border-slate-200 object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="mt-2 text-sm text-slate-600">{formatAdminDate(searchItem.date, locale)}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <AdminStatusBadge value={searchItem.status} label={getStatusLabel(searchItem.status)} />
                    </div>
                    <Link
                      href={`/admin/searches/${searchItem._id}`}
                      className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      {t('common.viewDetails')}
                    </Link>
                  </article>
                ))
              )}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-[760px] w-full border-collapse text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('memberDetails.searchColumns.image')}</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('memberDetails.searchColumns.status')}</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('memberDetails.searchColumns.date')}</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('memberDetails.searchColumns.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {searchesState.loading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-500">
                        {t('memberDetails.searchesLoading')}
                      </td>
                    </tr>
                  ) : searchesState.error ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-800">
                        {searchesState.error}
                      </td>
                    </tr>
                  ) : searchesState.data.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-500">
                        {t('memberDetails.searchesEmpty')}
                      </td>
                    </tr>
                  ) : (
                    searchesState.data.map((searchItem) => (
                      <tr key={searchItem._id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-start gap-3">
                            <img src={searchItem.image} alt="search" className="h-14 w-14 shrink-0 rounded-2xl border border-slate-200 object-cover" />
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <AdminStatusBadge value={searchItem.status} label={getStatusLabel(searchItem.status)} />
                        </td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap text-slate-600 align-top">{formatAdminDate(searchItem.date, locale)}</td>
                        <td className="px-4 py-4 align-top">
                          <Link
                            href={`/admin/searches/${searchItem._id}`}
                            className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium whitespace-nowrap text-slate-700 transition hover:bg-slate-50"
                          >
                            {t('common.viewDetails')}
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <AdminPagination
              page={searchesState.pagination.page}
              pages={searchesState.pagination.pages}
              total={searchesState.pagination.total}
              visibleCount={searchesState.data.length}
              onPageChange={setSearchPage}
              previousLabel={t('common.previous')}
              nextLabel={t('common.next')}
              summaryLabel={t('common.paginationSummary', { count: '{count}', total: '{total}' })}
            />
          </AdminPanel>
        </div>

        <div className="space-y-6">
          <AdminPanel title={t('memberDetails.subscriptionTitle')} description={t('memberDetails.subscriptionDescription')}>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span>{t('memberDetails.subscriptionFields.plan')}</span>
                <span className="w-full font-medium text-left text-slate-900 sm:w-auto sm:text-right" title={planDisplayName}>
                  {truncateText(planDisplayName, 24)}
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span>{t('memberDetails.subscriptionFields.status')}</span>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <AdminStatusBadge value={statusDisplayValue} label={getStatusLabel(statusDisplayValue)} />
                  {isTrialExpired ? <AdminStatusBadge value="expired" label={t('memberDetails.trialExpired')} /> : null}
                </div>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span>{t('memberDetails.subscriptionFields.source')}</span>
                <span className="w-full font-medium text-left text-slate-900 sm:w-auto sm:text-right">
                  {sourceDisplayValue === 'none' ? t('memberDetails.noActivePlan') : humanizeAdminValue(sourceDisplayValue)}
                </span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span>{t('memberDetails.subscriptionFields.billingCycle')}</span>
                <span className="w-full font-medium text-left text-slate-900 sm:w-auto sm:text-right" title={billingDisplay}>
                  {truncateText(billingDisplay, 24)}
                </span>
              </div>
              {isTrialing ? (
                <>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span>{t('memberDetails.subscriptionFields.trialDaysLeft')}</span>
                    <span className="w-full font-medium text-left text-slate-900 sm:w-auto sm:text-right">
                      {trialDaysLeft === null ? t('memberDetails.unavailable') : t('memberDetails.trialDaysLeftValue', { count: trialDaysLeft })}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span>{t('memberDetails.subscriptionFields.trialEndDate')}</span>
                    <span className="w-full font-medium text-left text-slate-900 sm:w-auto sm:text-right">
                      {trialEndDate ? formatAdminDate(trialEndDate, locale) : t('memberDetails.unavailable')}
                    </span>
                  </div>
                  <p className="rounded-2xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-sky-800">
                    {t('memberDetails.trialHelperText')}
                  </p>
                </>
              ) : null}
            </div>
          </AdminPanel>

          <AdminPanel title={t('memberDetails.adminActionsTitle')} description={t('memberDetails.adminActionsDescription')}>
            <div className="space-y-4">
              {deactivation.successMessage ? (
                <div className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800">
                  {deactivation.successMessage}
                </div>
              ) : null}
              {deactivation.error ? (
                <div className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800">
                  {deactivation.error}
                </div>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">{t('memberDetails.deactivateReasonLabel')}</span>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder={t('memberDetails.deactivateReasonPlaceholder')}
                  rows={4}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>

              <button
                type="button"
                disabled={!data.isActive || isDeactivating}
                onClick={() => dispatch(deactivateAdminUser({ userId, reason: reason.trim() || undefined }))}
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Ban className="mr-2 h-4 w-4" />
                {data.isActive ? t('memberDetails.deactivateButton') : t('memberDetails.alreadyInactive')}
              </button>
            </div>
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}