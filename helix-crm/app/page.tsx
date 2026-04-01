// app/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'demo' && password === 'demo123') {
      localStorage.setItem('lotiq_user', username);
      router.push('/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#ffffff' }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(198,40,40,0.04)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(198,40,40,0.03)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center" style={{ border: '2px solid #c62828', borderRadius: '4px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c62828" strokeWidth="2.5" strokeLinecap="round">
                <path d="M3 3h18v18H3z" />
                <path d="M3 9h18" />
                <path d="M9 3v18" />
              </svg>
            </div>
            <span className="text-3xl font-bold tracking-tight font-mono" style={{ color: '#c62828' }}>LotIQ</span>
          </div>
          <p className="text-sm font-mono" style={{ color: '#757575' }}>RV Market Intelligence Platform</p>
        </div>

        <form onSubmit={handleLogin} style={{ background: '#f8f8f8', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '32px' }}>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-mono mb-1.5 uppercase tracking-wider" style={{ color: '#757575' }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 text-sm font-sans outline-none transition-all"
                style={{ background: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '4px', color: '#1a1a1a' }}
                onFocus={e => e.target.style.borderColor = '#c62828'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-xs font-mono mb-1.5 uppercase tracking-wider" style={{ color: '#757575' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-sm font-sans outline-none transition-all"
                style={{ background: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '4px', color: '#1a1a1a' }}
                onFocus={e => e.target.style.borderColor = '#c62828'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                placeholder="Enter password"
              />
            </div>
            {error && <p className="text-sm font-mono" style={{ color: '#c62828' }}>{error}</p>}
            <button
              type="submit"
              className="w-full py-2.5 text-sm font-semibold font-mono uppercase tracking-wider transition-all"
              style={{ background: '#c62828', color: '#ffffff', borderRadius: '4px', border: 'none' }}
              onMouseOver={e => (e.target as HTMLElement).style.background = '#e53935'}
              onMouseOut={e => (e.target as HTMLElement).style.background = '#c62828'}
            >
              Sign In
            </button>
            <p className="text-center text-xs font-mono" style={{ color: '#757575' }}>
              demo / demo123
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
