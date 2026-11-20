import type { RefObject } from "react";

export function ConvergenceSide({
  anchor,
  title,
  text,
  pale = false,
  className = "",
}: {
  anchor: RefObject<HTMLDivElement | null>;
  title: string;
  text: string;
  pale?: boolean;
  className?: string;
}) {
  const face = pale
    ? "border-program-x bg-program-x/40 dark:border-program-field dark:bg-program-field/35"
    : "border-line bg-surface";
  return (
    <div className={`grid justify-items-center gap-3 text-center ${className}`}>
      <p className="text-xs font-bold tracking-[0.16em] text-ink-muted uppercase">Hoy</p>
      <div ref={anchor} className={`grid size-36 place-items-center rounded-full border border-dashed px-3 lg:size-40 lg:px-4 ${face}`}>
        <p className="text-xs font-bold text-ink sm:text-small">{title}</p>
      </div>
      <p className="max-w-[14ch] text-xs leading-5 text-ink-secondary sm:text-small">{text}</p>
    </div>
  );
}
