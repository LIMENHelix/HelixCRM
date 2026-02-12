// app/api/contacts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { store, Contact } from '@/lib/store';

export async function GET() {
  return NextResponse.json({ contacts: store.getContacts() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.bulk && Array.isArray(body.contacts)) {
    // CSV bulk import
    const imported: Contact[] = [];
    const skipped: string[] = [];

    for (const row of body.contacts) {
      const email = (row.email || '').trim().toLowerCase();
      if (!email || !email.includes('@')) {
        skipped.push(row.email || 'empty');
        continue;
      }

      // Dedupe by email
      const existing = Array.from(store.contacts.values()).find(c => c.email.toLowerCase() === email);
      if (existing) {
        skipped.push(email);
        continue;
      }

      const contact: Contact = {
        id: store.generateId(),
        name: (row.name || '').trim() || 'Unknown',
        email,
        phone: (row.phone || '').trim(),
        status: 'active',
        tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
        tcpaConsent: body.tcpaConsent || false,
        tcpaConsentDate: body.tcpaConsent ? new Date().toISOString() : null,
        createdAt: new Date().toISOString(),
        lastContacted: null,
        notes: row.notes || '',
      };

      store.contacts.set(contact.id, contact);
      imported.push(contact);
    }

    return NextResponse.json({
      imported: imported.length,
      skipped: skipped.length,
      skippedEmails: skipped,
      total: store.contacts.size,
    });
  }

  // Single contact add
  const contact: Contact = {
    id: store.generateId(),
    name: body.name,
    email: body.email,
    phone: body.phone || '',
    status: 'active',
    tags: body.tags || [],
    tcpaConsent: body.tcpaConsent || false,
    tcpaConsentDate: body.tcpaConsent ? new Date().toISOString() : null,
    createdAt: new Date().toISOString(),
    lastContacted: null,
    notes: body.notes || '',
  };

  store.contacts.set(contact.id, contact);
  return NextResponse.json({ contact });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  store.contacts.delete(id);
  return NextResponse.json({ success: true });
}
