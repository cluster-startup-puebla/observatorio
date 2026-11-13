import { QrCode } from "lucide-react";
import Link from "next/link";
import type { PassFace } from "@/lib/admin/pases/relations";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-24 rounded-xl border border-line bg-surface-subtle px-3 py-3 text-center">
      <div className="text-body font-semibold text-ink">{value}</div>
      <div className="text-small text-ink-secondary">{label}</div>
    </div>
  );
}

export function PaseHeader({ face }: { face: PassFace }) {
  return (
    <section className="rounded-2xl border border-line bg-elevated p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {face.assetId ? (
            <img
              src={`/api/admin/medios/${face.assetId}/archivo`}
              alt=""
              className="size-20 shrink-0 rounded-2xl border border-line bg-surface-subtle object-contain"
            />
          ) : (
            <span className="grid size-20 shrink-0 place-items-center rounded-2xl border border-line bg-surface-subtle text-ink">
              <QrCode className="size-8" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold text-ink">{face.name}</h2>
            {face.email ? <p className="mt-1 text-small text-ink-secondary">{face.email}</p> : null}
            {face.companyHref ? (
              <Link href={face.companyHref} className="mt-1 inline-block text-small text-link">
                {face.companyName}
              </Link>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Stat label="Sesión" value={face.sessionShort} />
          <Stat label="Llegada" value={face.arrived ? "Sí" : "No"} />
        </div>
      </div>
    </section>
  );
}
