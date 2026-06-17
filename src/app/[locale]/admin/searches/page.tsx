'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Activity, Filter, Layers3, RotateCcw, Search, Users } from 'lucide-react';
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
import { fetchAdminSearches } from '@/lib/store/slices/adminSlice';

const searchStatusOptions = ['all', 'processing', 'completed', 'failed', 'reviewPending'];

export default function AdminSearchesPage() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const { data, pagination, loading, error } = useAppSelector((state) => state.admin.searches);
  const [memberInput, setMemberInput] = useState('');
  const [appliedMember, setAppliedMember] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    dispatch(
      fetchAdminSearches({
        page,
        limit,
        status: statusFilter === 'all' ? undefined : statusFilter,
        userName: appliedMember || undefined,
      }),
    );
  }, [appliedMember, dispatch, limit, page, statusFilter]);

  const completedCount = data.filter((item) => item.status === 'completed').length;
  const uniqueUploaders = new Set(data.map((item) => item.uploaderId)).size;
  const averageDiscoveries = data.length
    ? formatAdminNumber(Math.round(data.reduce((sum, item) => sum + item.discoveryCount, 0) / data.length), locale)
    : '0';

  const getStatusLabel = (status: string) => {
    const statusToken = getAdminStatusToken(status);
    return statusToken ? t(`common.statusLabels.${statusToken}`) : humanizeAdminValue(status);
  };

  const applyFilters = () => {
    startTransition(() => {
      setPage(1);
      setAppliedMember(memberInput.trim());
    });
  };

  const resetFilters = () => {
    startTransition(() => {
      setMemberInput('');
      setAppliedMember('');
      setStatusFilter('all');
      setLimit(10);
      setPage(1);
    });
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow={t('searches.eyebrow')}
        title={t('searches.title')}
        description={t('searches.description')}
        actions={
          <button
            type="button"
            onClick={() => dispatch(fetchAdminSearches({ page, limit, status: statusFilter === 'all' ? undefined : statusFilter, userName: appliedMember || undefined }))}
            className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            {t('common.refresh')}
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          title={t('searches.summary.total')}
          value={formatAdminNumber(pagination.total, locale)}
          hint={t('searches.summary.totalHint')}
          icon={<Layers3 className="h-5 w-5" />}
          accent="teal"
        />
        <AdminMetricCard
          title={t('searches.summary.completed')}
          value={formatAdminNumber(completedCount, locale)}
          hint={t('searches.summary.completedHint')}
          icon={<Activity className="h-5 w-5" />}
          accent="emerald"
        />
        <AdminMetricCard
          title={t('searches.summary.averageDiscoveries')}
          value={averageDiscoveries}
          hint={t('searches.summary.averageDiscoveriesHint')}
          icon={<Filter className="h-5 w-5" />}
          accent="amber"
        />
        <AdminMetricCard
          title={t('searches.summary.uploaders')}
          value={formatAdminNumber(uniqueUploaders, locale)}
          hint={t('searches.summary.uploadersHint')}
          icon={<Users className="h-5 w-5" />}
          accent="slate"
        />
      </div>

      <AdminPanel title={t('searches.tableTitle')} description={t('searches.tableDescription')}>
        <div className="mb-6 grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_220px_140px_auto]">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={memberInput}
              onChange={(event) => setMemberInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  applyFilters();
                }
              }}
              placeholder={t('searches.filters.memberPlaceholder')}
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
            {searchStatusOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'all'
                  ? t('searches.filters.allStatuses')
                  : (() => {
                      const statusToken = getAdminStatusToken(option);
                      return statusToken ? t(`common.statusLabels.${statusToken}`) : humanizeAdminValue(option);
                    })()}
              </option>
            ))}
          </select>

          <select
            value={limit}
            onChange={(event) => {
              setLimit(Number(event.target.value));
              setPage(1);
            }}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
          >
            {[10, 20, 50].map((option) => (
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
              {t('searches.loading')}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-12 text-center text-sm text-slate-800">
              {error}
            </div>
          ) : data.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
              {t('searches.empty')}
            </div>
          ) : (
            data.map((item) => (
              <article key={item._id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="flex items-start gap-3">
                  <img src={item.image} alt={item.fileName} className="h-12 w-12 shrink-0 rounded-xl border border-slate-200 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900" title={item.fileName}>{item.fileName}</p>
                    <div className="mt-2">
                      <AdminStatusBadge value={item.status} label={getStatusLabel(item.status)} />
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('searches.columns.uploader')}</p>
                    <Link href={`/admin/members/${item.uploaderId}`} className="mt-1.5 block truncate text-sm font-medium text-slate-900 hover:underline" title={item.uploaderName}>
                      {truncateText(item.uploaderName, 30)}
                    </Link>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('searches.columns.discoveries')}</p>
                    <p className="mt-1.5 text-sm font-medium text-slate-900">{formatAdminNumber(item.discoveryCount, locale)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('searches.columns.uploadDate')}</p>
                    <p className="mt-1.5 text-sm font-medium text-slate-900">{formatAdminDate(item.uploadDate, locale)}</p>
                  </div>
                </div>

                <Link
                  href={`/admin/searches/${item._id}`}
                  className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  {t('common.viewDetails')}
                </Link>
              </article>
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-[980px] w-full border-collapse text-left ">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('searches.columns.file')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('searches.columns.uploader')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('searches.columns.status')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('searches.columns.discoveries')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('searches.columns.uploadDate')}</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t('searches.columns.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                    {t('searches.loading')}
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
                    {t('searches.empty')}
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <img src={item.image} alt={item.fileName} className="h-14 w-14 shrink-0 rounded-2xl border border-slate-200 object-cover" />
                        <div className="min-w-0 max-w-[20rem]">
                          <p className="text-sm font-semibold text-slate-900" title={item.fileName}>{truncateText(item.fileName, 34)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="min-w-0 max-w-[16rem]">
                        <Link href={`/admin/members/${item.uploaderId}`} className="text-sm font-semibold text-slate-900 hover:underline" title={item.uploaderName}>
                          {truncateText(item.uploaderName, 28)}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <AdminStatusBadge value={item.status} label={getStatusLabel(item.status)} />
                    </td>
                    <td className="px-4 py-4 text-sm font-medium whitespace-nowrap text-slate-700 align-top">{formatAdminNumber(item.discoveryCount, locale)}</td>
                    <td className="px-4 py-4 text-sm whitespace-nowrap text-slate-600 align-top">{formatAdminDate(item.uploadDate, locale)}</td>
                    <td className="px-4 py-4 align-top">
                      <Link
                        href={`/admin/searches/${item._id}`}
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