// components/SettingsView.tsx
'use client';
import { useState } from 'react';
import { Icons } from './shared';

export default function SettingsView({ settings, onRefresh }: { settings: any; onRefresh: () => void }) {
  const [form, setForm] = useState({
    anthropicApiKey: settings.anthropicApiKey || '',
    businessName: settings.businessName || '',
    businessAddress: settings.businessAddress || '',
    unsubscribeUrl: settings.unsubscribeUrl || '',
    replyHandling: settings.replyHandling || 'ai-draft',
    dailySendLimit: settings.dailySendLimit || 100,
  });
  const [saved, setSaved] = useState(false);
  const [gmail, setGmail] = useState({ connected: settings.gmailConnected, email: settings.gmailEmail });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaved(true); setTimeout(() => setSaved(false), 2000); onRefresh();
  };

  const connectGmail = async () => {
    const res = await fetch('/api/gmail', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'connect' }) });
    const data = await res.json();
    if (data.authUrl) window.location.href = data.authUrl;
    else if (data.demo) setGmail({ connected: true, email: data.email });
  };

  const disconnectGmail = async () => {
    await fetch('/api/gmail', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'disconnect' }) });
    setGmail({ connected: false, email: null });
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl">
      <div><h2 className="text-2xl font-display text-white mb-1">Settings</h2><p className="text-muted text-sm">Configure integrations and compliance</p></div>

      <div className="card">
        <h3 className="font-semibold text-white mb-4">Gmail Integration</h3>
        {gmail.connected ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-helix-500/20 flex items-center justify-center"><Icons.Check /></div>
              <div><p className="text-sm font-medium text-white">Connected</p><p className="text-xs text-muted font-mono">{gmail.email}</p></div>
            </div>
            <button onClick={disconnectGmail} className="btn-ghost text-rose-400 hover:text-rose-300">Disconnect</button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted mb-3">Connect your Gmail to send emails and receive replies automatically.</p>
            <button onClick={connectGmail} className="btn-primary flex items-center gap-2"><Icons.Mail /> Connect Gmail</button>
            <p className="text-xs text-muted mt-2">Requires Google OAuth2 credentials in environment variables.</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="card space-y-4">
          <h3 className="font-semibold text-white">AI Reply Engine</h3>
          <div>
            <label className="block text-sm text-subtle mb-1">Anthropic API Key</label>
            <input type="password" value={form.anthropicApiKey} onChange={e => setForm({...form, anthropicApiKey: e.target.value})} className="input-field font-mono" placeholder="sk-ant-..." />
            <p className="text-xs text-muted mt-1">Used by Claude to classify replies and draft responses.</p>
          </div>
          <div>
            <label className="block text-sm text-subtle mb-1">Reply Handling Mode</label>
            <select value={form.replyHandling} onChange={e => setForm({...form, replyHandling: e.target.value})} className="input-field">
              <option value="manual">Manual — All replies need manual response</option>
              <option value="ai-draft">AI Draft — Claude drafts, you approve before sending</option>
              <option value="ai-auto">AI Auto — Claude auto-replies (opt-outs always auto-processed)</option>
            </select>
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="font-semibold text-white">CAN-SPAM Compliance (15 U.S.C. §7704)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm text-subtle mb-1">Business Name</label><input value={form.businessName} onChange={e => setForm({...form, businessName: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm text-subtle mb-1">Physical Address*</label><input value={form.businessAddress} onChange={e => setForm({...form, businessAddress: e.target.value})} className="input-field" placeholder="Required by CAN-SPAM" /></div>
          </div>
          <div><label className="block text-sm text-subtle mb-1">Daily Send Limit</label><input type="number" value={form.dailySendLimit} onChange={e => setForm({...form, dailySendLimit: parseInt(e.target.value) || 100})} className="input-field w-32" /></div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary">Save Settings</button>
          {saved && <span className="text-helix-400 text-sm animate-fade-in">✓ Saved</span>}
        </div>
      </form>

      <div className="card border-amber-500/20">
        <h3 className="font-semibold text-amber-400 mb-3">Production Setup</h3>
        <div className="text-sm text-subtle space-y-2">
          <p><span className="text-amber-400 font-mono">GOOGLE_CLIENT_ID</span> — Google Cloud Console → APIs → Credentials → OAuth 2.0</p>
          <p><span className="text-amber-400 font-mono">GOOGLE_CLIENT_SECRET</span> — Same OAuth credentials page</p>
          <p><span className="text-amber-400 font-mono">GOOGLE_REDIRECT_URI</span> — https://your-domain.vercel.app/api/gmail/callback</p>
          <p><span className="text-amber-400 font-mono">ANTHROPIC_API_KEY</span> — From console.anthropic.com</p>
          <p className="text-muted pt-2">Add these as Vercel Environment Variables in Project Settings → Environment Variables.</p>
        </div>
      </div>
    </div>
  );
}
