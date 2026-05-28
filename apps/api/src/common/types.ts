/**
 * Gedeelde typen voor request-context en RBAC.
 */

export type RolScopeContext = {
  rol: string;
  scope: 'NATIONAAL' | 'DISTRICT' | 'RESSORT' | 'ORGANISATIE';
  districtId?: number;
  ressortId?: number;
  subregioId?: number; // DC-cluster binnen district (alleen voor DC's met subregio)
  subregioCode?: string; // bv. 'WAN-ZO' — handig voor UI-labels
  subregioNaam?: string; // bv. 'Zuid-Oost' — voor UI-display
  organisatieId?: number; // externe dienst (scope ORGANISATIE) — EO2
  organisatieCode?: string; // bv. 'GBB' — voor UI-labels
  organisatieNaam?: string; // bv. 'Grondbeleid & Bosbeheer' — voor UI-display
};

export type AuthenticatedUser = {
  id: string;
  email: string | null;
  naam: string;
  rollen: RolScopeContext[];
  permissies: Set<string>; // afgeleid uit rollen, voor snelle checks
};

declare module 'express' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Request {
    user?: AuthenticatedUser;
    ip?: string;
  }
}
