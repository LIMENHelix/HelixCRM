// components/PricingView.tsx
'use client';
import { useState } from 'react';
import { rvUnits, formatPrice, classColor, RVUnit } from './shared';

const radiusOptions = [50, 100, 200, 0] as const;

const compTiers = [
  { radius: '100mi', units: 4, avgPrice: 0 },
  { radius: '250mi', units: 9, avgPrice: 0 },
  { radius: '500mi', units: 18, avgPrice: 0 },
  { radius: '1,000mi', units: 34, avgPrice: 0 },
  { radius: '2,000mi', units: 61, avgPrice: 0 },
  { radius: 'Nationwide', units: 142, avgPrice: 0 },
];

function getCompTiers(unit: RVUnit) {
  const base = unit.marketAvg;
  return compTiers.map(t => ({
    ...t,
    avgPrice: Math.round(base * (0.94 + Math.random() * 0.12)),
  }));
}

function getPriceStatus(ratio: number): { label: string; color: string } {
  if (ratio > 1.05) return { label: 'OVERPRICED', color: '#ff4444' };
  if (ratio > 1.01) return { label: 'MILDLY OVERPRICED', color: '#ffb800' };
  if (ratio >= 0.96) return { label: 'ON TARGET', color: '#00ff88' };
  return { label: 'UNDERPRICED', color: '#00d4ff' };
}

export default function PricingView() {
  const [radius, setRadius] = useState<number>(0);
  const [modalUnit, setModalUnit] = useState<RVUnit | null>(null);

  const filtered = radius === 0 ? rvUnits : rvUnits.filter(u => u.radius <= radius);

  const avgDOM = filtered.length ? Math.round(filtered.reduce((s, u) => s + u.daysOnMarket, 0) / filtered.length) : 0;
  const aboveCount = filtered.filter(u => u.trend === 'above').length;
  const belowCount = filtered.filter(u => u.trend === 'below').length;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-mono" style={{ color: '#fff' }}>PRICING INTEL</h2>
        <p className="text-sm" style={{ color: '#7a8fa6' }}>Market position analysis for your inventory</p>
      </div>

      {/* Radius Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono uppercase tracking-wider" style={{ color: '#7a8fa6' }}>Radius:</span>
        {radiusOptions.map(r => (
          <button
            key={r}
            onClick={() => setRadius(r)}
            className="px-3 py-1 text-xs font-mono transition-all"
            style={{
              background: radius === r ? '#00d4ff' : 'transparent',
              color: radius === r ? '#080c10' : '#7a8fa6',
              border: `1px solid ${radius === r ? '#00d4ff' : '#1e2d3d'}`,
              borderRadius: '4px',
            }}
          >
            {r === 0 ? 'ALL' : `${r}mi`}
          </button>
        ))}
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-4 gap-4">
        <StatBox label="Total Units" value={String(filtered.length)} color="#fff" />
        <StatBox label="Avg Days on Market" value={String(avgDOM)} color="#00d4ff" />
        <StatBox label="Units Above Market" value={String(aboveCount)} color="#ff4444" />
        <StatBox label="Units Below Market" value={String(belowCount)} color="#00ff88" />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map(unit => (
          <UnitCard key={unit.id} unit={unit} onAnalyze={() => setModalUnit(unit)} />
        ))}
      </div>

      {/* Price Analysis Modal */}
      {modalUnit && <PriceAnalysisModal unit={modalUnit} onClose={() => setModalUnit(null)} />}
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

function UnitCard({ unit, onAnalyze }: { unit: RVUnit; onAnalyze: () => void }) {
  const diff = unit.askingPrice - unit.marketAvg;
  const cc = classColor(unit.class);
  const trendColor = unit.trend === 'above' ? '#ff4444' : unit.trend === 'below' ? '#00ff88' : '#7a8fa6';
  const trendLabel = unit.trend === 'above' ? 'ABOVE MARKET' : unit.trend === 'below' ? 'BELOW MARKET' : 'AT MARKET';
  const trendArrow = unit.trend === 'above' ? '\u25B2' : unit.trend === 'below' ? '\u25BC' : '\u25C6';
  const domColor = unit.daysOnMarket > 60 ? '#ff4444' : unit.daysOnMarket > 30 ? '#ffb800' : '#c9d4e0';

  return (
    <div style={{ background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: '4px', padding: '20px' }} className="animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-base font-bold" style={{ color: '#fff' }}>
            {unit.year} {unit.make} {unit.model}
          </div>
          <span
            className="inline-block text-xs font-mono px-2 py-0.5 mt-1"
            style={{ background: cc.bg, color: cc.text, borderRadius: '4px' }}
          >
            {unit.class}
          </span>
        </div>
        <span
          className="text-xs font-mono font-semibold px-2 py-0.5"
          style={{ color: trendColor, background: `${trendColor}15`, borderRadius: '4px' }}
        >
          {trendArrow} {trendLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-xs font-mono uppercase" style={{ color: '#7a8fa6' }}>Asking</div>
          <div className="text-lg font-bold font-mono" style={{ color: '#fff' }}>{formatPrice(unit.askingPrice)}</div>
        </div>
        <div>
          <div className="text-xs font-mono uppercase" style={{ color: '#7a8fa6' }}>Market Avg</div>
          <div className="text-lg font-bold font-mono" style={{ color: '#7a8fa6' }}>{formatPrice(unit.marketAvg)}</div>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-3">
        <span className="text-xs font-mono" style={{ color: '#7a8fa6' }}>Variance:</span>
        <span className="text-sm font-mono font-semibold" style={{ color: diff > 0 ? '#ff4444' : diff < 0 ? '#00ff88' : '#7a8fa6' }}>
          {diff > 0 ? '+' : ''}{formatPrice(diff)}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs font-mono mb-4" style={{ color: '#7a8fa6' }}>
        <span>DOM: <span style={{ color: domColor, fontWeight: 600 }}>{unit.daysOnMarket}d</span></span>
        <span>{unit.compCount} comps within {unit.radius}mi</span>
      </div>

      <button
        onClick={onAnalyze}
        className="w-full py-2 text-xs font-mono font-semibold uppercase tracking-wider transition-all"
        style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '4px' }}
        onMouseOver={e => (e.target as HTMLElement).style.background = 'rgba(0,212,255,0.2)'}
        onMouseOut={e => (e.target as HTMLElement).style.background = 'rgba(0,212,255,0.1)'}
      >
        Price Analysis
      </button>
    </div>
  );
}

function PriceAnalysisModal({ unit, onClose }: { unit: RVUnit; onClose: () => void }) {
  const ratio = unit.askingPrice / unit.marketAvg;
  const status = getPriceStatus(ratio);
  const tiers = getCompTiers(unit);

  // Gauge: 80% to 120% of market
  const gaugeMin = 0.80;
  const gaugeMax = 1.20;
  const clampedRatio = Math.min(Math.max(ratio, gaugeMin), gaugeMax);
  const dotPosition = ((clampedRatio - gaugeMin) / (gaugeMax - gaugeMin)) * 100;

  // Target range: 92-95% of market
  const targetLeft = ((0.92 - gaugeMin) / (gaugeMax - gaugeMin)) * 100;
  const targetWidth = ((0.95 - 0.92) / (gaugeMax - gaugeMin)) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: '4px', padding: '28px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-all"
          style={{ color: '#7a8fa6', border: '1px solid #1e2d3d', borderRadius: '4px', background: 'transparent' }}
          onMouseOver={e => (e.target as HTMLElement).style.background = 'rgba(255,68,68,0.1)'}
          onMouseOut={e => (e.target as HTMLElement).style.background = 'transparent'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {/* Photo Placeholder */}
        <div
          className="w-full h-48 flex items-center justify-center mb-6"
          style={{ background: '#1a1f2e', border: '1px solid #1e2d3d', borderRadius: '4px' }}
        >
          <div className="text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7a8fa6" strokeWidth="1.5" className="mx-auto mb-2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            <div className="text-sm font-mono" style={{ color: '#7a8fa6' }}>{unit.year} {unit.make} {unit.model}</div>
          </div>
        </div>

        {/* Price Comparison */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center" style={{ background: '#080c10', borderRadius: '4px', padding: '16px', border: '1px solid #1e2d3d' }}>
            <div className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: '#7a8fa6' }}>Your Price</div>
            <div className="text-3xl font-bold font-mono" style={{ color: '#fff' }}>{formatPrice(unit.askingPrice)}</div>
          </div>
          <div className="text-center" style={{ background: '#080c10', borderRadius: '4px', padding: '16px', border: '1px solid #1e2d3d' }}>
            <div className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: '#7a8fa6' }}>Market Average</div>
            <div className="text-3xl font-bold font-mono" style={{ color: '#00d4ff' }}>{formatPrice(unit.marketAvg)}</div>
          </div>
        </div>

        {/* Price Position Gauge */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono" style={{ color: '#7a8fa6' }}>PRICE POSITION</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5" style={{ color: status.color, background: `${status.color}15`, borderRadius: '4px' }}>
              {status.label}
            </span>
          </div>
          <div className="relative h-8" style={{ background: '#080c10', borderRadius: '4px', border: '1px solid #1e2d3d' }}>
            {/* Gauge gradient bar */}
            <div className="absolute inset-y-0 left-0 right-0 flex" style={{ borderRadius: '4px', overflow: 'hidden' }}>
              <div className="flex-1" style={{ background: 'linear-gradient(to right, #00d4ff, #00ff88 30%, #00ff88 40%, #ffb800 60%, #ff4444 80%, #ff4444)' , opacity: 0.25 }} />
            </div>
            {/* Target range highlight */}
            <div
              className="absolute inset-y-0"
              style={{
                left: `${targetLeft}%`,
                width: `${targetWidth}%`,
                background: 'rgba(0,255,136,0.2)',
                borderLeft: '1px solid #00ff88',
                borderRight: '1px solid #00ff88',
              }}
            />
            {/* Position dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
              style={{
                left: `calc(${dotPosition}% - 8px)`,
                background: status.color,
                boxShadow: `0 0 8px ${status.color}`,
                border: '2px solid #fff',
              }}
            />
            {/* Labels */}
            <div className="absolute -bottom-5 left-0 text-xs font-mono" style={{ color: '#7a8fa6' }}>80%</div>
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-mono" style={{ color: '#7a8fa6' }}>100%</div>
            <div className="absolute -bottom-5 right-0 text-xs font-mono" style={{ color: '#7a8fa6' }}>120%</div>
          </div>
          <div className="flex items-center gap-2 mt-7">
            <div className="w-3 h-3" style={{ background: 'rgba(0,255,136,0.3)', border: '1px solid #00ff88', borderRadius: '2px' }} />
            <span className="text-xs font-mono" style={{ color: '#7a8fa6' }}>Target range (92-95% of market)</span>
          </div>
        </div>

        {/* Competitor Table */}
        <div>
          <div className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: '#7a8fa6' }}>COMPETITOR PRICING BY RADIUS</div>
          <div style={{ border: '1px solid #1e2d3d', borderRadius: '4px', overflow: 'hidden' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#080c10', borderBottom: '1px solid #1e2d3d' }}>
                  <th className="text-left text-xs font-mono uppercase tracking-wider px-4 py-2.5" style={{ color: '#7a8fa6' }}>Distance</th>
                  <th className="text-left text-xs font-mono uppercase tracking-wider px-4 py-2.5" style={{ color: '#7a8fa6' }}>Units</th>
                  <th className="text-left text-xs font-mono uppercase tracking-wider px-4 py-2.5" style={{ color: '#7a8fa6' }}>Avg Price</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map(t => (
                  <tr key={t.radius} style={{ borderBottom: '1px solid #1e2d3d' }} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5 font-mono font-semibold" style={{ color: '#00d4ff' }}>{t.radius}</td>
                    <td className="px-4 py-2.5 font-mono" style={{ color: '#c9d4e0' }}>{t.units}</td>
                    <td className="px-4 py-2.5 font-mono" style={{ color: '#c9d4e0' }}>{formatPrice(t.avgPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
