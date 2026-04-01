// components/InventoryView.tsx
'use client';
import { useState, useMemo } from 'react';
import { rvUnits, formatPrice, classColor, RVUnit } from './shared';

type SortKey = 'price' | 'dom' | 'variance';

const mockPhotoCounts: Record<number, number> = { 1: 8, 2: 12, 3: 4, 4: 3, 5: 10, 6: 6, 7: 11, 8: 5 };

function getStatus(dom: number): { label: string; color: string } {
  if (dom < 15) return { label: 'FAST MOVER', color: '#2e7d32' };
  if (dom <= 45) return { label: 'ACTIVE', color: '#1a1a1a' };
  if (dom <= 90) return { label: 'AGING', color: '#e65100' };
  return { label: 'STALE', color: '#b71c1c' };
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
  if (min <= 30) return { label: 'HEALTHY', color: '#2e7d32' };
  if (min <= 60) return { label: 'MONITOR', color: '#c62828' };
  if (min <= 90) return { label: 'AT RISK', color: '#e65100' };
  return { label: 'CRITICAL', color: '#b71c1c' };
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
        <h2 className="text-2xl font-bold font-mono" style={{ color: '#1a1a1a' }}>INVENTORY</h2>
        <p className="text-sm" style={{ color: '#757575' }}>Inventory management and status tracking</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <StatBox label="Total Inventory Value" value={formatPrice(totalValue)} color="#1a1a1a" />
        <StatBox label="Average DOM" value={`${avgDOM} days`} color="#c62828" />
        <StatBox label="Units Needing Attention" value={String(needsAttention)} color="#e65100" />
      </div>

      {/* Age Breakdown Table */}
      <div>
        <div className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: '#757575' }}>AGE BREAKDOWN</div>
        <div style={{ background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                {['Age Range', 'Units', 'Avg Price', 'Avg DOM', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-mono uppercase tracking-wider px-4 py-2.5" style={{ color: '#757575' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ageData.map(row => (
                <tr key={row.range} style={{ borderBottom: '1px solid #e0e0e0' }} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 font-mono font-semibold" style={{ color: '#1a1a1a' }}>{row.range}</td>
                  <td className="px-4 py-2.5 font-mono" style={{ color: row.count > 0 ? '#1a1a1a' : '#757575' }}>{row.count}</td>
                  <td className="px-4 py-2.5 font-mono" style={{ color: '#1a1a1a' }}>{row.count > 0 ? formatPrice(row.avgPrice) : '\u2014'}</td>
                  <td className="px-4 py-2.5 font-mono" style={{ color: '#1a1a1a' }}>{row.count > 0 ? `${row.avgDom}d` : '\u2014'}</td>
                  <td className="px-4 py-2.5">
                    {row.count > 0 ? (
                      <span className="text-xs font-mono font-semibold px-2 py-0.5" style={{ color: row.status.color, background: `${row.status.color}15`, borderRadius: '4px' }}>
                        {row.status.label}
                      </span>
                    ) : (
                      <span className="text-xs font-mono" style={{ color: '#757575' }}>{'\u2014'}</span>
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
          <span className="text-xs font-mono uppercase tracking-wider" style={{ color: '#757575' }}>Sort:</span>
          {(['price', 'dom', 'variance'] as SortKey[]).map(k => (
            <button
              key={k}
              onClick={() => setSortBy(k)}
              className="px-3 py-1 text-xs font-mono uppercase transition-all"
              style={{
                background: sortBy === k ? '#c62828' : 'transparent',
                color: sortBy === k ? '#ffffff' : '#757575',
                border: `1px solid ${sortBy === k ? '#c62828' : '#e0e0e0'}`,
                borderRadius: '4px',
              }}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider" style={{ color: '#757575' }}>Class:</span>
          <select
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            className="text-xs font-mono px-3 py-1 outline-none"
            style={{ background: '#f8f8f8', color: '#1a1a1a', border: '1px solid #e0e0e0', borderRadius: '4px' }}
          >
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              {['Unit', 'Class', 'Asking', 'Market Avg', 'Variance', 'DOM', 'Status', 'Photos', ''].map(h => (
                <th key={h} className="text-left text-xs font-mono uppercase tracking-wider px-4 py-3" style={{ color: '#757575' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(unit => {
              const variance = unit.askingPrice - unit.marketAvg;
              const status = getStatus(unit.daysOnMarket);
              const domColor = unit.daysOnMarket > 60 ? '#b71c1c' : unit.daysOnMarket > 30 ? '#e65100' : '#1a1a1a';
              const cc = classColor(unit.class);
              const photos = mockPhotoCounts[unit.id] || 5;
              return (
                <tr key={unit.id} style={{ borderBottom: '1px solid #e0e0e0' }} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold" style={{ color: '#1a1a1a' }}>
                    {unit.year} {unit.make} {unit.model}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono px-2 py-0.5" style={{ background: cc.bg, color: cc.text, borderRadius: '4px' }}>{unit.class}</span>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold" style={{ color: '#1a1a1a' }}>{formatPrice(unit.askingPrice)}</td>
                  <td className="px-4 py-3 font-mono" style={{ color: '#757575' }}>{formatPrice(unit.marketAvg)}</td>
                  <td className="px-4 py-3 font-mono font-semibold" style={{ color: variance > 0 ? '#b71c1c' : variance < 0 ? '#2e7d32' : '#757575' }}>
                    {variance > 0 ? '+' : ''}{formatPrice(variance)}
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold" style={{ color: domColor }}>{unit.daysOnMarket}d</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5" style={{ color: status.color, background: `${status.color}15`, borderRadius: '4px' }}>{status.label}</span>
                  </td>
                  <td className="px-4 py-3 font-mono" style={{ color: photos < 5 ? '#e65100' : '#757575' }}>
                    {photos} {photos < 5 && <span className="text-xs">!</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-xs font-mono font-semibold px-3 py-1 transition-all"
                      style={{ color: '#c62828', border: '1px solid rgba(198,40,40,0.3)', borderRadius: '4px', background: 'transparent' }}
                      onMouseOver={e => (e.target as HTMLElement).style.background = 'rgba(198,40,40,0.1)'}
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
    <div style={{ background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '16px' }}>
      <div className="text-2xl font-bold font-mono" style={{ color }}>{value}</div>
      <div className="text-xs font-mono uppercase tracking-wider mt-1" style={{ color: '#757575' }}>{label}</div>
    </div>
  );
}
