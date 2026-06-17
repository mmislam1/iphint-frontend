'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { apiClient, getApiErrorMessage } from '@/lib/api';

export default function ResetPasswordPage() {
  const t = useTranslations('Auth.resetPasswordPage');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => (searchParams.get('token') || '').trim(), [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isStrongPassword = (value: string) => {
    if (value.length < 8 || value.length > 128) return false;
    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);
    return hasLower && hasUpper && hasDigit && hasSpecial;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError(t('missingTokenError'));
      return;
    }

    if (!isStrongPassword(password)) {
      setError(t('weakPasswordError'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('mismatchError'));
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiClient.post('/auth/reset-password', { token, password });
      setSuccess(response.data?.message || t('success'));
      setTimeout(() => router.push('/login'), 1200);
    } catch (err) {
      setError(getApiErrorMessage(err, t('error')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-6 py-16 text-gray-900 sm:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">{t('eyebrow')}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">{t('title')}</h1>
        <p className="mt-4 text-base leading-7 text-gray-600 sm:text-lg">
          {t('description')}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-black">{t('newPasswordLabel')}</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('newPasswordPlaceholder')}
              className="input-field"
            />
            <p className="mt-2 text-xs text-gray-500">{t('helper')}</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-black">{t('confirmPasswordLabel')}</label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder={t('confirmPasswordPlaceholder')}
              className="input-field"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                <span>{t('submitLoading')}</span>
              </>
            ) : (
              t('submit')
            )}
          </button>

          {success && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{success}</p>}
          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        </form>

        <div className="mt-6">
          <Link href="/login" className="rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50">
            {t('backToLogin')}
          </Link>
        </div>
      </div>
    </main>
  );
}
