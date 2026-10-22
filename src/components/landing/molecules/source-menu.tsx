import { SourceLogo } from "@/components/landing/molecules/source-logo";

type Source = { src: string; alt: string; width: number; height: number };

export function SourceMenu({
  listId,
  sources,
  value,
  compact,
  onPick,
}: {
  listId: string;
  sources: Source[];
  value: string;
  compact: boolean;
  onPick: (alt: string) => void;
}) {
  return (
    <ul
      id={listId}
      role="listbox"
      aria-label="¿Cómo te enteraste?"
      className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-sm border border-line bg-elevated p-1 shadow-[var(--card-shadow)]"
    >
      {sources.map((partner) => {
        const active = partner.alt === value;
        return (
          <li key={partner.src} role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => onPick(partner.alt)}
              className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-small text-ink hover:bg-surface-subtle ${
                active ? "bg-surface-subtle" : ""
              }`}
            >
              <SourceLogo src={partner.src} width={partner.width} height={partner.height} compact={compact} />
              <span className="min-w-0">{partner.alt}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
