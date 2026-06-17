import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { defaultLocale, locales } from '@/lib/i18n';

type ResetPasswordRedirectPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResetPasswordRedirectPage({
  searchParams,
}: ResetPasswordRedirectPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string') {
          query.append(key, item);
        }
      }
      continue;
    }

    if (typeof value === 'string') {
      query.set(key, value);
    }
  }

  const suffix = query.toString();
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  const preferredLocale = (localeCookie && locales.includes(localeCookie as (typeof locales)[number]))
    ? localeCookie
    : defaultLocale;

  redirect(
    suffix
      ? `/${preferredLocale}/reset-password?${suffix}`
      : `/${preferredLocale}/reset-password`,
  );
}