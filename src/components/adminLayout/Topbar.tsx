'use client';

import React from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LocaleSwitcher from '@/components/layout/LocaleSwitcher';

export default function AdminTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const t = useTranslations('Admin');

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="truncate text-lg font-semibold tracking-tight leading-none text-slate-950">{t('topbar.title')}</h1>
        </div>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-800 sm:flex">
            <ShieldCheck className="h-4 w-4 text-slate-900" />
            <span>{t('topbar.session')}</span>
          </div>
        </div>
      </div>
    </header>
  );
}