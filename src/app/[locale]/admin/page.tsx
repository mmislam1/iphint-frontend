'use client';

import React, { useEffect } from 'react';
import { Activity, BadgeDollarSign, CheckCircle2, Clock3, Search, Users } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import AdminMetricCard from '@/components/admin/AdminMetricCard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminPanel from '@/components/admin/AdminPanel';
import AdminStatusBadge from '@/components/admin/AdminStatusBadge';
import { formatAdminCurrency, formatAdminDate, formatAdminNumber } from '@/lib/adminFormat';
import { getAdminActivityToken, humanizeAdminValue } from '@/lib/adminLabels';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchAdminDashboard } from '@/lib/store/slices/adminSlice';

export default function AdminDashboardPage() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.admin.dashboard);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  const completionRate = data?.totalContent
    ? Math.round((data.analysisComplete / data.totalContent) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow={t('dashboard.eyebrow')}
        title={t('dashboard.title')}
        description={t('dashboard.description')}
        actions={
          <button
            type="button"
            onClick={() => dispatch(fetchAdminDashboard())}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {t('common.refresh')}
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          title={t('dashboard.metrics.totalContent')}
          value={formatAdminNumber(data?.totalContent ?? 0, locale)}
          hint={t('dashboard.metricHints.totalContent')}
          icon={<Search className="h-5 w-5" />}
          accent="teal"
        />
        <AdminMetricCard
          title={t('dashboard.metrics.members')}
          value={formatAdminNumber(data?.memberCount ?? 0, locale)}
          hint={t('dashboard.metricHints.members')}
          icon={<Users className="h-5 w-5" />}
          accent="emerald"
        />
        <AdminMetricCard
          title={t('dashboard.metrics.activeSubscriptions')}
          value={formatAdminNumber(data?.activeSubscriptions ?? 0, locale)}
          hint={t('dashboard.metricHints.activeSubscriptions')}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="amber"
        />
        <AdminMetricCard
          title={t('dashboard.metrics.revenue')}
          value={formatAdminCurrency(data?.revenueThisMonth ?? 0, locale)}
          hint={t('dashboard.metricHints.revenue')}
          icon={<BadgeDollarSign className="h-5 w-5" />}
          accent="slate"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <AdminPanel
          title={t('dashboard.recentActivityTitle')}
          description={t('dashboard.recentActivityDescription')}
        >
          {loading && !data ? (
            <p className="py-14 text-center text-sm text-slate-500">{t('common.loading')}</p>
          ) : error && !data ? (
            <div className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800">{error}</div>
          ) : data?.recentActivity.length ? (
            <div className="space-y-4">
              {data.recentActivity.map((activity, index) => {
                const activityToken = getAdminActivityToken(activity.type);
                const activityLabel = activityToken
                  ? t(`common.activityTypes.${activityToken}`)
                  : humanizeAdminValue(activity.type);

                return (
                  <div
                    key={`${activity.userId}-${activity.timestamp}-${index}`}
                    className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <AdminStatusBadge value={activity.type} label={activityLabel} />
                          <p className="text-sm font-semibold text-slate-900">{activity.userName || t('common.unknownMember')}</p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{activity.description}</p>
                        <p className="mt-2 text-xs text-slate-500">{activity.userEmail}</p>
                      </div>
                      <p className="text-xs font-medium text-slate-500">{formatAdminDate(activity.timestamp, locale)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-14 text-center text-sm text-slate-500">{t('common.noResults')}</p>
          )}
        </AdminPanel>

        <div className="space-y-6">
          <AdminPanel title={t('dashboard.systemSnapshotTitle')} description={t('dashboard.systemSnapshotDescription')}>
            <div className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span>{t('dashboard.snapshot.analysisComplete')}</span>
                  <span className="font-semibold text-slate-900">{completionRate}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-slate-950"
                    style={{ width: `${Math.min(completionRate, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                    <Clock3 className="h-4 w-4 text-slate-900" />
                    {t('dashboard.snapshot.underAnalysis')}
                  </div>
                  <p className="text-2xl font-semibold text-slate-950">{formatAdminNumber(data?.underAnalysis ?? 0, locale)}</p>
                </div>
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                    <Activity className="h-4 w-4 text-slate-900" />
                    {t('dashboard.snapshot.searchesToday')}
                  </div>
                  <p className="text-2xl font-semibold text-slate-950">{formatAdminNumber(data?.searchesToday ?? 0, locale)}</p>
                </div>
              </div>
            </div>
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}