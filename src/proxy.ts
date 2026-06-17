import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, locales } from './lib/i18n';

const localizedTopLevelRoutes = new Set([
  'about',
  'admin',
  'dashboard',
  'login',
  'pricing',
  'register',
  'signin',
  'signup',
  'user',
    'forgot-password',
    'reset-password',
]);

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export default function proxy(request: NextRequest) {
  const segments = request.nextUrl.pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  const isSupportedLocale = Boolean(firstSegment && (locales as readonly string[]).includes(firstSegment));
  const legacySignupIndex = isSupportedLocale ? 1 : 0;

  if (segments[legacySignupIndex] === 'signup2') {
    const redirectUrl = request.nextUrl.clone();
    const redirectedSegments = [...segments];
    redirectedSegments[legacySignupIndex] = 'signup';
    redirectUrl.pathname = `/${redirectedSegments.join('/')}`;
    return NextResponse.redirect(redirectUrl);
  }

  if (segments[legacySignupIndex] === 'login2') {
    const redirectUrl = request.nextUrl.clone();
    const redirectedSegments = [...segments];
    redirectedSegments[legacySignupIndex] = 'login';
    redirectUrl.pathname = `/${redirectedSegments.join('/')}`;
    return NextResponse.redirect(redirectUrl);
  }

  const isKnownRouteWithoutLocale = Boolean(firstSegment && localizedTopLevelRoutes.has(firstSegment));
  const looksLikeLocalePrefix = Boolean(firstSegment && /^[A-Za-z-]{2,5}$/.test(firstSegment));

  if (firstSegment && !isSupportedLocale && !isKnownRouteWithoutLocale && (segments.length > 1 || looksLikeLocalePrefix)) {
    const redirectUrl = request.nextUrl.clone();
    const remainingSegments = segments.length > 1 ? segments.slice(1) : [];
    redirectUrl.pathname = `/${[defaultLocale, ...remainingSegments].join('/')}`;
    return NextResponse.redirect(redirectUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(en|kr)/:path*', '/((?!api|_next|_vercel|.*\..*).*)']
};