import axios from 'axios';

export const BILLING_SERVICE_UNREACHABLE_MESSAGE = 'Unable to reach billing service. Please try again.';

export type BillingApiWarning = {
  code: string;
  message: string;
  [key: string]: unknown;
};

export type BillingApiResponse<T = Record<string, unknown>> = T & {
  success?: boolean;
  message?: string;
  code?: string;
  warnings?: BillingApiWarning[];
  trialCancellationWarning?: BillingApiWarning | string | boolean | null;
};

export type BillingApiMeta = {
  success?: boolean;
  message?: string;
  code?: string;
  warnings?: BillingApiWarning[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const extractBillingMessage = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  if (!isRecord(value)) {
    return null;
  }

  if ('message' in value) {
    return extractBillingMessage(value.message);
  }

  if ('error' in value) {
    return extractBillingMessage(value.error);
  }

  return null;
};

export const extractBillingCode = (value: unknown): string | null => {
  if (!isRecord(value) || !('code' in value)) {
    return null;
  }

  const code = value.code;
  return typeof code === 'string' && code.trim() ? code.trim() : null;
};

const normalizeWarning = (warning: unknown): BillingApiWarning | null => {
  if (!isRecord(warning)) {
    return null;
  }

  const code = typeof warning.code === 'string' ? warning.code.trim() : '';
  const message = extractBillingMessage(warning);

  if (!code || !message) {
    return null;
  }

  return {
    ...warning,
    code,
    message,
  };
};

export const extractBillingWarnings = (value: unknown): BillingApiWarning[] => {
  if (!isRecord(value) || !Array.isArray(value.warnings)) {
    return [];
  }

  return value.warnings.map(normalizeWarning).filter((warning): warning is BillingApiWarning => Boolean(warning));
};

export const extractTrialCancellationWarning = (value: unknown): BillingApiWarning | null => {
  const warning = extractBillingWarnings(value).find((item) => item.code === 'TRIAL_WILL_BE_CANCELLED');

  if (warning) {
    return warning;
  }

  if (!isRecord(value) || !('trialCancellationWarning' in value)) {
    return null;
  }

  const rawWarning = value.trialCancellationWarning;
  if (!rawWarning) {
    return null;
  }

  if (typeof rawWarning === 'string') {
    const message = rawWarning.trim();
    return message ? { code: 'TRIAL_WILL_BE_CANCELLED', message } : null;
  }

  if (isRecord(rawWarning)) {
    const message = extractBillingMessage(rawWarning);
    if (!message) {
      return null;
    }

    return {
      ...rawWarning,
      code: extractBillingCode(rawWarning) ?? 'TRIAL_WILL_BE_CANCELLED',
      message,
    };
  }

  return null;
};

export const extractBillingApiMeta = (value: unknown): BillingApiMeta => {
  const warnings = extractBillingWarnings(value);
  const meta: BillingApiMeta = {};

  if (isRecord(value) && typeof value.success === 'boolean') {
    meta.success = value.success;
  }

  const message = extractBillingMessage(value);
  if (message) {
    meta.message = message;
  }

  const code = extractBillingCode(value);
  if (code) {
    meta.code = code;
  }

  if (warnings.length) {
    meta.warnings = warnings;
  }

  return meta;
};

export const assertBillingApiSuccess = <T>(payload: T): T => {
  if (isRecord(payload) && payload.success === false) {
    throw payload;
  }

  return payload;
};

export const getBillingErrorPayload = (error: unknown): unknown => {
  if (axios.isAxiosError(error)) {
    return error.response?.data ?? null;
  }

  return error;
};

export const getBillingApiErrorMessage = (error: unknown, fallback = 'Billing action failed.') => {
  const payload = getBillingErrorPayload(error);
  const payloadMessage = extractBillingMessage(payload);

  if (payloadMessage) {
    return payloadMessage;
  }

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return BILLING_SERVICE_UNREACHABLE_MESSAGE;
    }

    const errorMessage = error.message.trim();
    return errorMessage ? errorMessage : fallback;
  }

  if (error instanceof Error) {
    const errorMessage = error.message.trim();
    return errorMessage ? errorMessage : fallback;
  }

  return fallback;
};
