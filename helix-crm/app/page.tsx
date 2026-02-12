// app/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: accept any credentials
    if (email && password) {
      localStorage.setItem('helix-auth', JSON.stringify({ email, name: email.split('@')[0] }));
      router.push('/dashboard');
    } else {
      setError('Enter email and password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-helix-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-helix-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-helix-500 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-ink">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-2xl font-display text-white tracking-tight">HELIX CRM</span>
          </div>
          <p className="text-muted text-sm">AI-Powered Email Automation</p>
        </div>

        <form onSubmit={handleLogin} className="card space-y-5">
          <div>
            <label className="block text-sm text-subtle mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@limenhelix.com"
            />
          </div>
          <div>
            <label className="block text-sm text-subtle mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full">
            Sign In
          </button>
          <p className="text-center text-xs text-muted">
            Demo: Use any email/password to sign in
          </p>
        </form>
      </div>
    </div>
  );
}
