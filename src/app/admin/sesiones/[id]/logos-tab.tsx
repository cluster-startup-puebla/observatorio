import { LogoTile } from "@/app/admin/tablero/logo-tile";
import { loadLatestLogos } from "@/lib/admin/tablero/latest-logos";

export async function LogosTab({ sessionId }: { sessionId: string }) {
  const logos = await loadLatestLogos(sessionId);
  if (logos.length === 0) {
    return <p className="text-small text-ink-muted">Nadie pidió mostrar su logo en esta sesión.</p>;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {logos.map((logo) => (
        <li key={logo.companyId}>
          <LogoTile logo={logo} />
        </li>
      ))}
    </ul>
  );
}
