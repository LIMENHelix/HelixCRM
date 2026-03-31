// components/CompetitorView.tsx
'use client';
import { competitors, formatPrice } from './shared';

function activityColor(lastSeen: string): string {
  if (lastSeen.includes('hour')) return '#00ff88';
  if (lastSeen.includes('1 day')) return '#ffb800';
  return '#ff4444';
}

export default function CompetitorView() {
  const mostActive = [...competitors].sort((a, b) => b.priceChanges7d - a.priceChanges7d)[0];
  const closest = [...competitors].sort((a, b) => a.distance - b.distance)[0];
  const marketAvg = Math.round(competitors.reduce((s, c) => s + c.avgPrice, 0) / competitors.length);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-mono" style={{ color: '#fff' }}>COMPETITORS</h2>
        <p className="text-sm" style={{ color: '#7a8fa6' }}>Dealer monitoring and competitive intelligence</p>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-4 gap-4">
        <StatBox label="Dealers Tracked" value={String(competitors.length)} color="#fff" />
        <StatBox label="Most Active" value={mostActive.name} color="#ffb800" />
        <StatBox label="Market Avg Price" value={formatPrice(marketAvg)} color="#00d4ff" />
        <StatBox label="Closest Competitor" value={`${closest.name} ${closest.distance}mi`} color="#00ff88" />
      </div>

      {/* Dealer Cards */}
      <div className="grid grid-cols-1 gap-4">
        {competitors.map(c => {
          const dotColor = activityColor(c.lastSeen);
          const isAggressive = c.priceChanges7d > 8;
          return (
            <div
              key={c.id}
              style={{ background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: '4px', padding: '20px' }}
              className="animate-slide-up"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}` }} />
                  <div>
                    <div className="text-base font-bold" style={{ color: '#fff' }}>{c.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono" style={{ color: '#7a8fa6' }}>{c.location}</span>
                      <span
                        className="text-xs font-mono px-2 py-0.5"
                        style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', borderRadius: '4px' }}
                      >
                        {c.distance}mi
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono" style={{ color: '#7a8fa6' }}>Last seen: {c.lastSeen}</span>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-xs font-mono uppercase" style={{ color: '#7a8fa6' }}>Units on Lot</div>
                  <div className="text-xl font-bold font-mono mt-1" style={{ color: '#fff' }}>{c.units}</div>
                </div>
                <div>
                  <div className="text-xs font-mono uppercase" style={{ color: '#7a8fa6' }}>Avg Price</div>
                  <div className="text-xl font-bold font-mono mt-1" style={{ color: '#fff' }}>{formatPrice(c.avgPrice)}</div>
                </div>
                <div>
                  <div className="text-xs font-mono uppercase" style={{ color: '#7a8fa6' }}>Avg DOM</div>
                  <div className="text-xl font-bold font-mono mt-1" style={{ color: '#fff' }}>{c.avgDOM}d</div>
                </div>
                <div>
                  <div className="text-xs font-mono uppercase" style={{ color: '#7a8fa6' }}>Price Changes (7d)</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl font-bold font-mono" style={{ color: isAggressive ? '#ffb800' : '#fff' }}>{c.priceChanges7d}</span>
                    {isAggressive && (
                      <span className="text-xs font-mono font-semibold px-2 py-0.5" style={{ background: 'rgba(255,184,0,0.15)', color: '#ffb800', borderRadius: '4px' }}>
                        AGGRESSIVE
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                className="px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider transition-all"
                style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '4px' }}
                onMouseOver={e => (e.target as HTMLElement).style.background = 'rgba(0,212,255,0.2)'}
                onMouseOut={e => (e.target as HTMLElement).style.background = 'rgba(0,212,255,0.1)'}
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
    <div style={{ background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: '4px', padding: '16px' }}>
      <div className="text-lg font-bold font-mono truncate" style={{ color }}>{value}</div>
      <div className="text-xs font-mono uppercase tracking-wider mt-1" style={{ color: '#7a8fa6' }}>{label}</div>
    </div>
  );
}
