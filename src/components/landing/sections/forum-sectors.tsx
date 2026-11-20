import Link from "next/link";
import { forumSectors } from "@/content/forum-public";

type SectorItem = { name: string; href?: string };

export function ForumSectors({ sectors }: { sectors?: SectorItem[] }) {
  const items: SectorItem[] = sectors ?? forumSectors.map((sector) => ({ name: sector.name }));
  return (
    <div className="mt-12">
      <p className="text-body text-ink">Estos 13 sectores están en el desayuno.</p>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-body text-ink-secondary">
        {items.map((sector) => (
          <li key={sector.name}>
            {sector.href ? (
              <Link href={sector.href} className="text-link">
                {sector.name}
              </Link>
            ) : (
              sector.name
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
