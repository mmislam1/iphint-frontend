'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { apiClient, getApiErrorMessage } from '@/lib/api';
import {
  loginUser,
  logout,
  clearError,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from '@/lib/store/slices/userSlice';
import { AppDispatch } from '@/lib/store/store';
import { Link, useRouter } from '@/i18n/routing';

export default function LoginPage() {
  const locale = useLocale();
  const t = useTranslations('Auth');
  const router = useRouter();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const [hasSessionToken, setHasSessionToken] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendFailed, setResendFailed] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const alertRef = useRef<HTMLDivElement | null>(null);
  const logoutRequested = searchParams.get('loggedOut') === '1';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (searchParams.get('loggedOut') !== '1') return;

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivityAt');
    dispatch(logout());
    setHasSessionToken(false);

    if (window.history?.replaceState) {
      const current = new URL(window.location.href);
      current.searchParams.delete('loggedOut');
      window.history.replaceState(null, '', `${current.pathname}${current.search}`);
    }
  }, [dispatch, searchParams]);

  useEffect(() => {
    if (logoutRequested) {
      return;
    }

    if (!authLoading && isAuthenticated) {
      const redirectTarget = searchParams.get('redirect');
      router.push(redirectTarget || '/user');
    }
  }, [authLoading, isAuthenticated, logoutRequested, router, searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setHasSessionToken(Boolean(localStorage.getItem('token')));
  }, []);

  useEffect(() => {
    const verifyToken = searchParams.get('verifyToken');
    if (!verifyToken) return;

    const verify = async () => {
      try {
        await apiClient.get('/auth/verify-email', { params: { token: verifyToken } });
        setVerificationMessage(t('verificationSuccess'));
        setVerificationFailed(false);
      } catch (err) {
        setVerificationMessage(getApiErrorMessage(err, t('verificationError')));
        setVerificationFailed(true);
      } finally {
        if (typeof window !== 'undefined' && window.history?.replaceState) {
          const current = new URL(window.location.href);
          current.searchParams.delete('verifyToken');
          window.history.replaceState(null, '', `${current.pathname}${current.search}`);
        }
      }
    };

    verify();
  }, [searchParams, t]);

  const loading = authLoading;

  const oauthError =
    !isAuthenticated && !hasSessionToken && searchParams.get('error') === 'google_auth_failed'
      ? t('oauthError')
      : null;
  const error = authError || oauthError;
  const activeError = validationError || error;

  useEffect(() => {
    if (!oauthError) return;
    if (typeof window === 'undefined' || !window.history?.replaceState) return;

    const current = new URL(window.location.href);
    if (!current.searchParams.has('error')) return;

    current.searchParams.delete('error');
    window.history.replaceState(null, '', `${current.pathname}${current.search}`);
  }, [oauthError]);

  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(clearError());
    setValidationError(null);
    setResendMessage(null);
    setResendFailed(false);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedEmail = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!normalizedEmail) {
      setValidationError(t('validationEmailRequired'));
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(normalizedEmail)) {
      setValidationError(t('validationEmailInvalid'));
      return;
    }

    if (!password) {
      setValidationError(t('validationPasswordRequired'));
      return;
    }

    dispatch(loginUser({ email: normalizedEmail, password }));
  };

  useEffect(() => {
    if (!activeError || !alertRef.current) return;
    alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    alertRef.current.focus();
  }, [activeError]);

  const handleGoogleLogin = () => {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
    window.location.href = `${base}/auth/google`;
  };

  const handleResendVerification = async () => {
    const email = formData.email.trim();
    if (!email) {
      setResendMessage(t('resendEmailFirst'));
      setResendFailed(true);
      return;
    }

    try {
      setResendLoading(true);
      setResendMessage(null);
      setResendFailed(false);

      const response = await apiClient.post('/auth/resend-verification', { email });
      const message =
        typeof response.data?.message === 'string' && response.data.message.trim()
          ? response.data.message
          : t('resendSuccess');
      setResendMessage(message);
      setResendFailed(false);
    } catch (err) {
      setResendMessage(getApiErrorMessage(err, t('resendError')));
      setResendFailed(true);
    } finally {
      setResendLoading(false);
    }
  };

  const shouldShowResendVerification = !validationError && !!authError && /verify your email/i.test(authError);
  const illustrationSrc = locale === 'kr' ? '/login_kr.svg' : '/login.svg';

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div
          aria-hidden="true"
          className="hidden lg:block lg:min-h-screen bg-slate-100 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${illustrationSrc}')` }}
        />

        <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16 xl:px-20">
          <div className="w-full max-w-[420px]">
            <h1 className="mb-8 text-3xl font-bold text-black sm:mb-10 sm:text-4xl">{t('loginTitle')}</h1>

            <button type="button" onClick={handleGoogleLogin} className="btn-secondary btn-lg w-full mb-8 gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {t('continueWithGoogle')}
            </button>

            <div className="relative mb-4 flex items-center py-4">
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-black sm:text-base">{t('emailOnlyLabel')}</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder={t('loginEmailPlaceholder')}
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black sm:text-base">{t('passwordOnlyLabel')}</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder={t('loginPasswordPlaceholder')}
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              {activeError && (
                <div
                  ref={alertRef}
                  tabIndex={-1}
                  role="alert"
                  aria-live="polite"
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#FEE2E2] bg-[#FFF1F0] p-4 text-[#D93025]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#D93025" />
                    <path d="M12 8V12M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="text-sm font-medium">{activeError}</span>
                </div>
              )}

              {shouldShowResendVerification && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="rounded-lg border border-black px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {resendLoading ? t('resendLoading') : t('resendAction')}
                  </button>
                </div>
              )}

              <div className="flex justify-start pt-1">
                <Link href="/forgot-password" className="border-b border-black pb-0.5 text-sm font-semibold text-black transition-colors hover:text-gray-600">
                  {t('forgetPassword')}
                </Link>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
                {loading ? (
                  <>
                    <span
                      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                      aria-hidden="true"
                    />
                    <span>{t('processing')}</span>
                  </>
                ) : (
                  t('submitLogin')
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-black sm:text-base">
              {t('noAccountText')}{' '}
              <Link href="/signup" className="ml-1 border-b border-black pb-0.5 font-semibold transition-colors hover:text-gray-600">
                {t('noAccountLink')}
              </Link>
            </div>

            {resendMessage && (
              <div
                className={[
                  'mt-3 flex items-center justify-center gap-2 rounded-xl p-4',
                  resendFailed
                    ? 'border border-[#FEE2E2] bg-[#FFF1F0] text-[#D93025]'
                    : 'border border-green-200 bg-green-50 text-green-700',
                ].join(' ')}
              >
                {resendFailed ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#D93025" />
                    <path d="M12 8V12M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#16A34A" />
                    <path d="M8 12.5L10.5 15L16 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <span className="text-sm font-medium">{resendMessage}</span>
              </div>
            )}

            {verificationMessage && !error && (
              <div
                className={[
                  'mt-4 flex items-center justify-center gap-2 rounded-xl p-4',
                  verificationFailed
                    ? 'border border-[#FEE2E2] bg-[#FFF1F0] text-[#D93025]'
                    : 'border border-green-200 bg-green-50 text-green-700',
                ].join(' ')}
              >
                {verificationFailed ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#D93025" />
                    <path d="M12 8V12M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#16A34A" />
                    <path d="M8 12.5L10.5 15L16 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <span className="text-sm font-medium">{verificationMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
