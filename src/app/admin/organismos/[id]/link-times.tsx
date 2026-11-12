import { ChevronDown } from "lucide-react";

export function LinkTimes({ times, dates }: { times: number; dates: string[] }) {
  const label = times === 1 ? "1 vez" : `${times} veces`;
  return (
    <details className="group">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-ink [&::-webkit-details-marker]:hidden">
        {label}
        <ChevronDown className="size-4 text-ink-muted transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <ul className="mt-2 grid gap-1 text-ink-muted">
        {dates.map((date, index) => (
          <li key={`${date}-${index}`}>{date}</li>
        ))}
      </ul>
    </details>
  );
}
