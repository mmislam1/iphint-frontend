'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const accentStyles = {
  teal: 'bg-slate-950 text-white ring-1 ring-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:ring-slate-300',
  emerald: 'bg-slate-100 text-slate-900 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700',
  amber: 'bg-slate-200 text-slate-900 ring-1 ring-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:ring-slate-600',
  slate: 'bg-white text-slate-900 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700',
  rose: 'bg-rose-100 text-rose-900 ring-1 ring-rose-200 dark:bg-rose-900/40 dark:text-rose-100 dark:ring-rose-800',
  indigo: 'bg-indigo-100 text-indigo-900 ring-1 ring-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-100 dark:ring-indigo-800',
  googleBlue: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/40 dark:text-blue-100 dark:ring-blue-800',
  googleGreen: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-100 dark:ring-emerald-800',
  googleYellow: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/40 dark:text-amber-100 dark:ring-amber-800',
  googleRed: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/40 dark:text-rose-100 dark:ring-rose-800',
} as const;

export default function AdminMetricCard({
  title,
  value,
  hint,
  icon,
  accent = 'teal',
  className,
}: {
  title: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  accent?: keyof typeof accentStyles;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6',
        className,
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium wrap-break-word text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-3 wrap-break-word text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-3xl">{value}</p>
        </div>
        {icon ? (
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', accentStyles[accent])}>{icon}</div>
        ) : null}
      </div>

      {hint ? <p className="text-sm wrap-break-word text-slate-500 dark:text-slate-400">{hint}</p> : null}
    </div>
  );
}