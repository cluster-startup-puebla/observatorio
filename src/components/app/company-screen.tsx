import { AppCard } from "@/components/app/app-card";
import { CompanyChecklist } from "@/components/app/company-checklist";
import { SectorRank } from "@/components/methodology/v2/sector-rank";
import { bandLabel } from "@/lib/admin/empresas/band-label";
import type { CompanyHome, CompanyScore } from "@/lib/app/company-score";
import { marketSizes } from "@/lib/onboarding/market-sizes";

const medals: Record<string, string> = {
  platino: "Platino",
  oro: "Oro",
  plata: "Plata",
  bronce: "Bronce",
};

function clean(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  return text || null;
}

function named(value: string | null, labelFor: (raw: string) => string | null | undefined) {
  const raw = clean(value);
  if (!raw) return null;
  return clean(labelFor(raw) ?? null) ?? raw;
}

function grade(score: CompanyScore) {
  const band = score.band ? (medals[score.band] ?? score.band) : "";
  const note = score.ismsNivel2.toFixed(2);
  return band ? `${band} · ${note}` : note;
}

function rowsFor(home: CompanyHome) {
  const pairs: [string, string | null][] = [
    ["Empresa", clean(home.legalName)],
    ["Sector", clean(home.sectorName)],
    ["Tamaño", named(home.employeeBand, bandLabel)],
    ["Sitio web", clean(home.website)],
    ["Municipio", clean(home.municipality)],
    ["Mercado", named(home.marketSize, (raw) => marketSizes.find((item) => item.value === raw)?.label)],
    ["Cómo llegó", clean(home.referral)],
    ["Interés", clean(home.sessionInterest)],
  ];
  return pairs.flatMap(([label, value]) => (value ? [{ label, value }] : []));
}

export function CompanyScreen({ home }: { home: CompanyHome }) {
  const rows = rowsFor(home);
  return (
    <div className="grid w-full max-w-lg gap-8 md:max-w-none">
      <AppCard>
        <h1 className="text-h3 text-ink">Empresa</h1>
        {rows.length ? (
          <dl className="mt-6 grid gap-5">
            {rows.map((row) => (
              <div key={row.label}>
                <dt className="text-micro text-ink-secondary">{row.label}</dt>
                <dd className="mt-1 text-body text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {home.score ? (
          <p className="mt-6">
            <span className="block text-micro text-ink-secondary">Última calificación</span>
            <span className="mt-1 block text-body text-ink">{grade(home.score)}</span>
          </p>
        ) : null}
      </AppCard>
      <SectorRank />
      <CompanyChecklist actions={home.actions} />
    </div>
  );
}
