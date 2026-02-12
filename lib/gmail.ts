// lib/gmail.ts
// Gmail API integration via OAuth2
// Ref: https://developers.google.com/gmail/api/quickstart/nodejs

import { google } from 'googleapis';
import { store } from './store';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
];

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`
  );
}

export function getAuthUrl(): string {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

export async function handleCallback(code: string) {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  // Get user email
  const gmail = google.gmail({ version: 'v1', auth: client });
  const profile = await gmail.users.getProfile({ userId: 'me' });

  store.settings.gmailConnected = true;
  store.settings.gmailEmail = profile.data.emailAddress || null;
  store.settings.gmailTokens = tokens;

  return { email: profile.data.emailAddress, tokens };
}

function getAuthedClient() {
  const client = getOAuth2Client();
  if (!store.settings.gmailTokens) throw new Error('Gmail not connected');
  client.setCredentials(store.settings.gmailTokens);
  return client;
}

export async function sendEmail(to: string, subject: string, body: string, replyToMessageId?: string) {
  const client = getAuthedClient();
  const gmail = google.gmail({ version: 'v1', auth: client });

  // CAN-SPAM: append unsubscribe footer (15 U.S.C. §7704)
  const footer = `\n\n---\n${store.settings.businessName}\n${store.settings.businessAddress}\nReply STOP to unsubscribe.`;
  const fullBody = body + footer;

  // Build raw email
  const headers = [
    `To: ${to}`,
    `From: ${store.settings.gmailEmail}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
  ];

  if (replyToMessageId) {
    headers.push(`In-Reply-To: ${replyToMessageId}`);
    headers.push(`References: ${replyToMessageId}`);
  }

  const raw = Buffer.from(headers.join('\r\n') + '\r\n\r\n' + fullBody)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });

  store.sentToday++;
  return result.data;
}

export async function getInboxMessages(maxResults = 20, query?: string) {
  const client = getAuthedClient();
  const gmail = google.gmail({ version: 'v1', auth: client });

  const listResult = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    q: query || 'in:inbox is:unread',
  });

  if (!listResult.data.messages) return [];

  const messages = await Promise.all(
    listResult.data.messages.map(async (msg) => {
      const full = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full',
      });
      return parseGmailMessage(full.data);
    })
  );

  return messages;
}

function parseGmailMessage(msg: any) {
  const headers = msg.payload?.headers || [];
  const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  let body = '';
  if (msg.payload?.body?.data) {
    body = Buffer.from(msg.payload.body.data, 'base64').toString('utf-8');
  } else if (msg.payload?.parts) {
    const textPart = msg.payload.parts.find((p: any) => p.mimeType === 'text/plain');
    if (textPart?.body?.data) {
      body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
    }
  }

  return {
    id: msg.id,
    threadId: msg.threadId,
    from: getHeader('From'),
    to: getHeader('To'),
    subject: getHeader('Subject'),
    date: getHeader('Date'),
    body,
    snippet: msg.snippet,
  };
}

export async function checkForReplies() {
  // Get sent campaign emails and check for replies
  if (!store.settings.gmailConnected) return [];

  try {
    const messages = await getInboxMessages(50, 'in:inbox is:unread');
    const newReplies = [];

    for (const msg of messages) {
      // Check if from a known contact
      const fromEmail = msg.from.match(/<([^>]+)>/)?.[1] || msg.from;
      const contact = Array.from(store.contacts.values()).find(
        c => c.email.toLowerCase() === fromEmail.toLowerCase()
      );

      if (contact) {
        // Check for opt-out keywords (CAN-SPAM compliance)
        const optOutKeywords = ['stop', 'unsubscribe', 'remove', 'opt out', 'opt-out'];
        const isOptOut = optOutKeywords.some(kw =>
          msg.body.toLowerCase().includes(kw) || msg.subject.toLowerCase().includes(kw)
        );

        if (isOptOut) {
          contact.status = 'opted-out';
          store.contacts.set(contact.id, contact);
        }

        newReplies.push({
          message: msg,
          contact,
          isOptOut,
        });
      }
    }

    return newReplies;
  } catch (err) {
    console.error('Failed to check replies:', err);
    return [];
  }
}
