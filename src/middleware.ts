import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
import createIntlMiddleware from 'next-intl/middleware';

import { routing } from '@/core/i18n/config';

const intlMiddleware = createIntlMiddleware(routing);
const NEXT_INTL_LOCALE_HEADER = 'X-NEXT-INTL-LOCALE';
const INTERNAL_LOCALE_REWRITE_PARAM = '__elyralab_locale_rewrite';
const PUBLIC_CACHE_CONTROL =
  'public, s-maxage=3600, stale-while-revalidate=14400';

function isPublicCacheablePath(pathWithoutLocale: string) {
  return (
    !pathWithoutLocale.startsWith('/admin') &&
    !pathWithoutLocale.startsWith('/settings') &&
    !pathWithoutLocale.startsWith('/activity') &&
    !pathWithoutLocale.startsWith('/sign-') &&
    !pathWithoutLocale.startsWith('/auth')
  );
}

function applyPublicPageHeaders(
  response: NextResponse,
  pathWithoutLocale: string
) {
  if (!isPublicCacheablePath(pathWithoutLocale)) {
    return response;
  }

  response.headers.delete('Set-Cookie');
  response.headers.set('Cache-Control', PUBLIC_CACHE_CONTROL);
  response.headers.set('CDN-Cache-Control', PUBLIC_CACHE_CONTROL);
  response.headers.set('Cloudflare-CDN-Cache-Control', PUBLIC_CACHE_CONTROL);

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = pathname.split('/')[1];
  const isValidLocale = routing.locales.includes(locale as any);
  const pathWithoutLocale = isValidLocale
    ? pathname.slice(locale.length + 1)
    : pathname;

  if (
    isValidLocale &&
    request.nextUrl.searchParams.get(INTERNAL_LOCALE_REWRITE_PARAM) === '1'
  ) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(NEXT_INTL_LOCALE_HEADER, locale);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    response.headers.set('x-pathname', pathname);
    response.headers.set('x-url', request.url);

    return applyPublicPageHeaders(response, pathWithoutLocale);
  }

  const intlResponse = intlMiddleware(request);

  if (
    pathWithoutLocale.startsWith('/admin') ||
    pathWithoutLocale.startsWith('/settings') ||
    pathWithoutLocale.startsWith('/activity')
  ) {
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
      const signInUrl = new URL(
        isValidLocale ? `/${locale}/sign-in` : '/sign-in',
        request.url
      );
      const callbackPath = pathWithoutLocale + request.nextUrl.search;
      signInUrl.searchParams.set('callbackUrl', callbackPath);
      return NextResponse.redirect(signInUrl);
    }
  }

  if (!isValidLocale && isPublicCacheablePath(pathWithoutLocale)) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname =
      pathname === '/'
        ? `/${routing.defaultLocale}`
        : `/${routing.defaultLocale}${pathname}`;
    rewriteUrl.searchParams.set(INTERNAL_LOCALE_REWRITE_PARAM, '1');
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(NEXT_INTL_LOCALE_HEADER, routing.defaultLocale);

    const rewriteResponse = NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: requestHeaders,
      },
    });
    const alternateLinks = intlResponse.headers.get('Link');
    if (alternateLinks) {
      rewriteResponse.headers.set('Link', alternateLinks);
    }
    rewriteResponse.headers.set('x-pathname', request.nextUrl.pathname);
    rewriteResponse.headers.set('x-url', request.url);

    return applyPublicPageHeaders(rewriteResponse, pathWithoutLocale);
  }

  intlResponse.headers.set('x-pathname', request.nextUrl.pathname);
  intlResponse.headers.set('x-url', request.url);
  applyPublicPageHeaders(intlResponse, pathWithoutLocale);

  return intlResponse;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
