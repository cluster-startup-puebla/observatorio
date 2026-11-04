import Link from "next/link";
import { forumSectors } from "@/content/forum-public";

export function ForumSectors() {
  return (
    <div className="mt-12">
      <p className="text-micro uppercase text-ink-muted">Sectores participantes · 13</p>
      <ul className="mt-4 flex flex-wrap gap-3">
        {forumSectors.map((sector) => (
          <li key={sector.href}>
            <Link
              href={sector.href}
              className="inline-flex rounded-full border border-line px-4 py-2 text-small text-ink hover:bg-surface-subtle"
            >
              {sector.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
