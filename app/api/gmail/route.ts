// app/api/gmail/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  return NextResponse.json({
    connected: store.settings.gmailConnected,
    email: store.settings.gmailEmail,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.action === 'connect') {
    // In production: return getAuthUrl() from lib/gmail.ts
    // For demo: simulate connection
    if (process.env.GOOGLE_CLIENT_ID) {
      const { getAuthUrl } = await import('@/lib/gmail');
      return NextResponse.json({ authUrl: getAuthUrl() });
    }

    // Demo mode - simulate
    store.settings.gmailConnected = true;
    store.settings.gmailEmail = 'demo@limenhelix.com';
    return NextResponse.json({
      connected: true,
      email: 'demo@limenhelix.com',
      demo: true,
    });
  }

  if (body.action === 'disconnect') {
    store.settings.gmailConnected = false;
    store.settings.gmailEmail = null;
    store.settings.gmailTokens = null;
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
