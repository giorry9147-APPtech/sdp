/**
 * Eenvoudig client-side sessiebeheer (localStorage). MVP only.
 *
 * Later vervangen door HTTP-only cookies via een Next.js route handler
 * wanneer Digitale-ID OIDC gekoppeld wordt (en CSRF-bescherming nodig is).
 */

const KEY = 'sdp.sessie.v1';

export type Sessie = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string | null;
    naam: string;
    rollen: Array<{
      rol: string;
      scope: 'NATIONAAL' | 'DISTRICT' | 'RESSORT';
      districtId?: number;
      ressortId?: number;
      subregioId?: number;
      subregioCode?: string;
      subregioNaam?: string;
    }>;
    permissies: string[];
  };
};

export const sessie = {
  get(): Sessie | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Sessie;
    } catch {
      return null;
    }
  },
  set(s: Sessie): void {
    localStorage.setItem(KEY, JSON.stringify(s));
  },
  clear(): void {
    localStorage.removeItem(KEY);
  },
};
