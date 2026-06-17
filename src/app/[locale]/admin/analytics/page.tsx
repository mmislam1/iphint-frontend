'use client';

import React, { useEffect, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, Clock3, Eye, MousePointerClick, Users } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import AdminMetricCard from '@/components/admin/AdminMetricCard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminPanel from '@/components/admin/AdminPanel';
import { formatAdminNumber } from '@/lib/adminFormat';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchAdminWebsiteAnalytics } from '@/lib/store/slices/adminSlice';
import type { AdminAnalyticsDateRange } from '@/types/admin';

const SOURCE_COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];
const GA_COLORS = {
  visitors: '#1a73e8',
  sessions: '#34a853',
  countries: '#1a73e8',
  cities: '#5e97f6',
  browsers: '#4285f4',
} as const;

const SOURCE_COLOR_MAP: Record<string, string> = {
  'Organic Search': '#34a853',
  Direct: '#4285f4',
  Referral: '#fbbc04',
  Social: '#ea4335',
};

const DEVICE_COLOR_MAP: Record<string, string> = {
  Desktop: '#1a73e8',
  Mobile: '#34a853',
  Tablet: '#fbbc04',
};

const BROWSER_COLOR_MAP: Record<string, string> = {
  Chrome: '#34a853',
  Safari: '#1a73e8',
  Edge: '#00acc1',
  Firefox: '#fb8c00',
};

const SOURCE_PRESETS = [
  { key: 'organicSearch', matcher: /(organic search|organic)/i },
  { key: 'direct', matcher: /^(direct|\(direct\))$/i },
  { key: 'social', matcher: /(social|organic social|paid social)/i },
  { key: 'referral', matcher: /(referral|affiliate)/i },
] as const;

const DEVICE_PRESETS = [
  { key: 'mobile', matcher: /^mobile$/i },
  { key: 'desktop', matcher: /^desktop$/i },
  { key: 'tablet', matcher: /^tablet$/i },
] as const;

const BROWSER_PRESETS = [
  { key: 'chrome', matcher: /chrome/i },
  { key: 'safari', matcher: /safari/i },
  { key: 'edge', matcher: /edge/i },
  { key: 'firefox', matcher: /firefox/i },
] as const;

const toReadableDuration = (seconds: number): string => {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const remainingSeconds = total % 60;
  if (!minutes) {
    return `${remainingSeconds}s`;
  }
  return `${minutes}m ${remainingSeconds}s`;
};

const formatPercent = (value: number): string => `${Number(value || 0).toFixed(1)}%`;

const isHttpUrl = (value: string): boolean => /^https?:\/\//i.test(value || '');

const formatShortDate = (value: string): string => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return value.slice(5);
};

const EmptyPanelState = ({ label }: { label: string }) => (
  <div className="flex h-70 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
    {label}
  </div>
);

const AnalyticsMetricSkeleton = () => (
  <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
    <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
    <div className="mt-4 h-8 w-28 rounded bg-slate-200 dark:bg-slate-700" />
    <div className="mt-4 h-4 w-full rounded bg-slate-100 dark:bg-slate-800" />
  </div>
);

const AnalyticsPanelSkeleton = ({ heightClassName = 'h-80' }: { heightClassName?: string }) => (
  <div className={`animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800 ${heightClassName}`} />
);

export default function AdminAnalyticsPage() {
  const t = useTranslations('Admin.analytics');
  const common = useTranslations('Admin.common');
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const analyticsState = useAppSelector((state) => state.admin.analytics);

  useEffect(() => {
    dispatch(fetchAdminWebsiteAnalytics({ range: analyticsState.range }));

    const intervalId = setInterval(() => {
      dispatch(fetchAdminWebsiteAnalytics({ range: analyticsState.range }));
    }, 30000);

    return () => clearInterval(intervalId);
  }, [analyticsState.range, dispatch]);

  const analytics = analyticsState.data;
  const realtime = analytics?.realtime;
  const showInitialLoading = analyticsState.loading && !analytics;

  const growthSeries = useMemo(() => {
    if (!analytics?.dailyTraffic?.length) {
      return [];
    }

    return analytics.dailyTraffic.map((point) => {
      return {
        date: point.date,
        visitors: point.visitors,
        sessions: point.sessions,
        activeUsers: point.activeUsers,
      };
    });
  }, [analytics?.dailyTraffic]);

  const sourceChartData = useMemo(() => {
    const base = analytics?.trafficSources || [];
    const grouped = SOURCE_PRESETS.map((preset) => {
      const name = t(`sourceCategories.${preset.key}`);
      return {
        name,
        value: base
          .filter((item) => preset.matcher.test(item.label || ''))
          .reduce((sum, item) => sum + (item.sessions || 0), 0),
        color: SOURCE_COLOR_MAP[name] || SOURCE_COLORS[0],
      };
    });

    const hasAnyPresetData = grouped.some((item) => item.value > 0);
    if (hasAnyPresetData) {
      return grouped;
    }

    return base.slice(0, 4).map((item) => ({
      name: item.label,
      value: item.sessions,
      color: SOURCE_COLOR_MAP[item.label] || SOURCE_COLORS[0],
    }));
  }, [analytics?.trafficSources, t]);

  const deviceChartData = useMemo(() => {
    const base = analytics?.deviceUsage || [];
    const grouped = DEVICE_PRESETS.map((preset) => {
      const name = t(`deviceCategories.${preset.key}`);
      return {
        name,
        value: base
          .filter((item) => preset.matcher.test(item.label || ''))
          .reduce((sum, item) => sum + (item.sessions || 0), 0),
        color: DEVICE_COLOR_MAP[name] || SOURCE_COLORS[1],
      };
    });

    const hasAnyPresetData = grouped.some((item) => item.value > 0);
    if (hasAnyPresetData) {
      return grouped;
    }

    return base.slice(0, 3).map((item) => ({
      name: item.label,
      value: item.sessions,
      color: DEVICE_COLOR_MAP[item.label] || SOURCE_COLORS[1],
    }));
  }, [analytics?.deviceUsage, t]);

  const browserChartData = useMemo(() => {
    const base = analytics?.browserUsage || [];
    const grouped = BROWSER_PRESETS.map((preset) => {
      const name = t(`browserCategories.${preset.key}`);
      return {
        name,
        sessions: base
          .filter((item) => preset.matcher.test(item.label || ''))
          .reduce((sum, item) => sum + (item.sessions || 0), 0),
        color: BROWSER_COLOR_MAP[name] || SOURCE_COLORS[2],
      };
    });

    const hasAnyPresetData = grouped.some((item) => item.sessions > 0);
    if (hasAnyPresetData) {
      return grouped;
    }

    return base.slice(0, 4).map((item) => ({
      name: item.label,
      sessions: item.sessions,
      color: BROWSER_COLOR_MAP[item.label] || SOURCE_COLORS[2],
    }));
  }, [analytics?.browserUsage, t]);

  const topEngagementPages = useMemo(() => {
    return [...(analytics?.topContent || [])]
      .sort((left, right) => right.engagementRate - left.engagementRate)
      .slice(0, 6);
  }, [analytics?.topContent]);

  const handleRangeChange = (range: AdminAnalyticsDateRange) => {
    dispatch(fetchAdminWebsiteAnalytics({ range }));
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            {(['7d', '30d', '90d'] as AdminAnalyticsDateRange[]).map((range) => {
              const active = analyticsState.range === range;
              return (
                <button
                  key={range}
                  type="button"
                  onClick={() => handleRangeChange(range)}
                  className={[
                    'rounded-xl px-3 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800',
                  ].join(' ')}
                >
                  {range === '7d' ? t('filters.last7Days') : range === '30d' ? t('filters.last30Days') : t('filters.last90Days')}
                </button>
              );
            })}
          </div>
        }
      />

      {showInitialLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <AnalyticsMetricSkeleton key={`metric-skeleton-${index}`} />
          ))}
        </div>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          title={t('metrics.totalVisitors')}
          value={formatAdminNumber(analytics?.summary.totalVisitors ?? 0, locale)}
          hint={t('hints.totalVisitors')}
          icon={<Users className="h-5 w-5" />}
          accent="googleBlue"
        />
        <AdminMetricCard
          title={t('metrics.uniqueVisitors')}
          value={formatAdminNumber(analytics?.summary.uniqueVisitors ?? 0, locale)}
          hint={t('hints.uniqueVisitors')}
          icon={<Users className="h-5 w-5" />}
          accent="googleGreen"
        />
        <AdminMetricCard
          title={t('metrics.activeVisitors')}
          value={formatAdminNumber(analytics?.summary.activeVisitors ?? 0, locale)}
          hint={t('hints.activeVisitors')}
          icon={<Activity className="h-5 w-5" />}
          accent="googleBlue"
        />
        <AdminMetricCard
          title={t('metrics.pageViews')}
          value={formatAdminNumber(analytics?.summary.pageViews ?? 0, locale)}
          hint={t('hints.pageViews')}
          icon={<Eye className="h-5 w-5" />}
          accent="googleBlue"
        />
        <AdminMetricCard
          title={t('metrics.sessions')}
          value={formatAdminNumber(analytics?.summary.sessions ?? 0, locale)}
          hint={t('hints.sessions')}
          icon={<Activity className="h-5 w-5" />}
          accent="googleGreen"
        />
        <AdminMetricCard
          title={t('metrics.engagementRate')}
          value={formatPercent(analytics?.summary.engagementRate ?? 0)}
          hint={t('hints.engagementRate')}
          icon={<MousePointerClick className="h-5 w-5" />}
          accent="googleGreen"
        />
        <AdminMetricCard
          title={t('metrics.bounceRate')}
          value={formatPercent(analytics?.summary.bounceRate ?? 0)}
          hint={t('hints.bounceRate')}
          icon={<Activity className="h-5 w-5" />}
          accent="googleRed"
        />
        <AdminMetricCard
          title={t('metrics.averageSessionDuration')}
          value={toReadableDuration(analytics?.summary.averageSessionDurationSeconds ?? 0)}
          hint={t('hints.averageSessionDuration')}
          icon={<Clock3 className="h-5 w-5" />}
          accent="googleYellow"
        />
      </div>
      )}

      {showInitialLoading ? (
        <AdminPanel title={t('panels.liveActiveVisitorsTitle')} description={t('panels.liveActiveVisitorsDescription')}>
          <AnalyticsPanelSkeleton heightClassName="h-56" />
        </AdminPanel>
      ) : realtime ? (
        <AdminPanel title={t('panels.liveActiveVisitorsTitle')} description={t('panels.liveActiveVisitorsDescription')}>
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('realtime.totalActiveUsers')}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">
                {formatAdminNumber(realtime.totalActiveUsers || analytics.summary.activeVisitors || 0, locale)}
              </p>
            </div>

            {[{
              key: 'topCountries',
              title: t('realtime.locationCountries'),
              items: realtime.topCountries,
            }, {
              key: 'topCities',
              title: t('realtime.locationCities'),
              items: realtime.topCities,
            }, {
              key: 'devices',
              title: t('realtime.devices'),
              items: realtime.devices,
            }, {
              key: 'browsers',
              title: t('realtime.browsers'),
              items: realtime.browsers,
            }].map((section) => (
              <div key={section.key} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{section.title}</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                  {section.items?.length ? section.items.slice(0, 5).map((item) => (
                    <li key={item.label} className="flex items-center justify-between gap-2">
                      <span className="truncate" title={item.label}>{item.label}</span>
                      <span className="font-semibold">{formatAdminNumber(item.activeUsers, locale)}</span>
                    </li>
                  )) : (
                    <li className="text-xs text-slate-500 dark:text-slate-400">{t('realtime.noActiveUsers')}</li>
                  )}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('realtime.activePages')}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {realtime.activePages?.length ? realtime.activePages.slice(0, 8).map((item) => (
                <div key={item.path} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
                  <span className="truncate" title={item.path}>{item.path}</span>
                  <span className="shrink-0 font-semibold">{formatAdminNumber(item.activeUsers, locale)}</span>
                </div>
              )) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('realtime.noActiveUsers')}</p>
              )}
            </div>
          </div>
        </AdminPanel>
      ) : null}

      {showInitialLoading ? (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            <AdminPanel title={t('charts.dailyVisitorsTitle')} description={t('charts.dailyVisitorsDescription')}>
              <AnalyticsPanelSkeleton />
            </AdminPanel>
            <AdminPanel title={t('charts.trafficSourcesTitle')} description={t('charts.trafficSourcesDescription')}>
              <AnalyticsPanelSkeleton />
            </AdminPanel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AdminPanel title={t('charts.deviceUsageTitle')} description={t('charts.deviceUsageDescription')}>
              <AnalyticsPanelSkeleton />
            </AdminPanel>
            <AdminPanel title={t('charts.topCountriesTitle')} description={t('charts.topCountriesDescription')}>
              <AnalyticsPanelSkeleton />
            </AdminPanel>
          </div>
        </>
      ) : analyticsState.error && !analytics ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-900/30 dark:text-rose-200">
          {analyticsState.error}
        </div>
      ) : analytics ? (
        <>
          {analyticsState.error ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
              {analyticsState.error}
            </div>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-2">
            <AdminPanel title={t('charts.dailyVisitorsTitle')} description={t('charts.dailyVisitorsDescription')}>
              {growthSeries.length ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthSeries} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={formatShortDate} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => formatAdminNumber(Number(value || 0), locale)} />
                    <Legend />
                    <Line type="monotone" dataKey="visitors" stroke={GA_COLORS.visitors} strokeWidth={2.4} dot={false} name={t('legends.visitors')} />
                    <Line type="monotone" dataKey="sessions" stroke={GA_COLORS.sessions} strokeWidth={2.2} dot={false} name={t('legends.sessions')} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              ) : (
                <EmptyPanelState label={t('empty')} />
              )}
            </AdminPanel>

            <AdminPanel title={t('charts.trafficSourcesTitle')} description={t('charts.trafficSourcesDescription')}>
              {sourceChartData.length ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sourceChartData} dataKey="value" nameKey="name" outerRadius={110} innerRadius={55}>
                      {sourceChartData.map((entry, index) => (
                        <Cell key={entry.name} fill={entry.color || SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatAdminNumber(Number(value || 0), locale)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              ) : (
                <EmptyPanelState label={t('empty')} />
              )}
            </AdminPanel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AdminPanel title={t('charts.deviceUsageTitle')} description={t('charts.deviceUsageDescription')}>
              {deviceChartData.length ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deviceChartData} dataKey="value" nameKey="name" outerRadius={110} innerRadius={55}>
                      {deviceChartData.map((entry, index) => (
                        <Cell key={entry.name} fill={entry.color || SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatAdminNumber(Number(value || 0), locale)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              ) : (
                <EmptyPanelState label={t('empty')} />
              )}
            </AdminPanel>

            <AdminPanel title={t('charts.topCountriesTitle')} description={t('charts.topCountriesDescription')}>
              {(analytics?.topCountries || []).length ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topCountries} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => formatAdminNumber(Number(value || 0), locale)} />
                    <Bar dataKey="value" fill={GA_COLORS.countries} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              ) : (
                <EmptyPanelState label={t('empty')} />
              )}
            </AdminPanel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AdminPanel title={t('charts.topCitiesTitle')} description={t('charts.topCitiesDescription')}>
              {(analytics?.topCities || []).length ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topCities} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => formatAdminNumber(Number(value || 0), locale)} />
                    <Bar dataKey="value" fill={GA_COLORS.cities} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              ) : (
                <EmptyPanelState label={t('empty')} />
              )}
            </AdminPanel>

            <AdminPanel title={t('charts.browserUsageTitle')} description={t('charts.browserUsageDescription')}>
              {browserChartData.length ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={browserChartData} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => formatAdminNumber(Number(value || 0), locale)} />
                    <Bar dataKey="sessions" fill={GA_COLORS.browsers} radius={[6, 6, 0, 0]}>
                      {browserChartData.map((entry, index) => (
                        <Cell key={`${entry.name}-${index}`} fill={entry.color || GA_COLORS.browsers} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              ) : (
                <EmptyPanelState label={t('empty')} />
              )}
            </AdminPanel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AdminPanel title={t('charts.topPagesTitle')} description={t('charts.topPagesDescription')}>
              {(analytics?.topPages || []).length ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topPages} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="path" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => formatAdminNumber(Number(value || 0), locale)} />
                    <Bar dataKey="views" fill={GA_COLORS.visitors} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              ) : (
                <EmptyPanelState label={t('empty')} />
              )}
            </AdminPanel>

            <AdminPanel title={t('panels.topContentTitle')} description={t('panels.topContentDescription')}>
              {topEngagementPages.length ? (
              <div className="space-y-3">
                {topEngagementPages.map((item, index) => (
                  <div
                    key={`${item.path}-${index}`}
                    className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800"
                  >
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100" title={item.title || item.path}>{item.title || item.path}</p>
                    <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400" title={item.path}>{item.path}</p>
                    <div className="mt-2 grid grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300">
                      <span>{t('table.views')}: {formatAdminNumber(item.views, locale)}</span>
                      <span>{t('table.engagement')}: {formatPercent(item.engagementRate)}</span>
                      <span>{t('table.duration')}: {toReadableDuration(item.avgEngagementSeconds)}</span>
                    </div>
                  </div>
                ))}
              </div>
              ) : (
                <EmptyPanelState label={t('empty')} />
              )}
            </AdminPanel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AdminPanel title={t('panels.landingPagesTitle')} description={t('panels.landingPagesDescription')}>
              {(analytics?.topLandingPages || []).length ? (
              <div className="space-y-3">
                {(analytics.topLandingPages || []).map((item, index) => (
                  <div
                    key={`${item.landingPage}-${index}`}
                    className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800"
                  >
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100" title={item.landingPage}>{item.landingPage}</p>
                    <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300 sm:grid-cols-4">
                      <span>{t('table.sessions')}: {formatAdminNumber(item.sessions, locale)}</span>
                      <span>{t('table.engagement')}: {formatPercent(item.engagementRate)}</span>
                      <span>{t('table.bounce')}: {formatPercent(item.bounceRate)}</span>
                      <span>{t('table.duration')}: {toReadableDuration(item.avgEngagementSeconds)}</span>
                    </div>
                  </div>
                ))}
              </div>
              ) : (
                <EmptyPanelState label={t('empty')} />
              )}
            </AdminPanel>

            <AdminPanel title={t('panels.audienceBreakdownTitle')} description={t('panels.audienceBreakdownDescription')}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('audience.operatingSystems')}</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {(analytics.operatingSystemUsage || []).slice(0, 6).map((item) => (
                    <li key={item.label} className="flex items-center justify-between gap-3">
                      <span className="truncate dark:text-slate-200">{item.label}</span>
                      <span className="font-semibold">{formatAdminNumber(item.sessions, locale)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('audience.referrers')}</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {(analytics.referrers || []).slice(0, 6).map((item) => (
                    <li key={item.label} className="flex items-center justify-between gap-3">
                      {isHttpUrl(item.label) ? (
                        <a
                          href={item.label}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-sky-700 underline decoration-sky-300 underline-offset-2 transition-colors hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-200"
                          title={item.label}
                        >
                          {item.label}
                        </a>
                      ) : (
                        <span className="truncate dark:text-slate-200" title={item.label}>{item.label}</span>
                      )}
                      <span className="font-semibold">{formatAdminNumber(item.sessions, locale)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            </AdminPanel>
          </div>
        </>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          {t('empty')}
        </div>
      )}

      {analytics?.generatedAt ? (
        <p className="text-right text-xs text-slate-500 dark:text-slate-400">{common('generatedAt')}: {new Date(analytics.generatedAt).toLocaleString()}</p>
      ) : null}
    </div>
  );
}
