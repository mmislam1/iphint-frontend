'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../../lib/store/slices/userSlice';
import { AppDispatch, RootState } from '../../../lib/store/store';
import { countries } from './countries';
import { Link, useRouter } from '@/i18n/routing';
import { selectIsAuthenticated, selectAuthLoading } from '../../../lib/store/slices/userSlice';

// We separate the form logic to safely use useSearchParams inside a Suspense boundary
function SignupForm() {
  const t = useTranslations('Auth');
  const searchParams = useSearchParams();
  const referralCode =
    searchParams.get('refCode') ||
    searchParams.get('ref') ||
    searchParams.get('referralCode') ||
    '';
  const dispatch = useDispatch<AppDispatch>();
  const { authError } = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/user');
    }
  }, [isAuthenticated, authLoading, router]);

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    specificRole: '',
    country: 'KR',
    phoneCode: '+82',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    companyName?: string;
    specificRole?: string;
    phoneNumber?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const passwordChecks = useMemo(
    () => ({
      minLength: formData.password.length >= 8,
      upper: /[A-Z]/.test(formData.password),
      lower: /[a-z]/.test(formData.password),
      number: /\d/.test(formData.password),
      special: /[^A-Za-z0-9]/.test(formData.password),
    }),
    [formData.password],
  );

  const isPasswordStrong = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch =
    formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;
  const hasPasswordInput = formData.password.length > 0;

  const passwordRequirementItems = [
    { key: 'minLength', label: t('passwordChecks.minLength'), met: passwordChecks.minLength },
    { key: 'upper', label: t('passwordChecks.upper'), met: passwordChecks.upper },
    { key: 'lower', label: t('passwordChecks.lower'), met: passwordChecks.lower },
    { key: 'number', label: t('passwordChecks.number'), met: passwordChecks.number },
    { key: 'special', label: t('passwordChecks.special'), met: passwordChecks.special },
  ] as const;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    dispatch(clearError());
    if (e.target.name in fieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextFieldErrors: {
      name?: string;
      companyName?: string;
      specificRole?: string;
      phoneNumber?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!formData.name.trim()) {
      nextFieldErrors.name = t('validationNameRequired');
    }

    if (!formData.companyName.trim()) {
      nextFieldErrors.companyName = t('validationBusinessRequired');
    }

    if (!formData.specificRole.trim()) {
      nextFieldErrors.specificRole = t('validationRoleRequired');
    }

    const phoneOnly = formData.phoneNumber.trim();
    if (!phoneOnly) {
      nextFieldErrors.phoneNumber = t('validationContactRequired');
    } else if (!/^[0-9\-()\s]{6,20}$/.test(phoneOnly)) {
      nextFieldErrors.phoneNumber = t('validationContactInvalid');
    }

    const email = formData.email.trim();
    if (!email) {
      nextFieldErrors.email = t('validationEmailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextFieldErrors.email = t('validationEmailInvalid');
    }

    if (!formData.password) {
      nextFieldErrors.password = t('validationPasswordRequired');
    } else if (!isPasswordStrong) {
      nextFieldErrors.password = t('passwordRequirementsError');
    }

    if (!formData.confirmPassword) {
      nextFieldErrors.confirmPassword = t('validationConfirmPasswordRequired');
    } else if (!passwordsMatch) {
      nextFieldErrors.confirmPassword = t('passwordMismatchError');
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setFieldErrors({});

    const fullPhone = `${formData.phoneCode}${formData.phoneNumber}`;

    // Referral is tracked from signup URL params and sent to backend from here.
    const submitData = {
      name: formData.name,
      companyName: formData.companyName,
      specificRole: formData.specificRole,
      country: formData.country,
      phoneNumber: fullPhone,
      email: formData.email,
      password: formData.password,
      referralCode,
    };

    const action = await dispatch(registerUser(submitData));
    if (registerUser.fulfilled.match(action) && !action.payload.token) {
      const noticeMessage = action.payload.message || '';
      const target = `/signup/verification-request?email=${encodeURIComponent(formData.email)}&message=${encodeURIComponent(noticeMessage)}`;
      router.push(target);
    }
  };

  const uniqueDialCodes = Array.from(new Set(countries.map((c) => c.dial)))
    .map((dial) => countries.find((c) => c.dial === dial))
    .sort((a, b) => (a!.dial > b!.dial ? 1 : -1));

  return (
    <div className="w-full">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-10 text-black">{t('signupTitle')}</h1>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          <div>
            {fieldErrors.name && (
              <p className="mb-1 text-xs font-medium text-red-600">{fieldErrors.name}</p>
            )}
            <label className="block text-sm sm:text-base font-semibold text-black mb-2">{t('nameLabel')}</label>
            <input
              name="name"
              type="text"
              required
              placeholder={t('namePlaceholder')}
              value={formData.name}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            {fieldErrors.companyName && (
              <p className="mb-1 text-xs font-medium text-red-600">{fieldErrors.companyName}</p>
            )}
            <label className="block text-sm sm:text-base font-semibold text-black mb-2">{t('businessLabel')}</label>
            <input
              name="companyName"
              type="text"
              required
              placeholder={t('businessPlaceholder')}
              value={formData.companyName}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            {fieldErrors.specificRole && (
              <p className="mb-1 text-xs font-medium text-red-600">{fieldErrors.specificRole}</p>
            )}
            <label className="block text-sm sm:text-base font-semibold text-black mb-2">{t('roleLabel')}</label>
            <input
              name="specificRole"
              type="text"
              required
              placeholder={t('rolePlaceholder')}
              value={formData.specificRole}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            {fieldErrors.phoneNumber && (
              <p className="mb-1 text-xs font-medium text-red-600">{fieldErrors.phoneNumber}</p>
            )}
            <label className="block text-sm sm:text-base font-semibold text-black mb-2">{t('contactLabel')}</label>
            <div className="flex border border-gray-300 rounded-[12px] overflow-hidden focus-within:ring-2 focus-within:ring-black transition-all bg-white h-14">
              <select
                name="phoneCode"
                value={formData.phoneCode}
                onChange={handleChange}
                className="px-4 py-3 bg-transparent border-r border-gray-300 outline-none cursor-pointer min-w-[80px] text-sm appearance-none"
              >
                {uniqueDialCodes.map((country, idx) => (
                  <option key={idx} value={country!.dial}>
                    {country!.dial}
                  </option>
                ))}
              </select>
              <input
                name="phoneNumber"
                type="tel"
                required
                placeholder={t('phonePlaceholder')}
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 outline-none placeholder-gray-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold text-black mb-2">{t('countryLabel')}</label>
            <div className="relative">
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="input-field cursor-pointer"
              >
                <option value="KR">{t('defaultCountry')}</option>
                <option disabled>----------</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name} {country.code}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            {fieldErrors.email && (
              <p className="mb-1 text-xs font-medium text-red-600">{fieldErrors.email}</p>
            )}
            <label className="block text-sm sm:text-base font-semibold text-black mb-2">{t('emailLabel')}</label>
            <input
              name="email"
              type="email"
              required
              placeholder={t('emailPlaceholder')}
              value={formData.email}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            {fieldErrors.password && (
              <p className="mb-1 text-xs font-medium text-red-600">{fieldErrors.password}</p>
            )}
            <label className="block text-sm sm:text-base font-semibold text-black mb-2">{t('passwordLabel')}</label>
            <input
              name="password"
              type="password"
              required
              placeholder={t('passwordPlaceholder')}
              value={formData.password}
              onChange={handleChange}
              className="input-field"
            />
            <div className="mt-2" aria-live="polite">
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[11px]">
                {passwordRequirementItems.map((item) => (
                  <span
                    key={item.key}
                    className={[
                      'transition-all duration-300',
                      item.met
                        ? 'text-black font-semibold'
                        : hasPasswordInput
                          ? 'text-gray-500'
                          : 'text-gray-400',
                    ].join(' ')}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            {fieldErrors.confirmPassword && (
              <p className="mb-1 text-xs font-medium text-red-600">{fieldErrors.confirmPassword}</p>
            )}
            <label className="block text-sm sm:text-base font-semibold text-black mb-2">{t('confirmPasswordLabel')}</label>
            <input
              name="confirmPassword"
              type="password"
              required
              placeholder={t('confirmPasswordPlaceholder')}
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input-field"
            />
            {formData.confirmPassword.length > 0 && (
              <p className={passwordsMatch ? 'mt-2 text-xs text-emerald-700' : 'mt-2 text-xs text-red-600'}>
                {passwordsMatch ? t('passwordsMatch') : t('passwordsDoNotMatch')}
              </p>
            )}
          </div>
        </div>

        <input type="hidden" name="referralCode" value={referralCode} />

        {authError && (
          <div className="text-red-600 bg-red-50 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#EF4444" />
              <path d="M12 8V12M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {authError}
          </div>
        )}

        <div className="text-center text-sm sm:text-base">
          <span className="font-medium text-gray-600">
            {t('hasAccountText')} {' '}
          </span>
          <Link href="/login" className="group inline-flex items-center gap-1 font-semibold text-black transition-colors hover:text-gray-600">
            {t('hasAccountLink')}
            <ChevronRight size={18} className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-10 flex justify-center">
          <button type="submit" disabled={authLoading} className="btn-primary">
            {authLoading ? (
              <>
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  aria-hidden="true"
                />
                <span>{t('processing')}</span>
              </>
            ) : (
              t('submitSignup')
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SignupPage() {
  const locale = useLocale();
  const t = useTranslations('Auth');
  const illustrationSrc = locale === 'kr' ? '/signup_kr.svg' : '/signup2.svg';

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div
          aria-hidden="true"
          className="hidden lg:block lg:min-h-screen bg-slate-100 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${illustrationSrc}')` }}
        />

        <div className="flex items-start justify-center px-6 sm:px-10 py-10 lg:py-12 w-full">
          <Suspense fallback={<div className="w-full text-center">{t('loading')}</div>}>
            <SignupForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}