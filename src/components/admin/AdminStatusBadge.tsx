'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const toneMap = {
  success: 'border-black bg-black text-white',
  warning: 'border-slate-700 bg-slate-700 text-white',
  danger: 'border-slate-900 bg-slate-900 text-white',
  trial: 'border-slate-800 bg-slate-800 text-white',
  muted: 'border-slate-300 bg-slate-200 text-slate-800',
  neutral: 'border-slate-200 bg-slate-100 text-slate-700',
  info: 'border-slate-500 bg-white text-slate-900',
} as const;

const getTone = (value: string) => {
  const normalizedValue = value.toLowerCase();
  const compactValue = normalizedValue.replace(/[_\s]+/g, '');

  if (['active', 'completed', 'approved', 'reviewed'].includes(compactValue)) {
    return 'success';
  }

  if (compactValue === 'trialing') {
    return 'trial';
  }

  if (['processing', 'underanalysis', 'reviewpending', 'pending', 'pastdue'].includes(compactValue)) {
    return 'warning';
  }

  if (['failed', 'inactive'].includes(compactValue)) {
    return 'danger';
  }

  if (['cancelled', 'expired', 'paused'].includes(compactValue)) {
    return 'muted';
  }

  if (['admin', 'pro'].includes(compactValue)) {
    return 'info';
  }

  if (compactValue === 'notreviewed') {
    return 'neutral';
  }

  return 'neutral';
};

export default function AdminStatusBadge({ value, label }: { value: string; label?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize',
        toneMap[getTone(value)],
      )}
    >
      {label ?? value}
    </span>
  );
}