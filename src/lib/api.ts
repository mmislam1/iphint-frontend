import axios from 'axios';

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

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const parseLocaleFromPathname = (pathname: string) => {
  const segment = pathname.split('/').filter(Boolean)[0];
  return segment === 'kr' ? 'kr' : 'en';
};

const clearStoredSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const OPTIONAL_401_PATH_PREFIXES = ['/user-details/notifications'];

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

const extractApiErrorMessage = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  if (value && typeof value === 'object') {
    if ('message' in value) {
      return extractApiErrorMessage((value as { message?: unknown }).message);
    }

    if ('error' in value) {
      return extractApiErrorMessage((value as { error?: unknown }).error);
    }
  }

  return null;
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