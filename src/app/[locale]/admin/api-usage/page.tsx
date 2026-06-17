'use client';

import React, { useEffect } from 'react';
import { Gauge, Search, TrendingUp, Users } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import AdminMetricCard from '@/components/admin/AdminMetricCard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminPanel from '@/components/admin/AdminPanel';
import AdminStatusBadge from '@/components/admin/AdminStatusBadge';
import { formatAdminNumber } from '@/lib/adminFormat';
import { getAdminStatusToken, humanizeAdminValue } from '@/lib/adminLabels';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { truncateText } from '@/lib/utils';
import { fetchAdminApiUsage } from '@/lib/store/slices/adminSlice';

export default function AdminApiUsagePage() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.admin.apiUsage);

  useEffect(() => {
    dispatch(fetchAdminApiUsage({ limit: 100 }));
  }, [dispatch]);

  const getStatusLabel = (status: string) => {
    const statusToken = getAdminStatusToken(status);
    return statusToken ? t(`common.statusLabels.${statusToken}`) : humanizeAdminValue(status);
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={t('apiUsage.title')}
        description={t('apiUsage.description')}
        actions={
          <button
            type="button"
            onClick={() => dispatch(fetchAdminApiUsage({ limit: 100 }))}
            className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            {t('common.refresh')}
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          title={t('apiUsage.metrics.totalRequests')}
          value={formatAdminNumber(data?.totalRequests ?? 0, locale)}
          hint={t('apiUsage.metricHints.totalRequests')}
          icon={<Search className="h-5 w-5" />}
          accent="teal"
        />
        <AdminMetricCard
          title={t('apiUsage.metrics.successRate')}
          value={`${data?.successRate ?? 0}%`}
          hint={t('apiUsage.metricHints.successRate')}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="emerald"
        />
        <AdminMetricCard
          title={t('apiUsage.metrics.averageDiscoveries')}
          value={formatAdminNumber(data?.averageDiscoveries ?? 0, locale)}
          hint={t('apiUsage.metricHints.averageDiscoveries')}
          icon={<Gauge className="h-5 w-5" />}
          accent="amber"
        />
        <AdminMetricCard
          title={t('apiUsage.metrics.activeMembers')}
          value={formatAdminNumber(data?.activeMembers ?? 0, locale)}
          hint={t('apiUsage.metricHints.activeMembers')}
          icon={<Users className="h-5 w-5" />}
          accent="slate"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <AdminPanel title={t('apiUsage.breakdownTitle')} description={t('apiUsage.breakdownDescription')}>
            {loading && !data ? (
              <p className="py-12 text-center text-sm text-slate-500">{t('apiUsage.loading')}</p>
            ) : error && !data ? (
              <div className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800">{error}</div>
            ) : data?.statusBreakdown.length ? (
              <div className="space-y-4">
                {data.statusBreakdown.map((item) => {
                  const width = data.sampleSize ? Math.max((item.count / data.sampleSize) * 100, 8) : 8;
                  return (
                    <div key={item.status}>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                        <AdminStatusBadge value={item.status} label={getStatusLabel(item.status)} />
                        <span className="text-sm font-medium text-slate-700">{formatAdminNumber(item.count, locale)}</span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-100">
                        <div className="h-3 rounded-full bg-slate-950" style={{ width: `${Math.min(width, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-slate-500">{t('apiUsage.empty')}</p>
            )}
          </AdminPanel>

          <AdminPanel title={t('apiUsage.topUploadersTitle')} description={t('apiUsage.topUploadersDescription')}>
            {data?.topUploaders.length ? (
              <div className="space-y-3">
                {data.topUploaders.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-3 rounded-3xl border border-slate-100 bg-slate-50 px-4 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-950" title={item.name}>{truncateText(item.name, 30)}</p>
                      <p className="mt-1 text-xs text-slate-500">{t('apiUsage.topUploaderHint')}</p>
                    </div>
                    <div className="inline-flex h-11 min-w-11 shrink-0 items-center justify-center rounded-2xl bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm">
                      {formatAdminNumber(item.uploads, locale)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-slate-500">{t('apiUsage.empty')}</p>
            )}
          </AdminPanel>
        </div>

        <div className="space-y-6">
          <AdminPanel title={t('apiUsage.snapshotTitle')} description={t('apiUsage.snapshotDescription')}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">{t('apiUsage.snapshot.searchesToday')}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{formatAdminNumber(data?.searchesToday ?? 0, locale)}</p>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">{t('apiUsage.snapshot.completed')}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{formatAdminNumber(data?.completedRequests ?? 0, locale)}</p>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">{t('apiUsage.snapshot.pending')}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{formatAdminNumber(data?.pendingRequests ?? 0, locale)}</p>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">{t('apiUsage.snapshot.failed')}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{formatAdminNumber(data?.failedRequests ?? 0, locale)}</p>
              </div>
            </div>
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}