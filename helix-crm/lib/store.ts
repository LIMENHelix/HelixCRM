// lib/store.ts
// In-memory data store for development/demo
// Production: swap to Supabase or Postgres

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'opted-out' | 'bounced' | 'unsubscribed';
  tags: string[];
  tcpaConsent: boolean;
  tcpaConsentDate: string | null;
  createdAt: string;
  lastContacted: string | null;
  notes: string;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  recipients: string[]; // contact IDs
  sentCount: number;
  openCount: number;
  replyCount: number;
  optOutCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

export interface EmailThread {
  id: string;
  contactId: string;
  contactName: string;
  contactEmail: string;
  subject: string;
  lastMessage: string;
  direction: 'inbound' | 'outbound';
  status: 'new' | 'replied' | 'ai-drafted' | 'closed';
  aiClassification: 'question' | 'opt-out' | 'hot-lead' | 'complaint' | 'info-request' | 'positive' | null;
  aiDraftReply: string | null;
  campaignId: string | null;
  messages: EmailMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  direction: 'inbound' | 'outbound';
  timestamp: string;
  gmailId?: string;
}

export interface Settings {
  gmailConnected: boolean;
  gmailEmail: string | null;
  gmailTokens: any | null;
  anthropicApiKey: string | null;
  businessName: string;
  businessAddress: string;
  unsubscribeUrl: string;
  replyHandling: 'manual' | 'ai-draft' | 'ai-auto';
  dailySendLimit: number;
}

// --- In-memory store ---
class DataStore {
  contacts: Map<string, Contact> = new Map();
  campaigns: Map<string, Campaign> = new Map();
  threads: Map<string, EmailThread> = new Map();
  settings: Settings = {
    gmailConnected: false,
    gmailEmail: null,
    gmailTokens: null,
    anthropicApiKey: null,
    businessName: 'LIMEN Helix',
    businessAddress: '',
    unsubscribeUrl: '',
    replyHandling: 'ai-draft',
    dailySendLimit: 100,
  };
  users: Map<string, { email: string; password: string; name: string }> = new Map();
  sentToday: number = 0;

  constructor() {
    // Seed demo data
    this.seedDemoData();
  }

  private seedDemoData() {
    const demoContacts: Contact[] = [
      { id: 'c1', name: 'Marcus Williams', email: 'marcus.w@example.com', phone: '816-555-0101', status: 'active', tags: ['trt-prospect'], tcpaConsent: true, tcpaConsentDate: '2025-12-01', createdAt: '2025-12-01T10:00:00Z', lastContacted: '2026-02-10T14:30:00Z', notes: 'Interested in TRT program' },
      { id: 'c2', name: 'David Chen', email: 'david.chen@example.com', phone: '913-555-0202', status: 'active', tags: ['ed-treatment', 'hot-lead'], tcpaConsent: true, tcpaConsentDate: '2025-11-15', createdAt: '2025-11-15T09:00:00Z', lastContacted: '2026-02-09T11:00:00Z', notes: 'Asked about ED + TRT combo' },
      { id: 'c3', name: 'Robert Torres', email: 'r.torres@example.com', phone: '816-555-0303', status: 'active', tags: ['weight-loss'], tcpaConsent: true, tcpaConsentDate: '2026-01-05', createdAt: '2026-01-05T08:00:00Z', lastContacted: null, notes: 'New lead from landing page' },
      { id: 'c4', name: 'James Mitchell', email: 'j.mitchell@example.com', phone: '913-555-0404', status: 'opted-out', tags: ['trt-prospect'], tcpaConsent: false, tcpaConsentDate: null, createdAt: '2025-10-20T12:00:00Z', lastContacted: '2025-12-15T16:00:00Z', notes: 'Opted out Dec 2025' },
      { id: 'c5', name: 'Anthony Brooks', email: 'a.brooks@example.com', phone: '816-555-0505', status: 'active', tags: ['peptide-therapy', 'returning'], tcpaConsent: true, tcpaConsentDate: '2026-01-20', createdAt: '2026-01-20T10:00:00Z', lastContacted: '2026-02-08T09:00:00Z', notes: 'Previous client, interested in peptides' },
      { id: 'c6', name: 'Kevin Park', email: 'k.park@example.com', phone: '913-555-0606', status: 'active', tags: ['trt-prospect', 'referred'], tcpaConsent: true, tcpaConsentDate: '2026-02-01', createdAt: '2026-02-01T14:00:00Z', lastContacted: null, notes: 'Referred by Anthony Brooks' },
    ];

    demoContacts.forEach(c => this.contacts.set(c.id, c));

    const demoCampaign: Campaign = {
      id: 'camp1',
      name: 'February TRT Awareness',
      subject: 'Is low testosterone holding you back?',
      body: 'Hi {{name}},\n\nMillions of men over 30 experience symptoms of low testosterone without realizing it — fatigue, brain fog, decreased motivation, and more.\n\nOur 36-month Testosterone Optimization Program gives you comprehensive care at $250/month for 24 months, with Year 3 included at no additional cost.\n\nWant to learn if TRT is right for you? Reply to this email or call us directly.\n\nBest,\nLIMEN Helix\n\n---\nThis message was sent by LIMEN Helix. Reply STOP to unsubscribe.',
      status: 'sent',
      recipients: ['c1', 'c2', 'c3', 'c5', 'c6'],
      sentCount: 5,
      openCount: 3,
      replyCount: 2,
      optOutCount: 0,
      scheduledAt: null,
      sentAt: '2026-02-10T09:00:00Z',
      createdAt: '2026-02-09T20:00:00Z',
    };
    this.campaigns.set(demoCampaign.id, demoCampaign);

    const demoThreads: EmailThread[] = [
      {
        id: 't1', contactId: 'c2', contactName: 'David Chen', contactEmail: 'david.chen@example.com',
        subject: 'Re: Is low testosterone holding you back?',
        lastMessage: 'Hi, I\'m interested in the TRT + ED combo program. What are the costs and how do I get started?',
        direction: 'inbound', status: 'new',
        aiClassification: 'hot-lead',
        aiDraftReply: 'Hi David,\n\nGreat to hear from you! Our TRT + ED Combination Program is $442/month for 24 months, covering a full 36 months of care. Year 3 is included at no extra cost.\n\nThe program includes testosterone optimization, ED treatment (Trimix or oral), integrated care coordination, all labs, medications, and concierge support.\n\nWould you like to schedule a consultation to discuss which treatment approach fits you best? I can set up a call at your convenience.\n\nBest,\nLIMEN Helix',
        campaignId: 'camp1',
        messages: [
          { id: 'm1', from: 'helix@limenhelix.com', to: 'david.chen@example.com', subject: 'Is low testosterone holding you back?', body: 'Hi David,\n\nMillions of men over 30...', direction: 'outbound', timestamp: '2026-02-10T09:00:00Z' },
          { id: 'm2', from: 'david.chen@example.com', to: 'helix@limenhelix.com', subject: 'Re: Is low testosterone holding you back?', body: 'Hi, I\'m interested in the TRT + ED combo program. What are the costs and how do I get started?', direction: 'inbound', timestamp: '2026-02-10T14:22:00Z' },
        ],
        createdAt: '2026-02-10T14:22:00Z', updatedAt: '2026-02-10T14:22:00Z',
      },
      {
        id: 't2', contactId: 'c5', contactName: 'Anthony Brooks', contactEmail: 'a.brooks@example.com',
        subject: 'Re: Is low testosterone holding you back?',
        lastMessage: 'Hey, I was a client before. What peptide options do you have now? Also do you still do the same payment plans?',
        direction: 'inbound', status: 'new',
        aiClassification: 'question',
        aiDraftReply: 'Hi Anthony,\n\nWelcome back! We\'d love to work with you again.\n\nOur current peptide therapy options include BPC-157, CJC-1295/Ipamorelin, and other targeted protocols. The TRT + Peptide Program is $500/month for 24 months — same structure as before, pay for 2 years and Year 3 is included.\n\nWant me to set up a quick consultation to review what\'s changed since your last visit?\n\nBest,\nLIMEN Helix',
        campaignId: 'camp1',
        messages: [
          { id: 'm3', from: 'helix@limenhelix.com', to: 'a.brooks@example.com', subject: 'Is low testosterone holding you back?', body: 'Hi Anthony,\n\nMillions of men over 30...', direction: 'outbound', timestamp: '2026-02-10T09:00:00Z' },
          { id: 'm4', from: 'a.brooks@example.com', to: 'helix@limenhelix.com', subject: 'Re: Is low testosterone holding you back?', body: 'Hey, I was a client before. What peptide options do you have now? Also do you still do the same payment plans?', direction: 'inbound', timestamp: '2026-02-11T08:15:00Z' },
        ],
        createdAt: '2026-02-11T08:15:00Z', updatedAt: '2026-02-11T08:15:00Z',
      },
    ];

    demoThreads.forEach(t => this.threads.set(t.id, t));

    // Default admin user
    this.users.set('admin', { email: 'admin@limenhelix.com', password: '$2a$10$demo', name: 'Chris' });
  }

  // Helper methods
  getContacts(): Contact[] { return Array.from(this.contacts.values()); }
  getActiveContacts(): Contact[] { return this.getContacts().filter(c => c.status === 'active'); }
  getCampaigns(): Campaign[] { return Array.from(this.campaigns.values()); }
  getThreads(): EmailThread[] { return Array.from(this.threads.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()); }
  getNewThreads(): EmailThread[] { return this.getThreads().filter(t => t.status === 'new'); }

  generateId(): string { return Math.random().toString(36).substring(2, 10) + Date.now().toString(36); }
}

// Singleton
export const store = new DataStore();
