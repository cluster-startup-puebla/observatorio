import { sessionDateParts } from "@/lib/sessions/face";

export function SessionDate({ iso }: { iso: string }) {
  const parts = sessionDateParts(iso);
  if (!parts) return null;

  return (
    <div aria-hidden className="w-16 shrink-0 overflow-hidden rounded-xl border border-line bg-surface text-center">
      <p className="bg-program-field px-1 py-1 font-display text-[11px] font-bold tracking-[0.14em] text-white uppercase">
        {parts.month.slice(0, 3)}
      </p>
      <p className="mx-1.5 my-1.5 rounded-lg border border-line py-2 font-display text-[1.75rem] leading-none font-bold text-ink">
        {parts.day}
      </p>
    </div>
  );
}
