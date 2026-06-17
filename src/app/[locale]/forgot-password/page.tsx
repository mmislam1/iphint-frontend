'use client';

import { FormEvent, useState } from 'react';
import { Link } from '@/i18n/routing';
import { apiClient, getApiErrorMessage } from '@/lib/api';
import { useTranslations } from 'next-intl';

export default function ForgotPasswordPage() {
  const t = useTranslations('Auth.forgotPasswordPage');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      setSuccess(response.data?.message || t('success'));
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
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-black">{t('emailLabel')}</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t('emailPlaceholder')}
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

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800">
            {t('backToLogin')}
          </Link>
          <Link href="/signup" className="rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50">
            {t('createAccount')}
          </Link>
        </div>
      </div>
    </main>
  );
}
