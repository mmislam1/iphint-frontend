'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboardLayout/Sidebar';
import Topbar from '@/components/dashboardLayout/Topbar';
import TrialActivationModal from '@/components/user/TrialActivationModal';
import { usePathname } from '@/i18n/routing';
import { hasSubscriptionAccess } from '@/lib/billingAccess';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchSubscriptionSnapshot } from '@/lib/store/slices/accountSlice';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const subscriptionState = useAppSelector((state) => state.account.subscription);
  const hasAccess = hasSubscriptionAccess(subscriptionState.data);
  const subscriptionLoading = subscriptionState.loading || (!subscriptionState.data && !subscriptionState.error);
  const isBillingRoute = pathname === '/user/billing' || pathname.startsWith('/user/billing/');
  const shouldGateUserContent = !hasAccess && !isBillingRoute;

  useEffect(() => {
    dispatch(fetchSubscriptionSnapshot());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 lg:pl-60">
      <Sidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div className="min-h-screen">
        <Topbar onMenuClick={() => setMobileSidebarOpen((previous) => !previous)} />

        <main className="min-h-screen px-4 py-5 sm:px-6 sm:py-6">
          <div className="mx-auto w-full space-y-6">
            {shouldGateUserContent ? (
              <div className="min-h-[60vh] rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="h-6 w-44 animate-pulse rounded bg-gray-100" />
                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="h-28 animate-pulse rounded-lg bg-gray-100" />
                  <div className="h-28 animate-pulse rounded-lg bg-gray-100" />
                  <div className="h-28 animate-pulse rounded-lg bg-gray-100" />
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>

      {shouldGateUserContent && (
        <TrialActivationModal
          snapshot={subscriptionState.data}
          loading={subscriptionLoading}
          error={subscriptionState.error}
        />
      )}
    </div>
  );
}
