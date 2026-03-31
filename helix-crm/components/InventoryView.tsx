// components/InventoryView.tsx
'use client';
import { useState, useMemo } from 'react';
import { rvUnits, formatPrice, classColor, RVUnit } from './shared';

type SortKey = 'price' | 'dom' | 'variance';

const mockPhotoCounts: Record<number, number> = { 1: 8, 2: 12, 3: 4, 4: 3, 5: 10, 6: 6, 7: 11, 8: 5 };

function getStatus(dom: number): { label: string; color: string } {
  if (dom < 15) return { label: 'FAST MOVER', color: '#00ff88' };
  if (dom <= 45) return { label: 'ACTIVE', color: '#c9d4e0' };
  if (dom <= 90) return { label: 'AGING', color: '#ffb800' };
  return { label: 'STALE', color: '#ff4444' };
}

const classes = ['All', 'Class A', 'Class B', 'Class C', '5th Wheel', 'Travel Trailer'];

interface AgeRow {
  range: string;
  min: number;
  max: number;
}

const ageRanges: AgeRow[] = [
  { range: '0-30d', min: 0, max: 30 },
  { range: '31-60d', min: 31, max: 60 },
  { range: '61-90d', min: 61, max: 90 },
  { range: '91-180d', min: 91, max: 180 },
  { range: '180d+', min: 181, max: Infinity },
];

function ageStatus(min: number): { label: string; color: string } {
  if (min <= 30) return { label: 'HEALTHY', color: '#00ff88' };
  if (min <= 60) return { label: 'MONITOR', color: '#00d4ff' };
  if (min <= 90) return { label: 'AT RISK', color: '#ffb800' };
  return { label: 'CRITICAL', color: '#ff4444' };
}

export default function InventoryView() {
  const [sortBy, setSortBy] = useState<SortKey>('dom');
  const [classFilter, setClassFilter] = useState('All');

  const filtered = useMemo(() => {
    let data = classFilter === 'All' ? [...rvUnits] : rvUnits.filter(u => u.class === classFilter);
    data.sort((a, b) => {
      if (sortBy === 'price') return b.askingPrice - a.askingPrice;
      if (sortBy === 'dom') return b.daysOnMarket - a.daysOnMarket;
      return Math.abs(b.askingPrice - b.marketAvg) - Math.abs(a.askingPrice - a.marketAvg);
    });
    return data;
  }, [sortBy, classFilter]);

  const totalValue = filtered.reduce((s, u) => s + u.askingPrice, 0);
  const avgDOM = filtered.length ? Math.round(filtered.reduce((s, u) => s + u.daysOnMarket, 0) / filtered.length) : 0;
  const needsAttention = filtered.filter(u => u.daysOnMarket > 45).length;

  const ageData = ageRanges.map(ar => {
    const units = rvUnits.filter(u => u.daysOnMarket >= ar.min && u.daysOnMarket <= ar.max);
    const count = units.length;
    const avgPrice = count ? Math.round(units.reduce((s, u) => s + u.askingPrice, 0) / count) : 0;
    const avgDom = count ? Math.round(units.reduce((s, u) => s + u.daysOnMarket, 0) / count) : 0;
    const st = ageStatus(ar.min);
    return { range: ar.range, count, avgPrice, avgDom, status: st };
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-mono" style={{ color: '#fff' }}>INVENTORY</h2>
        <p className="text-sm" style={{ color: '#7a8fa6' }}>Inventory management and status tracking</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <StatBox label="Total Inventory Value" value={formatPrice(totalValue)} color="#fff" />
        <StatBox label="Average DOM" value={`${avgDOM} days`} color="#00d4ff" />
        <StatBox label="Units Needing Attention" value={String(needsAttention)} color="#ffb800" />
      </div>

      {/* Age Breakdown Table */}
      <div>
        <div className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: '#7a8fa6' }}>AGE BREAKDOWN</div>
        <div style={{ background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: '4px', overflow: 'hidden' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2d3d' }}>
                {['Age Range', 'Units', 'Avg Price', 'Avg DOM', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-mono uppercase tracking-wider px-4 py-2.5" style={{ color: '#7a8fa6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ageData.map(row => (
                <tr key={row.range} style={{ borderBottom: '1px solid #1e2d3d' }} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-2.5 font-mono font-semibold" style={{ color: '#c9d4e0' }}>{row.range}</td>
                  <td className="px-4 py-2.5 font-mono" style={{ color: row.count > 0 ? '#fff' : '#7a8fa6' }}>{row.count}</td>
                  <td className="px-4 py-2.5 font-mono" style={{ color: '#c9d4e0' }}>{row.count > 0 ? formatPrice(row.avgPrice) : '—'}</td>
                  <td className="px-4 py-2.5 font-mono" style={{ color: '#c9d4e0' }}>{row.count > 0 ? `${row.avgDom}d` : '—'}</td>
                  <td className="px-4 py-2.5">
                    {row.count > 0 ? (
                      <span className="text-xs font-mono font-semibold px-2 py-0.5" style={{ color: row.status.color, background: `${row.status.color}15`, borderRadius: '4px' }}>
                        {row.status.label}
                      </span>
                    ) : (
                      <span className="text-xs font-mono" style={{ color: '#7a8fa6' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider" style={{ color: '#7a8fa6' }}>Sort:</span>
          {(['price', 'dom', 'variance'] as SortKey[]).map(k => (
            <button
              key={k}
              onClick={() => setSortBy(k)}
              className="px-3 py-1 text-xs font-mono uppercase transition-all"
              style={{
                background: sortBy === k ? '#00d4ff' : 'transparent',
                color: sortBy === k ? '#080c10' : '#7a8fa6',
                border: `1px solid ${sortBy === k ? '#00d4ff' : '#1e2d3d'}`,
                borderRadius: '4px',
              }}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider" style={{ color: '#7a8fa6' }}>Class:</span>
          <select
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            className="text-xs font-mono px-3 py-1 outline-none"
            style={{ background: '#0d1117', color: '#c9d4e0', border: '1px solid #1e2d3d', borderRadius: '4px' }}
          >
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: '4px', overflow: 'hidden' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #1e2d3d' }}>
              {['Unit', 'Class', 'Asking', 'Market Avg', 'Variance', 'DOM', 'Status', 'Photos', ''].map(h => (
                <th key={h} className="text-left text-xs font-mono uppercase tracking-wider px-4 py-3" style={{ color: '#7a8fa6' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(unit => {
              const variance = unit.askingPrice - unit.marketAvg;
              const status = getStatus(unit.daysOnMarket);
              const domColor = unit.daysOnMarket > 60 ? '#ff4444' : unit.daysOnMarket > 30 ? '#ffb800' : '#c9d4e0';
              const cc = classColor(unit.class);
              const photos = mockPhotoCounts[unit.id] || 5;
              return (
                <tr key={unit.id} style={{ borderBottom: '1px solid #1e2d3d' }} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-semibold" style={{ color: '#fff' }}>
                    {unit.year} {unit.make} {unit.model}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono px-2 py-0.5" style={{ background: cc.bg, color: cc.text, borderRadius: '4px' }}>{unit.class}</span>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold" style={{ color: '#fff' }}>{formatPrice(unit.askingPrice)}</td>
                  <td className="px-4 py-3 font-mono" style={{ color: '#7a8fa6' }}>{formatPrice(unit.marketAvg)}</td>
                  <td className="px-4 py-3 font-mono font-semibold" style={{ color: variance > 0 ? '#ff4444' : variance < 0 ? '#00ff88' : '#7a8fa6' }}>
                    {variance > 0 ? '+' : ''}{formatPrice(variance)}
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold" style={{ color: domColor }}>{unit.daysOnMarket}d</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5" style={{ color: status.color, background: `${status.color}15`, borderRadius: '4px' }}>{status.label}</span>
                  </td>
                  <td className="px-4 py-3 font-mono" style={{ color: photos < 5 ? '#ffb800' : '#7a8fa6' }}>
                    {photos} {photos < 5 && <span className="text-xs">!</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-xs font-mono font-semibold px-3 py-1 transition-all"
                      style={{ color: '#00d4ff', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '4px', background: 'transparent' }}
                      onMouseOver={e => (e.target as HTMLElement).style.background = 'rgba(0,212,255,0.1)'}
                      onMouseOut={e => (e.target as HTMLElement).style.background = 'transparent'}
                    >
                      VIEW
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: '4px', padding: '16px' }}>
      <div className="text-2xl font-bold font-mono" style={{ color }}>{value}</div>
      <div className="text-xs font-mono uppercase tracking-wider mt-1" style={{ color: '#7a8fa6' }}>{label}</div>
    </div>
  );
}
