'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  Copy,
  Check,
  Users,
  Gift,
  Trophy,
  Link2,
  AlertCircle,
} from 'lucide-react';
import { fetchReferralStatus } from '@/lib/store/slices/accountSlice';

export default function ReferralPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { data: status, loading, error } = useAppSelector((state) => state.account.referral);
  const [copied, setCopied] = useState(false);
  const t = useTranslations('UserPanel.referral');

  useEffect(() => {
    dispatch(fetchReferralStatus());
  }, [dispatch]);

  const handleCopy = async () => {
    const code = status?.referralCode || user?.referralCode || '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/signup?ref=${code}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        const body = document.body;

        if (!body) {
          throw new Error('Document body is unavailable for clipboard fallback.');
        }

        body.appendChild(ta);

        try {
          ta.focus();
          ta.select();
          document.execCommand('copy');
        } finally {
          ta.remove();
        }
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* silent */ }
  };

  const referralCode = status?.referralCode || user?.referralCode || '';
  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/signup?ref=${referralCode}`
    : `/signup?ref=${referralCode}`;

  const progress = status ? Math.min((status.completedInWindow / status.milestoneTarget) * 100, 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('title')}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t('description')}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          <AlertCircle size={16} className="text-gray-600" />
          {error}
        </div>
      )}

      {/* Reward milestone card */}
      <div className={`rounded-2xl border p-6 ${status?.milestoneReached ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${status?.milestoneReached ? 'bg-gray-900' : 'bg-gray-100'}`}>
              <Trophy size={20} className={status?.milestoneReached ? 'text-white' : 'text-gray-700'} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{t('milestoneTitle')}</p>
              <p className="text-xs text-gray-500">{t('milestoneDescription', { target: status?.milestoneTarget ?? 5 })}</p>
            </div>
          </div>
          {status?.milestoneReached && (
            <span className="shrink-0 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">{t('milestoneUnlocked')}</span>
          )}
        </div>

        {!status?.milestoneReached && (
          <div className="mt-5">
            <div className="mb-1 flex justify-between text-xs text-gray-500">
              <span>{t('progress')}</span>
              <span>{status?.completedInWindow ?? 0} / {status?.milestoneTarget ?? 5}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gray-900 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <Users size={20} className="mx-auto mb-1 text-gray-700" />
          <p className="text-2xl font-bold text-gray-900">{status?.totalReferrals ?? 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">{t('totalSignups')}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <Check size={20} className="mx-auto mb-1 text-gray-700" />
          <p className="text-2xl font-bold text-gray-900">{status?.completedInWindow ?? 0}</p>
          <p className="text-xs text-gray-500 mt-0.5">{t('completedReferrals')}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <Gift size={20} className="mx-auto mb-1 text-gray-700" />
          <p className="text-2xl font-bold text-gray-900">{status?.milestoneReached ? '1' : '0'}</p>
          <p className="text-xs text-gray-500 mt-0.5">{t('rewardsEarned')}</p>
        </div>
      </div>

      {/* Referral link card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link2 size={18} className="text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">{t('referralLinkTitle')}</h2>
        </div>

        {/* URL display */}
        <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 sm:flex-row sm:items-center">
          <span className="flex-1 truncate text-sm text-gray-700 font-mono">{referralUrl}</span>
          <button
            onClick={handleCopy}
            className={`flex w-full shrink-0 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:w-auto ${
              copied ? 'bg-gray-700 text-white' : 'bg-gray-900 text-white hover:bg-black'
            }`}
          >
            {copied ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />}
            {copied ? t('copied') : t('copy')}
          </button>
        </div>

        <p className="text-xs text-gray-400">
          {t('codeLabel')} <span className="font-mono font-semibold text-gray-600">{referralCode}</span>
          &nbsp;· {t('codeNote')}
        </p>
      </div>

      {/* Referral status card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Link2 size={18} className="text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900">{t('referralStatusTitle')}</h2>
        </div>

        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-500">
          {t('referralStatusNote')}
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">{t('howItWorksTitle')}</h2>
        <ol className="space-y-3">
          {[
            { step: '1', text: t('step1') },
            { step: '2', text: t('step2') },
            { step: '3', text: t('step3') },
          ].map(({ step, text }) => (
            <li key={step} className="flex items-start gap-3 text-sm text-gray-600">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                {step}
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
