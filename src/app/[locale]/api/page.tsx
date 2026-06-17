import { Link } from '@/i18n/routing';

type ApiPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ApiPage({ params }: ApiPageProps) {
  const { locale } = await params;
  const isKorean = locale === 'kr';

  const copy = isKorean
    ? {
        eyebrow: 'API',
        title: '개발자 API',
        description:
          'API 접근, 통합 가이드, 기술 문의, 그리고 상용 연동 관련 상담이 필요하시면 문의하기를 통해 연락해 주세요.',
        note: '담당 팀이 요구사항을 검토한 뒤 연동 범위와 다음 절차를 안내드립니다.',
        backToSignIn: '로그인으로 돌아가기',
        contactSupport: 'API 문의하기',
      }
    : {
        eyebrow: 'API',
        title: 'Developer API',
        description:
          'For API access, integration guidance, technical questions, or commercial onboarding, please contact our team through the contact page.',
        note: 'Our team will review your requirements and share the recommended integration scope and next steps.',
        backToSignIn: 'Back to sign in',
        contactSupport: 'Contact API team',
      };

  return (
    <main className="min-h-screen bg-white px-6 py-16 text-gray-900 sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">{copy.eyebrow}</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{copy.title}</h1>
        <p className="max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
          {copy.description}
        </p>
        <p className="max-w-2xl text-sm leading-6 text-gray-500">{copy.note}</p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/login" className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800">
            {copy.backToSignIn}
          </Link>
          <Link href="/contact" className="rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50">
            {copy.contactSupport}
          </Link>
        </div>
      </div>
    </main>
  );
}