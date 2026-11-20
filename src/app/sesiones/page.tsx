import type { Metadata } from "next";
import { SessionList } from "@/components/sessions/session-list";
import { pageMetadata } from "@/lib/metadata";
import { listPublicSessions } from "@/lib/sessions/load-public";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Sesiones",
  description: "Sesiones del Observatorio Tecnológico de Puebla.",
  path: "/sesiones",
});

export default async function SesionesPage() {
  const sessions = await listPublicSessions();
  return (
    <div className="container-site py-16 lg:py-24">
      <h1 className="text-h2 text-ink">Sesiones</h1>
      <p className="mt-3 max-w-2xl text-body text-ink-secondary">
        Cada encuentro del observatorio tiene su propia página.
      </p>
      <SessionList sessions={sessions} />
    </div>
  );
}
