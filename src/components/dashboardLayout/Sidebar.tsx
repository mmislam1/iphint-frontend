'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { LayoutDashboard, Search, Activity, CreditCard, Settings, LogOut, UserCircle2, FileText, Crown, Users, ShieldCheck } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchCurrentUserProfile, logout } from '@/lib/store/slices/userSlice';
import { fetchSubscriptionSnapshot } from '@/lib/store/slices/accountSlice';

const PLACEHOLDER_NAMES = new Set(['user', 'new user', 'unknown user']);

const closeOnMobileOnly = (onClose: () => void) => {
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    onClose();
  }
};

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const adminT = useTranslations('Admin');
  const dashboardT = useTranslations('Dashboard');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.user);
  const subscriptionSnapshot = useAppSelector((state) => state.account.subscription.data);
  const subscriptionLoading = useAppSelector((state) => state.account.subscription.loading);
  const hasEffectivePlan =
    !!subscriptionSnapshot?.subscription &&
    ((subscriptionSnapshot.subscription.hasAccess === true) ||
      ['active', 'trialing', 'past_due'].includes(subscriptionSnapshot.subscription.status || ''));
  const planInfo = {
    name: hasEffectivePlan
      ? (subscriptionSnapshot?.plan?.name ?? '--')
      : (subscriptionLoading ? dashboardT('sidebar.loadingPlan') : '--'),
    tier: hasEffectivePlan ? (subscriptionSnapshot?.plan?.tier ?? null) : null,
    subscriptionStatus: subscriptionSnapshot?.subscription?.status || null,
  };
  const menu = [
    { label: dashboardT('sidebar.dashboard'), href: '/user', icon: LayoutDashboard },
    { label: dashboardT('sidebar.searches'), href: '/user/searches', icon: Search },
    { label: dashboardT('sidebar.monitoring'), href: '/user/monitoring', icon: Activity },
    { label: dashboardT('sidebar.reports'), href: '/user/reports', icon: FileText },
    { label: dashboardT('sidebar.referral'), href: '/user/referral', icon: Users },
    { label: dashboardT('sidebar.billing'), href: '/user/billing', icon: CreditCard },
    { label: dashboardT('sidebar.settings'), href: '/user/settings', icon: Settings },
  ];

  const normalizedUserName = (user.name || '').trim();
  const emailLocalPart = (user.email || '').split('@')[0]?.trim() || '';
  const displayName =
    normalizedUserName && normalizedUserName.toLowerCase() !== 'user'
      ? normalizedUserName
      : emailLocalPart || dashboardT('sidebar.userFallback');
  const company = user.role || dashboardT('sidebar.organizationFallback');
  const isAdmin = user.role === 'admin';
  const showUpgradeAction =
    !hasEffectivePlan ||
    planInfo.tier === 'starter' ||
    planInfo.tier === 'pro';

  const isItemActive = (href: string) => {
    if (href === '/user') return pathname === '/user';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('lastActivityAt');
    }
    dispatch(logout());
    router.replace('/login?loggedOut=1');
  };

  useEffect(() => {
    dispatch(fetchSubscriptionSnapshot());
  }, [dispatch]);

  useEffect(() => {
    if (!user.token) {
      return;
    }

    const normalizedName = (user.name || '').trim().toLowerCase();
    const shouldHydrateProfile = !user.email || !normalizedName || PLACEHOLDER_NAMES.has(normalizedName);

    if (shouldHydrateProfile) {
      dispatch(fetchCurrentUserProfile());
    }
  }, [dispatch, user.email, user.name, user.token]);

  return (
    <>
      {open && (
        <button
          aria-label={dashboardT('sidebar.closeOverlay')}
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 w-60 border-r border-gray-200 bg-white shadow-sm transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex h-full flex-col">
          <button
            type="button"
            onClick={() => {
              closeOnMobileOnly(onClose);
              router.push('/user');
            }}
            className="flex h-16 cursor-pointer items-center border-b border-gray-200 px-4"
            aria-label={dashboardT('sidebar.goToDashboard')}
          >
            <Image src="/logo_mo.svg" alt="IPHINT" width={102} height={28} priority className="h-7 w-auto" />
          </button>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {menu.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => closeOnMobileOnly(onClose)}
                  className={[
                    'flex items-center gap-3 rounded-lg px-4 py-2 text-sm leading-5 font-medium transition-colors',
                    active
                      ? 'bg-gray-100 text-black'
                      : 'text-gray-700 hover:bg-gray-50',
                  ].join(' ')}
                >
                  <Icon size={18} strokeWidth={2} className={active ? 'text-gray-900' : 'text-gray-500'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-200 px-3 py-3">
            <div className="mb-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{dashboardT('sidebar.currentPlan')}</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-gray-900">{planInfo.name}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                  <Crown className="h-3 w-3" />
                  {planInfo.tier ? planInfo.tier.toUpperCase() : '--'}
                </span>
              </div>

              {showUpgradeAction && (
                <button
                  type="button"
                  onClick={() => {
                    closeOnMobileOnly(onClose);
                    router.push('/user/billing');
                  }}
                  className="mt-2 w-full cursor-pointer rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                >
                  {!hasEffectivePlan ? dashboardT('sidebar.buyNow') : dashboardT('sidebar.upgradePlan')}
                </button>
              )}
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  closeOnMobileOnly(onClose);
                  router.push('/admin');
                }}
                className="mb-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm leading-5 font-medium text-white hover:bg-gray-800"
              >
                <ShieldCheck size={16} strokeWidth={2} className="text-white" />
                <span>{adminT('common.goToAdmin')}</span>
              </button>
            )}

            <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
              <UserCircle2 className="h-8 w-8 text-gray-500" strokeWidth={1.8} />
              <div className="min-w-0">
                <p className="truncate text-sm leading-5 font-medium text-gray-900">{displayName}</p>
                <p className="truncate text-xs leading-4 text-gray-500">{company}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-5 font-medium text-gray-700 hover:bg-gray-50"
            >
              <LogOut size={16} strokeWidth={2} className="text-gray-600" />
              <span>{dashboardT('sidebar.logout')}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
