import axios from 'axios';
import { normalizeNotificationLocale, type NotificationLocaleInput } from '@/lib/notifications';

const sanitizeBaseUrl = (value: string) =>
  value
    .trim()
    .replace(/^['"\s]+|['"\s]+$/g, '')
    .replace(/\/+$/g, '');

const readApiBaseUrl = () => {
  const value = process.env.NEXT_PUBLIC_BASE_URL;

  if (!value) {
    throw new Error('NEXT_PUBLIC_BASE_URL is not configured.');
  }

  return sanitizeBaseUrl(value);
};

export const getApiBaseUrl = () => readApiBaseUrl();

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
});

const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('token');
};

const NOTIFICATION_LOCALE_STORAGE_KEY = 'notificationLocale';

export const getStoredNotificationLocale = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedLocale = localStorage.getItem(NOTIFICATION_LOCALE_STORAGE_KEY);
  return storedLocale ? normalizeNotificationLocale(storedLocale) : null;
};

export const setStoredNotificationLocale = (locale: NotificationLocaleInput) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(NOTIFICATION_LOCALE_STORAGE_KEY, normalizeNotificationLocale(locale));
};

const parseLocaleFromPathname = (pathname: string) => {
  const segment = pathname.split('/').filter(Boolean)[0];
  return segment === 'kr' ? 'kr' : 'en';
};

const toApiLocale = (locale: string | null | undefined) => normalizeNotificationLocale(locale);

const getCurrentLocale = () => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  return parseLocaleFromPathname(window.location.pathname || '/');
};

const getCurrentApiLocale = () => {
  const currentLocale = toApiLocale(getCurrentLocale());
  if (currentLocale) {
    return currentLocale;
  }

  const storedLocale = getStoredNotificationLocale();
  if (storedLocale) {
    return storedLocale;
  }

  return 'en';
};

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  const locale = getCurrentApiLocale();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['Accept-Language'] = locale === 'kr' ? 'ko-KR,ko;q=0.9,en;q=0.8' : 'en-US,en;q=0.9';
  config.headers['X-Locale'] = locale;

  return config;
});

const clearStoredSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem(NOTIFICATION_LOCALE_STORAGE_KEY);
};

const OPTIONAL_401_PATH_PREFIXES = ['/user-details/notifications', '/user/notifications'];

let isAuthRedirectInProgress = false;

const extractRequestPath = (rawUrl?: string) => {
  if (!rawUrl) return '';

  const withoutQuery = rawUrl.split('?')[0] || '';

  if (withoutQuery.startsWith('http://') || withoutQuery.startsWith('https://')) {
    try {
      return new URL(withoutQuery).pathname;
    } catch {
      return withoutQuery;
    }
  }

  return withoutQuery;
};

const isOptional401Request = (rawUrl?: string) => {
  const path = extractRequestPath(rawUrl);
  if (!path) return false;

  return OPTIONAL_401_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    if (status !== 401 || typeof window === 'undefined') {
      return Promise.reject(error);
    }

    if (isOptional401Request(error.config?.url)) {
      return Promise.reject(error);
    }

    const currentPath = window.location.pathname || '/';
    const locale = parseLocaleFromPathname(currentPath);
    const isAuthPage = /^\/(en|kr)\/(login|signup|forgot-password|reset-password)\/?$/.test(currentPath);

    clearStoredSession();

    if (!isAuthPage && !isAuthRedirectInProgress) {
      isAuthRedirectInProgress = true;
      const redirectTarget = `${window.location.pathname}${window.location.search || ''}`;
      const loginPath = `/${locale}/login?redirect=${encodeURIComponent(redirectTarget)}`;
      window.location.replace(loginPath);
    }

    return Promise.reject(error);
  },
);

type ApiMessageLocale = 'en' | 'kr';

const toMessageLocale = (locale?: NotificationLocaleInput): ApiMessageLocale =>
  normalizeNotificationLocale(locale ?? getCurrentApiLocale());

const readMessageString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  return null;
};

const readMessageTranslation = (value: unknown, locale: ApiMessageLocale): string | null => {
  if (!value || typeof value !== 'object' || !('messageTranslations' in value)) {
    return null;
  }

  const translations = (value as { messageTranslations?: unknown }).messageTranslations;
  if (!translations || typeof translations !== 'object') {
    return null;
  }

  const localized = (translations as Record<string, unknown>)[locale];
  return readMessageString(localized);
};

const readDirectApiMessage = (value: unknown, locale: ApiMessageLocale): string | null => {
  if (value && typeof value === 'object') {
    const translatedMessage = readMessageTranslation(value, locale);
    if (translatedMessage) return translatedMessage;

    return readMessageString((value as { message?: unknown }).message);
  }

  return readMessageString(value);
};

export const pickApiMessage = (payload: unknown, locale?: NotificationLocaleInput) => {
  const appLocale = toMessageLocale(locale);
  if (!payload || typeof payload !== 'object') {
    return readMessageString(payload) ?? '';
  }

  const directMessage = readDirectApiMessage(payload, appLocale);
  if (directMessage) return directMessage;

  const error = (payload as { error?: unknown }).error;
  const errorMessage = readDirectApiMessage(error, appLocale);
  return errorMessage ?? '';
};

const extractApiErrorMessage = (value: unknown, locale = toMessageLocale()): string | null => {
  const pickedMessage = pickApiMessage(value, locale);
  return pickedMessage || null;
};

const extractApiMessageList = (value: unknown, locale = toMessageLocale()): string[] => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractApiMessageList(item, locale));
  }

  if (value && typeof value === 'object') {
    const directMessage = readDirectApiMessage(value, locale);
    if (directMessage) return [directMessage];

    const nested = value as { error?: unknown };

    if ('error' in nested) {
      return extractApiMessageList(nested.error, locale);
    }
  }

  return [];
};

export const getApiPayloadMessages = (payload: unknown, locale?: NotificationLocaleInput) => {
  const appLocale = toMessageLocale(locale);

  if (!payload || typeof payload !== 'object') {
    return {
      messages: extractApiMessageList(payload, appLocale),
      warnings: [] as string[],
      errors: [] as string[],
    };
  }

  const value = payload as {
    message?: unknown;
    messages?: unknown;
    warning?: unknown;
    warnings?: unknown;
    error?: unknown;
    errors?: unknown;
  };

  const directMessage = readDirectApiMessage(value, appLocale);

  return {
    messages: [...(directMessage ? [directMessage] : []), ...extractApiMessageList(value.messages, appLocale)],
    warnings: [...extractApiMessageList(value.warning, appLocale), ...extractApiMessageList(value.warnings, appLocale)],
    errors: [...extractApiMessageList(value.error, appLocale), ...extractApiMessageList(value.errors, appLocale)],
  };
};

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const responseMessage = extractApiErrorMessage(error.response?.data);
    const status = error.response?.status;

    if (status === 429) {
      const retryAfterRaw = error.response?.headers?.['retry-after'];
      const retryAfterSeconds = Number(retryAfterRaw);

      if (responseMessage) {
        if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
          const retryMinutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
          return `${responseMessage} Please wait about ${retryMinutes} minute${retryMinutes === 1 ? '' : 's'} before trying again.`;
        }

        return responseMessage;
      }

      return 'Too many attempts. Please wait a few minutes before trying again.';
    }

    if (responseMessage) {
      return responseMessage;
    }

    if (error.message) {
      return error.message;
    }
  }

  return fallback;
};
