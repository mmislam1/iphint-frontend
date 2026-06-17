'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { apiClient, getApiErrorMessage } from '@/lib/api';

type ContactFormState = {
  fullName: string;
  companyName: string;
  workEmail: string;
  phoneNumber: string;
  inquiryMessage: string;
  consentEmail: boolean;
  consentSms: boolean;
  consentServiceUpdates: boolean;
  consentEventsPromotions: boolean;
};

const INITIAL_FORM_STATE: ContactFormState = {
  fullName: '',
  companyName: '',
  workEmail: '',
  phoneNumber: '',
  inquiryMessage: '',
  consentEmail: false,
  consentSms: false,
  consentServiceUpdates: false,
  consentEventsPromotions: false,
};

const INQUIRY_LIMIT = 5000;

export default function ContactPage() {
  const t = useTranslations('Contact');
  const router = useRouter();
  const [formData, setFormData] = useState<ContactFormState>(INITIAL_FORM_STATE);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fullName = formData.fullName.trim();
    const companyName = formData.companyName.trim();
    const workEmail = formData.workEmail.trim();
    const phoneNumber = formData.phoneNumber.trim();
    const inquiryMessage = formData.inquiryMessage.trim();

    if (!fullName || !workEmail || !inquiryMessage) {
      setIsSubmitting(false);
      setSubmitSuccess('');
      setSubmitError(t('submitErrorRequired'));
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      await apiClient.post('/contact', {
        fullName,
        companyName,
        workEmail,
        phoneNumber,
        inquiryMessage,
        consentEmail: formData.consentEmail,
        consentSms: formData.consentSms,
        consentServiceUpdates: formData.consentServiceUpdates,
        consentEventsPromotions: formData.consentEventsPromotions,
      });

      setSubmitSuccess(t('submitSuccess'));
      setFormData(INITIAL_FORM_STATE);

      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }

      redirectTimerRef.current = setTimeout(() => {
        router.push('/');
      }, 1600);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, t('submitError')));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="grid grid-cols-1 gap-8 lg:min-h-[68vh] lg:grid-cols-12 lg:items-center lg:gap-16">
          <section className="lg:col-span-4 lg:self-start lg:pt-8">
            <h1 className="text-3xl font-bold text-black sm:text-4xl">{t('title')}</h1>
            <p className="mt-3 max-w-md text-sm text-gray-600 sm:text-base">
              {t('description')}
            </p>
          </section>

          <section className="lg:col-span-8 lg:pl-4">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
            {submitError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {submitSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm font-semibold text-black">
                  {t('labels.fullName')}
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder={t('placeholders.fullName')}
                  className="input-field"
                  value={formData.fullName}
                  onChange={(event) => setFormData((prev) => ({ ...prev, fullName: event.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="companyName" className="mb-2 block text-sm font-semibold text-black">
                  {t('labels.companyName')}
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder={t('placeholders.companyName')}
                  className="input-field"
                  value={formData.companyName}
                  onChange={(event) => setFormData((prev) => ({ ...prev, companyName: event.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="workEmail" className="mb-2 block text-sm font-semibold text-black">
                  {t('labels.workEmail')}
                </label>
                <input
                  id="workEmail"
                  name="workEmail"
                  type="email"
                  placeholder={t('placeholders.workEmail')}
                  className="input-field"
                  value={formData.workEmail}
                  onChange={(event) => setFormData((prev) => ({ ...prev, workEmail: event.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="mb-2 block text-sm font-semibold text-black">
                  {t('labels.phoneNumber')}
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder={t('placeholders.phoneNumber')}
                  className="input-field"
                  value={formData.phoneNumber}
                  onChange={(event) => setFormData((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="inquiryMessage" className="block text-sm font-semibold text-black">
                  {t('labels.inquiryMessage')}
                </label>
                <span className="text-xs text-gray-500">{t('inquiryLimit')}</span>
              </div>
              <textarea
                id="inquiryMessage"
                name="inquiryMessage"
                maxLength={INQUIRY_LIMIT}
                placeholder={t('placeholders.inquiryMessage')}
                className="min-h-32 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-black sm:min-h-36"
                value={formData.inquiryMessage}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    inquiryMessage: event.target.value,
                  }))
                }
              />
              <p className="mt-2 text-right text-xs text-gray-500">
                {t('characterCount', { count: formData.inquiryMessage.length, limit: INQUIRY_LIMIT })}
              </p>
            </div>

            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-black">{t('marketingConsentTitle')}</h2>
              <div className="mt-3 h-px w-full bg-gray-200" />

              <ul className="mt-4 space-y-3">
                <li>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-gray-200 transition-colors hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.consentEmail}
                      onChange={(event) => setFormData((prev) => ({ ...prev, consentEmail: event.target.checked }))}
                      className="mt-0.5 h-5 w-5 rounded border-gray-400 accent-black"
                    />
                    {t('consentEmail')}
                  </label>
                </li>

                <li>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-gray-200 transition-colors hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.consentSms}
                      onChange={(event) => setFormData((prev) => ({ ...prev, consentSms: event.target.checked }))}
                      className="mt-0.5 h-5 w-5 rounded border-gray-400 accent-black"
                    />
                    {t('consentSms')}
                  </label>
                </li>

                <li>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-gray-200 transition-colors hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.consentServiceUpdates}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          consentServiceUpdates: event.target.checked,
                        }))
                      }
                      className="mt-0.5 h-5 w-5 rounded border-gray-400 accent-black"
                    />
                    {t('consentServiceUpdates')}
                  </label>
                </li>

                <li>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-gray-200 transition-colors hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.consentEventsPromotions}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          consentEventsPromotions: event.target.checked,
                        }))
                      }
                      className="mt-0.5 h-5 w-5 rounded border-gray-400 accent-black"
                    />
                    {t('consentEventsPromotions')}
                  </label>
                </li>
              </ul>

              <p className="mt-4 text-xs text-gray-500">
                {t('consentHelp')}
              </p>
            </section>

            <div className="flex justify-center pt-1">
              <button type="submit" disabled={isSubmitting} className="btn-primary h-12 w-full text-sm disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-52 sm:px-8">
                {isSubmitting ? t('submitLoading') : t('submit')}
              </button>
            </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
