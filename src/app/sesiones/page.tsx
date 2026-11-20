import type { Metadata } from "next";
import { SessionCatalog } from "@/components/sessions/session-catalog";
import { pageMetadata } from "@/lib/metadata";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Sesiones",
  description: "Sesiones del Observatorio Tecnológico de Puebla.",
  path: "/sesiones",
});

export default function SesionesPage() {
  return (
    <div className="container-site py-16 lg:py-24">
      <h1 className="text-h2 text-ink">Sesiones</h1>
      <p className="mt-3 max-w-2xl text-body text-ink-secondary">
        Cada encuentro del observatorio tiene su propia página.
      </p>
      <SessionCatalog />
    </div>
  );
}
