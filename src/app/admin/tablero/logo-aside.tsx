import Link from "next/link";
import { LogoTile } from "@/app/admin/tablero/logo-tile";
import { Button } from "@/components/ui/button";
import { takeLatest, type ShowableLogo } from "@/lib/admin/empresas/event-logos";

export function LogoAside({ logos }: { logos: ShowableLogo[] }) {
  const shown = takeLatest(logos);
  if (shown.length === 0) return null;
  const waiting = shown.some((logo) => logo.pending);
  return (
    <aside className="h-fit rounded-2xl border border-line bg-elevated p-5 lg:sticky lg:top-6">
      <h2 className="text-h4 text-ink">Se pueden mostrar</h2>
      <ul className="mt-4 grid gap-3">
        {shown.map((logo) => (
          <li key={logo.companyId}>
            <LogoTile logo={logo} />
          </li>
        ))}
      </ul>
      {waiting ? <p className="mt-4 text-small text-ink-muted">En gris falta confirmarles su asistencia.</p> : null}
      <Button asChild variant="outline" size="sm" className="mt-4">
        <Link href="/admin/logo">Ver todos</Link>
      </Button>
    </aside>
  );
}
