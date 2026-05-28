/** Status-badge voor verzoeken. statusCode is catalogus-specifiek, dus we
 *  tonen de coarse fase (open/afgehandeld/ingetrokken) met een kleur en de
 *  granulaire statusCode als label. */
export function verzoekStatusBadge(v: {
  statusCode: string;
  afgehandeldOp: string | null;
  ingetrokkenOp: string | null;
  resultaatCode?: string | null;
}): { label: string; kleur: string } {
  if (v.ingetrokkenOp) {
    return { label: 'Ingetrokken', kleur: 'bg-gray-200 text-gray-700' };
  }
  if (v.afgehandeldOp) {
    return {
      label: v.resultaatCode ? `Beantwoord · ${v.resultaatCode}` : 'Afgehandeld',
      kleur: 'bg-emerald-100 text-emerald-800',
    };
  }
  return { label: v.statusCode, kleur: 'bg-amber-100 text-amber-800' };
}
