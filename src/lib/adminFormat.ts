const toIntlLocale = (locale: string) => (locale === 'en' ? 'en-US' : 'ko-KR');

export const formatAdminNumber = (value: number, locale: string) =>
  new Intl.NumberFormat(toIntlLocale(locale)).format(value);

export const formatAdminCurrency = (value: number, locale: string) =>
  new Intl.NumberFormat(toIntlLocale(locale), {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);

export const formatAdminDate = (value: string, locale: string) => {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
};