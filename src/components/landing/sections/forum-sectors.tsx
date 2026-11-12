import { forumSectors } from "@/content/forum-public";

export function ForumSectors() {
  return (
    <div className="mt-12">
      <p className="text-body text-ink">Estos 13 sectores están en el desayuno.</p>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-body text-ink-secondary">
        {forumSectors.map((sector) => (
          <li key={sector.name}>{sector.name}</li>
        ))}
      </ul>
    </div>
  );
}
