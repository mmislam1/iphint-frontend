export const KRW_PER_USD = 1360;

export const isKoreanCountry = (countryCode: string): boolean =>
  String(countryCode || '').toUpperCase() === 'KR';

export const formatPriceByCountry = (usd: number, countryCode: string): string => {
  if (isKoreanCountry(countryCode)) {
    const krw = Math.round(usd * KRW_PER_USD);
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(krw);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(usd);
};

export const detectCountryCodeByIp = async (): Promise<string> => {
  try {
    const res = await fetch('https://get.geojs.io/v1/ip/country.json');
    if (!res.ok) {
      throw new Error('geo lookup failed');
    }

    const data = await res.json();
    return String(data?.country || 'US').toUpperCase();
  } catch {
    return 'US';
  }
};
