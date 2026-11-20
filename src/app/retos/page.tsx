import type { Metadata } from "next";
import { RetosList } from "@/components/retos/retos-list";
import { pageMetadata } from "@/lib/metadata";
import { listPortalChallenges } from "@/lib/retos/load-portal";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Retos",
  description: "Necesidades tecnológicas publicadas por empresas del Observatorio.",
  path: "/retos",
});

export default async function RetosPage() {
  const rows = await listPortalChallenges();
  return (
    <div className="container-site py-16 lg:py-24">
      <h1 className="text-h2 text-ink">Retos</h1>
      <p className="mt-3 max-w-2xl text-body text-ink-secondary">
        Necesidades concretas de la operación. Algunas muestran la empresa; otras son
        licitaciones anónimas.
      </p>
      <RetosList rows={rows} />
    </div>
  );
}
