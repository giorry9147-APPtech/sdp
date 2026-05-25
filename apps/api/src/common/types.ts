/**
 * Gedeelde typen voor request-context en RBAC.
 */

export type RolScopeContext = {
  rol: string;
  scope: 'NATIONAAL' | 'DISTRICT' | 'RESSORT';
  districtId?: number;
  ressortId?: number;
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
