import Link from "next/link";
import { AppCard } from "@/components/app/app-card";
import type { SectorSession } from "@/lib/app/sector-sessions";

export type SessionBannerProps = {
  next: SectorSession | null;
};

export function SessionBanner({ next }: SessionBannerProps) {
  if (!next) return null;

  return (
    <AppCard>
      <h2 className="text-h3 text-ink">{next.title}</h2>
      <Link href={`/app/sesiones/${next.publicSlug}`} className="btn btn-primary mt-6 w-fit">
        Unirme a la sesión
      </Link>
    </AppCard>
  );
}
