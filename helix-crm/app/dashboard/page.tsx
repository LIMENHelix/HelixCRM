// app/dashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import PricingView from '@/components/PricingView';
import InventoryView from '@/components/InventoryView';
import CompetitorView from '@/components/CompetitorView';
import { rvUnits } from '@/components/shared';

type Tab = 'pricing' | 'inventory' | 'competitors';

const tabs: { id: Tab; label: string }[] = [
  { id: 'pricing', label: 'PRICING INTEL' },
  { id: 'inventory', label: 'INVENTORY' },
  { id: 'competitors', label: 'COMPETITORS' },
];

const tickerItems = [
  'CLASS A AVG: $198,400 \u25B2 2.1%',
  'CLASS B AVG: $97,800 \u25BC 0.8%',
  'CLASS C AVG: $139,500 \u25B2 1.4%',
  '5TH WHEEL AVG: $62,300 \u25BC 3.2%',
  'TRAVEL TRAILER AVG: $41,200 \u25B2 0.5%',
  'NATIONAL AVG DOM: 34 DAYS',
  'ACTIVE LISTINGS: 142,847',
  'NEW LISTINGS (7D): 3,291',
  'PRICE DROPS (7D): 8,104',
  'TX MARKET: $156,200 AVG',
];

const mockPhotoCounts: Record<number, number> = { 1: 8, 2: 12, 3: 4, 4: 3, 5: 10, 6: 6, 7: 11, 8: 5 };

const needsAttentionCount = rvUnits.filter(u => u.daysOnMarket > 45).length;
const belowMarketCount = rvUnits.filter(u => u.trend === 'below').length;
const missingDataCount = rvUnits.filter(u => (mockPhotoCounts[u.id] || 5) < 5).length;

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('pricing');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('lotiq_user');
    if (!user) {
      window.location.href = '/';
      return;
    }
    setUsername(user);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('lotiq_user');
    window.location.href = '/';
  };

  if (!username) return null;

  return (
    <div className="flex flex-col h-screen" style={{ background: '#080c10' }}>
      {/* Ticker Bar */}
      <div className="overflow-hidden whitespace-nowrap" style={{ background: '#0d1117', borderBottom: '1px solid #1e2d3d', height: '28px', lineHeight: '28px' }}>
        <div className="inline-block animate-ticker">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="text-xs font-mono mx-6" style={{ color: item.includes('\u25B2') ? '#00ff88' : item.includes('\u25BC') ? '#ff4444' : '#7a8fa6' }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="flex items-center px-6 py-3 gap-4" style={{ background: '#0d1117', borderBottom: '1px solid #1e2d3d' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 mr-4">
          <div className="w-8 h-8 flex items-center justify-center" style={{ border: '2px solid #00d4ff', borderRadius: '4px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 3h18v18H3z" />
              <path d="M3 9h18" />
              <path d="M9 3v18" />
            </svg>
          </div>
          <span className="text-lg font-bold font-mono" style={{ color: '#00d4ff' }}>LotIQ</span>
        </div>

        {/* Alert Boxes */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('inventory')}
            className="flex items-center gap-2 px-3 py-1.5 transition-all"
            style={{ background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.25)', borderRadius: '4px' }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,184,0,0.15)'}
            onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,184,0,0.08)'}
          >
            <span className="text-lg font-bold font-mono" style={{ color: '#ffb800' }}>{needsAttentionCount}</span>
            <span className="text-xs font-mono uppercase" style={{ color: '#ffb800' }}>Needs Attention</span>
          </button>
          <button
            onClick={() => setTab('pricing')}
            className="flex items-center gap-2 px-3 py-1.5 transition-all"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: '4px' }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.15)'}
            onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.08)'}
          >
            <span className="text-lg font-bold font-mono" style={{ color: '#00d4ff' }}>{belowMarketCount}</span>
            <span className="text-xs font-mono uppercase" style={{ color: '#00d4ff' }}>Market Opportunities</span>
          </button>
          <button
            onClick={() => setTab('inventory')}
            className="flex items-center gap-2 px-3 py-1.5 transition-all"
            style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.25)', borderRadius: '4px' }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,68,68,0.15)'}
            onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,68,68,0.08)'}
          >
            <span className="text-lg font-bold font-mono" style={{ color: '#ff4444' }}>{missingDataCount}</span>
            <span className="text-xs font-mono uppercase" style={{ color: '#ff4444' }}>Missing Data</span>
          </button>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-1 ml-auto mr-4">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-4 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider transition-all"
              style={{
                background: tab === t.id ? 'rgba(0,212,255,0.1)' : 'transparent',
                color: tab === t.id ? '#00d4ff' : '#7a8fa6',
                borderBottom: tab === t.id ? '2px solid #00d4ff' : '2px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* User + Sign Out */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono" style={{ color: '#7a8fa6' }}>{username}</span>
          <button
            onClick={handleSignOut}
            className="text-xs font-mono px-3 py-1 transition-all"
            style={{ color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)', borderRadius: '4px', background: 'transparent' }}
            onMouseOver={e => (e.target as HTMLElement).style.background = 'rgba(255,68,68,0.1)'}
            onMouseOut={e => (e.target as HTMLElement).style.background = 'transparent'}
          >
            SIGN OUT
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {tab === 'pricing' && <PricingView />}
          {tab === 'inventory' && <InventoryView />}
          {tab === 'competitors' && <CompetitorView />}
        </div>
      </main>
    </div>
  );
}
