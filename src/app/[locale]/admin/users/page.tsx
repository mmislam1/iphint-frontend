'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Filter, RotateCcw, Search, ShieldCheck, Users } from 'lucide-react';
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
import { fetchAdminUsers } from '@/lib/store/slices/adminSlice';

const pageSizeOptions = [10, 20, 50];

export default function AdminUsersPage() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const { data, pagination, loading, error } = useAppSelector((state) => state.admin.users);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    dispatch(
      fetchAdminUsers({
        page,
        limit,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: appliedSearch || undefined,
      }),
    );
  }, [appliedSearch, dispatch, limit, page, statusFilter]);

  const activeCount = data.filter((member) => member.status === 'active').length;
  const proCount = data.filter((member) => member.subscription?.tier === 'pro').length;

  const getStatusLabel = (status: string) => {
    const statusToken = getAdminStatusToken(status);
    return statusToken ? t(`common.statusLabels.${statusToken}`) : humanizeAdminValue(status);
  };

  const getPlanLabel = (member: (typeof data)[number]) => {
    const status = member.subscription?.status?.toLowerCase() || '';
    const source = member.subscription?.grantSource?.toLowerCase() || '';
    const isTrialing = status === 'trialing' || source === 'trial';
    const isTrialExpired = source === 'trial' && ['expired', 'cancelled'].includes(status);

    if (isTrialing) {
      return 'Pro (Trial)';
    }

    if (isTrialExpired) {
      return t('users.noActivePlan');
    }

    if (!member.subscription) {
      return t('users.noActivePlan');
    }

    return member.subscription.planName || member.subscription.tier || 'Pro';
  };

  const getBillingLabel = (member: (typeof data)[number]) => {
    const status = member.subscription?.status?.toLowerCase() || '';
    const source = member.subscription?.grantSource?.toLowerCase() || '';
    const isTrialing = status === 'trialing' || source === 'trial';
    if (isTrialing) {
      return t('users.trialBillingCycle');
    }

    return member.subscription?.billingCycle || t('users.noActivePlan');
  };

  const getSourceLabel = (member: (typeof data)[number]) => {
    if (!member.subscription?.grantSource) {
      return t('users.noActivePlan');
    }

    return humanizeAdminValue(member.subscription.grantSource);
  };

  const applyFilters = () => {
    startTransition(() => {
      setPage(1);
      setAppliedSearch(searchInput.trim());
    });
  };

  const resetFilters = () => {
    startTransition(() => {
      setSearchInput('');
      setAppliedSearch('');
      setStatusFilter('all');
      setLimit(10);
      setPage(1);
    });
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow={t('users.eyebrow')}
        title={t('users.title')}
        description={t('users.description')}
        actions={
          <button
            type="button"
            onClick={() => dispatch(fetchAdminUsers({ page, limit, status: statusFilter === 'all' ? undefined : statusFilter, search: appliedSearch || undefined }))}
            className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            {t('common.refresh')}
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          title={t('users.summary.totalMembers')}
          value={formatAdminNumber(pagination.total, locale)}
          hint={t('users.summary.totalMembersHint')}
          icon={<Users className="h-5 w-5" />}
          accent="teal"
        />
        <AdminMetricCard
          title={t('users.summary.visibleMembers')}
          value={formatAdminNumber(data.length, locale)}
          hint={t('users.summary.visibleMembersHint')}
          icon={<Search className="h-5 w-5" />}
          accent="slate"
        />
        <AdminMetricCard
          title={t('users.summary.activeAccounts')}
          value={formatAdminNumber(activeCount, locale)}
          hint={t('users.summary.activeAccountsHint')}
          icon={<ShieldCheck className="h-5 w-5" />}
          accent="emerald"
        />
        <AdminMetricCard
          title={t('users.summary.proPlans')}
          value={formatAdminNumber(proCount, locale)}
          hint={t('users.summary.proPlansHint')}
          icon={<Filter className="h-5 w-5" />}
          accent="amber"
        />
      </div>

      <AdminPanel title={t('users.tableTitle')} description={t('users.tableDescription')}>
        <div className="mb-6 grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_220px_140px_auto]">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  applyFilters();
                }
              }}
              placeholder={t('users.filters.searchPlaceholder')}
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
          >
            <option value="all">{t('users.filters.allStatuses')}</option>
            <option value="active">{t('common.statusLabels.active')}</option>
            <option value="inactive">{t('common.statusLabels.inactive')}</option>
          </select>

          <select
            value={limit}
            onChange={(event) => {
              setLimit(Number(event.target.value));
              setPage(1);
            }}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {t('users.filters.perPage', { count: option })}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={applyFilters}
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto"
            >
              {t('common.apply')}
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {t('common.reset')}
            </button>
          </div>
        </div>

        <div className="space-y-3 md:hidden">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
              {t('users.loading')}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-12 text-center text-sm text-slate-800">
              {error}
            </div>
          ) : data.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
              {t('users.empty')}
            </div>
          ) : (
            data.map((member) => (
              <article key={member._id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-950" title={member.name}>{truncateText(member.name, 36)}</p>
                    <p className="mt-1 text-xs text-slate-500" title={member.email}>{truncateText(member.email, 40)}</p>
                  </div>
                  <div className="shrink-0">
                    <AdminStatusBadge value={member.status} label={getStatusLabel(member.status)} />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="min-w-0 rounded-2xl border border-slate-200 bg-white px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('users.columns.plan')}</p>
                    <p className="mt-2 text-sm font-medium text-slate-900" title={getPlanLabel(member)}>
                      {truncateText(getPlanLabel(member), 24)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500" title={member.subscription?.status ? getStatusLabel(member.subscription.status) : t('users.noActiveSubscription')}>
                      {truncateText(member.subscription?.status ? getStatusLabel(member.subscription.status) : t('users.noActiveSubscription'), 28)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {t('users.columns.source')}: {getSourceLabel(member)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {t('users.columns.trialEnds')}: {member.subscription?.trialEndDate ? formatAdminDate(member.subscription.trialEndDate, locale) : '-'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {t('users.columns.billingCycle')}: {getBillingLabel(member)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('users.columns.searches')}</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{formatAdminNumber(member.searchCount, locale)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('users.columns.joined')}</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{formatAdminDate(member.joiningDate, locale)}</p>
                  </div>
                </div>

                <Link
                  href={`/admin/members/${member._id}`}
                  className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  {t('common.viewDetails')}
                </Link>
              </article>
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-[820px] w-full border-collapse text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('users.columns.member')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('users.columns.status')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('users.columns.plan')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('users.columns.searches')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('users.columns.joined')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('users.columns.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                    {t('users.loading')}
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-800">
                    {error}
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                    {t('users.empty')}
                  </td>
                </tr>
              ) : (
                data.map((member) => (
                  <tr key={member._id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-4 align-top">
                      <div className="min-w-0 max-w-[18rem]">
                        <p className="text-sm font-semibold text-slate-950" title={member.name}>{truncateText(member.name, 34)}</p>
                        <p className="mt-1 text-sm text-slate-500" title={member.email}>{truncateText(member.email, 38)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <AdminStatusBadge value={member.status} label={getStatusLabel(member.status)} />
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="max-w-[14rem] text-sm text-slate-700">
                        <p className="font-medium text-slate-900" title={getPlanLabel(member)}>
                          {truncateText(getPlanLabel(member), 22)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500" title={member.subscription?.status ? getStatusLabel(member.subscription.status) : t('users.noActiveSubscription')}>
                          {truncateText(member.subscription?.status ? getStatusLabel(member.subscription.status) : t('users.noActiveSubscription'), 26)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {t('users.columns.source')}: {getSourceLabel(member)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {t('users.columns.trialEnds')}: {member.subscription?.trialEndDate ? formatAdminDate(member.subscription.trialEndDate, locale) : '-'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {t('users.columns.billingCycle')}: {getBillingLabel(member)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium whitespace-nowrap text-slate-700 align-top">{formatAdminNumber(member.searchCount, locale)}</td>
                    <td className="px-4 py-4 text-sm whitespace-nowrap text-slate-600 align-top">{formatAdminDate(member.joiningDate, locale)}</td>
                    <td className="px-4 py-4 align-top">
                      <Link
                        href={`/admin/members/${member._id}`}
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
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          visibleCount={data.length}
          onPageChange={setPage}
          previousLabel={t('common.previous')}
          nextLabel={t('common.next')}
          summaryLabel={t('common.paginationSummary', { count: '{count}', total: '{total}' })}
        />
      </AdminPanel>
    </div>
  );
}