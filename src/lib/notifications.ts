export type AppLocale = 'en' | 'kr' | 'ko' | string;
export type NotificationLocale = 'en' | 'kr';
export type NotificationLocaleInput = NotificationLocale | 'ko' | 'ko-KR' | 'en-US' | string | null | undefined;

export interface NotificationTranslation {
  title?: string;
  message?: string;
}

export type NotificationTranslations = Partial<Record<NotificationLocale, NotificationTranslation>> &
  Record<string, NotificationTranslation | undefined>;

export interface LocalizableNotification {
  title?: string;
  message?: string;
  locale?: NotificationLocaleInput;
  translations?: NotificationTranslations;
  type?: string;
  timestamp?: string;
  titleKey?: string;
  messageKey?: string;
  translationKey?: string;
  params?: Record<string, string | number | boolean | null | undefined>;
  metadata?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

type NotificationField = 'title' | 'message';

export const normalizeNotificationLocale = (locale: NotificationLocaleInput): NotificationLocale => {
  const normalized = typeof locale === 'string' ? locale.trim().toLowerCase() : '';
  return normalized === 'ko' || normalized === 'ko-kr' || normalized === 'kr' ? 'kr' : 'en';
};

export const isKoreanNotificationLocale = (locale: NotificationLocaleInput) =>
  normalizeNotificationLocale(locale) === 'kr';

const toIntlLocale = (locale: AppLocale) => (isKoreanNotificationLocale(locale) ? 'ko-KR' : 'en-US');

const readParam = (item: LocalizableNotification | undefined, key: string): string | null => {
  const sources = [item?.params, item?.metadata, item?.data];

  for (const source of sources) {
    const value = source?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }

  return null;
};

const normalizeKey = (value?: string | null) => {
  if (!value) return null;
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
  return normalized || null;
};

const readTranslationField = (
  translation: NotificationTranslation | undefined,
  field: NotificationField,
) => {
  const text = translation?.[field];
  return typeof text === 'string' && text.trim() ? text : null;
};

const readTranslatedNotificationText = (
  item: LocalizableNotification | undefined,
  field: NotificationField,
  locale: AppLocale,
) => {
  const translations = item?.translations;
  if (!translations) return null;

  const requestedLocale = normalizeNotificationLocale(locale);
  return (
    readTranslationField(translations[requestedLocale], field) ??
    readTranslationField(translations.en, field)
  );
};

const typedNotificationText = (
  item: LocalizableNotification | undefined,
  field: NotificationField,
  locale: AppLocale,
) => {
  if (!isKoreanNotificationLocale(locale)) return null;

  const type = normalizeKey(item?.type ?? item?.translationKey);
  if (!type) return null;

  const days = readParam(item, 'days') ?? readParam(item, 'daysLeft') ?? readParam(item, 'trialDaysLeft');
  const count = readParam(item, 'count') ?? readParam(item, 'matchCount') ?? readParam(item, 'matches');

  if (['trial_started', 'trial_activated', 'free_trial_started', 'free_trial_activated'].includes(type)) {
    return field === 'title'
      ? '7일 무료 체험이 시작되었습니다'
      : days
        ? `${days}일 동안 Pro 기능을 이용할 수 있습니다.`
        : '7일 동안 Pro 기능을 이용할 수 있습니다.';
  }

  if (['trial_ended', 'trial_expired', 'free_trial_ended', 'free_trial_expired'].includes(type)) {
    return field === 'title'
      ? '무료 체험이 종료되었습니다'
      : '서비스를 계속 이용하려면 요금제를 업그레이드해 주세요.';
  }

  if (['trial_ending', 'trial_ending_soon', 'free_trial_ending', 'free_trial_ending_soon'].includes(type)) {
    return field === 'title'
      ? '무료 체험 종료 예정'
      : days
        ? `무료 체험이 ${days}일 후 종료됩니다. 이용을 유지하려면 요금제를 업그레이드해 주세요.`
        : '무료 체험이 곧 종료됩니다. 이용을 유지하려면 요금제를 업그레이드해 주세요.';
  }

  if (['new_matches', 'new_match', 'matches_found', 'monitoring_match_found'].includes(type)) {
    return field === 'title'
      ? '새 일치 항목이 발견되었습니다'
      : count
        ? `${count}개의 새 일치 항목이 발견되었습니다.`
        : '새 일치 항목이 발견되었습니다.';
  }

  return null;
};

const translateStoredEnglishText = (value: string, locale: AppLocale) => {
  if (!isKoreanNotificationLocale(locale)) return value;

  const normalized = value.trim();

  if (/^(?:Your )?(?:7-day )?free trial (?:has )?(?:started|been activated)\.?$/i.test(normalized)) {
    return '7일 무료 체험이 시작되었습니다.';
  }

  if (/^(?:Your )?(?:7-day )?free trial is now active\.?$/i.test(normalized)) {
    return '7일 무료 체험이 활성화되었습니다.';
  }

  if (/^(?:Your )?(?:7-day )?free trial (?:has )?started\. You can use Pro features for 7 days\.?$/i.test(normalized)) {
    return '7일 무료 체험이 시작되었습니다. 7일 동안 Pro 기능을 이용할 수 있습니다.';
  }

  if (/^Your free trial has ended\. Upgrade to continue using the service\.?$/i.test(normalized)) {
    return '무료 체험이 종료되었습니다. 서비스를 계속 이용하려면 요금제를 업그레이드해 주세요.';
  }

  const trialEndingMatch = normalized.match(
    /^Your free trial ends in (\d+) day(?:s)?\. Upgrade to keep access\.?$/i,
  );
  if (trialEndingMatch) {
    return `무료 체험이 ${trialEndingMatch[1]}일 후 종료됩니다. 이용을 유지하려면 요금제를 업그레이드해 주세요.`;
  }

  const newMatchesMatch = normalized.match(/^(\d+) new match(?:es)? found\.?$/i);
  if (newMatchesMatch) {
    return `${newMatchesMatch[1]}개의 새 일치 항목이 발견되었습니다.`;
  }

  if (/^New matches found\.?$/i.test(normalized)) {
    return '새 일치 항목이 발견되었습니다.';
  }

  return value;
};

export const localizeNotificationText = (
  value: string | undefined,
  locale: AppLocale,
  item?: LocalizableNotification,
  field: NotificationField = 'message',
) => {
  const translatedText = readTranslatedNotificationText(item, field, locale);
  if (translatedText) return translatedText;

  if (!value) return value;

  const typedText = typedNotificationText(item, field, locale);
  if (typedText) return typedText;

  return translateStoredEnglishText(value, locale);
};

export const formatNotificationTimestamp = (value: string | undefined, locale: AppLocale) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};
