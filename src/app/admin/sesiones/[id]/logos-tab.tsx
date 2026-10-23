import { loadEventLogos } from "@/lib/admin/empresas/load-event-logos";

export async function LogosTab() {
  const logos = await loadEventLogos();
  if (logos.length === 0) return <p className="text-small text-ink-muted">Nadie pidió mostrar su logo.</p>;
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {logos.map((logo) => (
        <li key={logo.companyId} className="grid gap-2 rounded-lg border border-line p-3">
          <img src={`/api/admin/empresas/${logo.companyId}/logo`} alt="" className="h-16 w-auto object-contain" />
          <p className="text-small text-ink">{logo.name}</p>
        </li>
      ))}
    </ul>
  );
}
