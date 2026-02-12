// app/api/gmail/inbox/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  return NextResponse.json({
    threads: store.getThreads(),
    newCount: store.getNewThreads().length,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.action === 'update-status') {
    const thread = store.threads.get(body.threadId);
    if (!thread) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    thread.status = body.status;
    thread.updatedAt = new Date().toISOString();
    store.threads.set(thread.id, thread);
    return NextResponse.json({ thread });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
