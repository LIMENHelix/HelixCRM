// components/InboxView.tsx
'use client';
import { useState } from 'react';
import { EmailThread, Icons } from './shared';

export default function InboxView({ threads, onRefresh }: { threads: EmailThread[]; onRefresh: () => void }) {
  const [selected, setSelected] = useState<EmailThread | null>(null);
  const [replyText, setReplyText] = useState('');
  const [busy, setBusy] = useState(false);

  const handleApprove = async (t: EmailThread) => {
    if (!t.aiDraftReply) return;
    setBusy(true);
    await fetch('/api/ai-reply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve-send', threadId: t.id, subject: `Re: ${t.subject}`, body: t.aiDraftReply }) });
    setBusy(false); setSelected(null); onRefresh();
  };

  const handleReply = async (t: EmailThread) => {
    if (!replyText.trim()) return;
    setBusy(true);
    await fetch('/api/ai-reply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve-send', threadId: t.id, subject: `Re: ${t.subject}`, body: replyText }) });
    setReplyText(''); setBusy(false); setSelected(null); onRefresh();
  };

  const closeThread = async (threadId: string) => {
    await fetch('/api/gmail/inbox', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update-status', threadId, status: 'closed' }) });
    setSelected(null); onRefresh();
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div><h2 className="text-2xl font-display text-white mb-1">Inbox</h2><p className="text-muted text-sm">{threads.filter(t => t.status === 'new').length} pending · {threads.length} total</p></div>

      <div className="grid grid-cols-5 gap-5 h-[calc(100vh-200px)]">
        {/* Thread List */}
        <div className="col-span-2 card p-0 overflow-y-auto">
          {threads.map(t => (
            <button key={t.id} onClick={() => { setSelected(t); setReplyText(t.aiDraftReply || ''); }}
              className={`w-full text-left p-4 border-b border-border hover:bg-surface transition-colors ${selected?.id === t.id ? 'bg-surface border-l-2 border-l-helix-500' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-white text-sm truncate">{t.contactName}</span>
                <span className={`badge text-[10px] ${t.status === 'new' ? 'badge-new' : t.status === 'replied' ? 'badge-sent' : 'badge-replied'}`}>{t.status}</span>
              </div>
              <p className="text-xs text-subtle truncate mb-1">{t.subject}</p>
              <div className="flex items-center gap-2">
                {t.aiClassification && <span className={`text-[10px] px-1.5 py-0.5 rounded ${t.aiClassification === 'hot-lead' ? 'bg-helix-500/15 text-helix-400' : t.aiClassification === 'opt-out' ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'}`}>{t.aiClassification}</span>}
                <span className="text-[10px] text-muted">{new Date(t.updatedAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
          {threads.length === 0 && <div className="p-10 text-center text-muted text-sm">No threads yet</div>}
        </div>

        {/* Detail */}
        <div className="col-span-3 card p-0 flex flex-col overflow-hidden">
          {selected ? (
            <>
              <div className="p-5 border-b border-border">
                <div className="flex items-center justify-between">
                  <div><h3 className="font-semibold text-white">{selected.contactName}</h3><p className="text-xs text-muted font-mono">{selected.contactEmail}</p></div>
                  {selected.aiClassification && <span className={`badge ${selected.aiClassification === 'hot-lead' ? 'badge-new' : selected.aiClassification === 'opt-out' ? 'badge-optout' : 'badge-replied'}`}>AI: {selected.aiClassification}</span>}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {selected.messages.map((msg: any) => (
                  <div key={msg.id} className={`max-w-[85%] ${msg.direction === 'outbound' ? 'ml-auto' : ''}`}>
                    <div className={`p-4 rounded-xl text-sm ${msg.direction === 'outbound' ? 'bg-helix-500/10 border border-helix-500/20' : 'bg-surface border border-border'}`}>
                      <p className="text-xs text-muted mb-2">{msg.direction === 'outbound' ? 'You' : selected.contactName} · {new Date(msg.timestamp).toLocaleString()}</p>
                      <p className="text-subtle whitespace-pre-wrap">{msg.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              {selected.status === 'new' && (
                <div className="border-t border-border p-5 space-y-3">
                  {selected.aiDraftReply && (
                    <div className="bg-helix-500/5 border border-helix-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2"><Icons.Sparkle /><span className="text-xs font-semibold text-helix-400">AI-Drafted Reply</span></div>
                      <p className="text-sm text-subtle whitespace-pre-wrap">{selected.aiDraftReply}</p>
                      <button onClick={() => handleApprove(selected)} disabled={busy} className="btn-primary mt-3 text-xs flex items-center gap-1.5"><Icons.Check /> {busy ? 'Sending...' : 'Approve & Send'}</button>
                    </div>
                  )}
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)} className="input-field h-24 resize-none text-sm" placeholder="Write a reply or edit the AI draft..." />
                  <div className="flex gap-2">
                    <button onClick={() => handleReply(selected)} disabled={busy || !replyText.trim()} className="btn-primary text-xs">Send Reply</button>
                    <button onClick={() => closeThread(selected.id)} className="btn-ghost text-xs">Close Thread</button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted text-sm">Select a thread to view</div>
          )}
        </div>
      </div>
    </div>
  );
}
