// app/api/ai-reply/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { classifyEmail, draftReply } from '@/lib/ai-engine';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const apiKey = store.settings.anthropicApiKey || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Anthropic API key not configured. Add it in Settings.' }, { status: 400 });
  }

  if (body.action === 'classify') {
    const result = await classifyEmail(
      body.fromName,
      body.fromEmail,
      body.subject,
      body.body,
      apiKey
    );
    return NextResponse.json(result);
  }

  if (body.action === 'draft') {
    const contact = store.contacts.get(body.contactId);
    const result = await draftReply(
      body.fromName,
      body.subject,
      body.body,
      body.classification,
      contact?.tags || [],
      apiKey
    );
    return NextResponse.json(result);
  }

  if (body.action === 'approve-send') {
    // Approve AI draft and send
    const thread = store.threads.get(body.threadId);
    if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });

    // In production: call sendEmail() from lib/gmail.ts
    const newMessage = {
      id: store.generateId(),
      from: store.settings.gmailEmail || 'helix@limenhelix.com',
      to: thread.contactEmail,
      subject: body.subject || `Re: ${thread.subject}`,
      body: body.body,
      direction: 'outbound' as const,
      timestamp: new Date().toISOString(),
    };

    thread.messages.push(newMessage);
    thread.status = 'replied';
    thread.lastMessage = body.body;
    thread.direction = 'outbound';
    thread.updatedAt = new Date().toISOString();
    store.threads.set(thread.id, thread);

    return NextResponse.json({ success: true, thread });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
