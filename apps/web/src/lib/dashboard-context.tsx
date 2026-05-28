'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sessie, type Sessie } from './sessie';

/**
 * Dashboard-context: ingelogde gebruiker + actieve district-scope.
 *
 * Bepaalt automatisch het district op basis van de eerste DISTRICT-rol,
 * of valt terug op district #1 voor nationale rollen.
 *
 * Bij missende sessie redirect naar /login.
 */
type Ctx = {
  sessie: Sessie;
  activeDistrictId: number;
  activeRessortId?: number;
  /** Subregio van eerste DC-rol — optioneel, alleen voor DC's met sub-regio. */
  activeSubregioId?: number;
  activeSubregioCode?: string;
  activeSubregioNaam?: string;
  /** Toggle in UI: filter dashboards/lijsten op eigen subregio (default: aan). */
  filterEigenSubregio: boolean;
  setFilterEigenSubregio: (v: boolean) => void;
  /** Convenience: effectieve subregioId voor API-calls (undefined = hele district). */
  effectiefSubregioId?: number;
  /** C6 — handmatig gekozen ressort-filter (undefined = alle ressorten). */
  gekozenRessortId?: number;
  setGekozenRessortId: (id: number | undefined) => void;
  /** Module P — externe-dienst-gebruiker (scope ORGANISATIE). */
  isExtern: boolean;
  activeOrganisatieId?: number;
  activeOrganisatieCode?: string;
  activeOrganisatieNaam?: string;
  permissies: Set<string>;
  heeft: (permissie: string) => boolean;
  uitloggen: () => void;
};

const DashboardCtx = createContext<Ctx | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [s, setS] = useState<Sessie | null>(null);
  const [filterEigenSubregio, setFilterEigenSubregio] = useState(true);
  const [gekozenRessortId, setGekozenRessortId] = useState<number | undefined>();

  useEffect(() => {
    const huidige = sessie.get();
    if (!huidige) {
      router.replace('/login');
      return;
    }
    setS(huidige);
  }, [router]);

  const ctx: Ctx | null = useMemo(() => {
    if (!s) return null;
    const ressortRol = s.user.rollen.find((r) => r.scope === 'RESSORT');
    const districtRol = s.user.rollen.find((r) => r.scope === 'DISTRICT');
    const isNationaal = s.user.rollen.some((r) => r.scope === 'NATIONAAL');
    // ressort-rol bepaalt zowel ressort als district; anders eerste district-rol;
    // anders #1 voor nationale rollen
    const activeRessortId = ressortRol?.ressortId;
    const activeDistrictId =
      ressortRol?.districtId ?? districtRol?.districtId ?? (isNationaal ? 1 : 0);
    const subregioRol = s.user.rollen.find((r) => r.subregioId);
    const activeSubregioId = subregioRol?.subregioId;
    const orgRol = s.user.rollen.find((r) => r.scope === 'ORGANISATIE' && r.organisatieId);
    const permissies = new Set(s.user.permissies);
    return {
      sessie: s,
      activeDistrictId,
      activeRessortId,
      activeSubregioId,
      activeSubregioCode: subregioRol?.subregioCode,
      activeSubregioNaam: subregioRol?.subregioNaam,
      filterEigenSubregio,
      setFilterEigenSubregio,
      effectiefSubregioId:
        filterEigenSubregio && activeSubregioId ? activeSubregioId : undefined,
      gekozenRessortId,
      setGekozenRessortId,
      isExtern: Boolean(orgRol),
      activeOrganisatieId: orgRol?.organisatieId,
      activeOrganisatieCode: orgRol?.organisatieCode,
      activeOrganisatieNaam: orgRol?.organisatieNaam,
      permissies,
      heeft: (p: string) => permissies.has(p),
      uitloggen: () => {
        sessie.clear();
        router.replace('/');
      },
    };
  }, [s, router, filterEigenSubregio, gekozenRessortId]);

  if (!ctx) {
    return (
      <div className="flex h-full items-center justify-center py-12 text-sm text-gray-500">
        Sessie laden…
      </div>
    );
  }

  return <DashboardCtx.Provider value={ctx}>{children}</DashboardCtx.Provider>;
}

export function useDashboard(): Ctx {
  const ctx = useContext(DashboardCtx);
  if (!ctx) throw new Error('useDashboard buiten DashboardProvider gebruikt');
  return ctx;
}
