// app/api/campaigns/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { store, Campaign } from '@/lib/store';
import { personalizeTemplate } from '@/lib/ai-engine';

export async function GET() {
  return NextResponse.json({ campaigns: store.getCampaigns() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.action === 'send' && body.campaignId) {
    // Send campaign
    const campaign = store.campaigns.get(body.campaignId);
    if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

    if (campaign.status === 'sent') {
      return NextResponse.json({ error: 'Campaign already sent' }, { status: 400 });
    }

    // Check daily send limit
    const recipientCount = campaign.recipients.length;
    if (store.sentToday + recipientCount > store.settings.dailySendLimit) {
      return NextResponse.json({
        error: `Daily send limit (${store.settings.dailySendLimit}) would be exceeded. ${store.sentToday} already sent today.`
      }, { status: 429 });
    }

    // In demo mode, just mark as sent
    // In production: loop through recipients, personalize, call sendEmail()
    const sentMessages: any[] = [];

    for (const contactId of campaign.recipients) {
      const contact = store.contacts.get(contactId);
      if (!contact || contact.status !== 'active') continue;

      const personalizedBody = await personalizeTemplate(
        campaign.body,
        contact.name,
        contact.tags
      );

      // In production: await sendEmail(contact.email, campaign.subject, personalizedBody)
      sentMessages.push({
        contactId: contact.id,
        email: contact.email,
        status: 'sent',
      });

      contact.lastContacted = new Date().toISOString();
      store.contacts.set(contact.id, contact);
    }

    campaign.status = 'sent';
    campaign.sentCount = sentMessages.length;
    campaign.sentAt = new Date().toISOString();
    store.campaigns.set(campaign.id, campaign);
    store.sentToday += sentMessages.length;

    return NextResponse.json({
      success: true,
      sent: sentMessages.length,
      campaign,
    });
  }

  // Create new campaign
  const campaign: Campaign = {
    id: store.generateId(),
    name: body.name,
    subject: body.subject,
    body: body.body,
    status: 'draft',
    recipients: body.recipients || [],
    sentCount: 0,
    openCount: 0,
    replyCount: 0,
    optOutCount: 0,
    scheduledAt: body.scheduledAt || null,
    sentAt: null,
    createdAt: new Date().toISOString(),
  };

  store.campaigns.set(campaign.id, campaign);
  return NextResponse.json({ campaign });
}
