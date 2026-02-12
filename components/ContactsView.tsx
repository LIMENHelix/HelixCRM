// components/ContactsView.tsx
'use client';
import { useState, useRef } from 'react';
import { Contact, Icons } from './shared';

export default function ContactsView({ contacts, onRefresh }: { contacts: Contact[]; onRefresh: () => void }) {
  const [showImport, setShowImport] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [importResult, setImportResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', tags: '', notes: '', tcpaConsent: false });

  const filtered = filter === 'all' ? contacts : filter === 'active' ? contacts.filter(c => c.status === 'active') : contacts.filter(c => c.status === 'opted-out');

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return;
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIdx = headers.findIndex(h => h.includes('name'));
    const emailIdx = headers.findIndex(h => h.includes('email'));
    const phoneIdx = headers.findIndex(h => h.includes('phone'));
    if (emailIdx === -1) { setImportResult({ error: 'CSV must have an "email" column' }); return; }
    const parsed = lines.slice(1).map(line => {
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      return { name: nameIdx >= 0 ? cols[nameIdx] : '', email: cols[emailIdx], phone: phoneIdx >= 0 ? cols[phoneIdx] : '' };
    });
    const res = await fetch('/api/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bulk: true, contacts: parsed, tcpaConsent: true }) });
    setImportResult(await res.json());
    onRefresh();
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newContact, tags: newContact.tags.split(',').map(t => t.trim()).filter(Boolean) }) });
    setNewContact({ name: '', email: '', phone: '', tags: '', notes: '', tcpaConsent: false });
    setShowAdd(false);
    onRefresh();
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display text-white mb-1">Contacts</h2>
          <p className="text-muted text-sm">{contacts.length} total · {contacts.filter(c => c.status === 'active').length} active</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowImport(!showImport)} className="btn-secondary flex items-center gap-2"><Icons.Upload /> Import CSV</button>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2"><Icons.Plus /> Add Contact</button>
        </div>
      </div>

      {showImport && (
        <div className="card border-helix-500/30 animate-slide-up">
          <h3 className="font-semibold text-white mb-3">Import from CSV</h3>
          <p className="text-muted text-sm mb-4">Upload a CSV with columns: <span className="text-helix-400 font-mono text-xs">name, email, phone</span> (email required)</p>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} className="input-field" />
          {importResult && (
            <div className="mt-3 p-3 rounded-lg bg-surface text-sm">
              {importResult.error ? <span className="text-rose-400">{importResult.error}</span> : <span className="text-helix-400">Imported {importResult.imported} contacts · {importResult.skipped} skipped</span>}
            </div>
          )}
        </div>
      )}

      {showAdd && (
        <form onSubmit={handleAddContact} className="card border-helix-500/30 animate-slide-up">
          <h3 className="font-semibold text-white mb-4">Add Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm text-subtle mb-1">Name*</label><input value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm text-subtle mb-1">Email*</label><input type="email" value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} className="input-field" required /></div>
            <div><label className="block text-sm text-subtle mb-1">Phone</label><input value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm text-subtle mb-1">Tags (comma-sep)</label><input value={newContact.tags} onChange={e => setNewContact({...newContact, tags: e.target.value})} className="input-field" placeholder="trt-prospect, referred" /></div>
          </div>
          <div className="mt-3"><label className="flex items-center gap-2 text-sm text-subtle"><input type="checkbox" checked={newContact.tcpaConsent} onChange={e => setNewContact({...newContact, tcpaConsent: e.target.checked})} className="rounded" />TCPA consent obtained (47 U.S.C. §227)</label></div>
          <div className="mt-4 flex gap-3"><button type="submit" className="btn-primary">Add Contact</button><button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button></div>
        </form>
      )}

      <div className="flex gap-2">
        {['all', 'active', 'opted-out'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-helix-500/15 text-helix-400 border border-helix-500/20' : 'text-muted hover:text-white hover:bg-panel'}`}>
            {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Opted Out'}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border">
            <th className="text-left text-xs text-muted font-medium px-5 py-3">Name</th>
            <th className="text-left text-xs text-muted font-medium px-5 py-3">Email</th>
            <th className="text-left text-xs text-muted font-medium px-5 py-3">Phone</th>
            <th className="text-left text-xs text-muted font-medium px-5 py-3">Status</th>
            <th className="text-left text-xs text-muted font-medium px-5 py-3">Tags</th>
            <th className="text-left text-xs text-muted font-medium px-5 py-3">TCPA</th>
          </tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="table-row">
                <td className="px-5 py-3 text-sm font-medium text-white">{c.name}</td>
                <td className="px-5 py-3 text-sm text-subtle font-mono">{c.email}</td>
                <td className="px-5 py-3 text-sm text-subtle">{c.phone}</td>
                <td className="px-5 py-3"><span className={`badge ${c.status === 'active' ? 'badge-new' : 'badge-optout'}`}>{c.status}</span></td>
                <td className="px-5 py-3"><div className="flex gap-1 flex-wrap">{c.tags.map((t: string) => <span key={t} className="text-xs bg-surface px-2 py-0.5 rounded text-muted border border-border">{t}</span>)}</div></td>
                <td className="px-5 py-3">{c.tcpaConsent ? <span className="text-helix-400 text-xs">✓</span> : <span className="text-rose-400 text-xs">✗</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-10 text-center text-muted">No contacts found</div>}
      </div>
    </div>
  );
}
