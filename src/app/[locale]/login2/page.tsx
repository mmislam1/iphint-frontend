import { redirect } from 'next/navigation';

type Login2RedirectPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Login2RedirectPage({
  params,
  searchParams,
}: Login2RedirectPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(resolvedSearchParams)) {
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
  redirect(suffix ? `/${locale}/login?${suffix}` : `/${locale}/login`);
}