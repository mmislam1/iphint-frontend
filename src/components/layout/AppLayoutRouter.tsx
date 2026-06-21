'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import PublicLayout from '@/components/layout/PublicLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import { routing } from '@/i18n/routing';
import Header from '@/components/navbar';
import Footer from '@/components/footer';

const publicChromePaths = new Set([
  '/',
  '/about',
  '/api',
  '/contact',
  '/forgot-password',
  '/login',
  '/register',
  '/reset-password',
  '/signup',
  '/signup/verification-request',
  '/service',
  '/pricing',
  '/privacy_policy',
  '/refund_policy',
  '/terms_of_service',
  '/usage_policy',
]);

export default function AppLayoutRouter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const localePattern = routing.locales.join('|');
  const localelessPath = pathname.replace(new RegExp(`^\/(?:${localePattern})(?=\/|$)`), '') || '/';
  const normalizedPath = localelessPath !== '/' && localelessPath.endsWith('/')
    ? localelessPath.slice(0, -1)
    : localelessPath;
  const isDashboardRoute = normalizedPath === '/user' || normalizedPath.startsWith('/user/');
  const isAdminRoute = normalizedPath === '/admin' || normalizedPath.startsWith('/admin/');
  const shouldShowPublicChrome = publicChromePaths.has(normalizedPath);

  if (isDashboardRoute) {
    return (
      <ProtectedRoute>
        <DashboardLayout>{children}</DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (isAdminRoute) {
    return (
      <AdminRoute>
        <AdminLayout>{children}</AdminLayout>
      </AdminRoute>
    );
  }

  const content = <PublicLayout>{children}</PublicLayout>;

  if (!shouldShowPublicChrome) {
    return content;
  }

  return (
    <>
      <Header />
      {content}
      <Footer />
    </>
  );
}
