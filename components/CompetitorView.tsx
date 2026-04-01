// components/CompetitorView.tsx
'use client';
import { competitors, formatPrice } from './shared';

function activityColor(lastSeen: string): string {
  if (lastSeen.includes('hour')) return '#2e7d32';
  if (lastSeen.includes('1 day')) return '#e65100';
  return '#b71c1c';
}

export default function CompetitorView() {
  const mostActive = [...competitors].sort((a, b) => b.priceChanges7d - a.priceChanges7d)[0];
  const closest = [...competitors].sort((a, b) => a.distance - b.distance)[0];
  const marketAvg = Math.round(competitors.reduce((s, c) => s + c.avgPrice, 0) / competitors.length);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-mono" style={{ color: '#1a1a1a' }}>COMPETITORS</h2>
        <p className="text-sm" style={{ color: '#757575' }}>Dealer monitoring and competitive intelligence</p>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-4 gap-4">
        <StatBox label="Dealers Tracked" value={String(competitors.length)} color="#1a1a1a" />
        <StatBox label="Most Active" value={mostActive.name} color="#e65100" />
        <StatBox label="Market Avg Price" value={formatPrice(marketAvg)} color="#c62828" />
        <StatBox label="Closest Competitor" value={`${closest.name} ${closest.distance}mi`} color="#2e7d32" />
      </div>

      {/* Dealer Cards */}
      <div className="grid grid-cols-1 gap-4">
        {competitors.map(c => {
          const dotColor = activityColor(c.lastSeen);
          const isAggressive = c.priceChanges7d > 8;
          return (
            <div
              key={c.id}
              style={{ background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '20px' }}
              className="animate-slide-up"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: dotColor, boxShadow: `0 0 6px ${dotColor}` }} />
                  <div>
                    <div className="text-base font-bold" style={{ color: '#1a1a1a' }}>{c.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono" style={{ color: '#757575' }}>{c.location}</span>
                      <span
                        className="text-xs font-mono px-2 py-0.5"
                        style={{ background: 'rgba(198,40,40,0.1)', color: '#c62828', borderRadius: '4px' }}
                      >
                        {c.distance}mi
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono" style={{ color: '#757575' }}>Last seen: {c.lastSeen}</span>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-xs font-mono uppercase" style={{ color: '#757575' }}>Units on Lot</div>
                  <div className="text-xl font-bold font-mono mt-1" style={{ color: '#1a1a1a' }}>{c.units}</div>
                </div>
                <div>
                  <div className="text-xs font-mono uppercase" style={{ color: '#757575' }}>Avg Price</div>
                  <div className="text-xl font-bold font-mono mt-1" style={{ color: '#1a1a1a' }}>{formatPrice(c.avgPrice)}</div>
                </div>
                <div>
                  <div className="text-xs font-mono uppercase" style={{ color: '#757575' }}>Avg DOM</div>
                  <div className="text-xl font-bold font-mono mt-1" style={{ color: '#1a1a1a' }}>{c.avgDOM}d</div>
                </div>
                <div>
                  <div className="text-xs font-mono uppercase" style={{ color: '#757575' }}>Price Changes (7d)</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl font-bold font-mono" style={{ color: isAggressive ? '#e65100' : '#1a1a1a' }}>{c.priceChanges7d}</span>
                    {isAggressive && (
                      <span className="text-xs font-mono font-semibold px-2 py-0.5" style={{ background: 'rgba(230,81,0,0.1)', color: '#e65100', borderRadius: '4px' }}>
                        AGGRESSIVE
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                className="px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider transition-all"
                style={{ background: 'rgba(198,40,40,0.1)', color: '#c62828', border: '1px solid rgba(198,40,40,0.3)', borderRadius: '4px' }}
                onMouseOver={e => (e.target as HTMLElement).style.background = 'rgba(198,40,40,0.2)'}
                onMouseOut={e => (e.target as HTMLElement).style.background = 'rgba(198,40,40,0.1)'}
              >
                Monitor
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '16px' }}>
      <div className="text-lg font-bold font-mono truncate" style={{ color }}>{value}</div>
      <div className="text-xs font-mono uppercase tracking-wider mt-1" style={{ color: '#757575' }}>{label}</div>
    </div>
  );
}
