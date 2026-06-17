'use client';

import React from 'react';

export default function AdminPagination({
  page,
  pages,
  total,
  visibleCount,
  onPageChange,
  previousLabel,
  nextLabel,
  summaryLabel,
}: {
  page: number;
  pages: number;
  total: number;
  visibleCount: number;
  onPageChange: (page: number) => void;
  previousLabel: string;
  nextLabel: string;
  summaryLabel: string;
}) {
  const hasPrevious = page > 1;
  const hasNext = page < pages;

  return (
    <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm break-words text-slate-500">{summaryLabel.replace('{count}', String(visibleCount)).replace('{total}', String(total))}</p>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <button
          type="button"
          disabled={!hasPrevious}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50 sm:flex-none"
        >
          {previousLabel}
        </button>
        <div className="inline-flex h-10 flex-1 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-600 sm:flex-none">
          {page}/{Math.max(pages, 1)}
        </div>
        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50 sm:flex-none"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}