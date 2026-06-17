'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export default function AdminPanel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
    >
      <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-5">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-100">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
        </div>
        {actions ? <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:shrink-0 sm:justify-end">{actions}</div> : null}
      </div>

      <div className="px-4 py-4 sm:px-6 sm:py-5">{children}</div>
    </section>
  );
}