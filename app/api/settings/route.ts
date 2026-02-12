// app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  const { gmailTokens, ...safeSettings } = store.settings;
  return NextResponse.json(safeSettings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.anthropicApiKey !== undefined) store.settings.anthropicApiKey = body.anthropicApiKey;
  if (body.businessName !== undefined) store.settings.businessName = body.businessName;
  if (body.businessAddress !== undefined) store.settings.businessAddress = body.businessAddress;
  if (body.unsubscribeUrl !== undefined) store.settings.unsubscribeUrl = body.unsubscribeUrl;
  if (body.replyHandling !== undefined) store.settings.replyHandling = body.replyHandling;
  if (body.dailySendLimit !== undefined) store.settings.dailySendLimit = body.dailySendLimit;

  const { gmailTokens, ...safeSettings } = store.settings;
  return NextResponse.json(safeSettings);
}
