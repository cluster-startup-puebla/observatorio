import { PaseSection } from "@/app/admin/empresas/[id]/pase-section";
import type { CuentaSessionPass } from "@/lib/admin/cuentas/load-session-passes";
import { passQrDataUrl } from "@/lib/pass/qr-data-url";

export async function CuentaPaseTab({
  assetId,
  sessions,
}: {
  assetId: string | null;
  sessions: CuentaSessionPass[];
}) {
  if (!assetId && sessions.length === 0) {
    return <p className="text-sm text-ink-secondary">Sin pases.</p>;
  }
  const cards = await Promise.all(
    sessions.map(async (item) => ({ ...item, src: await passQrDataUrl(item.rsvpId) })),
  );
  return (
    <div className="grid gap-8">
      {assetId ? (
        <section className="grid gap-2">
          <h2 className="text-sm font-medium text-ink">Pase de cuenta</h2>
          <PaseSection assetId={assetId} />
        </section>
      ) : null}
      {cards.length ? (
        <section className="grid gap-4">
          <h2 className="text-sm font-medium text-ink">Pases por sesión</h2>
          <ul className="grid gap-6 sm:grid-cols-2">
            {cards.map((item) => (
              <li key={item.rsvpId} className="grid gap-2">
                <p className="text-sm text-ink">{item.sessionTitle}</p>
                {item.sessionSlug ? <p className="text-xs text-ink-secondary">{item.sessionSlug}</p> : null}
                <img
                  src={item.src}
                  alt={`QR ${item.sessionTitle}`}
                  width={192}
                  height={192}
                  className="h-48 w-48 rounded-lg border border-line bg-elevated object-contain"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
