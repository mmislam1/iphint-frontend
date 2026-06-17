'use client';

import React, { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchDashboardData, fetchAlerts } from '@/lib/store/slices/userSlice';
import { StatCard } from '@/components/dashboard/StatCard';
import { NewScanBanner } from '@/components/dashboard/NewScanBanner';
import { generateReferralWindow } from '@/lib/store/slices/accountSlice';
import { 
  CheckCircle2, 
  ChevronRight, 
  AlertTriangle, 
  UserPlus, 
  Check, 
  Copy 
} from 'lucide-react';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const locale = useLocale();
  const dispatch = useAppDispatch();

  const localizeNotificationText = (value: string) => {
    if (!value || locale !== 'kr') return value;

    const normalized = value.trim();

    if (/^Your free trial has ended\. Upgrade to continue using the service\.?$/i.test(normalized)) {
      return '무료 체험이 종료되었습니다. 서비스를 계속 이용하려면 업그레이드하세요.';
    }

    const trialEndingMatch = normalized.match(
      /^Your free trial ends in (\d+) day(?:s)?\. Upgrade to keep access\.?$/i,
    );
    if (trialEndingMatch) {
      const days = trialEndingMatch[1];
      return `무료 체험이 ${days}일 후 종료됩니다. 이용을 유지하려면 업그레이드하세요.`;
    }

    return value;
  };
  
  // Get user data for name and referral code
  const user = useAppSelector((state) => state.user);
  const { stats, latestSearches, alerts, loading } = useAppSelector((state) => state.user);

  // State for copy feedback
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardData());
    dispatch(fetchAlerts());
  }, [dispatch]);

  // Fail-safe copy logic for all devices
  const handleCopyReferral = async () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    let code = user?.referralCode || 'WELCOME';

    try {
      // Keep the quick-copy behavior, but activate the 24-hour window first.
      const referralStatus = await dispatch(generateReferralWindow()).unwrap();
      code = referralStatus?.referralCode || code;

      const referralUrl = `${baseUrl}/signup?ref=${code}`;
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(referralUrl);
      } else {
        // Fallback for non-HTTPS or older mobile browsers
        const textArea = document.createElement("textarea");
        textArea.value = referralUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        const body = document.body;

        if (!body) {
          throw new Error('Document body is unavailable for clipboard fallback.');
        }

        body.appendChild(textArea);

        try {
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
        } finally {
          textArea.remove();
        }
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to generate/copy referral link', err);
    }
  };

  if (loading && !stats) {
    return <div className="p-4 text-gray-500 sm:p-8">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen p-3 font-sans text-gray-900 sm:p-6 lg:p-10">
      
      {/* --- HEADER WITH POPPING BUTTON --- */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center sm:mb-10">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-col items-start gap-3 sm:gap-4">
            <h1
              className="max-w-full truncate text-2xl font-bold tracking-tight text-black sm:text-3xl"
              title={t('welcome', { name: user?.name || 'User' })}
            >
              {t('welcome', { name: user?.name || 'User' })}
            </h1>
            <p className="mt-1 max-w-full truncate text-sm text-gray-500 sm:text-base" title={t('overview')}>
              {t('overview')}
            </p>
            <button
              onClick={handleCopyReferral}
              className={`
                group relative flex w-full max-w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300 sm:w-auto sm:px-5 sm:py-2.5
                ${copied 
                  ? 'border border-gray-300 bg-white text-gray-900 shadow-sm' 
                  : 'bg-gray-900 text-white shadow-sm hover:bg-black hover:-translate-y-0.5 active:scale-95'
                }
              `}
            >
              {/* Ping Animation for "Popping" visibility */}
              {!copied && (
                <span className="absolute inset-0 rounded-full bg-white opacity-10 pointer-events-none"></span>
              )}
              
              {copied ? (
                <>
                  <Check size={14} strokeWidth={3} className="animate-bounce" />
                  <span className="min-w-0 truncate">{t('copied') || 'Copied!'}</span>
                </>
              ) : (
                <>
                  <UserPlus size={14} strokeWidth={3} />
                  <span className="min-w-0 truncate">{t('referralLink') || 'Referral Link'}</span>
                  <Copy size={12} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </button>
          </div>
          
        </div>
      </div>

      {/* --- STATS ROW --- */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 sm:mb-8 sm:gap-6">
        <StatCard title={t('totalScans')} value={stats?.totalScans || 0} />
        <StatCard title={t('matchesFound')} value={stats?.totalMatches || 0} />
        <StatCard title="Monitor Complete" value={stats?.monitorComplete || 0} />
        <StatCard title="Pending Review" value={stats?.pendingReview || 0} />
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 sm:gap-8">
        
        {/* Left Column: Banner & Recent Scans */}
        <div className="space-y-6 lg:col-span-2 sm:space-y-8">
          <NewScanBanner t={t} />

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-4 md:p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="max-w-full truncate text-lg font-bold text-black sm:text-xl" title={t('recentScans')}>
                {t('recentScans')}
              </h3>
              <button className="max-w-full truncate text-left text-sm font-bold text-gray-900 hover:underline sm:text-right" title={t('viewAll')}>
                {t('viewAll')}
              </button>
            </div>
            
            <div className="divide-y divide-gray-300">
              {latestSearches.map((search) => (
                <Link key={search.searchId} href={`/user/searches/${search.searchId}`} className="block first:pt-0 last:pb-0">
                  <div className="group cursor-pointer border border-transparent bg-gray-50/50 p-3 transition-all hover:border-gray-100 hover:bg-gray-200 sm:p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-200 shadow-sm sm:h-14 sm:w-14">
                          <img src={search.image} alt="scan" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p
                            className="max-w-full truncate font-bold text-gray-900 transition-colors group-hover:text-gray-700 sm:max-w-[220px]"
                            title={search.fileName}
                          >
                            {search.fileName}
                          </p>
                          <p
                            className="mt-0.5 truncate text-xs font-medium text-gray-400"
                            title={new Date(search.time).toLocaleDateString()}
                          >
                            {new Date(search.time).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex min-w-0 items-center justify-between gap-4 sm:justify-end sm:gap-6">
                        <div className="min-w-0 text-left sm:text-right">
                          <p className="truncate font-bold text-gray-900" title={`${search.resultCount} ${t('matches')}`}>
                            {search.resultCount} {t('matches')}
                          </p>
                          <p className="flex items-center gap-1 overflow-hidden text-[10px] font-black uppercase tracking-wider text-gray-600 sm:justify-end">
                            <CheckCircle2 size={12} className="shrink-0" />
                            <span className="truncate">{t(search.status)}</span>
                          </p>
                        </div>
                        <ChevronRight size={20} className="shrink-0 text-gray-300 transition-colors group-hover:text-black" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {latestSearches.length === 0 && (
                <p className="py-8 text-center text-sm italic text-gray-400 sm:py-10">No recent scans found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Alerts & Quick Actions */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* Recent Alerts */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
            <h3 className="mb-5 max-w-full truncate text-lg font-bold text-black sm:mb-6 sm:text-xl" title={t('recentAlerts')}>
              {t('recentAlerts')}
            </h3>
            <div className="mb-5 divide-y divide-gray-300 sm:mb-6">
              {alerts.slice(0, 3).map((alert, index) => (
                <div key={alert._id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                    <div className={`mt-1 shrink-0 rounded-lg p-2 ${index === 0 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}>
                      {index === 0 ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold leading-snug text-gray-900" title={localizeNotificationText(alert.title)}>{localizeNotificationText(alert.title)}</p>
                      <p className="mt-1 truncate text-[10px] font-medium text-gray-400" title={new Date(alert.timestamp).toLocaleString()}>
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full truncate border-t border-gray-50 pt-4 text-center text-sm font-bold text-gray-900 hover:underline" title={t('viewAllAlerts')}>
              {t('viewAllAlerts')}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
            <h3 className="mb-5 max-w-full truncate text-lg font-bold text-black sm:mb-6 sm:text-xl" title={t('quickActions')}>
              {t('quickActions')}
            </h3>
            <div className="space-y-3">
              <Link href="/user/searches" className="block w-full truncate rounded-xl border border-gray-200 px-4 py-3 text-left text-sm font-bold text-gray-700 transition-all hover:border-gray-900 hover:bg-gray-50 sm:px-5 sm:py-4" title={t('newScanAction')}>
                {t('newScanAction')}
              </Link>
              <Link href="/user/monitoring" className="block w-full truncate rounded-xl border border-gray-200 px-4 py-3 text-left text-sm font-bold text-gray-700 transition-all hover:border-gray-900 hover:bg-gray-50 sm:px-5 sm:py-4" title={t('viewMonitoringAction')}>
                {t('viewMonitoringAction')}
              </Link>
              <Link href="/user/billing" className="block w-full truncate rounded-xl border border-gray-200 px-4 py-3 text-left text-sm font-bold text-gray-700 transition-all hover:border-gray-900 hover:bg-gray-50 sm:px-5 sm:py-4" title={t('generateReportAction')}>
                {t('generateReportAction')}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}