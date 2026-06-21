'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  saveSignupQuestionnaire,
  SignupQuestionnaireAnswers,
} from '@/lib/store/slices/signupQuestionnaireSlice';

type QuestionnaireField = {
  name: keyof SignupQuestionnaireAnswers;
  labelKey: string;
  options: {
    value: string;
    labelKey: string;
  }[];
};

const questionnaireFields: QuestionnaireField[] = [
  {
    name: 'activeField',
    labelKey: 'activeField.label',
    options: [
      { value: 'photography', labelKey: 'activeField.options.photography' },
      { value: 'illustration_design', labelKey: 'activeField.options.illustrationDesign' },
      { value: 'ecommerce', labelKey: 'activeField.options.ecommerce' },
      { value: 'model_agency', labelKey: 'activeField.options.modelAgency' },
      { value: 'brand_marketing', labelKey: 'activeField.options.brandMarketing' },
      { value: 'other', labelKey: 'activeField.options.other' },
    ],
  },
  {
    name: 'imageUseLocation',
    labelKey: 'imageUseLocation.label',
    options: [
      { value: 'website_portfolio', labelKey: 'imageUseLocation.options.websitePortfolio' },
      { value: 'social_media', labelKey: 'imageUseLocation.options.socialMedia' },
      { value: 'ecommerce_platforms', labelKey: 'imageUseLocation.options.ecommercePlatforms' },
      { value: 'marketplaces', labelKey: 'imageUseLocation.options.marketplaces' },
      { value: 'ads_campaigns', labelKey: 'imageUseLocation.options.adsCampaigns' },
      { value: 'other', labelKey: 'imageUseLocation.options.other' },
    ],
  },
  {
    name: 'unauthorizedUseExperience',
    labelKey: 'unauthorizedUseExperience.label',
    options: [
      { value: 'yes_often', labelKey: 'unauthorizedUseExperience.options.yesOften' },
      { value: 'yes_once_or_twice', labelKey: 'unauthorizedUseExperience.options.yesOnceOrTwice' },
      { value: 'not_sure', labelKey: 'unauthorizedUseExperience.options.notSure' },
      { value: 'no', labelKey: 'unauthorizedUseExperience.options.no' },
    ],
  },
  {
    name: 'stolenWorkResponse',
    labelKey: 'stolenWorkResponse.label',
    options: [
      { value: 'request_removal', labelKey: 'stolenWorkResponse.options.requestRemoval' },
      { value: 'report_platform', labelKey: 'stolenWorkResponse.options.reportPlatform' },
      { value: 'ask_compensation', labelKey: 'stolenWorkResponse.options.askCompensation' },
      { value: 'legal_action', labelKey: 'stolenWorkResponse.options.legalAction' },
      { value: 'not_sure', labelKey: 'stolenWorkResponse.options.notSure' },
    ],
  },
  {
    name: 'discoverySource',
    labelKey: 'discoverySource.label',
    options: [
      { value: 'search_engine', labelKey: 'discoverySource.options.searchEngine' },
      { value: 'social_media', labelKey: 'discoverySource.options.socialMedia' },
      { value: 'recommendation', labelKey: 'discoverySource.options.recommendation' },
      { value: 'community_event', labelKey: 'discoverySource.options.communityEvent' },
      { value: 'ads', labelKey: 'discoverySource.options.ads' },
      { value: 'other', labelKey: 'discoverySource.options.other' },
    ],
  },
];

function SelectField({
  field,
  value,
  placeholder,
  onChange,
}: {
  field: QuestionnaireField;
  value: string;
  placeholder: string;
  onChange: (name: keyof SignupQuestionnaireAnswers, value: string) => void;
}) {
  const t = useTranslations('Auth.questionnairePage');
  const id = `signup-questionnaire-${field.name}`;

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="typo-t6 mb-3 block text-black">
        {t(field.labelKey)}
      </label>
      <div className="relative">
        <select
          id={id}
          name={field.name}
          value={value}
          onChange={(event) => onChange(field.name, event.target.value)}
          className={[
            'input-field cursor-pointer pr-12 typo-t6',
            value ? 'text-black' : 'text-tx-6',
          ].join(' ')}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelKey)}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          size={22}
          strokeWidth={2}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black"
        />
      </div>
    </div>
  );
}

export default function SignupQuestionnaireStep({ onComplete }: { onComplete?: () => void }) {
  const locale = useLocale();
  const t = useTranslations('Auth.questionnairePage');
  const dispatch = useAppDispatch();
  const savedAnswers = useAppSelector((state) => state.signupQuestionnaire.answers);
  const [answers, setAnswers] = useState<SignupQuestionnaireAnswers>(savedAnswers);

  const illustrationSrc = locale === 'kr' ? '/signup1_kr.svg' : '/signup1_en.svg';

  const isComplete = Object.values(answers).every((value) => value.trim().length > 0);

  const updateAnswer = (name: keyof SignupQuestionnaireAnswers, value: string) => {
    setAnswers((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isComplete) {
      return;
    }

    dispatch(
      saveSignupQuestionnaire({
        answers,
        skipped: false,
        completedAt: new Date().toISOString(),
      }),
    );
    onComplete?.();
  };

  const handleSkip = () => {
    dispatch(
      saveSignupQuestionnaire({
        answers: {
          activeField: '',
          imageUseLocation: '',
          unauthorizedUseExperience: '',
          stolenWorkResponse: '',
          discoverySource: '',
        },
        skipped: true,
        completedAt: new Date().toISOString(),
      }),
    );
    onComplete?.();
  };

  return (
    <div className="grid min-h-dvh bg-white text-black lg:grid-cols-[minmax(320px,42vw)_1fr]">
      <div aria-hidden="true" className="relative hidden h-dvh overflow-hidden bg-[#f5f5f5] lg:block">
        <Image
          src={illustrationSrc}
          alt=""
          fill
          priority
          sizes="42vw"
          className="object-cover"
        />
      </div>

      <main className="flex min-h-dvh flex-col px-5 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-16">
        <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-[980px] flex-1 flex-col">
          <div className="flex items-center justify-between gap-4">
            <h1 className="typo-t3 text-black">{t('title')}</h1>
            <span className="typo-t6 rounded-full bg-black px-3 py-1 text-white">
              {t('progress')}
            </span>
          </div>

          <div className="mt-8 rounded-[12px] bg-[#f5f5f5] px-5 py-6 sm:px-7">
            <p className="typo-t6-r text-black">{t('intro')}</p>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-x-8 gap-y-7 lg:grid-cols-2">
            {questionnaireFields.map((field) => (
              <SelectField
                key={field.name}
                field={field}
                value={answers[field.name]}
                placeholder={t('placeholder')}
                onChange={updateAnswer}
              />
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <button
              type="submit"
              disabled={!isComplete}
              className="btn-primary btn-lg w-full max-w-[420px]"
            >
              {t('next')}
            </button>
          </div>

          <div className="mt-auto flex justify-end pt-12">
            <button
              type="button"
              onClick={handleSkip}
              className="typo-t6 inline-flex items-center gap-1 border-b border-black pb-0.5 text-black transition-colors hover:text-gray-600"
            >
              {t('skip')}
              <ChevronRight aria-hidden="true" size={18} strokeWidth={2} />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
