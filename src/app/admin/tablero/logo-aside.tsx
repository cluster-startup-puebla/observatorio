import Link from "next/link";
import type { ShowableLogo } from "@/lib/admin/empresas/event-logos";

export function LogoAside({ logos }: { logos: ShowableLogo[] }) {
  if (logos.length === 0) return null;
  const waiting = logos.some((logo) => logo.pending);
  return (
    <aside className="h-fit rounded-2xl border border-line bg-elevated p-5 lg:sticky lg:top-6">
      <h2 className="text-h4 text-ink">Se pueden mostrar</h2>
      <ul className="mt-4 grid gap-3">
        {logos.map((logo) => (
          <li key={logo.companyId}>
            <Link href={`/admin/empresas/${logo.companyId}`} className="grid gap-2 rounded-lg border border-line p-3">
              <img
                src={`/api/admin/empresas/${logo.companyId}/logo`}
                alt=""
                className={`h-12 w-full object-contain ${logo.pending ? "grayscale" : ""}`}
              />
              <span className={`truncate text-small ${logo.pending ? "text-ink-muted" : "text-ink"}`}>{logo.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      {waiting ? <p className="mt-4 text-small text-ink-muted">En gris falta confirmarles su asistencia.</p> : null}
    </aside>
  );
}
