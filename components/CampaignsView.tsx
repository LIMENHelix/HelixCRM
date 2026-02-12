// components/CampaignsView.tsx
'use client';
import { useState } from 'react';
import { Campaign, Contact, Icons } from './shared';

export default function CampaignsView({ campaigns, contacts, onRefresh }: { campaigns: Campaign[]; contacts: Contact[]; onRefresh: () => void }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newCamp, setNewCamp] = useState({ name: '', subject: '', body: '', recipients: 'all-active' });
  const [sending, setSending] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeIds = contacts.filter(c => c.status === 'active').map(c => c.id);
    await fetch('/api/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newCamp, recipients: newCamp.recipients === 'all-active' ? activeIds : [] }) });
    setNewCamp({ name: '', subject: '', body: '', recipients: 'all-active' });
    setShowCreate(false);
    onRefresh();
  };

  const handleSend = async (campaignId: string) => {
    setSending(campaignId);
    await fetch('/api/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'send', campaignId }) });
    setSending(null);
    onRefresh();
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-display text-white mb-1">Campaigns</h2><p className="text-muted text-sm">{campaigns.length} campaigns</p></div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2"><Icons.Plus /> New Campaign</button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="card border-helix-500/30 animate-slide-up space-y-4">
          <h3 className="font-semibold text-white">Create Campaign</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm text-subtle mb-1">Campaign Name</label><input value={newCamp.name} onChange={e => setNewCamp({...newCamp, name: e.target.value})} className="input-field" placeholder="February TRT Outreach" required /></div>
            <div><label className="block text-sm text-subtle mb-1">Subject Line</label><input value={newCamp.subject} onChange={e => setNewCamp({...newCamp, subject: e.target.value})} className="input-field" placeholder="Is low testosterone holding you back?" required /></div>
          </div>
          <div>
            <label className="block text-sm text-subtle mb-1">Email Body <span className="text-muted">(use {'{{name}}'} for personalization)</span></label>
            <textarea value={newCamp.body} onChange={e => setNewCamp({...newCamp, body: e.target.value})} className="input-field h-40 resize-none font-mono text-xs" required placeholder={"Hi {{name}},\n\nMillions of men over 30 experience symptoms of low testosterone...\n\nReply to learn more.\n\nBest,\nLIMEN Helix"} />
          </div>
          <div><label className="block text-sm text-subtle mb-1">Recipients</label>
            <select value={newCamp.recipients} onChange={e => setNewCamp({...newCamp, recipients: e.target.value})} className="input-field">
              <option value="all-active">All Active Contacts ({contacts.filter(c => c.status === 'active').length})</option>
            </select>
          </div>
          <p className="text-xs text-muted">CAN-SPAM footer auto-appended (15 U.S.C. §7704). Opted-out contacts auto-excluded.</p>
          <div className="flex gap-3"><button type="submit" className="btn-primary">Create Draft</button><button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button></div>
        </form>
      )}

      <div className="space-y-4">
        {campaigns.map(c => (
          <div key={c.id} className="card">
            <div className="flex items-center justify-between mb-3">
              <div><h3 className="font-semibold text-white">{c.name}</h3><p className="text-muted text-xs">Subject: {c.subject}</p></div>
              <div className="flex items-center gap-3">
                <span className={`badge ${c.status === 'sent' ? 'badge-sent' : c.status === 'draft' ? 'badge-replied' : 'badge-new'}`}>{c.status}</span>
                {c.status === 'draft' && <button onClick={() => handleSend(c.id)} disabled={sending === c.id} className="btn-primary text-xs px-3 py-1.5">{sending === c.id ? 'Sending...' : 'Send Now'}</button>}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-surface rounded-lg"><p className="text-lg font-semibold text-white">{c.sentCount}</p><p className="text-xs text-muted">Sent</p></div>
              <div className="text-center p-3 bg-surface rounded-lg"><p className="text-lg font-semibold text-helix-400">{c.openCount}</p><p className="text-xs text-muted">Opens</p></div>
              <div className="text-center p-3 bg-surface rounded-lg"><p className="text-lg font-semibold text-amber-400">{c.replyCount}</p><p className="text-xs text-muted">Replies</p></div>
              <div className="text-center p-3 bg-surface rounded-lg"><p className="text-lg font-semibold text-rose-400">{c.optOutCount}</p><p className="text-xs text-muted">Opt-Outs</p></div>
            </div>
          </div>
        ))}
        {campaigns.length === 0 && <div className="card text-center py-12 text-muted">No campaigns yet. Click &quot;New Campaign&quot; to get started.</div>}
      </div>
    </div>
  );
}
