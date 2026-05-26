'use client';

import { useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { api, type ProjectDetail } from '@/lib/api';

/**
 * F2 — Toont contractor gestructureerd (bedrijf + KKF + contact) en
 * laat behandelaars deze inline bewerken. Toont een neutrale "geen
 * contractor geregistreerd" state als er nog niets ingevuld is.
 */
export function ContractorCard({
  project,
  onUpdated,
}: {
  project: ProjectDetail;
  onUpdated: () => void;
}) {
  const { sessie, heeft } = useDashboard();
  const [bewerk, setBewerk] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  const [contractor, setContractor] = useState(project.contractor ?? '');
  const [kkf, setKkf] = useState(project.contractorKkfNummer ?? '');
  const [contact, setContact] = useState(project.contractorContactpersoon ?? '');
  const [tel, setTel] = useState(project.contractorTelefoon ?? '');
  const [email, setEmail] = useState(project.contractorEmail ?? '');

  const heeftIets =
    !!project.contractor ||
    !!project.contractorKkfNummer ||
    !!project.contractorContactpersoon ||
    !!project.contractorTelefoon ||
    !!project.contractorEmail;

  async function opslaan() {
    setBezig(true);
    setFout(null);
    try {
      await api.projectContractor(
        project.id,
        {
          contractor: contractor.trim() || undefined,
          contractorKkfNummer: kkf.trim() || undefined,
          contractorContactpersoon: contact.trim() || undefined,
          contractorTelefoon: tel.trim() || undefined,
          contractorEmail: email.trim() || undefined,
        },
        sessie.accessToken,
      );
      setBewerk(false);
      onUpdated();
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'fout');
    } finally {
      setBezig(false);
    }
  }

  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">Contractor</h2>
        {heeft('project.update') && !bewerk && (
          <button
            onClick={() => setBewerk(true)}
            className="text-xs text-sdp-groen underline hover:text-emerald-700"
          >
            {heeftIets ? 'Bewerken' : '+ Toevoegen'}
          </button>
        )}
      </div>

      {!bewerk && !heeftIets && (
        <p className="mt-2 text-sm text-gray-500">Geen contractor geregistreerd.</p>
      )}

      {!bewerk && heeftIets && (
        <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {project.contractor && <Rij label="Bedrijf">{project.contractor}</Rij>}
          {project.contractorKkfNummer && (
            <Rij label="KKF-nummer">
              <span className="font-mono">{project.contractorKkfNummer}</span>
            </Rij>
          )}
          {project.contractorContactpersoon && (
            <Rij label="Contactpersoon">{project.contractorContactpersoon}</Rij>
          )}
          {project.contractorTelefoon && (
            <Rij label="Telefoon">
              <a href={`tel:${project.contractorTelefoon}`} className="text-sdp-groen hover:underline">
                {project.contractorTelefoon}
              </a>
            </Rij>
          )}
          {project.contractorEmail && (
            <Rij label="E-mail">
              <a href={`mailto:${project.contractorEmail}`} className="text-sdp-groen hover:underline">
                {project.contractorEmail}
              </a>
            </Rij>
          )}
        </dl>
      )}

      {bewerk && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Veld label="Bedrijfsnaam">
            <input
              type="text"
              maxLength={200}
              value={contractor}
              onChange={(e) => setContractor(e.target.value)}
              className="w-full rounded border-gray-300 text-sm"
              placeholder="bv. Wanica Wegenbouw N.V."
            />
          </Veld>
          <Veld label="KKF-nummer">
            <input
              type="text"
              maxLength={40}
              value={kkf}
              onChange={(e) => setKkf(e.target.value)}
              className="w-full rounded border-gray-300 font-mono text-sm"
              placeholder="bv. 12345.6"
            />
          </Veld>
          <Veld label="Contactpersoon">
            <input
              type="text"
              maxLength={200}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full rounded border-gray-300 text-sm"
            />
          </Veld>
          <Veld label="Telefoon">
            <input
              type="tel"
              maxLength={40}
              value={tel}
              onChange={(e) => setTel(e.target.value)}
              className="w-full rounded border-gray-300 text-sm"
            />
          </Veld>
          <Veld label="E-mail">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border-gray-300 text-sm sm:col-span-2"
            />
          </Veld>

          {fout && (
            <p className="text-xs text-red-700 sm:col-span-2">{fout}</p>
          )}

          <div className="flex justify-end gap-2 sm:col-span-2">
            <button
              onClick={() => {
                setBewerk(false);
                setContractor(project.contractor ?? '');
                setKkf(project.contractorKkfNummer ?? '');
                setContact(project.contractorContactpersoon ?? '');
                setTel(project.contractorTelefoon ?? '');
                setEmail(project.contractorEmail ?? '');
                setFout(null);
              }}
              className="rounded px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
            >
              Annuleren
            </button>
            <button
              onClick={opslaan}
              disabled={bezig}
              className="rounded bg-sdp-groen px-3 py-1.5 text-xs font-semibold text-white shadow disabled:opacity-50"
            >
              {bezig ? 'Opslaan…' : 'Opslaan'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Rij({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-gray-500">{label}</dt>
      <dd>{children}</dd>
    </>
  );
}

function Veld({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}
