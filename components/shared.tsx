// components/shared.tsx
'use client';

export interface RVUnit {
  id: number;
  year: number;
  make: string;
  model: string;
  class: string;
  vin: string;
  askingPrice: number;
  marketAvg: number;
  daysOnMarket: number;
  radius: number;
  compCount: number;
  trend: 'above' | 'below' | 'at';
}

export interface Competitor {
  id: number;
  name: string;
  location: string;
  distance: number;
  units: number;
  avgPrice: number;
  avgDOM: number;
  priceChanges7d: number;
  lastSeen: string;
}

export const rvUnits: RVUnit[] = [
  { id:1, year:2022, make:"Thor", model:"Magnitude", class:"Class A", vin:"1HTM5222XNH123456", askingPrice:189000, marketAvg:182000, daysOnMarket:14, radius:50, compCount:6, trend:"above" },
  { id:2, year:2021, make:"Tiffin", model:"Allegro Bus", class:"Class A", vin:"4UZABRDB4MCNA1234", askingPrice:245000, marketAvg:251000, daysOnMarket:8, radius:50, compCount:4, trend:"below" },
  { id:3, year:2023, make:"Winnebago", model:"Vita", class:"Class B", vin:"WD3PE8CC4N5123456", askingPrice:98000, marketAvg:97500, daysOnMarket:3, radius:100, compCount:9, trend:"at" },
  { id:4, year:2020, make:"Grand Design", model:"Solitude", class:"5th Wheel", vin:"573FB4022L3123456", askingPrice:67000, marketAvg:72000, daysOnMarket:45, radius:100, compCount:12, trend:"below" },
  { id:5, year:2022, make:"Forest River", model:"Georgetown", class:"Class C", vin:"4UZABRDB4MCNA5678", askingPrice:142000, marketAvg:138000, daysOnMarket:22, radius:75, compCount:7, trend:"above" },
  { id:6, year:2019, make:"Airstream", model:"Flying Cloud", class:"Travel Trailer", vin:"1STFBAB21KJ123456", askingPrice:89000, marketAvg:85000, daysOnMarket:67, radius:200, compCount:3, trend:"above" },
  { id:7, year:2023, make:"Coachmen", model:"Sportscoach", class:"Class A", vin:"1F65F5DY8N0123456", askingPrice:175000, marketAvg:179000, daysOnMarket:5, radius:50, compCount:8, trend:"below" },
  { id:8, year:2021, make:"Keystone", model:"Montana", class:"5th Wheel", vin:"4YDF37223M3123456", askingPrice:55000, marketAvg:54500, daysOnMarket:31, radius:150, compCount:11, trend:"at" },
];

export const competitors: Competitor[] = [
  { id:1, name:"Texas RV Superstore", location:"Houston, TX", distance:12, units:47, avgPrice:168000, avgDOM:28, priceChanges7d:6, lastSeen:"2 hours ago" },
  { id:2, name:"Lone Star RV", location:"San Antonio, TX", distance:34, units:31, avgPrice:142000, avgDOM:35, priceChanges7d:2, lastSeen:"1 day ago" },
  { id:3, name:"Sun Country RV", location:"Dallas, TX", distance:67, units:58, avgPrice:195000, avgDOM:19, priceChanges7d:11, lastSeen:"4 hours ago" },
  { id:4, name:"Freedom RV", location:"Austin, TX", distance:89, units:23, avgPrice:127000, avgDOM:44, priceChanges7d:1, lastSeen:"3 days ago" },
  { id:5, name:"RV Nation", location:"Oklahoma City, OK", distance:178, units:72, avgPrice:158000, avgDOM:22, priceChanges7d:14, lastSeen:"1 hour ago" },
];

export function formatPrice(n: number): string {
  return '$' + n.toLocaleString();
}

export function classColor(cls: string): { bg: string; text: string } {
  switch (cls) {
    case 'Class A': return { bg: 'rgba(198,40,40,0.1)', text: '#c62828' };
    case 'Class B': return { bg: 'rgba(183,28,28,0.1)', text: '#b71c1c' };
    case 'Class C': return { bg: 'rgba(229,57,53,0.1)', text: '#e53935' };
    case '5th Wheel': return { bg: 'rgba(230,81,0,0.1)', text: '#e65100' };
    case 'Travel Trailer': return { bg: 'rgba(46,125,50,0.1)', text: '#2e7d32' };
    default: return { bg: 'rgba(117,117,117,0.1)', text: '#757575' };
  }
}
