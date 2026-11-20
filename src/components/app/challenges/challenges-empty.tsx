import Link from "next/link";
import { Flag } from "lucide-react";
import { ComingCard } from "@/components/app/coming-card";
import { Button } from "@/components/ui/button";
import { clusterEmail } from "@/content/landing";

const helpHref = `mailto:${clusterEmail}?subject=${encodeURIComponent(
  "Ayuda para publicar un reto",
)}&body=${encodeURIComponent(
  "Hola, quiero agendar con el equipo para armar o publicar un reto en el Observatorio.",
)}`;

export function ChallengesEmpty() {
  return (
    <ComingCard
      icon={Flag}
      badge={false}
      title="Aún no tienes retos"
      body="Declara una necesidad tecnológica de tu operación. Si prefieres, el equipo te acompaña."
      actions={
        <>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/app/challenges/new">Crear reto</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <a href={helpHref}>¿Necesitas ayuda? Agenda con el equipo</a>
          </Button>
        </>
      }
    />
  );
}
