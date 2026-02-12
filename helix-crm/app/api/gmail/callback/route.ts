// app/api/gmail/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard?error=gmail_auth_failed', req.url));
  }

  try {
    const { handleCallback } = await import('@/lib/gmail');
    await handleCallback(code);
    return NextResponse.redirect(new URL('/dashboard?gmail=connected', req.url));
  } catch (err) {
    console.error('Gmail callback error:', err);
    return NextResponse.redirect(new URL('/dashboard?error=gmail_auth_failed', req.url));
  }
}
