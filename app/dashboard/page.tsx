// app/dashboard/page.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Icons, Contact, Campaign, EmailThread } from '@/components/shared';
import ContactsView from '@/components/ContactsView';
import CampaignsView from '@/components/CampaignsView';
import InboxView from '@/components/InboxView';
import SettingsView from '@/components/SettingsView';

type View = 'dashboard' | 'contacts' | 'campaigns' | 'inbox' | 'settings';

export default function DashboardPage() {
  const [view, setView] = useState<View>('dashboard');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [threads, setThreads] = useState<EmailThread[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [cRes, campRes, tRes, sRes] = await Promise.all([
        fetch('/api/contacts'), fetch('/api/campaigns'),
        fetch('/api/gmail/inbox'), fetch('/api/settings'),
      ]);
      const [cData, campData, tData, sData] = await Promise.all([cRes.json(), campRes.json(), tRes.json(), sRes.json()]);
      setContacts(cData.contacts || []);
      setCampaigns(campData.campaigns || []);
      setThreads(tData.threads || []);
      setSettings(sData);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const activeContacts = contacts.filter(c => c.status === 'active');
  const newThreads = threads.filter(t => t.status === 'new');
  const totalSent = campaigns.reduce((s, c) => s + c.sentCount, 0);

  const navItems: { id: View; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    { id: 'contacts', label: 'Contacts', icon: Icons.Users, badge: contacts.length },
    { id: 'campaigns', label: 'Campaigns', icon: Icons.Send },
    { id: 'inbox', label: 'Inbox', icon: Icons.Inbox, badge: newThreads.length || undefined },
    { id: 'settings', label: 'Settings', icon: Icons.Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 bg-surface border-r border-border flex flex-col">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-helix-500 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-ink"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div><h1 className="text-sm font-semibold text-white leading-tight">HELIX CRM</h1><p className="text-xs text-muted">LIMEN Helix</p></div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setView(item.id)} className={`sidebar-link w-full ${view === item.id ? 'active' : ''}`}>
              <item.icon /><span className="flex-1 text-left">{item.label}</span>
              {item.badge && item.badge > 0 && <span className="bg-helix-500/20 text-helix-400 text-xs font-semibold px-2 py-0.5 rounded-full">{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <button onClick={() => { localStorage.removeItem('helix-auth'); window.location.href = '/'; }} className="sidebar-link w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
            <Icons.Logout /><span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-ink">
        <div className="p-8 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-helix-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <>
              {view === 'dashboard' && (
                <div className="animate-fade-in space-y-8">
                  <div><h2 className="text-2xl font-display text-white mb-1">Dashboard</h2><p className="text-muted text-sm">Overview of your CRM activity</p></div>
                  <div className="grid grid-cols-4 gap-5">
                    <div className="stat-card"><span className="stat-value text-white">{contacts.length}</span><span className="stat-label">Total Contacts</span></div>
                    <div className="stat-card"><span className="stat-value text-helix-400">{activeContacts.length}</span><span className="stat-label">Active</span></div>
                    <div className="stat-card"><span className="stat-value text-amber-400">{newThreads.length}</span><span className="stat-label">Pending Replies</span></div>
                    <div className="stat-card"><span className="stat-value text-white">{totalSent}</span><span className="stat-label">Emails Sent</span></div>
                  </div>
                  {newThreads.length > 0 && (
                    <div className="card">
                      <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-white">Pending Replies</h3><button onClick={() => setView('inbox')} className="text-helix-400 text-sm hover:underline">View All →</button></div>
                      <div className="space-y-3">
                        {newThreads.slice(0, 3).map(t => (
                          <div key={t.id} className="flex items-start gap-4 p-3 rounded-lg bg-surface border border-border">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-white text-sm">{t.contactName}</span>
                                {t.aiClassification && <span className={`badge ${t.aiClassification === 'hot-lead' ? 'badge-new' : t.aiClassification === 'opt-out' ? 'badge-optout' : 'badge-replied'}`}>{t.aiClassification}</span>}
                              </div>
                              <p className="text-subtle text-sm truncate">{t.lastMessage}</p>
                            </div>
                            <span className="text-xs text-muted whitespace-nowrap">{new Date(t.updatedAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="card">
                    <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-white">Recent Campaigns</h3><button onClick={() => setView('campaigns')} className="text-helix-400 text-sm hover:underline">View All →</button></div>
                    {campaigns.length === 0 ? <p className="text-muted text-sm">No campaigns yet.</p> : (
                      <div className="space-y-3">
                        {campaigns.slice(0, 3).map(c => (
                          <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
                            <div><p className="font-medium text-white text-sm">{c.name}</p><p className="text-muted text-xs">{c.sentCount} sent · {c.replyCount} replies</p></div>
                            <span className={`badge ${c.status === 'sent' ? 'badge-sent' : 'badge-replied'}`}>{c.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {view === 'contacts' && <ContactsView contacts={contacts} onRefresh={fetchData} />}
              {view === 'campaigns' && <CampaignsView campaigns={campaigns} contacts={contacts} onRefresh={fetchData} />}
              {view === 'inbox' && <InboxView threads={threads} onRefresh={fetchData} />}
              {view === 'settings' && <SettingsView settings={settings} onRefresh={fetchData} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
