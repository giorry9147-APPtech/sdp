'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sessie } from '@/lib/sessie';

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [wachtwoord, setWachtwoord] = useState('');
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  async function inloggen(e: React.FormEvent) {
    e.preventDefault();
    setFout(null);
    setBezig(true);
    try {
      const r = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, wachtwoord }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { message?: string };
        throw new Error(j.message ?? `Login mislukt (${r.status})`);
      }
      const data = await r.json();
      sessie.set(data);
      router.push('/dashboard');
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'Onbekende fout');
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-sdp-groen">Inloggen</h1>

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Auth-provider:</strong> de actieve identity-provider wordt
        server-side bepaald via <code>AUTH_PROVIDER</code>. MVP-default is
        <code> email-password</code>; koppeling met Digitale-ID Government
        Authenticator volgt zodra het OIDC-endpoint beschikbaar is — zonder
        deze pagina te wijzigen.
      </div>

      <form onSubmit={inloggen} className="mt-6 space-y-4 rounded-lg bg-white p-6 shadow-sm">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">E-mail</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border-gray-300"
            autoComplete="username"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Wachtwoord</span>
          <input
            type="password"
            required
            minLength={8}
            value={wachtwoord}
            onChange={(e) => setWachtwoord(e.target.value)}
            className="w-full rounded border-gray-300"
            autoComplete="current-password"
          />
        </label>
        {fout && (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {fout}
          </div>
        )}
        <button
          type="submit"
          disabled={bezig}
          className="w-full rounded-lg bg-sdp-groen px-6 py-2.5 font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
        >
          {bezig ? 'Bezig…' : 'Inloggen'}
        </button>
      </form>
    </div>
  );
}
