import { NextRequest, NextResponse } from 'next/server';

import { getUserInfo } from '@/shared/models/user';
import {
  validateProxyResponse,
  validatePublicFetchUrl,
} from '@/shared/lib/url-security';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const user = await getUserInfo();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const validatedUrl = validatePublicFetchUrl(url);
    if (!validatedUrl.ok) {
      return new NextResponse(validatedUrl.error, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(validatedUrl.url, {
      redirect: 'manual',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return new NextResponse(`Failed to fetch file: ${response.statusText}`, {
        status: response.status,
      });
    }

    if (response.status >= 300 && response.status < 400) {
      return new NextResponse('Redirects are not allowed', { status: 400 });
    }

    const validatedResponse = validateProxyResponse(response);
    if (!validatedResponse.ok) {
      return new NextResponse(validatedResponse.error, {
        status: validatedResponse.status,
      });
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': validatedResponse.contentType,
        'Content-Disposition': 'attachment',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
